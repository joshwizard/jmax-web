import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, FolderOpen, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Layout } from "@/components/site/Layout";
import { AuthGate } from "@/components/site/AuthGate";
import { supabase } from "@/integrations/supabase/client";
import { formatKES } from "@/lib/products";
import { getDownloadUrl } from "@/lib/downloads.functions";

export const Route = createFileRoute("/account/library")({
  head: () => ({ meta: [{ title: "Your library · Jmax Builders" }] }),
  component: Library,
});

type OrderRow = {
  id: string;
  order_number: string;
  total_kes: number;
  status: string;
  created_at: string;
  order_items: { id: string; title: string; license: string; qty: number; unit_price_kes: number; product_slug: string }[];
};

function Library() {
  return (<AuthGate><LibraryInner /></AuthGate>);
}

function LibraryInner() {
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const downloadFn = useServerFn(getDownloadUrl);

  useEffect(() => {
    supabase
      .from("orders")
      .select("id, order_number, total_kes, status, created_at, order_items(id, title, license, qty, unit_price_kes, product_slug)")
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data as OrderRow[] | null) || []));
  }, []);

  const download = async (slug: string) => {
    setBusy(slug);
    try {
      const { url } = await downloadFn({ data: { productSlug: slug } });
      window.open(url, "_blank");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not get download link");
    } finally {
      setBusy(null);
    }
  };


  return (
    <Layout>
      <section className="container-page py-12">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-ink text-ink-foreground"><FolderOpen className="h-5 w-5" /></span>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Your library</h1>
            <p className="text-sm text-muted-foreground">Re-download files from past purchases.</p>
          </div>
        </div>

        {orders === null ? (
          <div className="mt-12 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="mt-12 rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <p className="font-display text-lg font-bold">No purchases yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Once you buy a plan or BOQ, your downloads appear here.</p>
            <Link to="/marketplace" className="mt-6 inline-block rounded-md bg-ink px-5 py-3 text-sm font-semibold text-ink-foreground hover:opacity-90">Browse marketplace</Link>
          </div>
        ) : (
        <div className="mt-10 space-y-6">
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Order · {o.status}</p>
                  <p className="font-display text-lg font-bold">{o.order_number}</p>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
              </div>
              <div className="mt-4 divide-y divide-border">
                {o.order_items.map((it) => (
                  <div key={it.id} className="flex items-center gap-4 py-3">
                    <div className="flex-1">
                      <Link to="/marketplace/$slug" params={{ slug: it.product_slug }} className="font-semibold hover:text-primary">{it.title}</Link>
                      <p className="text-xs text-muted-foreground">{it.license} · ×{it.qty} · {formatKES(it.unit_price_kes)}</p>
                    </div>
                    <button
                      onClick={() => download(it.product_slug)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-accent disabled:opacity-50"
                      disabled={o.status !== "paid" || busy === it.product_slug}
                    >
                      {busy === it.product_slug ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        )}
      </section>
    </Layout>
  );
}
