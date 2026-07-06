import { useEffect, useState } from "react";
import { applyPromo, type PromoCode } from "./promo";

const KEY = "jmax_promo_v1";

export function usePromo(subtotal: number) {
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setCode(sessionStorage.getItem(KEY));
    } catch {}
  }, []);

  const setPromo = (next: string | null) => {
    setCode(next);
    if (typeof window === "undefined") return;
    try {
      if (next) sessionStorage.setItem(KEY, next);
      else sessionStorage.removeItem(KEY);
    } catch {}
  };

  const result = applyPromo(subtotal, code);

  return {
    code,
    setPromo,
    discount: result.discount,
    promo: result.promo as PromoCode | null,
    error: result.error,
    clear: () => setPromo(null),
  };
}
