import { QueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { AppProviders } from "@/components/AppProviders";
import { Layout } from "@/components/site/Layout";

function NotFoundComponent() {
  return (
    <Layout>
      <div className="container-page flex min-h-[60vh] items-center justify-center py-24">
        <div className="max-w-md text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">404 — Off-Plan</p>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-tight">Page not found</h1>
          <p className="mt-3 text-muted-foreground">
            The page you're looking for isn't on the drawings. Let's get you back on site.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-ink px-5 py-3 text-sm font-semibold text-ink-foreground transition hover:opacity-90"
          >
            Back to home
          </Link>
        </div>
      </div>
    </Layout>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <Layout>
      <div className="container-page flex min-h-[60vh] items-center justify-center py-24">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl font-semibold">This page didn't load</h1>
          <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try again or head home.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => { router.invalidate(); reset(); }}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Try again
            </button>
            <a href="/" className="rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-accent">
              Go home
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Jmax Builders — Construction, Plans & BOQs in Kenya" },
      { name: "description", content: "Jmax Builders Ltd — residential and commercial construction in Meru, Kenya. Buy ready-to-build plans and Bills of Quantities from our marketplace." },
      { property: "og:title", content: "Jmax Builders — Construction, Plans & BOQs" },
      { property: "og:description", content: "Build with confidence. Plans and BOQs you can actually build from." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "GeneralContractor",
          name: "Jmax Builders Ltd",
          email: "jmaxbuildersltd@gmail.com",
          telephone: "+254702067939",
          address: { "@type": "PostalAddress", addressLocality: "Meru", addressCountry: "KE" },
          areaServed: "KE",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <AppProviders>
          {children}
        </AppProviders>
        <Scripts />
      </body>
    </html>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

function RootComponent() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
      <Toaster position="top-right" richColors />
    </>
  );
}
