import { useEffect, useState } from "react";
import { useAuth } from "./auth";
import { supabase } from "@/integrations/supabase/client";

export function useIsAdmin() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    setIsAdmin(null);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.warn("[roles] Admin check failed:", error.message);
          setIsAdmin(false);
          return;
        }
        setIsAdmin(!!data);
      });
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  return { isAdmin, loading: loading || isAdmin === null };
}
