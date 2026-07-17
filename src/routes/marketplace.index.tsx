import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Filter as FilterIcon, X, SearchX, Lightbulb, Sparkles } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { SectionHeader } from "@/components/site/SectionHeader";
import { products as seedProducts, productFromDb, type Product } from "@/lib/products";
import { loadProductMedia } from "@/lib/product-gallery";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/marketplace/")({
  head: () => ({
    meta: [
      { title: "Marketplace — Plans & BOQs · Jmax Builders" },
      { name: "description", content: "Browse buildable architectural plan sets and measured Bills of Quantities for residential and commercial projects." },
    ],
  }),
  component: Marketplace,
});

const TYPES: ("All" | Product["type"])[] = ["All", "Plans", "BOQ"];
const BUILDINGS: ("All" | Product["buildingType"])[] = ["All", "Residential", "Commercial", "Mixed-Use"];
const BANDS: ("All" | Product["sqftBand"])[] = ["All", "Under 1,500", "1,500 – 3,000", "3,000 – 5,000", "5,000+"];

const PRODUCT_SELECT =
  "id, slug, title, category, price_kes, description, cover_url, file_path, bedrooms, bathrooms, area_sqft, architectural_price_kes, structural_price_kes, boq_price_kes";

function Marketplace() {
  const [type, setType] = useState<(typeof TYPES)[number]>("All");
  const [building, setBuilding] = useState<(typeof BUILDINGS)[number]>("All");
  const [band, setBand] = useState<(typeof BANDS)[number]>("All");
  const [q, setQ] = useState("");
  const [catalog, setCatalog] = useState<Product[] | null>(null);

  useEffect(() => {
    const seedBySlug = new Map(seedProducts.map((p) => [p.slug, p]));
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("products").select(PRODUCT_SELECT).eq("is_active", true);
      if (cancelled || !data) {
        if (!cancelled) setCatalog([]);
        return;
      }
      const items = await Promise.all(
        data.map(async (r) => {
          const media = await loadProductMedia(r.slug, r.cover_url);
          return productFromDb(r, seedBySlug.get(r.slug), media);
        }),
      );
      if (!cancelled) setCatalog(items);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!catalog) return [];
    return catalog.filter((p) => {
      if (type !== "All" && p.type !== type) return false;
      if (building !== "All" && p.buildingType !== building) return false;
      if (band !== "All" && p.sqftBand !== band) return false;
      if (q.trim()) {
        const needle = q.toLowerCase();
        if (!`${p.title} ${p.shortDescription} ${(p.discipline || []).join(" ")}`.toLowerCase().includes(needle)) return false;
      }
      return true;
    });
  }, [catalog, type, building, band, q]);

  const reset = () => { setType("All"); setBuilding("All"); setBand("All"); setQ(""); };

  return (
    <Layout>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-page py-14">
          <SectionHeader
            eyebrow="Marketplace"
            title="Plans & BOQs you can build from"
            description="Every product is reviewed and used by our own teams. Buy a plan set, a BOQ, or both — with clear inclusions, exclusions, and licensing."
          />
        </div>
      </section>

      <section className="container-page py-10">
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-6 rounded-xl border border-border bg-card p-5 lg:sticky lg:top-20 lg:self-start">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider">
                <FilterIcon className="h-4 w-4" /> Filters
              </h3>
              <button onClick={reset} className="text-xs text-muted-foreground hover:text-primary">Reset</button>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search plans, BOQs..."
                className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <FilterGroup label="Product type" value={type} options={TYPES} onChange={setType} />
            <FilterGroup label="Building type" value={building} options={BUILDINGS} onChange={setBuilding} />
            <FilterGroup label="Floor area" value={band} options={BANDS} onChange={setBand} />
          </aside>

          <div>
            <div className="mb-5 flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                {catalog === null ? (
                  "Loading catalog…"
                ) : (
                  <>
                    Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {catalog.length}
                  </>
                )}
              </p>
            </div>

            {catalog === null ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="aspect-[4/5] animate-pulse rounded-xl border border-border bg-muted" />
                ))}
              </div>
            ) : catalog.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
                <h3 className="font-display text-xl font-bold">Catalog coming soon</h3>
                <p className="mt-2 text-sm text-muted-foreground">New plans and BOQs are being prepared. Check back shortly, or request a custom set.</p>
                <Link to="/consult" className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
                  Book a consultation
                </Link>
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                catalog={catalog}
                query={q}
                activeFilters={{ type, building, band }}
                onApply={(patch) => {
                  if (patch.type !== undefined) setType(patch.type);
                  if (patch.building !== undefined) setBuilding(patch.building);
                  if (patch.band !== undefined) setBand(patch.band);
                  if (patch.q !== undefined) setQ(patch.q);
                }}
                onReset={reset}
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}

