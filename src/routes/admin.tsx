import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Layout } from "@/components/site/Layout";
import { AuthGate } from "@/components/site/AuthGate";
import { useIsAdmin } from "@/lib/roles";
import { ShieldAlert, LayoutDashboard, Package, ShoppingBag, Crown, Loader2, Building2, Users, CalendarClock } from "lucide-react";
import { claimFirstAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · Jmax Builders" }, { name: "robots", content: "noindex" }] }),
  component: () => (<AuthGate><AdminLayout /></AuthGate>),
});

function AdminLayout() {
  const { isAdmin, loading } = useIsAdmin();
  const { pathname } = useLocation();

  if (loading) {
    return (
      <Layout>
        <div className="container-page py-20 text-center text-sm text-muted-foreground">Checking permissions…</div>
      </Layout>
    );
  }
  if (!isAdmin) {
    return (
      <Layout>
        <div className="container-page py-20">
          <div className="mx-auto max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <ShieldAlert className="mx-auto h-8 w-8 text-destructive" />
            <h1 className="mt-3 font-display text-xl font-bold">Admin access required</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              No admin permissions on your account. Sign in with an authorized admin account,
              or claim the first-admin role if this is a fresh deployment.
            </p>
            <ClaimFirstAdminButton />
          </div>
        </div>
      </Layout>
    );
  }

  const tabs: Array<{ to: "/admin" | "/admin/products" | "/admin/projects" | "/admin/orders" | "/admin/users" | "/admin/consultations"; label: string; icon: typeof LayoutDashboard; exact?: boolean }> = [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { to: "/admin/products", label: "Marketplace", icon: Package },
    { to: "/admin/projects", label: "Portfolio", icon: Building2 },
    { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { to: "/admin/consultations", label: "Consultations", icon: CalendarClock },
    { to: "/admin/users", label: "Admins", icon: Users },
  ];

  return (
    <Layout>
      <section className="container-page py-10">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-ink text-ink-foreground"><LayoutDashboard className="h-5 w-5" /></span>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Admin</h1>
            <p className="text-xs text-muted-foreground">Manage products, files, and orders.</p>
          </div>
        </div>
        <nav className="mt-6 flex flex-wrap gap-2 border-b border-border pb-2">
          {tabs.map((t) => {
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition ${
                  active ? "bg-ink text-ink-foreground" : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {t.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-6">
          <Outlet />
        </div>
      </section>
    </Layout>
  );
}

function ClaimFirstAdminButton() {
  const claim = useServerFn(claimFirstAdmin);
  const [busy, setBusy] = useState(false);
  return (
    <button
      onClick={async () => {
        setBusy(true);
        try {
          const res = await claim({});
          if (res.ok) {
            toast.success("You are now an admin. Reloading…");
            setTimeout(() => window.location.reload(), 800);
          } else {
            toast.error(res.reason || "Could not claim admin");
          }
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Failed");
        } finally {
          setBusy(false);
        }
      }}
      className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-xs font-bold text-ink-foreground hover:opacity-90 disabled:opacity-50"
      disabled={busy}
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Crown className="h-3.5 w-3.5" />} Claim admin access
    </button>
  );
}
