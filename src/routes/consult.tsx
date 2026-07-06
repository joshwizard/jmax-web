import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Clock, CheckCircle2, Loader2, Info } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { SectionHeader } from "@/components/site/SectionHeader";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  getConsultSettings,
  getConsultAvailability,
  createConsultBooking,
  initBookingMpesa,
  confirmBookingMpesa,
} from "@/lib/consultations.functions";

export const Route = createFileRoute("/consult")({
  head: () => ({
    meta: [
      { title: "Book a Consultation · Jmax Builders" },
      {
        name: "description",
        content:
          "Schedule a paid consultation with Jmax Builders. Pick a date and time, share what you'd like to discuss, and we'll confirm.",
      },
    ],
  }),
  component: ConsultPage,
});

type Settings = {
  price_kes: number;
  slot_minutes: number;
  work_start_hour: number;
  work_end_hour: number;
  blocked_weekdays: number[];
} | null;

function ConsultPage() {
  const fetchSettings = useServerFn(getConsultSettings);
  const fetchAvailability = useServerFn(getConsultAvailability);
  const submit = useServerFn(createConsultBooking);
  const initPay = useServerFn(initBookingMpesa);
  const confirmPay = useServerFn(confirmBookingMpesa);

  const [settings, setSettings] = useState<Settings>(null);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [taken, setTaken] = useState<{ at: string; minutes: number }[]>([]);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", topic: "" });
  const [busy, setBusy] = useState(false);
  const [booking, setBooking] = useState<{ id: string; price: number } | null>(null);
  const [stk, setStk] = useState<{ checkoutRequestId: string } | null>(null);
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [paid, setPaid] = useState<{ receipt: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, a] = await Promise.all([
          fetchSettings(),
          fetchAvailability({
            data: {
              from: new Date().toISOString(),
              to: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            },
          }),
        ]);
        setSettings(s as Settings);
        setBlockedDates(a.blockedDates || []);
        setTaken(a.taken || []);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load");
      }
    })();
  }, [fetchSettings, fetchAvailability]);

  const blockedWeekdays = settings?.blocked_weekdays || [0];
  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates]);

  const isDateDisabled = (d: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (d < today) return true;
    if (blockedWeekdays.includes(d.getDay())) return true;
    const iso = d.toISOString().slice(0, 10);
    if (blockedSet.has(iso)) return true;
    return false;
  };

  const slots = useMemo(() => {
    if (!settings || !date) return [];
    const out: { value: string; label: string; disabled: boolean }[] = [];
    const minutes = settings.slot_minutes;
    const startH = settings.work_start_hour;
    const endH = settings.work_end_hour;
    const dayStart = new Date(date);
    dayStart.setHours(startH, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(endH, 0, 0, 0);
    const now = Date.now();
    for (let t = dayStart.getTime(); t + minutes * 60_000 <= dayEnd.getTime(); t += minutes * 60_000) {
      const slot = new Date(t);
      const iso = slot.toISOString();
      const conflict = taken.some((b) => {
        const ts = new Date(b.at).getTime();
        return Math.abs(ts - t) < minutes * 60_000;
      });
      out.push({
        value: iso,
        label: slot.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        disabled: conflict || t < now,
      });
    }
    return out;
  }, [settings, date, taken]);

  const canSubmit = time && form.name && form.email && form.topic.length >= 5;

  const onSubmit = async () => {
    if (!time) return;
    setBusy(true);
    try {
      const res = await submit({
        data: {
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          scheduled_at: time,
          topic: form.topic,
        },
      });
      setBooking({ id: res.id, price: res.price_kes });
      setMpesaPhone(form.phone || "");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setBusy(false);
    }
  };

  const onSendStk = async () => {
    if (!booking) return;
    setBusy(true);
    try {
      const res = await initPay({ data: { bookingId: booking.id, phone: mpesaPhone } });
      setStk({ checkoutRequestId: res.checkoutRequestId });
      toast.success(res.message);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to start payment");
    } finally {
      setBusy(false);
    }
  };

  const onConfirm = async () => {
    if (!booking || !stk) return;
    setBusy(true);
    try {
      const res = await confirmPay({ data: { bookingId: booking.id, checkoutRequestId: stk.checkoutRequestId } });
      setPaid({ receipt: res.receipt || "PAID" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Confirmation failed");
    } finally {
      setBusy(false);
    }
  };

  if (paid) {
    return (
      <Layout>
        <section className="container-page py-20">
          <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-4 font-display text-2xl font-bold">Payment received</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Receipt: <span className="font-mono">{paid.receipt}</span>
            </p>
            <p className="mt-4 text-sm">
              Your slot is booked. We'll email you a meeting link shortly.
            </p>
            <Button className="mt-6" onClick={() => window.location.assign("/")}>Back home</Button>
          </div>
        </section>
      </Layout>
    );
  }

  if (booking) {
    return (
      <Layout>
        <section className="container-page py-20">
          <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-8">
            <h1 className="font-display text-2xl font-bold">Pay with M-Pesa</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Reference: <span className="font-mono">{booking.id.slice(0, 8)}</span> · Amount:{" "}
              <span className="font-bold text-foreground">KES {booking.price.toLocaleString()}</span>
            </p>
            {!stk ? (
              <div className="mt-6 space-y-3">
                <Label htmlFor="mpesa">M-Pesa phone (Safaricom)</Label>
                <Input id="mpesa" placeholder="2547XXXXXXXX" value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)} maxLength={20} />
                <Button onClick={onSendStk} disabled={busy || mpesaPhone.length < 7} className="w-full">
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send STK push
                </Button>
                <p className="text-xs text-muted-foreground">
                  You'll receive a prompt on your phone to authorize the payment.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3 rounded-md bg-secondary/40 p-4 text-sm">
                <p>STK push sent to <span className="font-mono">{mpesaPhone}</span>. After entering your PIN, tap below to confirm.</p>
                <Button onClick={onConfirm} disabled={busy} className="w-full">
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} I've paid — confirm
                </Button>
                <p className="text-xs text-muted-foreground">
                  (Simulated for now. Real M-Pesa Daraja integration drops in here later.)
                </p>
              </div>
            )}
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-page py-14">
          <SectionHeader
            eyebrow="Consultations"
            title="Book a consultation."
            description="Pick a date and time, tell us what you'd like to discuss, and we'll confirm by email after payment."
          />
          {settings && (
            <div className="mt-6 inline-flex items-center gap-4 rounded-md border border-border bg-card px-4 py-2 text-xs">
              <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{settings.slot_minutes} min</span>
              <span className="text-muted-foreground">·</span>
              <span className="font-semibold">
                {settings.price_kes > 0 ? `KES ${settings.price_kes.toLocaleString()}` : "Fee TBC"}
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <CalendarIcon className="h-4 w-4" /> Choose a date
              </div>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => { setDate(d); setTime(null); }}
                disabled={isDateDisabled}
                className={cn("p-3 pointer-events-auto")}
              />
              <p className="mt-2 text-xs text-muted-foreground inline-flex items-center gap-1">
                <Info className="h-3 w-3" /> Greyed-out days are unavailable.
              </p>
            </div>

            {date && (
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Clock className="h-4 w-4" /> Choose a time
                </div>
                {slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No slots available.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {slots.map((s) => (
                      <button
                        key={s.value}
                        disabled={s.disabled}
                        onClick={() => setTime(s.value)}
                        className={cn(
                          "rounded-md border px-2 py-2 text-xs font-semibold transition",
                          time === s.value
                            ? "border-ink bg-ink text-ink-foreground"
                            : "border-border bg-card hover:bg-accent",
                          s.disabled && "opacity-40 cursor-not-allowed line-through",
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold">Your details</h2>
            <div className="mt-4 grid gap-3">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={120} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} />
              </div>
              <div>
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={40} />
              </div>
              <div>
                <Label htmlFor="topic">What would you like to discuss?</Label>
                <Textarea
                  id="topic"
                  rows={5}
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  maxLength={4000}
                  placeholder="e.g. I'm planning a 3-bedroom bungalow on a 50x100 plot in Meru. I'd like to review options and rough budget."
                />
                <p className="mt-1 text-xs text-muted-foreground">{form.topic.length}/4000</p>
              </div>
              <Button onClick={onSubmit} disabled={!canSubmit || busy} className="mt-2">
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Request booking
              </Button>
              <p className="text-xs text-muted-foreground">
                After submitting, you'll pay via M-Pesa STK push to confirm your slot.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
