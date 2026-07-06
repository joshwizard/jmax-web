import { Link } from "@tanstack/react-router";
import { HardHat, Mail, Phone, MapPin } from "lucide-react";
import { NewsletterSignup } from "./NewsletterSignup";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-ink text-ink-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
              <HardHat className="h-5 w-5" />
            </span>
            Jmax<span className="text-primary">.</span>Builders
          </div>
          <p className="mt-4 max-w-xs text-sm text-ink-foreground/70">
            Construction, plans and BOQs you can build from. Based in Meru, serving clients across Kenya.
          </p>
          <div className="mt-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-foreground/60">Newsletter</h4>
            <p className="mt-2 text-xs text-ink-foreground/60">New plan releases and BOQ tips. No spam.</p>
            <NewsletterSignup />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-ink-foreground/60">Company</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/services" className="hover:text-primary">Services</Link></li>
            <li><Link to="/portfolio" className="hover:text-primary">Portfolio</Link></li>
            <li><Link to="/marketplace" className="hover:text-primary">Marketplace</Link></li>
            <li><Link to="/calculator" className="hover:text-primary">Cost calculator</Link></li>
            <li><Link to="/faq" className="hover:text-primary">FAQ</Link></li>
            <li><Link to="/account" className="hover:text-primary">Your library</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-ink-foreground/60">Legal</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/legal/terms" className="hover:text-primary">Terms of Sale</Link></li>
            <li><Link to="/legal/privacy" className="hover:text-primary">Privacy Policy</Link></li>
            <li><Link to="/legal/disclaimer" className="hover:text-primary">Plans & BOQ Disclaimer</Link></li>
            <li><Link to="/legal/refunds" className="hover:text-primary">Refund Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-ink-foreground/60">Get in touch</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary" /> Meru, Kenya</li>
            <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 text-primary" /> <a href="tel:+254702067939" className="hover:text-primary">+254 702 067 939</a></li>
            <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 text-primary" /> <a href="mailto:jmaxbuildersltd@gmail.com" className="hover:text-primary break-all">jmaxbuildersltd@gmail.com</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-foreground/10">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-5 text-xs text-ink-foreground/50 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Jmax Builders Ltd. All rights reserved.</p>
          <p>Service area: Meru &amp; nationwide on request · Licenses & insurance: details available on request</p>
        </div>
      </div>
    </footer>
  );
}
