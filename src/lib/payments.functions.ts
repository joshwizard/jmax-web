import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { attachAuth } from "@/lib/auth-attach";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const InitSchema = z.object({
  orderId: z.string().uuid(),
  callbackUrl: z.string().url(),
});

/**
 * Initialize a Paystack transaction. Returns an authorization_url the
 * client should redirect to so the customer can pay via card, M-Pesa,
 * bank, etc.
 */
export const initPaystack = createServerFn({ method: "POST" })
  .middleware([attachAuth, requireSupabaseAuth])
  .inputValidator((d: unknown) => InitSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, status, total_kes, user_id, customer_email, order_number")
      .eq("id", data.orderId)
      .single();

    if (error || !order) throw new Error("Order not found");
    if (order.user_id !== userId) throw new Error("Forbidden");
    if (order.status !== "pending") throw new Error("Order is not payable");

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error("Paystack is not configured");

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: order.customer_email,
        amount: order.total_kes * 100, // Paystack expects subunits
        currency: "KES",
        reference: `${order.order_number}-${Date.now().toString(36)}`,
        callback_url: data.callbackUrl,
        metadata: { order_id: order.id, order_number: order.order_number },
      }),
    });

    const json = (await res.json()) as {
      status: boolean;
      message: string;
      data?: { authorization_url: string; access_code: string; reference: string };
    };

    if (!res.ok || !json.status || !json.data) {
      throw new Error(json.message || "Paystack initialize failed");
    }

    await supabaseAdmin
      .from("orders")
      .update({
        payment_method: "paystack",
        payment_ref: json.data.reference,
      })
      .eq("id", order.id);

    return {
      authorizationUrl: json.data.authorization_url,
      reference: json.data.reference,
    };
  });

const VerifySchema = z.object({ reference: z.string().min(4) });

/**
 * Verify a Paystack transaction by reference and mark the order paid.
 * Safe to call multiple times.
 */
export const verifyPaystack = createServerFn({ method: "POST" })
  .middleware([attachAuth, requireSupabaseAuth])
  .inputValidator((d: unknown) => VerifySchema.parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error("Paystack is not configured");

    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(data.reference)}`,
      { headers: { Authorization: `Bearer ${secret}` } },
    );
    const json = (await res.json()) as {
      status: boolean;
      message: string;
      data?: { status: string; amount: number; reference: string };
    };
    if (!res.ok || !json.status || !json.data) {
      throw new Error(json.message || "Paystack verify failed");
    }

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, user_id, status, total_kes, order_number")
      .eq("payment_ref", data.reference)
      .single();
    if (error || !order) throw new Error("Order not found for reference");
    if (order.user_id !== userId) throw new Error("Forbidden");

    if (order.status === "paid") {
      return { ok: true, alreadyPaid: true, orderNumber: order.order_number, emailSent: false };
    }

    if (json.data.status !== "success") {
      return { ok: false, status: json.data.status, orderNumber: order.order_number };
    }

    if (json.data.amount !== order.total_kes * 100) {
      throw new Error("Amount mismatch");
    }

    const { error: upErr } = await supabaseAdmin
      .from("orders")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", order.id);
    if (upErr) throw new Error(upErr.message);

    // Fire-and-forget delivery email with per-deliverable download links
    const { sendOrderDeliveryEmail } = await import("@/lib/delivery-email");
    const emailResult = await sendOrderDeliveryEmail(order.id).catch((err) => {
      console.error("[verifyPaystack] delivery email error", err);
      return { sent: false, reason: err instanceof Error ? err.message : "email failed" };
    });

    return { ok: true, orderNumber: order.order_number, emailSent: emailResult.sent };
  });
