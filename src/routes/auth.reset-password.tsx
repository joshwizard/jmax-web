import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HardHat, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({
    meta: [
      { title: "Set new password · Jmax Builders" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function ensureSession() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          toast.error(error.message);
          navigate({ to: "/auth/forgot" });
          return;
        }
        url.searchParams.delete("code");
        window.history.replaceState({}, "", url.pathname);
      }

      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!data.session) {
        toast.error("Reset link expired or invalid. Request a new one.");
        navigate({ to: "/auth/forgot" });
        return;
      }
      setReady(true);
    }

    void ensureSession();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (!loading && !user && ready) {
      navigate({ to: "/auth/forgot" });
    }
  }, [loading, user, ready, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated. You’re signed in.");
      navigate({ to: "/account" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setBusy(false);
    }
  };

  if (!ready || loading) {
    return (
      <Layout>
        <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-3 py-20 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Preparing password reset…</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container-page grid place-items-center py-16">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-ink text-ink-foreground">
              <HardHat className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              Jmax<span className="text-primary">.</span>Builders
            </span>
          </div>

          <h1 className="mt-6 font-display text-2xl font-bold">Choose a new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter a new password for {user?.email ?? "your account"}.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-3">
            <PasswordField
              label="New password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
            />
            <PasswordField
              label="Confirm password"
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
            />
            <button
              type="submit"
              disabled={busy}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Update password
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            <Link to="/auth" className="font-semibold text-foreground underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </section>
    </Layout>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Lock className="h-3.5 w-3.5" /> {label} *
      </span>
      <input
        type="password"
        value={value}
        required
        minLength={8}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </label>
  );
}
