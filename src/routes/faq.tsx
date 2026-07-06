import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Plans, BOQs & Construction · Jmax Builders" },
      { name: "description", content: "Answers about plan licensing, file formats, BOQ rates, revisions, refunds, and how digital delivery works." },
    ],
  }),
  component: FAQPage,
});

const faqs: { q: string; a: string; group: string }[] = [
  
  { group: "Buying & licensing", q: "Can I share or resell the files I purchase?", a: "No. Source files (DWG, editable PDFs, XLSX) cannot be redistributed, resold, or sub-licensed. The license covers your use for building, not redistribution of drawings or BOQs themselves." },
  { group: "Buying & licensing", q: "Do I need an architect to submit plans for approval?", a: "Most county authorities in Kenya require drawings to be stamped by a registered architect (ARCON) and engineer (BORAQS/EBK) before approval. Our plans serve as a strong starting point — engage a local consultant to stamp and adapt them to your site." },
  { group: "Files & formats", q: "What file format do I receive?", a: "All deliverables — architectural drawings, structural drawings and BOQs — ship as print-ready PDF files." },

  { group: "BOQs", q: "Are the rates in your BOQs current?", a: "Rates are indicative and reflect market averages at the date of issue. Always reconfirm with current quotations from your local suppliers before you sign a contract sum. We note material price escalation beyond 60 days from issue." },
  { group: "BOQs", q: "What's not measured in a standard BOQ?", a: "Site-specific groundworks (rock excavation, dewatering), MEP detail, statutory fees, and external works beyond a 2 m apron are typically excluded or carried as provisional sums. Each BOQ lists its exclusions clearly." },
  { group: "Delivery & support", q: "How quickly do I receive my files after payment?", a: "Files are available immediately after a successful payment via download link in your account library and a copy emailed to you. Links remain valid for 30 days." },
  { group: "Delivery & support", q: "Can I get revisions to a plan I purchased?", a: "Minor adaptations (room re-arrangement, opening shifts) can be commissioned as a paid revision. Full re-design is treated as a new architectural service. Email us with your plot details to scope it." },
  { group: "Refunds", q: "Can I get a refund?", a: "Because deliverables are digital and granted under license at delivery, refunds are only issued where files are materially defective and we cannot resolve within 7 days. See our full refund policy for specifics." },
  { group: "Construction services", q: "Do you build outside Meru?", a: "Yes. We build across Kenya. Mobilisation costs to sites outside Meru are reflected in the quote." },
  { group: "Construction services", q: "How do I request a quote for my own project?", a: "Use the contact form with plot location, plot size, and a brief description. We'll respond within one business day with next steps." },
];

function FAQPage() {
  const groups = Array.from(new Set(faqs.map((f) => f.group)));
  return (
    <Layout>
      <Breadcrumbs items={[{ label: "FAQ" }]} />
      <section className="container-page py-12">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Frequently asked</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">Questions, clearly answered</h1>
          <p className="mt-3 text-muted-foreground">Licensing, formats, BOQ rates, refunds — straight answers, no fluff.</p>
        </div>

        <div className="mt-12 space-y-12">
          {groups.map((g) => (
            <div key={g}>
              <h2 className="font-display text-xl font-bold">{g}</h2>
              <div className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
                {faqs.filter((f) => f.group === g).map((f, i) => <FAQItem key={i} {...f} />)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-xl border border-border bg-secondary/40 p-6 text-center">
          <p className="font-display text-lg font-semibold">Still have a question?</p>
          <p className="mt-1 text-sm text-muted-foreground">Email <a className="underline hover:text-primary" href="mailto:jmaxbuildersltd@gmail.com">jmaxbuildersltd@gmail.com</a> and we'll respond within one business day.</p>
        </div>
      </section>
    </Layout>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="font-medium">{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-5 text-sm text-muted-foreground">{a}</div>}
    </div>
  );
}
