import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, HardHat, MapPin, Award, Quote, Star } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { CTABanner } from "@/components/site/CTABanner";
import { SectionHeader } from "@/components/site/SectionHeader";
import { TypeBadge } from "@/components/site/TypeBadge";
import { products as seedProducts, productFromDb, type Product } from "@/lib/products";
import { projects as seedProjects } from "@/lib/projects";
import { loadProductMedia } from "@/lib/product-gallery";
import { MARKETPLACE_ENABLED } from "@/lib/marketplace";
import { supabase } from "@/integrations/supabase/client";
import hero from "@/assets/hero-construction.jpg";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jmax Builders — Construction in Nairobi, Kenya" },
      {
        name: "description",
        content: MARKETPLACE_ENABLED
          ? "Residential and commercial construction services plus a marketplace of ready-to-build plans and BOQs. Based in Nairobi, serving all of Kenya."
          : "Residential and commercial construction across Kenya. Based in Nairobi — portfolio, consultations, and builder-grade delivery.",
      },
    ],
  }),
  component: Index,
});

const trust = [
  { icon: HardHat, label: "12+ years on site" },
  { icon: MapPin, label: "Nairobi · nationwide" },
  { icon: ShieldCheck, label: "Insured & licensed*" },
  { icon: Award, label: "Builder-grade docs" },
];

const testimonials = [
  {
    quote: "The plans were buildable on day one. Our foreman understood the drawings without back-and-forth — that saved us weeks.",
    author: "Michael - Murang'a.",
    role: "Owner-builder, Nyeri",
  },
  {
    quote: "Their BOQ format is what I wish every estimator used. Clean breakdown, clear exclusions, no surprises mid-tender.",
    author: "Jack",
    role: "Contractor, Nairobi",
  },
  {
    quote: "Jmax delivered on schedule. Their plans were stamped by registered professionals.",
    author: "Hawo",
    role: "Maisonette client, Katani, Machakos",
  },
];

type LatestProject = {
  slug: string;
  title: string;
  category: string;
  location: string;
  cover: string;
};

function Index() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [latest, setLatest] = useState<LatestProject>(() => {
    const p = seedProjects[0];
    return {
      slug: p.slug,
      title: p.title,
      category: p.category,
      location: p.location,
      cover: p.cover,
    };
  });
  const projectImgs = [project1, project2, project3];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("projects")
        .select("slug, title, category, location, cover_url")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled || !data?.cover_url) return;
      setLatest({
        slug: data.slug,
        title: data.title,
        category: data.category || "Project",
        location: data.location || "",
        cover: data.cover_url,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!MARKETPLACE_ENABLED) return;
    const seedBySlug = new Map(seedProducts.map((p) => [p.slug, p]));
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("products")
        .select("id, slug, title, category, price_kes, description, cover_url, file_path, bedrooms, bathrooms, area_sqft, architectural_price_kes, structural_price_kes, boq_price_kes")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3);
      if (cancelled || !data) return;
      const items = await Promise.all(
        data.map(async (r) => {
          const media = await loadProductMedia(r.slug, r.cover_url);
          return productFromDb(r, seedBySlug.get(r.slug), media);
        }),
      );
      if (!cancelled) setFeatured(items);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Layout>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-ink text-ink-foreground">
        <img
          src={hero}
          alt=""
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/55" />
        <div className="relative container-page grid items-center gap-10 py-16 md:grid-cols-12 md:py-24 lg:py-28">
          <div className="md:col-span-6 lg:col-span-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-ink-foreground/20 bg-ink-foreground/5 px-3 py-1 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Builders · Design · Delivery
            </p>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl text-balance">
              Build it once.<br />
              <span className="text-primary">Build it right.</span>
            </h1>
            <p className="mt-6 max-w-xl text-xl text-ink-foreground/75">
              Jmax Builders Ltd designs and constructs residential and commercial projects across Kenya
              {MARKETPLACE_ENABLED ? " — and sells the same builder-grade plans and BOQs we use on site." : "."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={MARKETPLACE_ENABLED ? "/marketplace" : "/portfolio"}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground transition hover:opacity-90"
              >
                {MARKETPLACE_ENABLED ? "Browse marketplace" : "View portfolio"} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-md border border-ink-foreground/30 bg-ink-foreground/5 px-6 py-3.5 text-base font-bold text-ink-foreground transition hover:bg-ink-foreground/10"
              >
                Request a consultation
              </Link>
            </div>
          </div>

          <div className="md:col-span-6 lg:col-span-6">
            <Link
              to="/portfolio/$projectId"
              params={{ projectId: latest.slug }}
              className="group relative block overflow-hidden rounded-2xl border border-ink-foreground/15 bg-ink-foreground/5 shadow-2xl shadow-black/40"
            >
              <div className="aspect-[4/5] sm:aspect-[5/4] md:aspect-[4/5] lg:aspect-[5/4]">
                <img
                  src={latest.cover}
                  alt={latest.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Latest project</p>
                <h2 className="mt-1 font-display text-xl font-bold md:text-2xl">{latest.title}</h2>
                <p className="mt-1 text-base text-ink-foreground/70">
                  {[latest.category, latest.location].filter(Boolean).join(" · ")}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-base font-semibold text-primary">
                  View case study <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Trust strip */}
        <div className="relative border-t border-ink-foreground/10 bg-ink/80 backdrop-blur">
          <div className="container-page grid grid-cols-2 gap-6 py-6 md:grid-cols-4">
            {trust.map((t) => (
              <div key={t.label} className="flex items-center gap-3 text-base">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/15 text-primary">
                  <t.icon className="h-4 w-4" />
                </span>
                <span className="font-medium text-ink-foreground/85">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED MARKETPLACE */}
      {MARKETPLACE_ENABLED && (
      <section className="container-page py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Marketplace"
            title="Featured plans & BOQs"
            description="Drawings and bills of quantities prepared by working builders — not theoretical templates."
          />
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1 text-base font-semibold text-primary hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.length === 0
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] animate-pulse rounded-xl border border-border bg-muted" />
              ))
            : featured.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3 text-base">
          <TypeBadge type="Plans" />
          <span className="text-muted-foreground">Architectural plan sets</span>
          <span className="text-border">·</span>
          <TypeBadge type="BOQ" />
          <span className="text-muted-foreground">Measured Bills of Quantities</span>
        </div>
      </section>
      )}

      {/* PROJECT HIGHLIGHTS */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container-page py-20">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <SectionHeader
              eyebrow="Recent work"
              title="Projects on the ground"
              description="A snapshot of homes and commercial buildings we've delivered."
            />
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-1 text-base font-semibold text-primary hover:underline"
            >
              View more projects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {projectImgs.map((src, i) => (
              <Link
                key={i}
                to="/portfolio"
                className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-muted"
              >
                <img
                  src={src}
                  alt={`Project ${i + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-ink-foreground">
                  <p className="text-sm font-mono uppercase tracking-wider text-primary">Project 0{i + 1}</p>
                  <h3 className="mt-1 font-display text-xl font-semibold">
                    {["Karen Family Residence", "Meru Commercial Block", "Highlands Bungalow"][i]}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-page py-20">
        <SectionHeader
          eyebrow="Clients"
          title="What people say"
          align="center"
        />
        <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.author} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-7">
              <div className="flex gap-0.5 text-primary">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <Quote className="h-6 w-6 text-primary/40" />
              <blockquote className="text-base leading-relaxed text-foreground">"{t.quote}"</blockquote>
              <figcaption className="mt-auto border-t border-border pt-4">
                <p className="text-base font-semibold">{t.author}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <CTABanner />
    </Layout>
  );
}
