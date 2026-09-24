import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { HardHat, Mail, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/forgot")({
  head: () => ({
    meta: [
      { title: "Forgot password · Jmax Builders" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent("/auth/reset-password")}`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (error) throw error;
      setSent(true);
      toast.success("Check your email for a reset link.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reset email");
    } finally {
      setBusy(false);
    }
  };

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

          <h1 className="mt-6 font-display text-2xl font-bold">Forgot password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {sent
              ? "If an account exists for that email, we sent a link to reset your password. The link expires in about an hour."
              : "Enter the email on your account and we’ll send a reset link."}
          </p>

          {!sent ? (
            <form onSubmit={submit} className="mt-6 space-y-3">
              <label className="block text-sm">
                <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> Email *
                </span>
                <input
                  type="email"
                  value={email}
                  required
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Send reset link
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="mt-6 inline-flex w-full items-center justify-center rounded-md border border-border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-accent"
            >
              Send another email
            </button>
          )}

          <p className="mt-5 text-center text-xs text-muted-foreground">
            <Link to="/auth" className="inline-flex items-center gap-1 font-semibold text-foreground underline">
              <ArrowLeft className="h-3 w-3" /> Back to sign in
            </Link>
          </p>
        </div>
      </section>
    </Layout>
  );
}
