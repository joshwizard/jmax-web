import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { deliverableLabel, filePathForLicense } from "@/lib/product-files";

type OrderItemRow = {
  title: string;
  license: string;
  product_slug: string;
  qty: number;
  unit_price_kes: number;
};

/**
 * After payment: create signed download URLs for each purchased deliverable
 * and email them to the customer (Resend when RESEND_API_KEY is set).
 */
export async function sendOrderDeliveryEmail(orderId: string): Promise<{ sent: boolean; reason?: string }> {
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, customer_email, customer_name, total_kes, status, order_items(title, license, product_slug, qty, unit_price_kes)")
    .eq("id", orderId)
    .single();

  if (error || !order) return { sent: false, reason: error?.message || "order not found" };
  if (order.status !== "paid") return { sent: false, reason: "order not paid" };
  if (!order.customer_email) return { sent: false, reason: "no customer email" };

  const items = (order.order_items || []) as OrderItemRow[];
  const links: { title: string; license: string; label: string; url: string }[] = [];

  for (const it of items) {
    const { data: product } = await supabaseAdmin
      .from("products")
      .select("file_path, title")
      .eq("slug", it.product_slug)
      .maybeSingle();
    const path = filePathForLicense(product?.file_path, it.license);
    if (!path) continue;
    const { data: signed } = await supabaseAdmin.storage
      .from("product-files")
      .createSignedUrl(path, 60 * 60 * 24 * 30); // 30 days
    if (!signed?.signedUrl) continue;
    links.push({
      title: it.title || product?.title || it.product_slug,
      license: it.license,
      label: deliverableLabel(it.license),
      url: signed.signedUrl,
    });
  }

  const site = "https://jmaxbuilders.com";
  const libraryUrl = `${site}/account/library`;
  const lines = links.length
    ? links
        .map(
          (l) =>
            `<li style="margin-bottom:12px"><strong>${escapeHtml(l.title)}</strong> — ${escapeHtml(l.label)}<br/><a href="${l.url}">Download file</a></li>`,
        )
        .join("")
    : `<li>Your files will appear in <a href="${libraryUrl}">Your library</a> once uploaded by our team.</li>`;

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#111">
      <p>Hi ${escapeHtml(order.customer_name || "there")},</p>
      <p>Thank you for your purchase. Order <strong>${escapeHtml(order.order_number)}</strong> is confirmed.</p>
      <p>Download only the deliverable(s) you bought:</p>
      <ul>${lines}</ul>
      <p>Links are valid for 30 days. You can also re-download anytime from <a href="${libraryUrl}">Your library</a>.</p>
      <p style="color:#666;font-size:13px">Questions? Reply to this email or write to jmaxbuildersltd@gmail.com.</p>
      <p>— Jmax Builders</p>
    </div>
  `;

  const text = [
    `Hi ${order.customer_name || "there"},`,
    ``,
    `Order ${order.order_number} is confirmed.`,
    ``,
    ...links.map((l) => `- ${l.title} (${l.label}): ${l.url}`),
    ``,
    `Library: ${libraryUrl}`,
    ``,
    `— Jmax Builders`,
  ].join("\n");

  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "Jmax Builders <onboarding@resend.dev>";

  if (!resendKey) {
    console.warn("[delivery-email] RESEND_API_KEY not set — customer can still download from library");
    return { sent: false, reason: "RESEND_API_KEY not configured" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [order.customer_email],
      subject: `Your Jmax Builders downloads — ${order.order_number}`,
      html,
      text,
      reply_to: "jmaxbuildersltd@gmail.com",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[delivery-email] Resend failed", res.status, body);
    return { sent: false, reason: body.slice(0, 200) };
  }

  return { sent: true };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
