import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/site/Layout";
import { SectionHeader } from "@/components/site/SectionHeader";
import { CTABanner } from "@/components/site/CTABanner";
import { ArrowRight } from "lucide-react";
import { projects as seedProjects, type Project, type ProjectCategory } from "@/lib/projects";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/portfolio/")({
  head: () => ({
    meta: [
      { title: "Portfolio — Selected Projects · Jmax Builders" },
      { name: "description", content: "A selection of residential and commercial projects delivered by Jmax Builders." },
      { property: "og:title", content: "Portfolio — Selected Projects · Jmax Builders" },
      { property: "og:description", content: "Residential and commercial projects, briefs, scope and outcomes." },
    ],
  }),
  component: Portfolio,
});

const filters = ["All", "Residential", "Commercial"] as const;

function Portfolio() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [dbItems, setDbItems] = useState<Project[]>([]);

  useEffect(() => {
    const seedBySlug = new Map(seedProjects.map((p) => [p.slug, p]));
    supabase
      .from("projects")
      .select("id, slug, title, category, year, location, duration, building_type, size, cover_url, summary")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (!data) return;
        setDbItems(
          data.map((r) => {
            const seed = seedBySlug.get(r.slug);
            return {
              id: r.id,
              slug: r.slug,
              title: r.title,
              category: (r.category as ProjectCategory) || seed?.category || "Residential",
              year: r.year || seed?.year || "",
              location: r.location || seed?.location || "",
              duration: r.duration || seed?.duration || "",
              buildingType: r.building_type || seed?.buildingType || "",
              size: r.size || seed?.size || "",
              client: seed?.client || "",
              cover: r.cover_url || seed?.cover || "/placeholder.svg",
              gallery: seed?.gallery || [],
              summary: r.summary || seed?.summary || "",
              brief: seed?.brief || "",
              scope: seed?.scope || [],
              challenges: seed?.challenges || [],
              outcomes: seed?.outcomes || [],
              stats: seed?.stats || [],
            };
          })
        );
      });
  }, []);

  const all = useMemo(() => {
    const seen = new Set<string>();
    return [...dbItems, ...seedProjects].filter((p) => (seen.has(p.slug) ? false : (seen.add(p.slug), true)));
  }, [dbItems]);
  const list = filter === "All" ? all : all.filter((p) => p.category === (filter as ProjectCategory));

  return (
    <Layout>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-page py-16">
          <SectionHeader
            eyebrow="Portfolio"
            title="Selected projects"
            description="A snapshot of work delivered across residential and commercial sectors. Click any project for the full case study."
          />
        </div>
      </section>

      <section className="container-page py-12">
        <div className="mb-8 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
                filter === f ? "border-ink bg-ink text-ink-foreground" : "border-border bg-card hover:border-primary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <Link
              key={p.id}
              to="/portfolio/$projectId"
              params={{ projectId: p.slug }}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
            >
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img src={p.cover} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono uppercase tracking-wider text-primary">{p.category}</span>
                  <span>{p.year}</span>
                </div>
                <h3 className="mt-2 font-display text-lg font-bold leading-snug">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.summary}</p>
                <div className="mt-4 flex flex-wrap gap-1.5 text-[11px]">
                  <Tag>{p.location}</Tag>
                  <Tag>{p.size}</Tag>
                  <Tag>{p.duration}</Tag>
                </div>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  View case study <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <CTABanner
        eyebrow="Build with us"
        title="Want a project like these?"
        subtitle="Tell us about your site and brief. We'll come back with a clear next step."
        primary={{ label: "Request a consultation", to: "/contact" }}
        secondary={{ label: "Browse marketplace", to: "/marketplace" }}
      />
    </Layout>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">{children}</span>;
}
