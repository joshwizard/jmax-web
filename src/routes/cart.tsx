import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, Tag as TagIcon, X, Check } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { TypeBadge } from "@/components/site/TypeBadge";
import { useCart } from "@/lib/cart";
import { formatKES } from "@/lib/products";
import { usePromo } from "@/lib/usePromo";
import { PROMO_CODES } from "@/lib/promo";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart · Jmax Builders" }, { name: "description", content: "Review your selected plans and BOQs." }] }),
  component: CartPage,
});

function CartPage() {
  const { items, remove, setQty, subtotal } = useCart();
  const { code, setPromo, discount, promo, error, clear: clearPromo } = usePromo(subtotal);
  const [input, setInput] = useState(code ?? "");
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * 0.16);
  const total = taxable + tax;

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-page py-20">
          <div className="mx-auto grid max-w-xl place-items-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-secondary text-muted-foreground">
              <ShoppingBag className="h-6 w-6" />
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold">Your cart is empty</h1>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Browse the marketplace and add a plan or BOQ to get started.
            </p>
            <Link to="/marketplace" className="mt-6 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-ink-foreground hover:opacity-90">
              Browse marketplace <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container-page py-12">
        <h1 className="font-display text-3xl font-bold tracking-tight">Cart</h1>
        <p className="mt-1 text-sm text-muted-foreground">{items.length} item{items.length === 1 ? "" : "s"}</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.productId + it.license} className="flex gap-4 rounded-xl border border-border bg-card p-4">
                <Link to="/marketplace/$slug" params={{ slug: it.slug }} className="block h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                  <img src={it.image} alt={it.title} loading="lazy" className="h-full w-full object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <TypeBadge type={it.type} />
                      <Link to="/marketplace/$slug" params={{ slug: it.slug }} className="mt-2 block font-display font-semibold leading-snug hover:text-primary">
                        {it.title}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">{it.license}</p>
                    </div>
                    <p className="font-display text-lg font-bold">{formatKES(it.price * it.qty)}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3 text-xs text-muted-foreground">
                    <div className="inline-flex items-center overflow-hidden rounded-md border border-border">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQty(it.productId, it.license, it.qty - 1)}
                        className="grid h-8 w-8 place-items-center hover:bg-accent"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="grid h-8 min-w-8 place-items-center px-2 text-xs font-semibold text-foreground">{it.qty}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQty(it.productId, it.license, it.qty + 1)}
                        className="grid h-8 w-8 place-items-center hover:bg-accent"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button onClick={() => remove(it.productId, it.license)} className="inline-flex items-center gap-1 hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="rounded-xl border border-border bg-card p-6 lg:sticky lg:top-20 lg:self-start">
            <h2 className="font-display text-lg font-bold">Order summary</h2>

            {/* Promo code */}
            <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <TagIcon className="h-3.5 w-3.5" /> Promo code
              </p>
              {promo ? (
                <div className="mt-2 flex items-center justify-between gap-2 rounded-md border border-primary/40 bg-background px-3 py-2 text-sm">
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <Check className="h-3.5 w-3.5 text-primary" /> {promo.code}
                  </span>
                  <button onClick={() => { clearPromo(); setInput(""); }} className="text-xs text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <form
                  className="mt-2 flex gap-2"
                  onSubmit={(e) => { e.preventDefault(); setPromo(input.trim() || null); }}
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g. JMAX10"
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm uppercase outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <button type="submit" className="rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-ink-foreground hover:opacity-90">Apply</button>
                </form>
              )}
              {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
              {!promo && (
                <details className="mt-2 text-xs text-muted-foreground">
                  <summary className="cursor-pointer hover:text-primary">Available codes</summary>
                  <ul className="mt-2 space-y-1">
                    {PROMO_CODES.map((c) => (
                      <li key={c.code}><span className="font-mono font-semibold text-foreground">{c.code}</span> — {c.label}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Subtotal" value={formatKES(subtotal)} />
              {discount > 0 && <Row label={`Discount (${promo?.code})`} value={`− ${formatKES(discount)}`} />}
              <Row label="VAT (16%) — placeholder" value={formatKES(tax)} />
              <div className="my-3 border-t border-border" />
              <Row label="Total" value={formatKES(total)} bold />
            </dl>
            <Link
              to="/checkout"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
            >
              Proceed to checkout <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-center text-xs text-muted-foreground">Secure checkout · Digital delivery</p>
          </aside>
        </div>
      </section>
    </Layout>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-bold" : "text-muted-foreground"}`}>
      <dt>{label}</dt>
      <dd className={bold ? "text-foreground" : ""}>{value}</dd>
    </div>
  );
}
