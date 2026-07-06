import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatKES } from "@/lib/products";

type Row = {
  id: string;
  order_number: string;
  status: string;
  total_kes: number;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  payment_method: string | null;
  payment_ref: string | null;
  created_at: string;
  paid_at: string | null;
  order_items: { id: string; title: string; product_slug: string; qty: number; unit_price_kes: number }[];
};

export const Route = createFileRoute("/admin/orders")({
  component: OrdersAdmin,
});

function OrdersAdmin() {
  const [rows, setRows] = useState<Row[] | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(id, title, product_slug, qty, unit_price_kes)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) toast.error(error.message);
    setRows((data as Row[]) || []);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: "paid" | "cancelled" | "refunded") => {
    const patch = { status, paid_at: status === "paid" ? new Date().toISOString() : null };
    const { error } = await supabase.from("orders").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Order marked ${status}`);
    load();
  };

  if (rows === null) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">No orders yet.</p>;

  return (
    <div className="space-y-4">
      {rows.map((r) => (
        <div key={r.id} className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{r.status} · {r.payment_method || "—"}</p>
              <p className="font-display text-base font-bold">{r.order_number}</p>
              <p className="text-xs text-muted-foreground">
                {r.customer_name || "—"} · {r.customer_email || "—"} · {r.customer_phone || "—"}
              </p>
              {r.payment_ref && <p className="mt-0.5 font-mono text-xs text-muted-foreground">Ref: {r.payment_ref}</p>}
            </div>
            <div className="text-right">
              <p className="font-display text-lg font-bold">{formatKES(r.total_kes)}</p>
              <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-3 divide-y divide-border text-sm">
            {r.order_items.map((it) => (
              <div key={it.id} className="flex justify-between py-2 text-xs">
                <span>{it.title} <span className="text-muted-foreground">×{it.qty}</span></span>
                <span>{formatKES(it.unit_price_kes * it.qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {r.status !== "paid" && (
              <button onClick={() => setStatus(r.id, "paid")} className="rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90">Mark paid</button>
            )}
            {r.status !== "cancelled" && (
              <button onClick={() => setStatus(r.id, "cancelled")} className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-accent">Cancel</button>
            )}
            {r.status === "paid" && (
              <button onClick={() => setStatus(r.id, "refunded")} className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10">Refund</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
