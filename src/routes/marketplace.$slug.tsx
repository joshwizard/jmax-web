import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, X, ShieldCheck, FileDown, Mail, ShoppingCart, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/site/Layout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { TypeBadge } from "@/components/site/TypeBadge";
import { ProductCard } from "@/components/site/ProductCard";
import { RecentlyViewed } from "@/components/site/RecentlyViewed";
import { ProductReviews } from "@/components/site/ProductReviews";
import {
  getProduct,
  productFromDb,
  formatKES,
  type Deliverable,
  type Product,
} from "@/lib/products";
import { loadProductMedia } from "@/lib/product-gallery";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { pushRecent } from "@/lib/recentlyViewed";

const PRODUCT_SELECT =
  "id, slug, title, category, price_kes, description, cover_url, file_path, bedrooms, bathrooms, area_sqft, architectural_price_kes, structural_price_kes, boq_price_kes";

async function fetchProduct(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error || !data) return null;
  const media = await loadProductMedia(data.slug, data.cover_url);
  return productFromDb(data, getProduct(data.slug), media);
}

async function fetchRelated(current: Product): Promise<Product[]> {
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("category", current.type)
    .neq("slug", current.slug)
    .limit(3);
  if (!data?.length) return [];
  return Promise.all(
    data.map(async (r) => {
      const media = await loadProductMedia(r.slug, r.cover_url);
      return productFromDb(r, getProduct(r.slug), media);
    }),
  );
}

