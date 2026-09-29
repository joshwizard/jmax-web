import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { products as seedCatalog } from "@/lib/products";
import { toast } from "sonner";
import { Heart, Loader2, Sparkles } from "lucide-react";
import { loadPortfolio } from "@/lib/portfolio-source";

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

      <ClientLikes />

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

type LikeRow = { slug: string; title: string; category: string; likes: number; lastLikedAt: string | null };

function ClientLikes() {
  const [rows, setRows] = useState<LikeRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data, error: statsError }, portfolio] = await Promise.all([
        supabase.from("project_like_stats").select("project_slug,likes,last_liked_at"),
        loadPortfolio(),
      ]);
      if (cancelled) return;
      if (statsError) {
        setError(statsError.message);
        setRows([]);
        return;
      }
      const bySlug = new Map(portfolio.map((p) => [p.slug, p]));
      const list = (data || [])
        .filter((r) => r.project_slug)
        .map((r) => {
          const p = bySlug.get(r.project_slug!);
          return {
            slug: r.project_slug!,
            title: p?.title ?? `${r.project_slug} (not on site)`,
            category: p?.category || "Other",
            likes: r.likes ?? 0,
            lastLikedAt: r.last_liked_at,
          };
        })
        .sort((a, b) => b.likes - a.likes);
      setRows(list);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const total = (rows || []).reduce((s, r) => s + r.likes, 0);
  const top = rows?.[0]?.likes || 1;
  const byCategory = Object.entries(
    (rows || []).reduce<Record<string, number>>((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + r.likes;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="inline-flex items-center gap-2 font-display text-lg font-bold">
          <Heart className="h-4 w-4 fill-current text-red-500" /> Client likes
        </h2>
        {rows && rows.length > 0 && (
          <span className="text-xs text-muted-foreground">{total} like{total === 1 ? "" : "s"} in total</span>
        )}
      </div>

      {rows === null ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Likes aren&apos;t set up yet. Run <code className="font-mono text-xs">supabase/migrations/20260930010000_project_likes.sql</code> in
          the Supabase SQL Editor.
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No likes yet. Visitors can tap the heart on any project in the portfolio.
        </p>
      ) : (
        <div className="mt-5 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Most liked projects</p>
            <ul className="mt-3 space-y-3">
              {rows.slice(0, 10).map((r) => (
                <li key={r.slug}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <Link
                      to="/portfolio/$projectId"
                      params={{ projectId: r.slug }}
                      className="truncate font-medium hover:text-primary"
                    >
                      {r.title}
                    </Link>
                    <span className="shrink-0 font-semibold">{r.likes}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-red-500/80" style={{ width: `${(r.likes / top) * 100}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.category}
                    {r.lastLikedAt && ` · last liked ${new Date(r.lastLikedAt).toLocaleDateString()}`}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">By project type</p>
            <ul className="mt-3 divide-y divide-border rounded-lg border border-border">
              {byCategory.map(([category, likes]) => (
                <li key={category} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span>{category}</span>
                  <span className="font-semibold">
                    {likes} <span className="text-xs font-normal text-muted-foreground">({Math.round((likes / total) * 100)}%)</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
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
