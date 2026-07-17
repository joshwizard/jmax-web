import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, ArrowRight } from "lucide-react";
import { productFromDb, type Product } from "@/lib/products";
import { loadProductMedia } from "@/lib/product-gallery";
import { getRecent } from "@/lib/recentlyViewed";
import { supabase } from "@/integrations/supabase/client";
import { TypeBadge } from "./TypeBadge";

export function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    const slugs = getRecent().filter((s) => s !== excludeSlug).slice(0, 4);
    if (slugs.length === 0) {
      setItems([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("products")
        .select("id, slug, title, category, price_kes, description, cover_url, file_path, bedrooms, bathrooms, area_sqft, architectural_price_kes, structural_price_kes, boq_price_kes")
        .eq("is_active", true)
        .in("slug", slugs);
      if (cancelled || !data) return;
      const bySlug = new Map(data.map((r) => [r.slug, r]));
      const ordered = (
        await Promise.all(
          slugs.map(async (slug) => {
            const row = bySlug.get(slug);
            if (!row) return null;
            const media = await loadProductMedia(row.slug, row.cover_url);
            return productFromDb(row, undefined, media);
          }),
        )
      ).filter(Boolean) as Product[];
      if (!cancelled) setItems(ordered);
    })();
    return () => {
      cancelled = true;
    };
  }, [excludeSlug]);

  if (items.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <Clock className="h-4 w-4 text-primary" /> Recently viewed
        </h2>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => (
          <Link
            key={p.id}
            to="/marketplace/$slug"
            params={{ slug: p.slug }}
            className="group flex gap-3 rounded-lg border border-border bg-card p-3 transition hover:border-primary"
          >
            <img src={p.image} alt={p.title} className="h-16 w-16 shrink-0 rounded-md object-cover" loading="lazy" />
            <div className="flex min-w-0 flex-1 flex-col">
              <TypeBadge type={p.type} />
              <p className="mt-1 truncate text-sm font-semibold">{p.title}</p>
              <span className="mt-auto inline-flex items-center gap-1 text-xs text-primary">
                View <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
