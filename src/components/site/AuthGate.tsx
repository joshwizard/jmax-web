import { useEffect } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Layout } from "./Layout";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", search: { redirect: location.pathname } });
    }
  }, [loading, user, navigate, location.pathname]);

  if (loading || !user) {
    return (
      <Layout>
        <div className="container-page flex min-h-[50vh] items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">Checking your session…</p>
        </div>
      </Layout>
    );
  }
  return <>{children}</>;
}
