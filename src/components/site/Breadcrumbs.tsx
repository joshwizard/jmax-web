import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="border-b border-border bg-secondary/40">
      <div className="container-page flex items-center gap-1.5 overflow-x-auto py-3 text-xs text-muted-foreground">
        <Link to="/" className="inline-flex items-center gap-1 hover:text-primary">
          <Home className="h-3.5 w-3.5" /> Home
        </Link>
        {items.map((c, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <ChevronRight className="h-3.5 w-3.5" />
            {c.to && i < items.length - 1 ? (
              <Link to={c.to} className="hover:text-primary">{c.label}</Link>
            ) : (
              <span className="font-semibold text-foreground">{c.label}</span>
            )}
          </span>
        ))}
      </div>
    </nav>
  );
}
