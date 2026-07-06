import { FileText, ClipboardList } from "lucide-react";
import type { Product } from "@/lib/products";

export function TypeBadge({ type }: { type: Product["type"] }) {
  const isPlan = type === "Plans";
  const Icon = isPlan ? FileText : ClipboardList;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm ${
        isPlan ? "bg-ink text-ink-foreground" : "bg-primary text-primary-foreground"
      }`}
    >
      <Icon className="h-3 w-3" /> {type}
    </span>
  );
}
