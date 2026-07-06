import { createFileRoute } from "@tanstack/react-router";
import { products } from "@/lib/products";
import { projects } from "@/lib/projects";

const SITE_URL = "https://jmaxbuilders.co.ke";

const STATIC = [
  "/", "/about", "/services", "/portfolio", "/marketplace", "/calculator",
  "/faq", "/contact", "/legal/terms", "/legal/privacy", "/legal/disclaimer", "/legal/refunds",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const urls: string[] = [
          ...STATIC.map((p) => `${SITE_URL}${p}`),
          ...products.map((p) => `${SITE_URL}/marketplace/${p.slug}`),
          ...projects.map((p) => `${SITE_URL}/portfolio/${p.id}`),
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