export const Route = createFileRoute("/marketplace/$slug")({
  head: ({ params }) => {
    const p = getProduct(params.slug);
    if (!p) return { meta: [{ title: "Product · Jmax Builders" }] };
    const url = `https://jmaxbuilders.com/marketplace/${p.slug}`;
    return {
      meta: [
        { title: `${p.title} · Jmax Builders` },
        { name: "description", content: p.shortDescription },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.shortDescription },
        { property: "og:type", content: "product" },
        { property: "og:image", content: p.image },
        { name: "twitter:image", content: p.image },
      ],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.title,
          description: p.shortDescription,
          image: [p.image],
          sku: p.id,
          category: p.type,
          brand: { "@type": "Brand", name: "Jmax Builders" },
          offers: {
            "@type": "Offer",
            url,
            priceCurrency: "KES",
            price: p.price,
            availability: "https://schema.org/InStock",
          },
        }),
      }],
    };
  },
  notFoundComponent: () => (
    <Layout>
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Product not found</h1>
        <Link to="/marketplace" className="mt-4 inline-block text-primary hover:underline">Back to marketplace</Link>
      </div>
    </Layout>
  ),
  errorComponent: ({ error, reset }) => (
    <Layout>
      <div className="container-page py-24 text-center">
        <p>{error.message}</p>
        <button onClick={reset} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Retry</button>
      </div>
    </Layout>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const [p, setP] = useState<Product | null | undefined>(() => getProduct(slug) ?? undefined);
  const [activeImg, setActiveImg] = useState(0);
  const ORDER: Deliverable[] = ["Architectural", "Structural", "BOQ"];
  const available = useMemo(
    () => (p ? [...p.deliverables].sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind)) : []),
    [p],
  );
  const [picked, setPicked] = useState<Record<Deliverable, boolean>>({
    Architectural: false,
    Structural: false,
    BOQ: false,
  });
  const [related, setRelated] = useState<Product[]>([]);
  const { add } = useCart();
  const { has: isWished, toggle: toggleWish } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const emptyPicked = { Architectural: false, Structural: false, BOQ: false } as Record<Deliverable, boolean>;
    const pickFirst = (product: Product) => {
      const first = product.deliverables[0]?.kind;
      setPicked(first ? { ...emptyPicked, [first]: true } : emptyPicked);
    };

    setActiveImg(0);
    setP(undefined);
    setRelated([]);
    setPicked(emptyPicked);
    fetchProduct(slug).then((product) => {
      if (cancelled) return;
      setP(product);
      if (product) {
        pickFirst(product);
        fetchRelated(product).then((items) => {
          if (!cancelled) setRelated(items);
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (p) pushRecent(p.slug);
  }, [p]);

  useEffect(() => {
    setActiveImg(0);
  }, [p?.slug]);

  if (p === undefined) {
    return (
      <Layout>
        <div className="container-page py-24 text-center text-sm text-muted-foreground">Loading…</div>
      </Layout>
    );
  }
  if (p === null) throw notFound();

  const gallery = (p.images && p.images.length > 0 ? p.images : [p.preview || p.image]).filter(Boolean);
  const currentSrc = gallery[Math.min(activeImg, gallery.length - 1)] || p.preview || p.image;
  const wished = isWished(p.id);
  const selected = available.filter((d) => picked[d.kind]);
  const total = selected.reduce((s, d) => s + d.price, 0);

  const step = (dir: -1 | 1) => {
    setActiveImg((i) => (i + dir + gallery.length) % gallery.length);
  };

  const onAdd = (goToCart = false) => {
    if (selected.length === 0) {
      toast.error("Pick at least one deliverable");
      return;
    }
    for (const d of selected) {
      add({
        productId: p.id, slug: p.slug, title: p.title, type: p.type,
        license: d.kind, price: d.price, image: p.image,
      });
    }
    toast.success("Added to cart", {
      description: `${p.title} — ${selected.map((d) => d.kind).join(", ")}`,
    });
    if (goToCart) navigate({ to: "/cart" });
  };


  const onWish = () => {
    toggleWish(p.id);
    toast.success(wished ? "Removed from wishlist" : "Saved to wishlist", { description: p.title });
  };

  const sheets = p.sheets || [];

  return (
    <Layout>
      <Breadcrumbs items={[
        { label: "Marketplace", to: "/marketplace" },
        { label: p.type === "Plans" ? "Plans" : "BOQs" },
        { label: p.title },
      ]} />


      <section className="container-page py-10">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image / preview gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted">
              <img
                key={currentSrc}
                src={currentSrc}
                alt={`${p.title} — photo ${activeImg + 1}`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute left-4 top-4"><TypeBadge type={p.type} /></div>
              <div className="pointer-events-none absolute bottom-3 right-3">
                <span className="rounded bg-ink/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-foreground/90">
                  Preview
                </span>
              </div>
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() => step(-1)}
                    className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/90 text-foreground shadow-sm transition hover:bg-background"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() => step(1)}
                    className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/90 text-foreground shadow-sm transition hover:bg-background"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-ink/60 px-2.5 py-1.5">
                    {gallery.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Go to image ${i + 1}`}
                        onClick={() => setActiveImg(i)}
                        className={`h-1.5 rounded-full transition ${i === activeImg ? "w-4 bg-primary" : "w-1.5 bg-ink-foreground/50 hover:bg-ink-foreground/80"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {gallery.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    aria-label={`Show image ${i + 1}`}
                    className={`aspect-[4/3] overflow-hidden rounded-md border-2 transition ${
                      i === activeImg ? "border-primary" : "border-transparent hover:border-border"
                    }`}
                  >
                    <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Preview shown is watermarked. Purchased deliverables are clean, print-ready files in the listed formats.
              {gallery.length > 1 ? ` · ${activeImg + 1} / ${gallery.length}` : ""}
            </p>
          </div>

          {/* Details */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{p.discipline.join(" · ")}</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl text-balance">{p.title}</h1>
            <p className="mt-3 text-muted-foreground">{p.longDescription}</p>

            <div className="mt-5 flex flex-wrap gap-1.5 text-xs">
              <Tag>{p.buildingType}</Tag>
              {p.bedrooms != null && <Tag>{p.bedrooms} bed</Tag>}
              {p.bathrooms != null && <Tag>{p.bathrooms} bath</Tag>}
              {p.floors != null && <Tag>{p.floors} {p.floors === 1 ? "floor" : "floors"}</Tag>}
              {p.plotSize && <Tag>{p.plotSize}</Tag>}
              {p.areaSqft != null && <Tag>{p.areaSqft.toLocaleString()} sq ft</Tag>}
              {p.formats.map((f) => <Tag key={f}>{f}</Tag>)}
            </div>

            {/* Deliverables selector */}
            <div className="mt-7 rounded-xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Choose what you need</p>
              {available.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Digital files for this product are being prepared. Email{" "}
                  <a href="mailto:jmaxbuildersltd@gmail.com" className="underline">jmaxbuildersltd@gmail.com</a>{" "}
                  or book a consult if you need them urgently.
                </p>
              ) : (
                <>
              <p className="mt-1 text-xs text-muted-foreground">Each option is a separate file. You only receive what you buy.</p>
              <div className="mt-3 grid gap-2">
                {available.map((d) => {
                  const checked = picked[d.kind];
                  return (
                    <label
                      key={d.kind}
                      className={`flex cursor-pointer items-start justify-between gap-4 rounded-lg border p-4 text-left transition ${
                        checked ? "border-ink bg-ink/[0.02] ring-1 ring-ink" : "border-border hover:border-primary"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => setPicked({ ...picked, [d.kind]: e.target.checked })}
                          className="mt-1 h-4 w-4 accent-foreground"
                        />
                        <div>
                          <p className="font-semibold">{d.kind === "BOQ" ? "Bill of Quantities (BOQ)" : `${d.kind} drawings`}</p>
                          <p className="text-xs text-muted-foreground">Separate file · single-use license · one project, one site.</p>
                        </div>
                      </div>
                      <p className="font-display text-lg font-bold whitespace-nowrap">{formatKES(d.price)}</p>
                    </label>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
                <span className="text-muted-foreground">{selected.length} selected</span>
                <span className="font-display text-base font-bold">Total {formatKES(total)}</span>
              </div>


              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={() => onAdd(false)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-background px-5 py-3 text-sm font-semibold transition hover:bg-accent"
                >
                  <ShoppingCart className="h-4 w-4" /> Add to cart
                </button>
                <button
                  onClick={() => onAdd(true)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  Buy now
                </button>
              </div>
                </>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={onWish}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-xs font-semibold transition ${wished ? "border-primary text-primary" : "border-border hover:border-primary"}`}
                >
                  <Heart className={`h-3.5 w-3.5 ${wished ? "fill-current" : ""}`} /> {wished ? "Saved" : "Save for later"}
                </button>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-md bg-secondary/60 p-3 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>Digital delivery via download link & email after checkout. Support: <a href="mailto:jmaxbuildersltd@gmail.com" className="underline">jmaxbuildersltd@gmail.com</a></p>
              </div>
            </div>
          </div>
        </div>

        {/* Drawing sheet previews */}
        {sheets.length > 0 && (
          <div className="mt-14">
            <h2 className="font-display text-2xl font-bold">Drawing previews</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sample sheets from the set. Full purchased files are clean and print-ready.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sheets.map((sheet) => (
                <figure key={sheet.src} className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="relative aspect-[4/3] bg-muted">
                    <img src={sheet.src} alt={sheet.label} loading="lazy" className="h-full w-full object-cover" />
                    <span className="absolute bottom-2 right-2 rounded bg-ink/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-foreground/90">
                      Preview
                    </span>
                  </div>
                  <figcaption className="border-t border-border px-4 py-2.5 text-sm font-semibold">{sheet.label}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}

        {/* Inclusions & exclusions */}
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <Panel title="What's included">
            <ul className="space-y-2 text-sm">
              {p.inclusions.map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> <span>{i}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="What's not included">
            <ul className="space-y-2 text-sm">
              {p.exclusions.map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /> <span>{i}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* BOQ-specific or Plans-specific blocks */}
        {p.type === "BOQ" && (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Panel title="Measurement basis">
              <p className="text-sm text-muted-foreground">{p.measurementBasis}</p>
              <p className="mt-2 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Units:</span> {p.units}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                Quantities reflect drawings as supplied at the date of issue. Rates are indicative; reconfirm with current market quotations before contract sum.
              </p>
            </Panel>
            <Panel title="Avoiding misunderstandings">
              <p className="text-sm text-muted-foreground">
                Each item is described with its measurement and unit. Where scope is uncertain, items are marked as <em>provisional</em> with a clear note. Read inclusions and exclusions before pricing.
              </p>
            </Panel>
          </div>
        )}

        {/* License & support */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Panel title="Licensing summary">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="font-semibold text-foreground">Single-use license:</span> Each plan is licensed for one project on one site. Reuse on additional sites or projects requires a new license. Resale or redistribution of source files is not permitted.</li>
            </ul>
            <Link to="/legal/terms" className="mt-3 inline-block text-xs font-semibold text-primary hover:underline">Read full Terms of Sale →</Link>
          </Panel>
          <Panel title="Support & delivery">
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><FileDown className="mt-0.5 h-4 w-4 text-primary" /> Instant download links after checkout, valid for 30 days.</li>
              <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 text-primary" /> Email response within one business day on weekdays.</li>
            </ul>
          </Panel>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-2xl font-bold">More {p.type === "Plans" ? "plan sets" : "BOQs"}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => <ProductCard key={r.id} p={r} />)}
            </div>
          </div>
        )}

        <ProductReviews productId={p.id} />

        <RecentlyViewed excludeSlug={p.slug} />
      </section>
    </Layout>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">{children}</span>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="font-display text-base font-bold">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}
