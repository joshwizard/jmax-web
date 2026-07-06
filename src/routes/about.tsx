import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Award, Users, HardHat, Hammer, Ruler, ArrowRight } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { SectionHeader } from "@/components/site/SectionHeader";
import { CTABanner } from "@/components/site/CTABanner";
import aboutImg from "@/assets/about-team.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Builders, Designers & Estimators · Jmax Builders" },
      { name: "description", content: "Jmax Builders Ltd is a Meru-based construction firm building homes and commercial projects across Kenya — and the team behind every plan and BOQ in our marketplace." },
      { property: "og:title", content: "About Jmax Builders Ltd" },
      { property: "og:description", content: "A working builder you can also buy a plan from." },
      { property: "og:image", content: aboutImg },
    ],
  }),
  component: About,
});

const stats = [
  { k: "12+", v: "Years on site" },
  { k: "80+", v: "Projects delivered" },
  { k: "14", v: "Counties served" },
  { k: "100%", v: "On-site supervision" },
];

const values = [
  { icon: HardHat, title: "Builder-first", body: "Every drawing and BOQ we publish is something our own crews would build from. No theoretical templates." },
  { icon: Ruler, title: "Measured & honest", body: "Clear inclusions, clear exclusions, indicative rates. We'd rather under-promise than surprise you mid-project." },
  { icon: Hammer, title: "Buildable details", body: "Standard block sizes, conventional spans, sensible finishes — designs optimised for Kenyan supply chains." },
  { icon: ShieldCheck, title: "Accountable", body: "Insured operations, weekly progress reporting, defects period on every build." },
];

const team = [
  { name: "John M.", role: "Founder & Lead Builder", bio: "12+ years on residential and small commercial sites across central Kenya." },
  { name: "Grace W.", role: "Quantity Surveyor", bio: "Trade-priced BOQs for tender and estimating workflows." },
  { name: "Samuel K.", role: "Site Engineer", bio: "Day-to-day supervision, snag tracking, and quality control." },
];

function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="border-b border-border bg-secondary/40">
        <div className="container-page grid gap-10 py-16 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">About Jmax Builders</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl text-balance">
              A working builder you can also buy a plan from.
            </h1>
            <p className="mt-4 max-w-xl text-muted-foreground">
              We started Jmax Builders Ltd because too many projects in Kenya were started with drawings nobody could build from, and BOQs nobody could trust. We're a small, focused team that designs, prices, and constructs — and sells the same builder-grade documents we use on site.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/portfolio" className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-bold text-ink-foreground hover:opacity-90">
                See our work <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-accent">
                Talk to the team
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted">
            <img src={aboutImg} alt="Jmax Builders team reviewing plans on site" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-ink text-ink-foreground">
        <div className="container-page grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.v}>
              <p className="font-display text-4xl font-bold text-primary">{s.k}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink-foreground/60">{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="container-page py-16">
        <SectionHeader eyebrow="What we believe" title="Four principles, every project." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.title} className="rounded-xl border border-border bg-card p-6">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-primary/15 text-primary">
                <v.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-bold">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container-page py-16">
          <SectionHeader eyebrow="The team" title="Small, accountable, on the tools." />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {team.map((t) => (
              <div key={t.name} className="rounded-xl border border-border bg-card p-6">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-ink text-ink-foreground">
                  <Users className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold">{t.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">{t.role}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="container-page py-16">
        <SectionHeader eyebrow="Credentials" title="Compliance & licensing" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6">
            <Award className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-display text-base font-bold">Registered company</h3>
            <p className="mt-2 text-sm text-muted-foreground">Jmax Builders Ltd, registered in the Republic of Kenya. KRA PIN available on invoice.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-display text-base font-bold">Insurance</h3>
            <p className="mt-2 text-sm text-muted-foreground">Public liability and workers' cover maintained per project. Certificates available on request.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <HardHat className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-display text-base font-bold">Professional partners</h3>
            <p className="mt-2 text-sm text-muted-foreground">We coordinate stamping with registered architects, structural and MEP engineers where required.</p>
          </div>
        </div>
      </section>

      <CTABanner
        eyebrow="Work with us"
        title="Have a brief? Let's scope it properly."
        subtitle="Send us your site details and timeline. We'll reply within one business day with a clear next step."
        primary={{ label: "Request a consultation", to: "/contact" }}
        secondary={{ label: "Browse marketplace", to: "/marketplace" }}
      />
    </Layout>
  );
}
