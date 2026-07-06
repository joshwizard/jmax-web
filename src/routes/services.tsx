import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheck, Calendar, HardHat, KeyRound, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Layout } from "@/components/site/Layout";
import { SectionHeader } from "@/components/site/SectionHeader";
import { CTABanner } from "@/components/site/CTABanner";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Residential & Commercial Construction · Jmax Builders" },
      { name: "description", content: "Design, build, and supervision for residential and commercial projects. Estimating, scheduling, and closeout." },
    ],
  }),
  component: Services,
});

const capabilities = [
  { title: "Residential builds", body: "New homes, maisonettes and bungalows — from foundations to handover, with finishings to spec." },
  { title: "Commercial builds", body: "Small commercial shells, retail and office fit-outs delivered to programme." },
  { title: "Plans & approvals", body: "Architectural plan sets and coordination support for local authority submission (third-party stamping arranged)." },
  { title: "BOQs & estimating", body: "Trade-priced Bills of Quantities you can take to tender — clear scope, clear exclusions." },
  { title: "Site supervision", body: "Day-to-day supervision, quality control and progress reporting against schedule." },
  { title: "Renovations", body: "Targeted refurbishments — kitchens, bathrooms, extensions — minimal disruption, real finishes." },
];

const steps = [
  { icon: ClipboardCheck, title: "Estimate", body: "Site visit (where feasible), brief, scope and an indicative budget within one week." },
  { icon: Calendar, title: "Schedule", body: "Programme of works, milestone payments and procurement plan agreed before kickoff." },
  { icon: HardHat, title: "Build", body: "Construction with weekly progress photos, snag tracking and clear change orders." },
  { icon: KeyRound, title: "Closeout", body: "Snag-free handover, as-built drawings where applicable, and a defects period." },
];

const faqs = [
  { q: "Where do you work?", a: "We're based in Meru and take projects across Kenya. Travel and lodging are quoted transparently." },
  { q: "Do your plans replace stamped drawings?", a: "No. Our plan sets are buildable and detailed, but local authority submission usually requires a registered architect/engineer to stamp the drawings. We can coordinate this." },
  { q: "Are your BOQ rates current?", a: "Rates are indicative as of the issue date. Always reconfirm with current quotations before signing a contract sum." },
  { q: "Can you customise a marketplace plan?", a: "Yes — small adjustments are typically a fixed fee. Major scope changes are scoped separately." },
];

function Services() {
  return (
    <Layout>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-page py-16">
          <SectionHeader
            eyebrow="Services"
            title="What we do — from drawings to keys."
            description="A full-service builder you can also buy a plan from. Two sides of the same business."
          />
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeader title="Capabilities" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c) => (
            <div key={c.title} className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-bold">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-ink text-ink-foreground">
        <div className="container-page py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Our process</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">A predictable build, in four phases.</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title} className="relative rounded-xl border border-ink-foreground/10 bg-ink-foreground/[0.04] p-6">
                <span className="font-mono text-xs text-primary">PHASE 0{i + 1}</span>
                <s.icon className="mt-3 h-7 w-7 text-primary" />
                <h3 className="mt-3 font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-foreground/70">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeader eyebrow="FAQ" title="Frequently asked" />
        <div className="mt-8 mx-auto max-w-3xl space-y-2">
          {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
        </div>
      </section>

      <CTABanner
        eyebrow="Talk to us"
        title="Got a project to scope?"
        subtitle="Book a paid consultation. Pick a date and time, share what you'd like to discuss, and we'll confirm."
        primary={{ label: "Book a consultation", to: "/consult" }}
        secondary={{ label: "Browse marketplace", to: "/marketplace" }}
      />
    </Layout>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-card">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
        <span className="font-semibold">{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-border p-5 pt-4 text-sm text-muted-foreground">{a}</div>}
    </div>
  );
}
