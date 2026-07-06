import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { attachAuth } from "@/lib/auth-attach";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const Schema = z.object({
  productSlug: z.string().min(1),
});

export const getDownloadUrl = createServerFn({ method: "POST" })
  .middleware([attachAuth, requireSupabaseAuth])
  .inputValidator((d: unknown) => Schema.parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Confirm purchase
    const { data: items, error: e1 } = await supabaseAdmin
      .from("order_items")
      .select("id, product_slug, orders!inner(user_id, status)")
      .eq("product_slug", data.productSlug)
      .eq("orders.user_id", userId)
      .eq("orders.status", "paid")
      .limit(1);

    if (e1) throw new Error(e1.message);
    if (!items || items.length === 0) throw new Error("Purchase not found or order not paid");

    // Find the product file
    const { data: product, error: e2 } = await supabaseAdmin
      .from("products")
      .select("file_path")
      .eq("slug", data.productSlug)
      .single();

    if (e2 || !product?.file_path) throw new Error("File not yet available — please contact support");

    const { data: signed, error: e3 } = await supabaseAdmin.storage
      .from("product-files")
      .createSignedUrl(product.file_path, 60 * 10); // 10 minutes

    if (e3 || !signed) throw new Error(e3?.message || "Could not create download link");

    return { url: signed.signedUrl, expiresInSec: 600 };
  });
