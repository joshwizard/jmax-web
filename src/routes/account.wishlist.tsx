import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { AuthGate } from "@/components/site/AuthGate";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { TypeBadge } from "@/components/site/TypeBadge";
import { useWishlist } from "@/lib/wishlist";
import { formatKES, productFromDb, type Product } from "@/lib/products";
import { loadProductMedia } from "@/lib/product-gallery";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist · Jmax Builders" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  return (<AuthGate><WishlistInner /></AuthGate>);
}
function WishlistInner() {
  const { ids, remove, clear } = useWishlist();
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    if (ids.length === 0) {
      setItems([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("products")
        .select("id, slug, title, category, price_kes, description, cover_url, file_path, bedrooms, bathrooms, area_sqft, architectural_price_kes, structural_price_kes, boq_price_kes")
        .in("id", ids);
      if (cancelled || !data) return;
      const byId = new Map(data.map((r) => [r.id, r]));
      const ordered = (
        await Promise.all(
          ids.map(async (id) => {
            const row = byId.get(id);
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
  }, [ids]);

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Account", to: "/account" }, { label: "Wishlist" }]} />
      <section className="container-page py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-ink text-ink-foreground">
              <Heart className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight">Saved for later</h1>
              <p className="text-sm text-muted-foreground">{items.length} item{items.length === 1 ? "" : "s"}</p>
            </div>
          </div>
          {items.length > 0 && (
            <button onClick={clear} className="text-xs font-semibold text-muted-foreground hover:text-destructive">Clear all</button>
          )}
        </div>

        {ids.length === 0 ? (
          <div className="mt-10 grid place-items-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-secondary text-muted-foreground">
              <ShoppingBag className="h-6 w-6" />
            </span>
            <p className="mt-4 font-display text-lg font-bold">Nothing saved yet</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Tap the heart on any plan or BOQ to save it here for later.
            </p>
            <Link to="/marketplace" className="mt-6 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-ink-foreground hover:opacity-90">
              Browse marketplace
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-3">
            {items.map((p) => (
              <div key={p.id} className="flex gap-4 rounded-xl border border-border bg-card p-4">
                <Link to="/marketplace/$slug" params={{ slug: p.slug }} className="block h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                  <img src={p.image} alt={p.title} className="h-full w-full object-cover" loading="lazy" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <TypeBadge type={p.type} />
                  <Link to="/marketplace/$slug" params={{ slug: p.slug }} className="mt-1 font-display font-semibold hover:text-primary">{p.title}</Link>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.shortDescription}</p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
                    <p className="font-display text-base font-bold">{formatKES(p.price)}</p>
                    <div className="flex gap-2">
                      <button onClick={() => remove(p.id)} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                      <Link to="/marketplace/$slug" params={{ slug: p.slug }} className="rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90">
                        View product
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
