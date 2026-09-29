import { useEffect, useSyncExternalStore } from "react";
import { getProjectLikes, setProjectLike } from "@/lib/project-likes.functions";
import { trackEvent } from "@/lib/analytics";

const VISITOR_KEY = "jmax_visitor_id";

type LikesState = {
  ready: boolean;
  counts: Record<string, number>;
  liked: Set<string>;
  pending: Set<string>;
};

let state: LikesState = { ready: false, counts: {}, liked: new Set(), pending: new Set() };
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const serverSnapshot: LikesState = state;

function setState(patch: Partial<LikesState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getVisitorId() {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

function ensureLoaded() {
  if (loading || typeof window === "undefined") return;
  const visitorId = getVisitorId();
  loading = getProjectLikes({ data: { visitorId: visitorId || undefined } })
    .then((res) => setState({ ready: true, counts: res.counts, liked: new Set(res.liked) }))
    .catch(() => setState({ ready: true }));
}

async function toggle(slug: string) {
  const visitorId = getVisitorId();
  if (!visitorId || state.pending.has(slug)) return;

  const wasLiked = state.liked.has(slug);
  const prevCount = state.counts[slug] ?? 0;
  const liked = new Set(state.liked);
  if (wasLiked) liked.delete(slug);
  else liked.add(slug);
  setState({
    liked,
    counts: { ...state.counts, [slug]: Math.max(0, prevCount + (wasLiked ? -1 : 1)) },
    pending: new Set(state.pending).add(slug),
  });

  try {
    const res = await setProjectLike({ data: { slug, visitorId, liked: !wasLiked } });
    if (!wasLiked) trackEvent("like_project", { project_slug: slug });
    setState({ counts: { ...state.counts, [slug]: res.likes } });
  } catch {
    const reverted = new Set(state.liked);
    if (wasLiked) reverted.add(slug);
    else reverted.delete(slug);
    setState({ liked: reverted, counts: { ...state.counts, [slug]: prevCount } });
    throw new Error("Could not save your like. Please try again.");
  } finally {
    const pending = new Set(state.pending);
    pending.delete(slug);
    setState({ pending });
  }
}

export function useProjectLikes() {
  const snap = useSyncExternalStore(subscribe, () => state, () => serverSnapshot);
  useEffect(() => {
    ensureLoaded();
  }, []);
  return { ...snap, toggle };
}
