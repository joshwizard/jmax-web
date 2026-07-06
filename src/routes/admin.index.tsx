import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { products as seedCatalog } from "@/lib/products";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Overview,
});

function Overview() {
  const [stats, setStats] = useState<{ products: number; orders: number; revenue: number } | null>(null);
  const [seeding, setSeeding] = useState(false);

  const load = async () => {
    const [{ count: p }, { count: o }, { data: paid }] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("total_kes").eq("status", "paid"),
    ]);
    const revenue = (paid || []).reduce((s, r) => s + (r.total_kes || 0), 0);
    setStats({ products: p || 0, orders: o || 0, revenue });
  };

  useEffect(() => {
    load();
  }, []);

  const seed = async () => {
    setSeeding(true);
    try {
      const rows = seedCatalog.map((p) => ({
        slug: p.slug,
        title: p.title,
        category: p.type,
        price_kes: p.price,
        description: p.shortDescription,
        is_active: true,
      }));
      const { error } = await supabase.from("products").upsert(rows, { onConflict: "slug" });
      if (error) throw error;
      toast.success(`Seeded ${rows.length} products`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Seed failed");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Products" value={stats?.products ?? "—"} />
        <Stat label="Orders" value={stats?.orders ?? "—"} />
        <Stat label="Revenue (paid)" value={stats ? `KES ${stats.revenue.toLocaleString()}` : "—"} />
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/admin/products" className="rounded-md bg-ink px-4 py-2 text-xs font-semibold text-ink-foreground hover:opacity-90">Manage products</Link>
          <Link to="/admin/orders" className="rounded-md border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-accent">View orders</Link>
          <button
            onClick={seed}
            disabled={seeding}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-accent disabled:opacity-50"
          >
            {seeding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Seed catalog from sample data
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Seeding inserts the static marketplace catalog into the database (idempotent — re-seeding updates existing rows by slug).
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}
