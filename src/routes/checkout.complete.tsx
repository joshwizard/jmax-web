import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { CheckCircle2, Download, Mail, FolderOpen, Loader2, XCircle } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { verifyPaystack } from "@/lib/payments.functions";
import { getDownloadUrl } from "@/lib/downloads.functions";
import { deliverableLabel } from "@/lib/product-files";
import { useCart } from "@/lib/cart";
import { usePromo } from "@/lib/usePromo";

export const Route = createFileRoute("/checkout/complete")({
  validateSearch: z.object({
    orderId: z.string().optional(),
    reference: z.string().optional(),
    trxref: z.string().optional(),
  }),
  head: () => ({ meta: [{ title: "Order complete · Jmax Builders" }] }),
  component: Complete,
});

interface SavedOrder {
  orderId: string;
  email: string;
  name: string;
  total: number;
  items: { title: string; license: string; qty: number; slug: string }[];
}

function Complete() {
  const { orderId, reference, trxref } = Route.useSearch();
  const [order, setOrder] = useState<SavedOrder | null>(null);
  const [status, setStatus] = useState<"verifying" | "paid" | "failed" | "idle">(
    reference || trxref ? "verifying" : "idle",
  );
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [verifiedOrderNumber, setVerifiedOrderNumber] = useState<string>("");
  const [emailSent, setEmailSent] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const verifyFn = useServerFn(verifyPaystack);
  const downloadFn = useServerFn(getDownloadUrl);
  const { clear: clearCart } = useCart();
  const { clear: clearPromo } = usePromo(0);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("last_order");
      if (raw) setOrder(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    const ref = reference || trxref;
    if (!ref) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await verifyFn({ data: { reference: ref } });
        if (cancelled) return;
        if (res.ok) {
          setStatus("paid");
          setVerifiedOrderNumber(res.orderNumber ?? "");
          setEmailSent(Boolean(res.emailSent));
          clearCart();
          clearPromo();
        } else {
          setStatus("failed");
          setErrorMsg(`Payment ${"status" in res ? res.status : "not successful"}.`);
        }
      } catch (err) {
        if (cancelled) return;
        setStatus("failed");
        setErrorMsg(err instanceof Error ? err.message : "Verification failed");
      }
    })();
    return () => { cancelled = true; };
  }, [reference, trxref, verifyFn, clearCart, clearPromo]);

  const download = async (slug: string, license: string, key: string) => {
    if (!slug) {
      toast.error("Open Your library to download");
      return;
    }
    setBusy(key);
    try {
      const { url } = await downloadFn({
        data: {
          productSlug: slug,
          license: license as "Architectural" | "Structural" | "BOQ",
        },
      });
      window.open(url, "_blank");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not get download link");
    } finally {
      setBusy(null);
    }
  };

  if (status === "verifying") {
    return (
      <Layout>
        <section className="container-page py-20 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <h1 className="mt-4 font-display text-2xl font-bold">Verifying your payment…</h1>
          <p className="mt-2 text-sm text-muted-foreground">Please wait, this only takes a moment.</p>
        </section>
      </Layout>
    );
  }

  if (status === "failed") {
    return (
      <Layout>
        <section className="container-page py-20 text-center">
          <XCircle className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-4 font-display text-2xl font-bold">Payment was not completed</h1>
          <p className="mt-2 text-sm text-muted-foreground">{errorMsg || "You can try again from the cart."}</p>
          <Link to="/cart" className="mt-6 inline-block rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:opacity-90">
            Return to cart
          </Link>
        </section>
      </Layout>
    );
  }

  const id = verifiedOrderNumber || orderId || order?.orderId || "JMX-DEMO-0000";
  const paid = status === "paid" || Boolean(reference || trxref);

  return (
    <Layout>
      <section className="container-page py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-border bg-card p-8 md:p-12">
            <div className="flex items-start gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                <CheckCircle2 className="h-7 w-7" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Order confirmed</p>
                <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Thank you{order?.name ? `, ${order.name}` : ""}.</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your order <span className="font-mono font-semibold text-foreground">{id}</span> is complete.
                  {emailSent ? (
                    <> Download links for the file(s) you bought were sent to {order?.email ? <span className="font-semibold text-foreground">{order.email}</span> : "your email"}.</>
                  ) : (
                    <> Download your purchased file(s) below, or from <Link to="/account/library" className="font-semibold text-foreground underline">Your library</Link>.
                      {order?.email ? <> A confirmation email will also go to <span className="font-semibold text-foreground">{order.email}</span> when email delivery is enabled.</> : null}
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-dashed border-border bg-secondary/40 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Download className="h-4 w-4 text-primary" /> Your purchased files
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Each button downloads only that deliverable. Links also stay in your library.
              </p>
              <div className="mt-4 space-y-2">
                {(order?.items ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Open Your library to access downloads for this order.</p>
                ) : (
                  order!.items.map((it, i) => {
                    const key = `${it.slug}-${it.license}-${i}`;
                    return (
                      <div key={key} className="flex items-center justify-between gap-3 rounded-md border border-border bg-card p-3 text-sm">
                        <div>
                          <p className="font-medium">{it.title}</p>
                          <p className="text-xs text-muted-foreground">{deliverableLabel(it.license)}</p>
                        </div>
                        <button
                          type="button"
                          disabled={!paid || !it.slug || busy === key}
                          onClick={() => download(it.slug, it.license, key)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-xs font-semibold text-ink-foreground hover:opacity-90 disabled:opacity-50"
                        >
                          {busy === key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} Download
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/account/library" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:opacity-90">
                <FolderOpen className="h-4 w-4" /> Access your library
              </Link>
              <a href="mailto:jmaxbuildersltd@gmail.com" className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-accent">
                <Mail className="h-4 w-4" /> Contact support
              </a>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Need to invoice a company? Reply to your receipt email and we'll re-issue it.
          </p>
        </div>
      </section>
    </Layout>
  );
}
