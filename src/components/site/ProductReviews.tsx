import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().max(2000).optional(),
});

export function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!UUID_RE.test(productId)) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("id,user_id,rating,title,body,created_at")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    setReviews((data ?? []) as Review[]);
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [productId]);

  useEffect(() => {
    if (!user || !UUID_RE.test(productId)) { setCanReview(false); return; }
    (async () => {
      const { data } = await supabase.rpc("has_purchased", { _user_id: user.id, _product_id: productId });
      setCanReview(Boolean(data));
    })();
  }, [user, productId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { toast.error("Please sign in to write a review"); return; }
    const parsed = reviewSchema.safeParse({ rating, title: title || undefined, body: body || undefined });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setBusy(true);
    const { error } = await supabase.from("reviews").insert({
      product_id: productId, user_id: user.id,
      rating: parsed.data.rating, title: parsed.data.title ?? null, body: parsed.data.body ?? null,
    });
    setBusy(false);
    if (error) { toast.error("Could not post review", { description: error.message }); return; }
    toast.success("Review posted");
    setTitle(""); setBody(""); setRating(5);
    load();
  }

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="mt-14 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-bold">Reviews</h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <Stars value={avg} />
            <span className="text-muted-foreground">{avg.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}</span>
          </div>
        )}
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No reviews yet. Verified buyers can be the first to share their experience.</p>
      ) : (
        <ul className="mt-5 space-y-5">
          {reviews.map((r) => (
            <li key={r.id} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
              <div className="flex items-center gap-2">
                <Stars value={r.rating} />
                <span className="text-sm font-semibold">Verified buyer</span>
                <span className="text-xs text-muted-foreground">· {new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              {r.title && <p className="mt-2 font-semibold">{r.title}</p>}
              {r.body && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-line">{r.body}</p>}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 border-t border-border pt-5">
        {!user ? (
          <p className="text-sm text-muted-foreground">Sign in and purchase this product to write a review.</p>
        ) : !canReview ? (
          <p className="text-sm text-muted-foreground">Only verified buyers can review this product.</p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your rating</label>
              <div className="mt-1.5 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`}>
                    <Star className={`h-6 w-6 ${n <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="Title (optional)"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Share your experience (optional)"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Posting…" : "Post review"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`h-4 w-4 ${n <= Math.round(value) ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />
      ))}
    </div>
  );
}
