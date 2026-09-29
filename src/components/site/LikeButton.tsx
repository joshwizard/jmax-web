import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useProjectLikes } from "@/lib/project-likes";

export function LikeButton({
  slug,
  title,
  variant = "overlay",
  className = "",
}: {
  slug: string;
  title: string;
  variant?: "overlay" | "pill";
  className?: string;
}) {
  const { liked, counts, pending, toggle } = useProjectLikes();
  const isLiked = liked.has(slug);
  const count = counts[slug] ?? 0;

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(slug).catch((err: Error) => toast.error(err.message));
  };

  const label = isLiked ? `Unlike ${title}` : `Like ${title}`;

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={pending.has(slug)}
        aria-pressed={isLiked}
        aria-label={label}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition disabled:opacity-70 ${
          isLiked
            ? "border-red-200 bg-red-50 text-red-600"
            : "border-border bg-card text-foreground hover:border-red-300 hover:text-red-600"
        } ${className}`}
      >
        <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
        {isLiked ? "You like this project" : "Like this project"}
        {count > 0 && <span className="text-muted-foreground">· {count}</span>}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending.has(slug)}
      aria-pressed={isLiked}
      aria-label={label}
      className={`inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-sm font-semibold shadow-sm backdrop-blur transition hover:scale-105 disabled:opacity-80 ${
        isLiked ? "text-red-600" : "text-foreground hover:text-red-600"
      } ${className}`}
    >
      <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
