import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Deliverable, Product } from "./products";

export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  type: Product["type"];
  license: Deliverable;
  price: number;
  image: string;
  qty: number;
}

interface CartCtx {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">) => void;
  remove: (productId: string, license: Deliverable) => void;
  setQty: (productId: string, license: Deliverable, qty: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "jmax_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add: CartCtx["add"] = (item) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.productId === item.productId && p.license === item.license);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const remove: CartCtx["remove"] = (productId, license) =>
    setItems((prev) => prev.filter((p) => !(p.productId === productId && p.license === license)));

  const setQty: CartCtx["setQty"] = (productId, license, qty) =>
    setItems((prev) =>
      qty <= 0
        ? prev.filter((p) => !(p.productId === productId && p.license === license))
        : prev.map((p) => (p.productId === productId && p.license === license ? { ...p, qty } : p))
    );

  const clear = () => setItems([]);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return <Ctx.Provider value={{ items, add, remove, setQty, clear, subtotal, count }}>{children}</Ctx.Provider>;
}

export const useCart = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used within CartProvider");
  return v;
};
