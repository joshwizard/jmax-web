import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { attachAuth } from "@/lib/auth-attach";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Admin only");
}

export const listAdmins = createServerFn({ method: "GET" })
  .middleware([attachAuth, requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data: roles, error } = await supabaseAdmin
      .from("user_roles")
      .select("id, user_id, role, created_at")
      .eq("role", "admin")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    const ids = (roles || []).map((r) => r.user_id);
    if (ids.length === 0) return { admins: [] as Array<{ user_id: string; email: string | null; created_at: string }> };

    // Fetch emails via auth admin API
    const out: Array<{ user_id: string; email: string | null; created_at: string }> = [];
    for (const r of roles!) {
      const { data: u } = await supabaseAdmin.auth.admin.getUserById(r.user_id);
      out.push({ user_id: r.user_id, email: u?.user?.email ?? null, created_at: r.created_at });
    }
    return { admins: out };
  });

const EmailSchema = z.object({ email: z.string().trim().toLowerCase().email().max(255) });

export const promoteAdminByEmail = createServerFn({ method: "POST" })
  .middleware([attachAuth, requireSupabaseAuth])
  .inputValidator((d: unknown) => EmailSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    // Find user by email
    let target: { id: string } | null = null;
    let page = 1;
    while (page <= 20) {
      const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw new Error(error.message);
      const found = list.users.find((u) => u.email?.toLowerCase() === data.email);
      if (found) { target = { id: found.id }; break; }
      if (list.users.length < 200) break;
      page++;
    }
    if (!target) throw new Error(`No user with email ${data.email}. Ask them to sign up first.`);

    const { error: insErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: target.id, role: "admin" });
    if (insErr && !insErr.message.includes("duplicate")) throw new Error(insErr.message);
    return { ok: true, user_id: target.id };
  });

export const revokeAdmin = createServerFn({ method: "POST" })
  .middleware([attachAuth, requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ user_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    if (data.user_id === context.userId) throw new Error("You cannot revoke your own admin role");

    // Prevent removing the last admin
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) <= 1) throw new Error("Cannot remove the only remaining admin");

    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.user_id)
      .eq("role", "admin");
    if (error) throw new Error(error.message);
    return { ok: true };
  });
