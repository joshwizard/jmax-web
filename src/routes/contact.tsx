import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Layout } from "@/components/site/Layout";
import { SectionHeader } from "@/components/site/SectionHeader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Jmax Builders, Meru, Kenya" },
      { name: "description", content: "Get in touch with Jmax Builders Ltd. Phone, email, and consultation request form." },
      { property: "og:title", content: "Contact Jmax Builders" },
      { property: "og:description", content: "Reach Jmax Builders in Meru, Kenya — call, email, or send a project brief." },
    ],
  }),
  component: Contact,
});

const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Please share a few details").max(4000),
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setBusy(true);
    const { error } = await supabase.from("leads").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message,
      source: "contact_form",
    });
    setBusy(false);
    if (error) { toast.error("Could not send message", { description: error.message }); return; }
    toast.success("Message sent", { description: "We'll get back to you within one business day." });
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <Layout>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-page py-16">
          <SectionHeader
            eyebrow="Contact"
            title="Tell us about your project."
            description="Send a message, call, or email — whichever works best."
          />
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-6">
            <ContactCard icon={Phone} label="Phone" value="+254 702 067 939" href="tel:+254702067939" />
            <ContactCard icon={Mail} label="Email" value="jmaxbuildersltd@gmail.com" href="mailto:jmaxbuildersltd@gmail.com" />
            <ContactCard icon={MapPin} label="Office" value="Meru, Kenya" />

            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="aspect-[16/10] w-full bg-muted">
                <iframe
                  title="Service area map — Meru, Kenya"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=37.55%2C-0.10%2C37.75%2C0.10&amp;layer=mapnik&amp;marker=0.0463%2C37.6559"
                  className="h-full w-full"
                  loading="lazy"
                />
              </div>
              <div className="p-4 text-xs text-muted-foreground">
                Service area: Meru and surrounding counties. Nationwide projects on request.
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="rounded-xl border border-border bg-card p-6 md:p-8">
            <h3 className="font-display text-xl font-bold">Request a consultation</h3>
            <p className="mt-1 text-sm text-muted-foreground">Share a few details. We'll respond within one business day.</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Name" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Field label="Email" type="email" required value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              <div className="sm:col-span-2">
                <Field label="Phone (optional)" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project brief *</span>
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Site location, building type, approximate size, timeline..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </label>
              </div>
            </div>

            <button type="submit" disabled={busy} className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60">
              <Send className="h-4 w-4" /> {busy ? "Sending…" : "Send message"}
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
}

function ContactCard({ icon: Icon, label, value, href }: { icon: typeof Mail; label: string; value: string; href?: string }) {
  const Inner = (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition hover:border-primary">
      <span className="grid h-11 w-11 place-items-center rounded-md bg-ink text-ink-foreground"><Icon className="h-5 w-5" /></span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href}>{Inner}</a> : Inner;
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}{required && " *"}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </label>
  );
}
