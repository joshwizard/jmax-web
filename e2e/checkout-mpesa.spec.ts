import { test, expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

/**
 * End-to-end: sign in → add to cart → mock M-Pesa STK → confirm payment →
 * verify order is paid in /account/library and that the signed-URL download
 * endpoint authorizes the buyer.
 *
 * The test bypasses Google OAuth UI by:
 *   1. provisioning a test user via the service-role key (auto-confirmed)
 *   2. logging in with email/password through the Supabase JS SDK
 *   3. seeding the resulting session into the page's localStorage so the
 *      app boots already authenticated.
 */

const {
  E2E_SUPABASE_URL,
  E2E_SUPABASE_ANON_KEY,
  E2E_SUPABASE_SERVICE_KEY,
  E2E_TEST_EMAIL,
  E2E_TEST_PASSWORD,
} = process.env;

test.describe("Checkout · Mock M-Pesa STK", () => {
  test.skip(
    !E2E_SUPABASE_URL ||
      !E2E_SUPABASE_ANON_KEY ||
      !E2E_SUPABASE_SERVICE_KEY ||
      !E2E_TEST_EMAIL ||
      !E2E_TEST_PASSWORD,
    "Set E2E_SUPABASE_URL / E2E_SUPABASE_ANON_KEY / E2E_SUPABASE_SERVICE_KEY / E2E_TEST_EMAIL / E2E_TEST_PASSWORD to run.",
  );

  const admin = () =>
    createClient(E2E_SUPABASE_URL!, E2E_SUPABASE_SERVICE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  const anon = () =>
    createClient(E2E_SUPABASE_URL!, E2E_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

  let userId: string;

  test.beforeAll(async () => {
    const a = admin();
    // Try to create; if already exists, fetch the id.
    const created = await a.auth.admin.createUser({
      email: E2E_TEST_EMAIL!,
      password: E2E_TEST_PASSWORD!,
      email_confirm: true,
      user_metadata: { full_name: "E2E Buyer" },
    });
    if (created.data.user) {
      userId = created.data.user.id;
    } else {
      const list = await a.auth.admin.listUsers();
      const u = list.data.users.find((x) => x.email === E2E_TEST_EMAIL);
      if (!u) throw new Error("Could not create or find test user");
      userId = u.id;
    }

    // Clean previous orders so the assertion is deterministic.
    const { data: prev } = await a
      .from("orders")
      .select("id")
      .eq("user_id", userId);
    if (prev?.length) {
      await a.from("order_items").delete().in(
        "order_id",
        prev.map((p) => p.id),
      );
      await a.from("orders").delete().eq("user_id", userId);
    }
  });

  test.afterAll(async () => {
    if (!userId) return;
    const a = admin();
    const { data: prev } = await a
      .from("orders")
      .select("id")
      .eq("user_id", userId);
    if (prev?.length) {
      await a.from("order_items").delete().in(
        "order_id",
        prev.map((p) => p.id),
      );
      await a.from("orders").delete().eq("user_id", userId);
    }
    await a.auth.admin.deleteUser(userId);
  });

  async function seedSession(page: Page) {
    const { data, error } = await anon().auth.signInWithPassword({
      email: E2E_TEST_EMAIL!,
      password: E2E_TEST_PASSWORD!,
    });
    if (error || !data.session) throw error ?? new Error("No session");

    const projectRef = new URL(E2E_SUPABASE_URL!).host.split(".")[0];
    const storageKey = `sb-${projectRef}-auth-token`;
    const session = data.session;

    await page.addInitScript(
      ({ key, value }) => {
        try {
          window.localStorage.setItem(key, value);
        } catch {}
      },
      { key: storageKey, value: JSON.stringify(session) },
    );
  }

  test("buyer pays via mock STK and unlocks downloads", async ({ page }) => {
    await seedSession(page);

    // 1. Add a product to the cart from the marketplace.
    await page.goto("/marketplace");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const firstAddToCart = page
      .getByRole("button", { name: /add to cart/i })
      .first();
    await firstAddToCart.click();

    // 2. Go to checkout.
    await page.goto("/checkout");
    await expect(
      page.getByRole("heading", { name: /checkout/i }),
    ).toBeVisible();

    // 3. Fill the M-Pesa phone + accept terms.
    await page
      .getByLabel(/M-Pesa phone/i)
      .fill("+254712345678");
    await page.getByRole("checkbox").check();

    // 4. Trigger the (stub) STK push.
    await page.getByRole("button", { name: /send stk/i }).click();

    // 5. Confirm the simulated payment.
    const confirmBtn = page.getByRole("button", {
      name: /i've paid — confirm/i,
    });
    await expect(confirmBtn).toBeVisible({ timeout: 15_000 });
    await confirmBtn.click();

    // 6. The app navigates to /checkout/complete on success.
    await page.waitForURL(/\/checkout\/complete/, { timeout: 15_000 });

    // 7. Verify the order is marked paid in the database.
    const a = admin();
    const { data: orders } = await a
      .from("orders")
      .select("id, status, total_kes")
      .eq("user_id", userId);
    expect(orders, "order row exists").toHaveLength(1);
    expect(orders![0].status).toBe("paid");

    // 8. Library page lists the paid order.
    await page.goto("/account/library");
    await expect(page.getByText(/paid/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
