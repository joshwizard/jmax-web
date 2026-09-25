import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FolderOpen, Receipt, ShoppingBag, Mail, ArrowRight, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/site/Layout";
import { AuthGate } from "@/components/site/AuthGate";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { MARKETPLACE_ENABLED } from "@/lib/marketplace";

export const Route = createFileRoute("/account/")({
  head: () => ({ meta: [{ title: "Account · Jmax Builders" }] }),
  component: () => (
    <AuthGate>
      <Account />
    </AuthGate>
  ),
});

function Account() {
  const { user } = useAuth();

  return (
    <Layout>
      <section className="container-page py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Account</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{user?.email}</span>. Manage purchases, downloads, and your password.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Tile to="/account/library" icon={FolderOpen} title="Your library" body="Re-download plans and BOQs from past purchases." />
          {MARKETPLACE_ENABLED ? (
            <Tile to="/marketplace" icon={ShoppingBag} title="Browse marketplace" body="Discover new plan sets and BOQs." />
          ) : (
            <Tile to="/portfolio" icon={ShoppingBag} title="View portfolio" body="See delivered homes, churches, and commercial builds." />
          )}
          <Tile to="/contact" icon={Mail} title="Contact support" body="We respond within one business day." />
        </div>

        <ChangePasswordCard email={user?.email ?? ""} />

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

function ChangePasswordCard({ email }: { email: string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    if (currentPassword && currentPassword === password) {
      toast.error("New password must be different from your current password.");
      return;
    }

    setBusy(true);
    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (verifyError) throw new Error("Current password is incorrect.");

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setCurrentPassword("");
      setPassword("");
      setConfirm("");
      toast.success("Password updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-10 max-w-lg rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-ink text-ink-foreground">
          <Lock className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold">Change password</h2>
          <p className="text-xs text-muted-foreground">
            Update the password you use with email sign-in. Forgot it?{" "}
            <Link to="/auth/forgot" className="font-semibold underline">
              Reset by email
            </Link>
            .
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-5 space-y-3">
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Current password *
          </span>
          <input
            type="password"
            value={currentPassword}
            required
            autoComplete="current-password"
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            New password *
          </span>
          <input
            type="password"
            value={password}
            required
            minLength={8}
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Confirm new password *
          </span>
          <input
            type="password"
            value={confirm}
            required
            minLength={8}
            autoComplete="new-password"
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Save password
        </button>
      </form>
    </div>
  );
}

function Tile({ to, icon: Icon, title, body }: { to: "/account/library" | "/marketplace" | "/portfolio" | "/contact"; icon: typeof FolderOpen; title: string; body: string }) {
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
