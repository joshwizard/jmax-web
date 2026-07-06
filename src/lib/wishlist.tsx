import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface WishlistCtx {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
}

const Ctx = createContext<WishlistCtx | null>(null);
const KEY = "jmax_wishlist_v1";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEY, JSON.stringify(ids));
  }, [ids]);

  const has = (id: string) => ids.includes(id);
  const toggle = (id: string) =>
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const remove = (id: string) => setIds((prev) => prev.filter((x) => x !== id));
  const clear = () => setIds([]);

  return (
    <Ctx.Provider value={{ ids, has, toggle, remove, clear, count: ids.length }}>{children}</Ctx.Provider>
  );
}

export const useWishlist = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useWishlist must be used within WishlistProvider");
  return v;
};
