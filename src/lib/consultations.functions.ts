import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SLOT_MS = 60_000;

export const getConsultSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("consultation_settings")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
});

export const getConsultAvailability = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ from: z.string(), to: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const [blocked, bookings] = await Promise.all([
      supabaseAdmin.from("consultation_blocked_dates").select("blocked_date"),
      supabaseAdmin
        .from("consultation_bookings")
        .select("scheduled_at,slot_minutes,status")
        .gte("scheduled_at", data.from)
        .lte("scheduled_at", data.to)
        .neq("status", "cancelled"),
    ]);
    if (blocked.error) throw new Error(blocked.error.message);
    if (bookings.error) throw new Error(bookings.error.message);
    return {
      blockedDates: (blocked.data || []).map((b) => b.blocked_date),
      taken: (bookings.data || []).map((b) => ({
        at: b.scheduled_at,
        minutes: b.slot_minutes,
      })),
    };
  });

const bookingInput = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().nullable(),
  scheduled_at: z.string(),
  topic: z.string().trim().min(5).max(4000),
});

export const createConsultBooking = createServerFn({ method: "POST" })
  .inputValidator((d) => bookingInput.parse(d))
  .handler(async ({ data }) => {
    const settings = await supabaseAdmin
      .from("consultation_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (settings.error || !settings.data) throw new Error("Settings unavailable");
    const s = settings.data;

    const when = new Date(data.scheduled_at);
    if (Number.isNaN(when.getTime())) throw new Error("Invalid time");

    // Validate weekday
    if ((s.blocked_weekdays || []).includes(when.getUTCDay())) {
      throw new Error("This day is unavailable");
    }
    // Validate working hours (interpret stored hours as local Africa/Nairobi which is UTC+3 fixed)
    const hourNairobi = (when.getUTCHours() + 3) % 24;
    if (hourNairobi < s.work_start_hour || hourNairobi >= s.work_end_hour) {
      throw new Error("Outside working hours");
    }

    // Check blocked date
    const dateStr = when.toISOString().slice(0, 10);
    const blocked = await supabaseAdmin
      .from("consultation_blocked_dates")
      .select("id")
      .eq("blocked_date", dateStr)
      .maybeSingle();
    if (blocked.data) throw new Error("This date is unavailable");

    // Check conflict (any overlapping booking)
    const slotMs = s.slot_minutes * SLOT_MS;
    const conflictStart = new Date(when.getTime() - slotMs + 1).toISOString();
    const conflictEnd = new Date(when.getTime() + slotMs - 1).toISOString();
    const conflicts = await supabaseAdmin
      .from("consultation_bookings")
      .select("id")
      .gte("scheduled_at", conflictStart)
      .lte("scheduled_at", conflictEnd)
      .neq("status", "cancelled");
    if (conflicts.error) throw new Error(conflicts.error.message);
    if ((conflicts.data || []).length > 0) throw new Error("Slot already taken");

    const { data: inserted, error } = await supabaseAdmin
      .from("consultation_bookings")
      .insert({
        customer_name: data.name,
        customer_email: data.email,
        customer_phone: data.phone || null,
        scheduled_at: when.toISOString(),
        slot_minutes: s.slot_minutes,
        topic: data.topic,
        price_kes: s.price_kes,
        status: "pending",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id, price_kes: s.price_kes };
  });

/* ----- M-Pesa STK Push (simulated, public) ----- */

export const initBookingMpesa = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ bookingId: z.string().uuid(), phone: z.string().trim().min(7).max(20) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { data: b, error } = await supabaseAdmin
      .from("consultation_bookings")
      .select("id,status,price_kes")
      .eq("id", data.bookingId)
      .single();
    if (error || !b) throw new Error("Booking not found");
    if (b.status !== "pending") throw new Error("Booking is not payable");
    if (!b.price_kes || b.price_kes <= 0) throw new Error("Price not set. Please contact us.");

    const checkoutRequestId = `MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const { error: upErr } = await supabaseAdmin
      .from("consultation_bookings")
      .update({ payment_ref: checkoutRequestId, customer_phone: data.phone })
      .eq("id", b.id);
    if (upErr) throw new Error(upErr.message);
    return {
      checkoutRequestId,
      message: "STK push sent to your phone (simulated). Confirm to complete payment.",
      simulated: true,
    };
  });

export const confirmBookingMpesa = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ bookingId: z.string().uuid(), checkoutRequestId: z.string().min(4) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { data: b, error } = await supabaseAdmin
      .from("consultation_bookings")
      .select("id,status,payment_ref")
      .eq("id", data.bookingId)
      .single();
    if (error || !b) throw new Error("Booking not found");
    if (b.payment_ref !== data.checkoutRequestId) throw new Error("Payment ref mismatch");
    if (b.status === "paid" || b.status === "confirmed") return { ok: true, alreadyPaid: true };

    const receipt = `MPESA${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const { error: upErr } = await supabaseAdmin
      .from("consultation_bookings")
      .update({ status: "paid", paid_at: new Date().toISOString(), payment_ref: receipt })
      .eq("id", b.id);
    if (upErr) throw new Error(upErr.message);
    return { ok: true, receipt };
  });

/* ----- Admin ----- */

export const adminListBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("consultation_bookings")
      .select("*")
      .order("scheduled_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  });

export const adminUpdateBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "paid", "confirmed", "cancelled", "completed"]).optional(),
        admin_notes: z.string().max(2000).optional().nullable(),
        payment_ref: z.string().max(120).optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const patch: {
      status?: typeof data.status;
      paid_at?: string;
      admin_notes?: string | null;
      payment_ref?: string | null;
    } = {};
    if (data.status) {
      patch.status = data.status;
      if (data.status === "paid") patch.paid_at = new Date().toISOString();
    }
    if (data.admin_notes !== undefined) patch.admin_notes = data.admin_notes;
    if (data.payment_ref !== undefined) patch.payment_ref = data.payment_ref;
    const { error } = await context.supabase
      .from("consultation_bookings")
      .update(patch)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminUpdateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        price_kes: z.number().int().min(0).max(10_000_000),
        slot_minutes: z.number().int().min(15).max(240),
        work_start_hour: z.number().int().min(0).max(23),
        work_end_hour: z.number().int().min(1).max(24),
        blocked_weekdays: z.array(z.number().int().min(0).max(6)),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const existing = await context.supabase
      .from("consultation_settings")
      .select("id")
      .limit(1)
      .maybeSingle();
    if (!existing.data) {
      const { error } = await context.supabase.from("consultation_settings").insert(data);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase
        .from("consultation_settings")
        .update(data)
        .eq("id", existing.data.id);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminListBlockedDates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("consultation_blocked_dates")
      .select("*")
      .order("blocked_date", { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  });

export const adminAddBlockedDate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ date: z.string(), reason: z.string().max(200).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("consultation_blocked_dates")
      .insert({ blocked_date: data.date, reason: data.reason || null });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminRemoveBlockedDate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("consultation_blocked_dates")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
