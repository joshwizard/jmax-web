import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function CTABanner({
  eyebrow = "Ready to build?",
  title = "Start with a plan you can actually build.",
  subtitle = "Browse the marketplace or talk to us about a custom design and tender.",
  primary = { label: "Browse marketplace", to: "/marketplace" as const },
  secondary = { label: "Request a consultation", to: "/contact" as const },
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primary?: { label: string; to: "/marketplace" | "/contact" | "/services" | "/consult" };
  secondary?: { label: string; to: "/marketplace" | "/contact" | "/services" | "/consult" };
}) {
  return (
    <section className="container-page my-20">
      <div className="relative overflow-hidden rounded-2xl bg-ink p-10 text-ink-foreground md:p-16">
        <div className="absolute inset-0 grid-blueprint opacity-30" />
        <div className="relative grid gap-6 md:grid-cols-2 md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl text-balance">{title}</h2>
            <p className="mt-3 max-w-lg text-ink-foreground/70">{subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link
              to={primary.to}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              {primary.label} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={secondary.to}
              className="inline-flex items-center gap-2 rounded-md border border-ink-foreground/20 px-5 py-3 text-sm font-semibold text-ink-foreground transition hover:bg-ink-foreground/10"
            >
              {secondary.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
