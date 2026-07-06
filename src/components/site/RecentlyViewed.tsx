import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, ArrowRight } from "lucide-react";
import { products } from "@/lib/products";
import { getRecent } from "@/lib/recentlyViewed";
import { TypeBadge } from "./TypeBadge";

export function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(getRecent().filter((s) => s !== excludeSlug));
  }, [excludeSlug]);

  const items = slugs.map((s) => products.find((p) => p.slug === s)).filter(Boolean).slice(0, 4) as typeof products;
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
