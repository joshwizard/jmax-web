import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreditCard, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { Layout } from "@/components/site/Layout";
import { AuthGate } from "@/components/site/AuthGate";
import { useCart } from "@/lib/cart";
import { formatKES } from "@/lib/products";
import { usePromo } from "@/lib/usePromo";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { initPaystack } from "@/lib/payments.functions";

export const Route = createFileRoute("/checkout/")({
  head: () => ({ meta: [{ title: "Checkout · Jmax Builders" }] }),
  component: () => (<AuthGate><Checkout /></AuthGate>),
});

function Checkout() {
  const { items, subtotal, clear: _clear } = useCart();
  const { discount, promo, clear: _clearPromo } = usePromo(subtotal);
  const { user } = useAuth();
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * 0.16);
  const total = taxable + tax;
  const navigate = useNavigate();
  const initFn = useServerFn(initPaystack);

  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: (user?.user_metadata?.full_name as string) || "",
    email: user?.email || "",
    phone: "",
    country: "Kenya",
  });

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: f.name || (user.user_metadata?.full_name as string) || "",
        email: f.email || user.email || "",
      }));
    }
  }, [user]);

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-page py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Nothing to check out</h1>
          <Link to="/marketplace" className="mt-4 inline-block text-primary hover:underline">Browse marketplace</Link>
        </div>
      </Layout>
    );
  }

  const startPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed || !user) return;
    setBusy(true);
    const num = "JMX-" + Math.random().toString(36).slice(2, 7).toUpperCase() + "-" + Date.now().toString().slice(-4);
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          order_number: num,
          status: "pending",
          subtotal_kes: subtotal,
          discount_kes: discount,
          tax_kes: tax,
          total_kes: total,
          promo_code: promo?.code ?? null,
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          payment_method: "paystack",
        })
        .select("id")
        .single();
      if (error || !order) throw error || new Error("Order failed");

      const { error: itemsErr } = await supabase.from("order_items").insert(
        items.map((it) => ({
          order_id: order.id,
          product_slug: it.slug,
          title: it.title,
          license: it.license,
          qty: it.qty,
          unit_price_kes: it.price,
        })),
      );
      if (itemsErr) throw itemsErr;

      try {
        sessionStorage.setItem("last_order", JSON.stringify({
          orderId: num, email: form.email, name: form.name, total, items,
        }));
      } catch {}

      const callbackUrl = `${window.location.origin}/checkout/complete`;
      const res = await initFn({ data: { orderId: order.id, callbackUrl } });
      window.location.href = res.authorizationUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start payment");
      setBusy(false);
    }
  };

  // navigate is reserved for future client-side flows
  void navigate;

  return (
    <Layout>
      <section className="container-page py-12">
        <Link to="/cart" className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to cart
        </Link>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">Checkout</h1>

        <form onSubmit={startPayment} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <Section title="Contact details">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} disabled={busy} />
                <Field label="Email" type="email" required value={form.email} onChange={(v) => setForm({ ...form, email: v })} disabled={busy} />
                <Field label="Phone (07xx or +2547xx)" required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} disabled={busy} />
                <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} disabled={busy} />
              </div>
            </Section>

            <Section title="Payment — Paystack">
              <div className="rounded-lg border border-border bg-secondary/40 p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-md bg-[oklch(0.55_0.18_250)] text-white"><CreditCard className="h-5 w-5" /></span>
                  <div>
                    <p className="font-semibold">Pay securely with Paystack</p>
                    <p className="text-xs text-muted-foreground">Card, M-Pesa, bank transfer and more. You'll be redirected to Paystack's secure checkout.</p>
                  </div>
                </div>
              </div>
            </Section>

            <label className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[oklch(0.72_0.18_55)]"
                required
                disabled={busy}
              />
              <span className="text-muted-foreground">
                I agree to the{" "}
                <Link to="/legal/terms" className="font-semibold text-foreground underline">Terms of Sale</Link>,{" "}
                <Link to="/legal/refunds" className="font-semibold text-foreground underline">Refund Policy</Link>, and the{" "}
                <Link to="/legal/disclaimer" className="font-semibold text-foreground underline">Plans & BOQ Disclaimer</Link>.
              </span>
            </label>
          </div>

          <aside className="rounded-xl border border-border bg-card p-6 lg:sticky lg:top-20 lg:self-start">
            <h2 className="font-display text-lg font-bold">Order summary</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {items.map((it) => (
                <li key={it.productId + it.license} className="flex justify-between gap-3">
                  <div>
                    <p className="font-medium">{it.title}</p>
                    <p className="text-xs text-muted-foreground">{it.license} · ×{it.qty}</p>
                  </div>
                  <p className="font-semibold whitespace-nowrap">{formatKES(it.price * it.qty)}</p>
                </li>
              ))}
            </ul>
            <div className="my-4 border-t border-border" />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground"><dt>Subtotal</dt><dd>{formatKES(subtotal)}</dd></div>
              {discount > 0 && <div className="flex justify-between text-primary"><dt>Discount ({promo?.code})</dt><dd>− {formatKES(discount)}</dd></div>}
              <div className="flex justify-between text-muted-foreground"><dt>VAT (16%) placeholder</dt><dd>{formatKES(tax)}</dd></div>
              <div className="flex justify-between text-base font-bold pt-2"><dt>Total</dt><dd>{formatKES(total)}</dd></div>
            </dl>
            <button
              type="submit"
              disabled={busy || !agreed}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting…</> : <><CreditCard className="h-4 w-4" /> Pay {formatKES(total)}</>}
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">Secured by Paystack.</p>
          </aside>
        </form>
      </section>
    </Layout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="font-display text-base font-bold">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", required, disabled,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; disabled?: boolean }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}{required && " *"}</span>
      <input
        type={type}
        value={value}
        required={required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
      />
    </label>
  );
}
