import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { ensureOwnerAdmin } from "@/lib/admin.functions";

type Search = { redirect?: string; code?: string; error?: string; error_description?: string };

export const Route = createFileRoute("/auth/callback")({
  head: () => ({ meta: [{ title: "Signing in · Jmax Builders" }, { name: "robots", content: "noindex" }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
    code: typeof s.code === "string" ? s.code : undefined,
    error: typeof s.error === "string" ? s.error : undefined,
    error_description: typeof s.error_description === "string" ? s.error_description : undefined,
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const { redirect, error, error_description } = Route.useSearch();
  const navigate = useNavigate();
  const promoteOwner = useServerFn(ensureOwnerAdmin);
  const [message, setMessage] = useState("Finishing sign-in…");

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      if (error) {
        setMessage(error_description || error);
        setTimeout(() => navigate({ to: "/auth", search: { redirect } }), 2000);
        return;
      }

      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else {
          const { data, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          if (!data.session) {
            await new Promise((r) => setTimeout(r, 400));
            const again = await supabase.auth.getSession();
            if (!again.data.session) throw new Error("No session after Google sign-in. Try again.");
          }
        }

        try {
          await promoteOwner({});
        } catch {
          // Non-fatal for regular users; owner promotion needs service role key.
        }

        if (cancelled) return;
        const next = redirect && redirect.startsWith("/") ? redirect : "/account";
        navigate({ to: next });
      } catch (err) {
        if (cancelled) return;
        setMessage(err instanceof Error ? err.message : "Sign-in failed");
        setTimeout(() => navigate({ to: "/auth", search: { redirect } }), 2500);
      }
    }

    void finish();
    return () => {
      cancelled = true;
    };
  }, [error, error_description, navigate, promoteOwner, redirect]);

  return (
    <Layout>
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-3 py-20 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </Layout>
  );
}
