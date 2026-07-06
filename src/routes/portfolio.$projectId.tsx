import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, MapPin, Calendar, Ruler, Users, Quote, CheckCircle2, AlertTriangle, ListChecks } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { CTABanner } from "@/components/site/CTABanner";
import { getProject, projects, type Project, type ProjectCategory } from "@/lib/projects";
import { supabase } from "@/integrations/supabase/client";

async function fetchProject(slug: string): Promise<Project | null> {
  const local = getProject(slug);
  if (local) return local;
  const { data } = await supabase.from("projects").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    category: (data.category as ProjectCategory) || "Residential",
    year: data.year || "",
    location: data.location || "",
    duration: data.duration || "",
    buildingType: data.building_type || "",
    size: data.size || "",
    client: data.client || "",
    cover: data.cover_url || "",
    gallery: (() => {
      const g = (data.gallery as string[] | { src: string; caption?: string }[] | null) || [];
      const items = g.map((item) =>
        typeof item === "string" ? { src: item, caption: data.title } : { src: item.src, caption: item.caption ?? data.title },
      );
      if (items.length === 0 && data.cover_url) items.push({ src: data.cover_url, caption: data.title });
      return items;
    })(),
    summary: data.summary || "",
    brief: data.brief || "",
    scope: (data.scope as string[]) || [],
    challenges: (data.challenges as { title: string; body: string }[]) || [],
    outcomes: (data.outcomes as string[]) || [],
    stats: (data.stats as { label: string; value: string }[]) || [],
    testimonial: (data.testimonial as Project["testimonial"]) || undefined,
  };
}

export const Route = createFileRoute("/portfolio/$projectId")({
  head: ({ params }) => {
    const p = getProject(params.projectId);
    return {
      meta: [
        { title: p ? `${p.title} — Case Study · Jmax Builders` : "Project · Jmax Builders" },
        { name: "description", content: p?.summary ?? "Project case study." },
        { property: "og:title", content: p ? `${p.title} — Case Study` : "Project" },
        { property: "og:description", content: p?.summary ?? "" },
        ...(p ? [{ property: "og:image", content: p.cover }] : []),
      ],
    };
  },
  notFoundComponent: () => (
    <Layout>
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Project not found</h1>
        <Link to="/portfolio" className="mt-4 inline-block text-primary hover:underline">Back to portfolio</Link>
      </div>
    </Layout>
  ),
  errorComponent: ({ error, reset }) => (
    <Layout>
      <div className="container-page py-24 text-center">
        <p>{error.message}</p>
        <button onClick={reset} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Retry</button>
      </div>
    </Layout>
  ),
  component: ProjectPage,
});

