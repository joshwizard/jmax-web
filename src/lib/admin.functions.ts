import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { attachAuth } from "@/lib/auth-attach";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * One-time bootstrap: if no admins exist yet, promote the calling user to admin.
 * After at least one admin exists, this becomes a no-op.
 */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([attachAuth, requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const { count, error: e1 } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if (e1) throw new Error(e1.message);

    if ((count ?? 0) > 0) return { ok: false, reason: "Admin already exists" };

    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
