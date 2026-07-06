import { createFileRoute } from "@tanstack/react-router";

const SITE_URL = "https://jmaxbuilders.co.ke";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () => {
        const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /account
Disallow: /checkout

Sitemap: ${SITE_URL}/sitemap.xml
`;
        return new Response(body, {
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
