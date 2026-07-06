import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Calculator, ArrowRight, Info } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { formatKES } from "@/lib/products";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: "Construction Cost Calculator (Kenya) · Jmax Builders" },
      { name: "description", content: "Estimate the cost of building a residential or commercial project in Kenya by floor area and finish quality. Indicative only." },
    ],
  }),
  component: CalculatorPage,
});

const RATES: Record<string, { basic: number; standard: number; premium: number; label: string }> = {
  Residential: { basic: 35000, standard: 50000, premium: 75000, label: "Residential" },
  Commercial: { basic: 45000, standard: 65000, premium: 95000, label: "Commercial" },
  "Mixed-Use": { basic: 42000, standard: 60000, premium: 85000, label: "Mixed-use" },
};

function CalculatorPage() {
  const [type, setType] = useState<keyof typeof RATES>("Residential");
  const [sqm, setSqm] = useState(150);
  const [finish, setFinish] = useState<"basic" | "standard" | "premium">("standard");

  const ratePerSqm = RATES[type][finish];
  const total = useMemo(() => Math.max(0, sqm) * ratePerSqm, [sqm, ratePerSqm]);
  const range = useMemo(() => ({ low: Math.round(total * 0.9), high: Math.round(total * 1.15) }), [total]);

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Calculator" }]} />
      <section className="container-page py-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Cost calculator</p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">Get a quick build-cost estimate</h1>
            <p className="mt-3 text-muted-foreground">An indicative figure to help you plan. Actual cost depends on site conditions, materials selection, statutory fees, and current market rates. For a binding quote, request a site visit.</p>

            <div className="mt-8 space-y-6 rounded-xl border border-border bg-card p-6">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Building type</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(Object.keys(RATES) as Array<keyof typeof RATES>).map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`rounded-md border px-3 py-2 text-xs font-semibold transition ${type === t ? "border-ink bg-ink text-ink-foreground" : "border-border hover:border-primary"}`}
                    >
                      {RATES[t].label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Floor area (sq m)</label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="range"
                    min={40}
                    max={1000}
                    step={5}
                    value={sqm}
                    onChange={(e) => setSqm(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <input
                    type="number"
                    min={1}
                    value={sqm}
                    onChange={(e) => setSqm(Number(e.target.value) || 0)}
                    className="w-24 rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">~{Math.round(sqm * 10.764)} sq ft</p>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Finish quality</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(["basic", "standard", "premium"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFinish(f)}
                      className={`rounded-md border px-3 py-2 text-xs font-semibold capitalize transition ${finish === f ? "border-ink bg-ink text-ink-foreground" : "border-border hover:border-primary"}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Basic: standard tiles, mass-market fixtures · Standard: porcelain finishes, mid-range fixtures · Premium: imported finishes, designer fixtures.
                </p>
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-border bg-ink p-6 text-ink-foreground">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink-foreground/70">
                <Calculator className="h-4 w-4" /> Indicative estimate
              </div>
              <p className="mt-3 font-display text-4xl font-bold tracking-tight">{formatKES(total)}</p>
              <p className="mt-1 text-xs text-ink-foreground/70">at {formatKES(ratePerSqm)} / sq m · {sqm} sq m</p>
              <div className="mt-4 rounded-md bg-ink-foreground/10 p-3 text-xs">
                <p className="font-semibold">Likely range</p>
                <p className="mt-1 text-ink-foreground/80">{formatKES(range.low)} — {formatKES(range.high)}</p>
                <p className="mt-2 text-ink-foreground/60">Accounts for ±10–15% variance from site conditions and procurement timing.</p>
              </div>
              <Link to="/contact" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
                Request a binding quote <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-md border border-border bg-card p-4 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>This estimate excludes land cost, statutory & permit fees, professional fees, and external works. Use it for early planning only.</p>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
}
