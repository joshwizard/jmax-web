export interface PromoCode {
  code: string;
  label: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal?: number;
}

export const PROMO_CODES: PromoCode[] = [
  { code: "JMAX10", label: "10% off any order", type: "percent", value: 10 },
  { code: "WELCOME", label: "KES 1,500 off orders over KES 10,000", type: "fixed", value: 1500, minSubtotal: 10000 },
  { code: "BUNDLE", label: "15% off when you spend KES 25,000+", type: "percent", value: 15, minSubtotal: 25000 },
];

export function applyPromo(subtotal: number, code: string | null): { discount: number; promo: PromoCode | null; error?: string } {
  if (!code) return { discount: 0, promo: null };
  const promo = PROMO_CODES.find((p) => p.code.toLowerCase() === code.trim().toLowerCase());
  if (!promo) return { discount: 0, promo: null, error: "Invalid promo code" };
  if (promo.minSubtotal && subtotal < promo.minSubtotal) {
    return { discount: 0, promo: null, error: `Spend at least KES ${promo.minSubtotal.toLocaleString()} to use this code` };
  }
  const discount = promo.type === "percent" ? Math.round((subtotal * promo.value) / 100) : promo.value;
  return { discount: Math.min(discount, subtotal), promo };
}