function FilterGroup<T extends string>({
  label, value, options, onChange,
}: { label: string; value: T; options: readonly T[]; onChange: (v: T) => void }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
              value === o
                ? "border-ink bg-ink text-ink-foreground"
                : "border-border bg-background text-foreground hover:border-primary"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

type ActiveFilters = {
  type: (typeof TYPES)[number];
  building: (typeof BUILDINGS)[number];
  band: (typeof BANDS)[number];
};

type Patch = Partial<ActiveFilters & { q: string }>;

interface Suggestion {
  label: string;
  patch: Patch;
  count: number;
}

function buildSuggestions(catalog: Product[], active: ActiveFilters, q: string): Suggestion[] {
  const out: Suggestion[] = [];
  const seen = new Set<string>();
  const push = (s: Suggestion) => {
    const key = JSON.stringify(s.patch);
    if (seen.has(key) || s.count === 0) return;
    seen.add(key);
    out.push(s);
  };

  if (q.trim()) {
    const count = catalog.filter((p) =>
      (active.type === "All" || p.type === active.type) &&
      (active.building === "All" || p.buildingType === active.building) &&
      (active.band === "All" || p.sqftBand === active.band)
    ).length;
    push({ label: `Clear search "${q}"`, patch: { q: "" }, count });
  }

  const relax: { key: keyof ActiveFilters; label: string }[] = [
    { key: "band", label: "Any floor area" },
    { key: "building", label: "Any building type" },
    { key: "type", label: "Plans + BOQs" },
  ];
  for (const r of relax) {
    if (active[r.key] !== "All") {
      const next = { ...active, [r.key]: "All" } as ActiveFilters;
      const count = catalog.filter((p) =>
        (next.type === "All" || p.type === next.type) &&
        (next.building === "All" || p.buildingType === next.building) &&
        (next.band === "All" || p.sqftBand === next.band) &&
        (!q.trim() || `${p.title} ${p.shortDescription} ${p.discipline.join(" ")}`.toLowerCase().includes(q.toLowerCase()))
      ).length;
      push({ label: r.label, patch: { [r.key]: "All" } as Patch, count });
    }
  }

  if (active.type !== "All") {
    const other: Product["type"] = active.type === "Plans" ? "BOQ" : "Plans";
    const count = catalog.filter((p) =>
      p.type === other &&
      (active.building === "All" || p.buildingType === active.building) &&
      (active.band === "All" || p.sqftBand === active.band)
    ).length;
    push({ label: `Switch to ${other}`, patch: { type: other }, count });
  }

  return out.slice(0, 4);
}

function EmptyState({
  catalog,
  query,
  activeFilters,
  onApply,
  onReset,
}: {
  catalog: Product[];
  query: string;
  activeFilters: ActiveFilters;
  onApply: (patch: Patch) => void;
  onReset: () => void;
}) {
  const suggestions = buildSuggestions(catalog, activeFilters, query);
  const activeChips: { label: string; patch: Patch }[] = [];
  if (query.trim()) activeChips.push({ label: `Search: "${query}"`, patch: { q: "" } });
  if (activeFilters.type !== "All") activeChips.push({ label: `Type: ${activeFilters.type}`, patch: { type: "All" } });
  if (activeFilters.building !== "All") activeChips.push({ label: `Building: ${activeFilters.building}`, patch: { building: "All" } });
  if (activeFilters.band !== "All") activeChips.push({ label: `Area: ${activeFilters.band}`, patch: { band: "All" } });

  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-8 md:p-12">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-secondary text-muted-foreground">
          <SearchX className="h-7 w-7" />
        </span>
        <h3 className="mt-5 font-display text-2xl font-bold tracking-tight">No matches on the drawings</h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {query.trim()
            ? <>Nothing matched <span className="font-semibold text-foreground">"{query}"</span> with your current filters.</>
            : <>Your current filter combination didn't return any plans or BOQs.</>}
        </p>

        {activeChips.length > 0 && (
          <div className="mt-6 w-full">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active filters</p>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              {activeChips.map((c) => (
                <button
                  key={c.label}
                  onClick={() => onApply(c.patch)}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium hover:border-primary"
                >
                  {c.label} <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="mt-8 border-t border-border pt-6">
          <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Lightbulb className="h-3.5 w-3.5" /> Try one of these
          </p>
          <div className="mx-auto mt-4 grid max-w-2xl gap-2 sm:grid-cols-2">
            {suggestions.map((s) => (
              <button
                key={s.label}
                onClick={() => onApply(s.patch)}
                className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3 text-left transition hover:border-primary hover:bg-accent"
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> {s.label}
                </span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
                  {s.count} {s.count === 1 ? "result" : "results"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <button onClick={onReset} className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-ink-foreground hover:opacity-90">
          Clear all filters
        </button>
        <Link to="/contact" className="rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-accent">
          Request a custom plan or BOQ
        </Link>
      </div>
    </div>
  );
}
