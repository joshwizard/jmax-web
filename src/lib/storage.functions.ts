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
  if (!data) throw new Error("Admin access required to upload files");
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").slice(0, 120);
}

const uploadSchema = z.object({
  bucket: z.enum(["product-covers", "product-files"]),
  path: z.string().min(1).max(400),
  contentType: z.string().min(1).max(200),
  /** Base64 file body (no data: URL prefix). */
  dataBase64: z.string().min(1),
});

/**
 * Admin-only storage upload using the service-role client (bypasses storage RLS).
 * Fixes "new row violates row-level security policy" when client-side upsert lacked SELECT.
 */
export const uploadAdminFile = createServerFn({ method: "POST" })
  .middleware([attachAuth, requireSupabaseAuth])
  .inputValidator((d: unknown) => uploadSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    const path = data.path
      .split("/")
      .map((part) => sanitizeFileName(part))
      .filter(Boolean)
      .join("/");
    if (!path) throw new Error("Invalid upload path");

    const bytes = Buffer.from(data.dataBase64, "base64");
    if (bytes.length === 0) throw new Error("Empty file");
    if (bytes.length > 15 * 1024 * 1024) throw new Error("File too large (max 15MB)");

    const { error } = await supabaseAdmin.storage.from(data.bucket).upload(path, bytes, {
      contentType: data.contentType,
      upsert: true,
    });
    if (error) throw new Error(error.message);

    if (data.bucket === "product-covers") {
      const { data: pub } = supabaseAdmin.storage.from(data.bucket).getPublicUrl(path);
      return { ok: true as const, path, publicUrl: pub.publicUrl };
    }

    return { ok: true as const, path, publicUrl: null as string | null };
  });

export async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
