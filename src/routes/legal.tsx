import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { SectionHeader } from "@/components/site/SectionHeader";

export const Route = createFileRoute("/legal")({
  component: LegalLayout,
});

const links = [
  { to: "/legal/terms" as const, label: "Terms of Sale" },
  { to: "/legal/privacy" as const, label: "Privacy Policy" },
  { to: "/legal/disclaimer" as const, label: "Plans & BOQ Disclaimer" },
  { to: "/legal/refunds" as const, label: "Refund Policy" },
];

function LegalLayout() {
  const loc = useLocation();
  return (
    <Layout>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-page py-12">
          <SectionHeader eyebrow="Legal" title="Policies & terms" description="Plain-language summaries followed by the actual terms. Placeholder content — to be reviewed by counsel before launch." />
        </div>
      </section>

      <section className="container-page py-10">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <nav className="flex flex-row flex-wrap gap-2 lg:flex-col">
              {links.map((l) => {
                const active = loc.pathname === l.to;
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                      active ? "border-ink bg-ink text-ink-foreground" : "border-border bg-card hover:border-primary"
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
          <article className="prose prose-sm max-w-none rounded-xl border border-border bg-card p-8 text-foreground [&_h2]:font-display [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-bold [&_p]:mt-2 [&_p]:text-sm [&_p]:text-muted-foreground [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:text-sm [&_li]:text-muted-foreground">
            <Outlet />
          </article>
        </div>
      </section>
    </Layout>
  );
}
