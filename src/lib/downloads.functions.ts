import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { attachAuth } from "@/lib/auth-attach";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { deliverableLabel, filePathForLicense } from "@/lib/product-files";

const Schema = z.object({
  productSlug: z.string().min(1),
  license: z.enum(["Architectural", "Structural", "BOQ"]),
});

export const getDownloadUrl = createServerFn({ method: "POST" })
  .middleware([attachAuth, requireSupabaseAuth])
  .inputValidator((d: unknown) => Schema.parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Confirm purchase of this specific deliverable
    const { data: items, error: e1 } = await supabaseAdmin
      .from("order_items")
      .select("id, product_slug, license, orders!inner(user_id, status)")
      .eq("product_slug", data.productSlug)
      .eq("license", data.license)
      .eq("orders.user_id", userId)
      .eq("orders.status", "paid")
      .limit(1);

    if (e1) throw new Error(e1.message);
    if (!items || items.length === 0) {
      throw new Error(`No paid purchase found for ${deliverableLabel(data.license)}`);
    }

    const { data: product, error: e2 } = await supabaseAdmin
      .from("products")
      .select("file_path, title")
      .eq("slug", data.productSlug)
      .single();

    if (e2) throw new Error(e2.message);
    const path = filePathForLicense(product?.file_path, data.license);
    if (!path) {
      throw new Error(`${deliverableLabel(data.license)} file is not available yet — contact support`);
    }

    const { data: signed, error: e3 } = await supabaseAdmin.storage
      .from("product-files")
      .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days for email / library

    if (e3 || !signed) throw new Error(e3?.message || "Could not create download link");

    return {
      url: signed.signedUrl,
      expiresInSec: 60 * 60 * 24 * 7,
      license: data.license,
      title: product?.title ?? data.productSlug,
      label: deliverableLabel(data.license),
    };
  });
