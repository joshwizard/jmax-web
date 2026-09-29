declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Google Analytics 4 Measurement ID, e.g. G-XXXXXXXXXX */
export const GA_MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim() || "";

export function isAnalyticsEnabled() {
  return Boolean(GA_MEASUREMENT_ID) && typeof window !== "undefined";
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (!isAnalyticsEnabled()) return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === "function") window.gtag("event", name, params);
  else window.dataLayer.push(["event", name, params]);
}

export function trackPageview(path: string) {
  if (!isAnalyticsEnabled()) return;
  // Queue even before gtag.js finishes loading (stub pushes into dataLayer).
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === "function") {
    window.gtag("event", "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  } else {
    window.dataLayer.push(["event", "page_view", { page_path: path }]);
  }
}