function ProjectPage() {
  const { projectId } = Route.useParams();
  const [p, setP] = useState<Project | null | undefined>(() => getProject(projectId) ?? undefined);
  const [activeImg, setActiveImg] = useState(0);
  useEffect(() => {
    if (p === undefined) fetchProject(projectId).then(setP);
  }, [projectId, p]);

  if (p === undefined) {
    return <Layout><div className="container-page py-24 text-center text-sm text-muted-foreground">Loading…</div></Layout>;
  }
  if (p === null) throw notFound();
  const idx = projects.findIndex((x) => x.slug === p.slug);
  const prev = idx > 0 ? projects[idx - 1] : null;
  const next = idx >= 0 && idx < projects.length - 1 ? projects[idx + 1] : null;

  const meta = [
    { icon: MapPin, label: "Location", value: p.location },
    { icon: Calendar, label: "Year", value: p.year },
    { icon: Calendar, label: "Duration", value: p.duration },
    { icon: Ruler, label: "Size", value: p.size },
    { icon: Users, label: "Client", value: p.client },
    { icon: ListChecks, label: "Type", value: p.buildingType },
  ];

  return (
    <Layout>
      <div className="border-b border-border bg-secondary/40">
        <div className="container-page py-4">
          <Link to="/portfolio" className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to portfolio
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="container-page py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{p.category} · {p.year}</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl text-balance">{p.title}</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">{p.summary}</p>
          </div>
          <dl className="grid grid-cols-2 gap-3">
            {p.stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-4">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</dt>
                <dd className="mt-1 font-display text-xl font-bold">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Gallery */}
      {p.gallery.length > 0 && (
        <section className="container-page">
          <div className="overflow-hidden rounded-2xl border border-border bg-muted">
            <div className="aspect-[16/9] w-full bg-muted">
              <img src={p.gallery[activeImg]?.src ?? p.cover} alt={p.gallery[activeImg]?.caption ?? p.title} className="h-full w-full object-cover" />
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border bg-card px-5 py-3">
              <p className="text-xs text-muted-foreground">{p.gallery[activeImg]?.caption}</p>
              <p className="text-xs font-mono text-muted-foreground">{activeImg + 1} / {p.gallery.length}</p>
            </div>
          </div>
          {p.gallery.length > 1 && (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {p.gallery.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  aria-label={`Show image ${i + 1}: ${g.caption}`}
                  className={`group relative aspect-[4/3] overflow-hidden rounded-md border-2 transition ${
                    i === activeImg ? "border-primary" : "border-transparent hover:border-border"
                  }`}
                >
                  <img src={g.src} alt={g.caption} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                </button>
              ))}
            </div>
          )}
        </section>
      )}
      {p.gallery.length === 0 && p.cover && (
        <section className="container-page">
          <div className="overflow-hidden rounded-2xl border border-border bg-muted">
            <div className="aspect-[16/9] w-full bg-muted">
              <img src={p.cover} alt={p.title} className="h-full w-full object-cover" />
            </div>
          </div>
        </section>
      )}
      {/* Meta */}
      <section className="container-page py-12">
        <div className="grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2 lg:grid-cols-3">
          {meta.map((m) => (
            <div key={m.label} className="flex items-start gap-3">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md bg-secondary text-foreground">
                <m.icon className="h-4 w-4 text-primary" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{m.label}</p>
                <p className="text-sm font-semibold">{m.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brief + scope */}
      <section className="container-page pb-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <Panel title="The brief">
            <p className="text-sm leading-relaxed text-muted-foreground">{p.brief}</p>
          </Panel>
          <Panel title="Scope of works">
            <ul className="space-y-2 text-sm">
              {p.scope.map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </section>

      {/* Challenges */}
      {p.challenges.length > 0 && (
        <section className="border-y border-border bg-secondary/40">
          <div className="container-page py-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">On site</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">Challenges & how we handled them</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {p.challenges.map((c) => (
                <div key={c.title} className="rounded-xl border border-border bg-card p-6">
                  <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/15 text-primary">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold">{c.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Outcomes */}
      <section className="container-page py-12">
        <Panel title="Outcomes">
          <ul className="grid gap-3 sm:grid-cols-2">
            {p.outcomes.map((o) => (
              <li key={o} className="flex items-start gap-2 rounded-lg border border-border bg-background p-4 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      {/* Testimonial */}
      {p.testimonial && (
        <section className="container-page pb-16">
          <figure className="rounded-2xl border border-border bg-ink p-8 text-ink-foreground md:p-12">
            <Quote className="h-8 w-8 text-primary/70" />
            <blockquote className="mt-4 font-display text-xl font-semibold leading-relaxed md:text-2xl text-balance">
              "{p.testimonial.quote}"
            </blockquote>
            <figcaption className="mt-6 text-sm text-ink-foreground/70">
              <span className="font-semibold text-ink-foreground">{p.testimonial.author}</span> — {p.testimonial.role}
            </figcaption>
          </figure>
        </section>
      )}

      {/* Prev / next */}
      <section className="container-page pb-16">
        <div className="grid gap-3 md:grid-cols-2">
          {prev ? (
            <Link to="/portfolio/$projectId" params={{ projectId: prev.slug }} className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 hover:border-primary">
              <ArrowLeft className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Previous project</p>
                <p className="font-display font-bold group-hover:text-primary">{prev.title}</p>
              </div>
            </Link>
          ) : <div className="hidden md:block" />}
          {next ? (
            <Link to="/portfolio/$projectId" params={{ projectId: next.slug }} className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-right hover:border-primary md:flex-row-reverse md:text-left">
              <ArrowRight className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Next project</p>
                <p className="font-display font-bold group-hover:text-primary">{next.title}</p>
              </div>
            </Link>
          ) : <div className="hidden md:block" />}
        </div>
      </section>

      <CTABanner
        eyebrow="Have a similar brief?"
        title="Let's scope your project."
        subtitle="Send us a few details about your site and timeline. We'll respond within one business day."
        primary={{ label: "Request a consultation", to: "/contact" }}
        secondary={{ label: "Browse marketplace", to: "/marketplace" }}
      />
    </Layout>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 md:p-8">
      <h3 className="font-display text-base font-bold">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}
