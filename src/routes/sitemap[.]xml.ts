import { createFileRoute } from "@tanstack/react-router";
import { projects } from "@/lib/projects";
import { seedBlogPosts } from "@/lib/blogs";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SITE_URL = "https://jmaxbuilders.com";
const MARKETPLACE_ENABLED = process.env.VITE_MARKETPLACE_ENABLED === "true";

const STATIC = [
  "/", "/about", "/about/services", "/portfolio", "/blog", "/calculator",
  "/faq", "/contact", "/legal/terms", "/legal/privacy", "/legal/disclaimer", "/legal/refunds",
  ...(MARKETPLACE_ENABLED ? ["/marketplace"] : []),
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const productRows = MARKETPLACE_ENABLED
          ? (await supabaseAdmin.from("products").select("slug").eq("is_active", true)).data
          : [];
        let blogSlugs = seedBlogPosts.map((p) => p.slug);
        try {
          const { data: blogRows } = await supabaseAdmin
            .from("blog_posts")
            .select("slug")
            .eq("is_published", true);
          if (blogRows?.length) {
            blogSlugs = [...new Set([...blogRows.map((b) => b.slug), ...blogSlugs])];
          }
        } catch {
          // Table may not exist yet — seed slugs still listed.
        }
        const urls: string[] = [
          ...STATIC.map((p) => `${SITE_URL}${p}`),
          ...(productRows || []).map((p) => `${SITE_URL}/marketplace/${p.slug}`),
          ...projects.map((p) => `${SITE_URL}/portfolio/${p.id}`),
          ...blogSlugs.map((slug) => `${SITE_URL}/blog/${slug}`),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
