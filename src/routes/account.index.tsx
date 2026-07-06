import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderOpen, Receipt, ShoppingBag, Mail, ArrowRight } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { AuthGate } from "@/components/site/AuthGate";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/account/")({
  head: () => ({ meta: [{ title: "Account · Jmax Builders" }] }),
  component: Account,
});

function Account() {
  return (
    <Layout>
      <section className="container-page py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Account</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Manage your purchases, re-download files, and keep track of orders. (Demo — sign-in is not wired up in the prototype.)
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Tile to="/account/library" icon={FolderOpen} title="Your library" body="Re-download plans and BOQs from past purchases." />
          <Tile to="/marketplace" icon={ShoppingBag} title="Browse marketplace" body="Discover new plan sets and BOQs." />
          <Tile to="/contact" icon={Mail} title="Contact support" body="We respond within one business day." />
        </div>

        <div className="mt-10 rounded-xl border border-dashed border-border bg-secondary/40 p-6">
          <div className="flex items-start gap-3">
            <Receipt className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">Need a tax invoice for a company?</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Reply to your receipt email with the company name and KRA PIN — we'll re-issue it within one business day.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function Tile({ to, icon: Icon, title, body }: { to: "/account/library" | "/marketplace" | "/contact"; icon: typeof FolderOpen; title: string; body: string }) {
  return (
    <Link to={to} className="group rounded-xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-lg">
      <span className="grid h-11 w-11 place-items-center rounded-md bg-ink text-ink-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
