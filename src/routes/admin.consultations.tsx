import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Trash2, Save, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  getConsultSettings,
  adminListBookings,
  adminUpdateBooking,
  adminUpdateSettings,
  adminListBlockedDates,
  adminAddBlockedDate,
  adminRemoveBlockedDate,
} from "@/lib/consultations.functions";

export const Route = createFileRoute("/admin/consultations")({
  component: AdminConsult,
});

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const STATUSES = ["pending", "paid", "confirmed", "cancelled", "completed"] as const;

type Booking = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  scheduled_at: string;
  slot_minutes: number;
  topic: string;
  status: typeof STATUSES[number];
  price_kes: number;
  payment_ref: string | null;
  admin_notes: string | null;
};

function AdminConsult() {
  const fetchSettings = useServerFn(getConsultSettings);
  const saveSettings = useServerFn(adminUpdateSettings);
  const fetchBookings = useServerFn(adminListBookings);
  const updateBooking = useServerFn(adminUpdateBooking);
  const fetchBlocked = useServerFn(adminListBlockedDates);
  const addBlocked = useServerFn(adminAddBlockedDate);
  const removeBlocked = useServerFn(adminRemoveBlockedDate);

  const [settings, setSettings] = useState({
    price_kes: 0,
    slot_minutes: 30,
    work_start_hour: 10,
    work_end_hour: 16,
    blocked_weekdays: [0] as number[],
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedDates, setBlockedDates] = useState<{ id: string; blocked_date: string; reason: string | null }[]>([]);
  const [picked, setPicked] = useState<Date | undefined>();
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    const [s, b, bd] = await Promise.all([fetchSettings(), fetchBookings(), fetchBlocked()]);
    if (s) setSettings({
      price_kes: s.price_kes,
      slot_minutes: s.slot_minutes,
      work_start_hour: s.work_start_hour,
      work_end_hour: s.work_end_hour,
      blocked_weekdays: s.blocked_weekdays || [0],
    });
    setBookings(Array.isArray(b) ? (b as Booking[]) : []);
    setBlockedDates(Array.isArray(bd) ? bd : []);
    setLoading(false);
  };

  useEffect(() => { reload().catch((e) => toast.error(e.message)); }, []);

  const toggleWeekday = (n: number) => {
    setSettings((s) => ({
      ...s,
      blocked_weekdays: s.blocked_weekdays.includes(n)
        ? s.blocked_weekdays.filter((x) => x !== n)
        : [...s.blocked_weekdays, n],
    }));
  };

  const onSaveSettings = async () => {
    try {
      await saveSettings({ data: settings });
      toast.success("Settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const onBlockDay = async () => {
    if (!picked) return;
    const iso = picked.toISOString().slice(0, 10);
    try {
      await addBlocked({ data: { date: iso } });
      setPicked(undefined);
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-10">
      {/* Settings */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold">Consultation settings</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <Label>Price (KES)</Label>
            <Input type="number" value={settings.price_kes}
              onChange={(e) => setSettings({ ...settings, price_kes: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Slot length (minutes)</Label>
            <Input type="number" value={settings.slot_minutes}
              onChange={(e) => setSettings({ ...settings, slot_minutes: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Work start hour (0-23)</Label>
            <Input type="number" value={settings.work_start_hour}
              onChange={(e) => setSettings({ ...settings, work_start_hour: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Work end hour (1-24)</Label>
            <Input type="number" value={settings.work_end_hour}
              onChange={(e) => setSettings({ ...settings, work_end_hour: Number(e.target.value) })} />
          </div>
        </div>
        <div className="mt-4">
          <Label className="mb-2 block">Blocked weekdays (no bookings)</Label>
          <div className="flex flex-wrap gap-3">
            {WEEKDAYS.map((d, i) => (
              <label key={d} className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs">
                <Checkbox
                  checked={settings.blocked_weekdays.includes(i)}
                  onCheckedChange={() => toggleWeekday(i)}
                />
                {d}
              </label>
            ))}
          </div>
        </div>
        <Button className="mt-5" onClick={onSaveSettings}>
          <Save className="mr-2 h-4 w-4" /> Save settings
        </Button>
      </section>

      {/* Blocked dates */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold">Block specific dates</h2>
        <p className="text-sm text-muted-foreground">For holidays, travel, or one-off unavailability.</p>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <Calendar
              mode="single"
              selected={picked}
              onSelect={setPicked}
              className="p-3 pointer-events-auto rounded-md border border-border"
            />
            <Button className="mt-3" size="sm" disabled={!picked} onClick={onBlockDay}>
              <Plus className="mr-2 h-4 w-4" /> Block selected date
            </Button>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Currently blocked</p>
            <div className="space-y-2 max-h-80 overflow-auto">
              {blockedDates.length === 0 && <p className="text-sm text-muted-foreground">None.</p>}
              {blockedDates.map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm">
                  <span>{b.blocked_date}</span>
                  <Button size="sm" variant="ghost" onClick={async () => { await removeBlocked({ data: { id: b.id } }); reload(); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bookings */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold">Bookings</h2>
        <div className="mt-4 space-y-3">
          {bookings.length === 0 && <p className="text-sm text-muted-foreground">No bookings yet.</p>}
          {bookings.map((b) => (
            <BookingRow key={b.id} b={b} onUpdate={async (patch) => {
              await updateBooking({ data: { id: b.id, ...patch } });
              toast.success("Updated");
              reload();
            }} />
          ))}
        </div>
      </section>
    </div>
  );
}

function BookingRow({ b, onUpdate }: { b: Booking; onUpdate: (patch: { status?: typeof STATUSES[number]; payment_ref?: string; admin_notes?: string }) => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState(b.admin_notes || "");
  const [ref, setRef] = useState(b.payment_ref || "");
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{b.customer_name} <span className="text-xs text-muted-foreground">· {b.customer_email}</span></p>
          <p className="text-xs text-muted-foreground">{new Date(b.scheduled_at).toLocaleString()} · {b.slot_minutes} min · KES {b.price_kes.toLocaleString()}</p>
          {b.customer_phone && <p className="text-xs text-muted-foreground">{b.customer_phone}</p>}
        </div>
        <select
          className="rounded-md border border-border bg-card px-2 py-1 text-xs"
          value={b.status}
          disabled={busy}
          onChange={async (e) => {
            setBusy(true);
            await onUpdate({ status: e.target.value as typeof STATUSES[number] });
            setBusy(false);
          }}
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="mt-3 rounded-md bg-secondary/40 p-3 text-sm">
        <p className="text-xs font-semibold uppercase text-muted-foreground">Topic</p>
        <p className="mt-1 whitespace-pre-wrap">{b.topic}</p>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div>
          <Label className="text-xs">Payment reference</Label>
          <Input value={ref} onChange={(e) => setRef(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Admin notes</Label>
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
      <Button size="sm" className="mt-3" disabled={busy} onClick={async () => {
        setBusy(true);
        await onUpdate({ payment_ref: ref, admin_notes: notes });
        setBusy(false);
      }}>
        {busy && <Loader2 className="mr-2 h-3 w-3 animate-spin" />} Save
      </Button>
    </div>
  );
}
