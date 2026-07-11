import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { attachAuth } from "@/lib/auth-attach";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/** Business owner emails that always receive admin on sign-in. */
export const OWNER_ADMIN_EMAILS = ["jmaxbuildersltd@gmail.com"];

async function grantAdmin(userId: string) {
  const { data: existing, error: lookupError } = await supabaseAdmin
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (lookupError) throw new Error(lookupError.message);
  if (existing) return { ok: true as const, already: true };

  const { error } = await supabaseAdmin
    .from("user_roles")
    .insert({ user_id: userId, role: "admin" });
  if (error) throw new Error(error.message);
  return { ok: true as const, already: false };
}

/**
 * Promote the signed-in user to admin when their email is a known owner address.
 * Safe to call on every login — no-ops for regular users.
 */
export const ensureOwnerAdmin = createServerFn({ method: "POST" })
  .middleware([attachAuth, requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (error) throw new Error(error.message);

    const email = data.user?.email?.toLowerCase().trim();
    if (!email || !OWNER_ADMIN_EMAILS.includes(email)) {
      return { ok: false as const, reason: "Not an owner account" };
    }

    return grantAdmin(userId);
  });

/**
 * One-time bootstrap: if no admins exist yet, promote the calling user to admin.
 * Owner emails can always claim via ensureOwnerAdmin instead.
 */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([attachAuth, requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    // Owner accounts can always ensure admin, even if another admin exists.
    const { data, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError) throw new Error(userError.message);
    const email = data.user?.email?.toLowerCase().trim();
    if (email && OWNER_ADMIN_EMAILS.includes(email)) {
      return grantAdmin(userId);
    }

    const { count, error: e1 } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if (e1) throw new Error(e1.message);

    if ((count ?? 0) > 0) return { ok: false, reason: "Admin already exists" };

    return grantAdmin(userId);
  });
