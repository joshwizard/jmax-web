import { Link } from "@tanstack/react-router";
import { ArrowRight, Bath, BedDouble, Heart, Layers, Ruler } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/products";
import { formatKES } from "@/lib/products";
import { TypeBadge } from "./TypeBadge";
import { useWishlist } from "@/lib/wishlist";

export function ProductCard({ p }: { p: Product }) {
  const { has, toggle } = useWishlist();
  const wished = has(p.id);
  const deliverableLabels = p.deliverables.map((d) => (d.kind === "BOQ" ? "BOQ" : d.kind.slice(0, 4)));

  const onWishClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(p.id);
    toast.success(wished ? "Removed from wishlist" : "Saved to wishlist", { description: p.title });
  };

  return (
    <Link
      to="/marketplace/$slug"
      params={{ slug: p.slug }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={p.image}
          alt={p.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3"><TypeBadge type={p.type} /></div>
        <button
          type="button"
          onClick={onWishClick}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border bg-background/95 backdrop-blur transition ${wished ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-primary"}`}
        >
          <Heart className={`h-4 w-4 ${wished ? "fill-current" : ""}`} />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-base font-semibold leading-snug text-balance">{p.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{p.shortDescription}</p>

        <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          {p.bedrooms != null && (
            <span className="inline-flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{p.bedrooms} bed</span>
          )}
          {p.bathrooms != null && (
            <span className="inline-flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{p.bathrooms} bath</span>
          )}
          {p.floors != null && (
            <span className="inline-flex items-center gap-1"><Layers className="h-3.5 w-3.5" />{p.floors} {p.floors === 1 ? "floor" : "floors"}</span>
          )}
          {p.plotSize && (
            <span className="inline-flex items-center gap-1"><Ruler className="h-3.5 w-3.5" />{p.plotSize}</span>
          )}
          {!p.plotSize && p.areaSqft != null && (
            <span className="inline-flex items-center gap-1"><Ruler className="h-3.5 w-3.5" />{p.areaSqft.toLocaleString()} sq ft</span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 text-[11px]">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">{p.buildingType}</span>
          {deliverableLabels.map((label) => (
            <span key={label} className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">{label}</span>
          ))}
          {p.formats[0] && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">{p.formats[0]}</span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">From</p>
            <p className="font-display text-lg font-bold">{formatKES(p.price)}</p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            View <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
