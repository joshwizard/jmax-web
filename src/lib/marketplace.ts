/**
 * Public marketplace (plans & BOQs). Keep false until catalog is ready.
 * Set VITE_MARKETPLACE_ENABLED=true in .env (and Vercel) to show it again.
 * Admin → Marketplace stays available either way.
 */
export const MARKETPLACE_ENABLED =
  import.meta.env.VITE_MARKETPLACE_ENABLED === "true";
