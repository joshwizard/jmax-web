import planImg from "@/assets/product-plan.jpg";
import boqImg from "@/assets/product-boq.jpg";
import { parseDeliverableFiles } from "@/lib/product-files";

export type ProductType = "Plans" | "BOQ";
export type Deliverable = "Architectural" | "Structural" | "BOQ";

export interface Product {
  id: string;
  slug: string;
  type: ProductType;
  title: string;
  shortDescription: string;
  longDescription: string;
  buildingType: "Residential" | "Commercial" | "Mixed-Use";
  sqftBand: "Under 1,500" | "1,500 – 3,000" | "3,000 – 5,000" | "5,000+";
  discipline: string[];
  price: number; // KES
  formats: string[];
  inclusions: string[];
  exclusions: string[];
  deliverables: { kind: Deliverable; price: number }[];
  measurementBasis?: string;
  units?: string;
  image: string;
  preview: string;
  /** Product photos for the detail carousel (max 5). Falls back to `image` when empty. */
  images?: string[];
  /** Labeled drawing-sheet previews (floor plans, elevations, etc.). */
  sheets?: { src: string; label: string }[];
  bedrooms?: number;
  bathrooms?: number;
  areaSqft?: number;
  plotSize?: string;
  floors?: number;
}

export const products: Product[] = [
  {
    id: "p-001",
    slug: "3br-bungalow-modern",
    type: "Plans",
    title: "3-Bedroom Modern Bungalow — Plan Set",
    shortDescription: "Complete architectural plan set for a 3-bedroom modern bungalow on a 50x100 plot.",
    longDescription:
      "A buildable, contractor-ready plan set for a 3-bedroom modern bungalow optimized for typical 50x100 ft plots in Kenya. Includes floor plan, elevations, roof plan, and indicative section drawings.",
    buildingType: "Residential",
    sqftBand: "1,500 – 3,000",
    discipline: ["Architectural", "Structural notes"],
    price: 12500,
    formats: ["PDF"],
    inclusions: [
      "Ground floor plan, dimensioned",
      "Four elevations (N/S/E/W)",
      "Roof plan and ridge layout",
      "One indicative cross-section",
      "Door & window schedule",
    ],
    exclusions: [
      "Structural calculations stamped by a registered engineer",
      "MEP detailed drawings (electrical, plumbing, HVAC)",
      "Site-specific geotechnical recommendations",
      "Local authority submission fees",
    ],
    deliverables: [
      { kind: "Architectural", price: 12500 },
      { kind: "Structural", price: 8800 },
      { kind: "BOQ", price: 6200 },
    ],
    image: planImg,
    preview: planImg,
  },
  {
    id: "p-002",
    slug: "4br-maisonette-contemporary",
    type: "Plans",
    title: "4-Bedroom Contemporary Maisonette — Plan Set",
    shortDescription: "Two-storey 4-bedroom maisonette with DSQ, ensuite master, and double garage.",
    longDescription:
      "Premium plan set tailored for upmarket residential plots. Designed for natural light, cross-ventilation, and a clear separation between public and private zones.",
    buildingType: "Residential",
    sqftBand: "3,000 – 5,000",
    discipline: ["Architectural"],
    price: 22000,
    formats: ["PDF"],
    inclusions: [
      "Ground & first floor plans",
      "Four elevations + roof plan",
      "Two cross-sections",
      "Door, window & finishing schedule",
    ],
    exclusions: [
      "Stamped structural & MEP drawings",
      "Interior design specifications",
      "Landscaping drawings",
    ],
    deliverables: [
      { kind: "Architectural", price: 22000 },
      { kind: "Structural", price: 15400 },
      { kind: "BOQ", price: 11000 },
    ],
    image: planImg,
    preview: planImg,
  },
  {
    id: "b-001",
    slug: "boq-3br-bungalow",
    type: "BOQ",
    title: "BOQ — 3-Bedroom Bungalow",
    shortDescription: "Itemized Bill of Quantities for the 3-bedroom modern bungalow plan set.",
    longDescription:
      "A measured BOQ prepared on standard SMM principles, broken down by trade. Quantities reflect drawings as supplied; rates are indicative and should be confirmed with current market quotations.",
    buildingType: "Residential",
    sqftBand: "1,500 – 3,000",
    discipline: ["Quantity Surveying"],
    price: 8500,
    formats: ["PDF"],
    inclusions: [
      "Preliminaries summary",
      "Substructure: excavation, blinding, foundations",
      "Superstructure: walling, columns, beams, slab",
      "Roof: trusses, covering, rainwater goods",
      "Finishes: plaster, paint, floor & wall finishes",
      "Doors, windows & ironmongery schedule",
      "Indicative rates per item (KES)",
    ],
    exclusions: [
      "Site-specific groundworks (rock excavation, dewatering)",
      "External works beyond a 2 m apron",
      "MEP detailed quantities (priced as provisional sums)",
      "Statutory fees, permits, NEMA charges",
      "Price escalation beyond 60 days from issue",
    ],
    measurementBasis: "Standard Method of Measurement (SMM7-aligned)",
    units: "m, m², m³, no., item, sum",
    deliverables: [
      { kind: "BOQ", price: 8500 },
    ],
    image: boqImg,
    preview: boqImg,
  },
  {
    id: "b-002",
    slug: "boq-commercial-shell",
    type: "BOQ",
    title: "BOQ — Commercial Shell (Ground + 2)",
    shortDescription: "Trade-by-trade BOQ for a small commercial shell building, ground plus two floors.",
    longDescription:
      "Suitable for early-stage feasibility and tender preparation on a small commercial shell. Excludes tenant fit-out.",
    buildingType: "Commercial",
    sqftBand: "5,000+",
    discipline: ["Quantity Surveying"],
    price: 18500,
    formats: ["PDF"],
    inclusions: [
      "Preliminaries & general items",
      "Substructure & superstructure measured",
      "Façade: curtain wall provisional",
      "Core: lift shaft, staircases",
      "Indicative rates (KES)",
    ],
    exclusions: [
      "Tenant fit-out works",
      "Detailed MEP quantities",
      "Specialist façade engineering",
      "Authority fees",
    ],
    measurementBasis: "Standard Method of Measurement (SMM7-aligned)",
    units: "m, m², m³, no., item, sum",
    deliverables: [
      { kind: "BOQ", price: 18500 },
    ],
    image: boqImg,
    preview: boqImg,
  },
  {
    id: "p-003",
    slug: "2br-starter-home",
    type: "Plans",
    title: "2-Bedroom Starter Home — Plan Set",
    shortDescription: "Compact, efficient 2-bedroom plan set ideal for first-time builders.",
    longDescription:
      "An affordable starter home plan focused on buildability and minimal waste. Drawings prioritize standard block sizes and conventional roof spans.",
    buildingType: "Residential",
    sqftBand: "Under 1,500",
    discipline: ["Architectural"],
    price: 7500,
    formats: ["PDF"],
    inclusions: ["Floor plan", "Four elevations", "Roof plan", "Schedule of openings"],
    exclusions: ["Stamped structural drawings", "MEP drawings", "Statutory submission costs"],
    deliverables: [
      { kind: "Architectural", price: 7500 },
      { kind: "Structural", price: 5200 },
      { kind: "BOQ", price: 3800 },
    ],
    image: planImg,
    preview: planImg,
  },
  {
    id: "b-003",
    slug: "boq-2br-starter",
    type: "BOQ",
    title: "BOQ — 2-Bedroom Starter Home",
    shortDescription: "Trade-priced BOQ companion to the 2-bedroom starter home plan.",
    longDescription:
      "A practical, lean BOQ designed for owner-builders and small contractors. Pairs directly with the 2-Bedroom Starter Home plan set.",
    buildingType: "Residential",
    sqftBand: "Under 1,500",
    discipline: ["Quantity Surveying"],
    price: 5500,
    formats: ["PDF"],
    inclusions: [
      "Preliminaries",
      "Substructure & superstructure",
      "Roof, finishes, openings",
      "Indicative rates (KES)",
    ],
    exclusions: ["Site-specific groundworks", "Detailed MEP", "Statutory fees"],
    measurementBasis: "Standard Method of Measurement (SMM7-aligned)",
    units: "m, m², m³, no., item, sum",
    deliverables: [
      { kind: "BOQ", price: 5500 },
    ],
    image: boqImg,
    preview: boqImg,
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

/** URL-safe slug: lowercase, hyphens, no spaces. */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const PRODUCT_GALLERY_MAX = 5;
export const PRODUCT_SHEETS_MAX = 5;

export const SHEET_LABEL_OPTIONS = [
  "Ground floor",
  "First floor",
  "Elevations",
  "Section",
  "Roof plan",
  "Site plan",
  "Schedule",
  "Other",
] as const;

export function sqftBandFromArea(area: number | null | undefined): Product["sqftBand"] {
  if (area == null || !Number.isFinite(area) || area <= 0) return "Under 1,500";
  if (area < 1500) return "Under 1,500";
  if (area < 3000) return "1,500 – 3,000";
  if (area < 5000) return "3,000 – 5,000";
  return "5,000+";
}

type DbProductRow = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  price_kes: number;
  description: string | null;
  cover_url: string | null;
  gallery?: unknown;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  architectural_price_kes?: number | null;
  structural_price_kes?: number | null;
  boq_price_kes?: number | null;
  file_path?: string | null;
};

/** Normalize gallery JSON / cover into a unique list of up to 5 image URLs. */
export function normalizeProductImages(coverUrl: string | null | undefined, gallery: unknown, fallback?: string): string[] {
  const fromGallery = Array.isArray(gallery)
    ? gallery.filter((u): u is string => typeof u === "string" && u.trim().length > 0)
    : [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const url of [...fromGallery, coverUrl, fallback].filter(Boolean) as string[]) {
    if (seen.has(url)) continue;
    seen.add(url);
    out.push(url);
    if (out.length >= PRODUCT_GALLERY_MAX) break;
  }
  return out;
}

export function normalizeProductSheets(sheets: unknown): { src: string; label: string }[] {
  if (!Array.isArray(sheets)) return [];
  const out: { src: string; label: string }[] = [];
  for (const item of sheets) {
    if (!item || typeof item !== "object") continue;
    const src = typeof (item as { src?: unknown }).src === "string" ? (item as { src: string }).src.trim() : "";
    if (!src) continue;
    const labelRaw = (item as { label?: unknown }).label;
    const label = typeof labelRaw === "string" && labelRaw.trim() ? labelRaw.trim() : "Drawing sheet";
    out.push({ src, label });
    if (out.length >= PRODUCT_SHEETS_MAX) break;
  }
  return out;
}

/** Public storage path for a product image gallery manifest (used when DB column is unavailable). */
export function productGalleryManifestPath(slug: string): string {
  return `gallery/${slugify(slug) || "tmp"}/manifest.json`;
}

/** Map a Supabase products row into the marketplace Product shape. */
export function productFromDb(
  row: DbProductRow,
  seed?: Product,
  media?: {
    images?: string[];
    sheets?: { src: string; label: string }[];
    plotSize?: string | null;
    floors?: number | null;
  },
): Product {
  const type: ProductType = row.category === "BOQ" ? "BOQ" : "Plans";
  const files = parseDeliverableFiles(row.file_path);
  const deliverables: Product["deliverables"] = [];
  if (row.architectural_price_kes != null && files.Architectural) {
    deliverables.push({ kind: "Architectural", price: row.architectural_price_kes });
  }
  if (row.structural_price_kes != null && files.Structural) {
    deliverables.push({ kind: "Structural", price: row.structural_price_kes });
  }
  if (row.boq_price_kes != null && files.BOQ) {
    deliverables.push({ kind: "BOQ", price: row.boq_price_kes });
  }
  // Fallback: priced kinds with no file map yet (legacy) — Architectural/BOQ from base price only if a legacy path exists
  if (deliverables.length === 0) {
    if (files.Architectural && type !== "BOQ") {
      deliverables.push({ kind: "Architectural", price: row.architectural_price_kes ?? row.price_kes });
    }
    if (files.Structural && row.structural_price_kes != null) {
      deliverables.push({ kind: "Structural", price: row.structural_price_kes });
    }
    if (files.BOQ) {
      deliverables.push({ kind: "BOQ", price: row.boq_price_kes ?? row.price_kes });
    }
  }
  const images = normalizeProductImages(
    row.cover_url,
    media?.images ?? row.gallery,
    seed?.image,
  );
  const image = images[0] || seed?.image || "/placeholder.svg";
  const sheets = media?.sheets?.length ? media.sheets : seed?.sheets || [];
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type,
    buildingType: seed?.buildingType || "Residential",
    sqftBand: row.area_sqft != null ? sqftBandFromArea(row.area_sqft) : seed?.sqftBand || "Under 1,500",
    price: row.price_kes,
    image,
    preview: seed?.preview || image,
    images: images.length ? images : [image],
    sheets,
    bedrooms: row.bedrooms ?? seed?.bedrooms,
    bathrooms: row.bathrooms ?? seed?.bathrooms,
    areaSqft: row.area_sqft ?? seed?.areaSqft,
    plotSize: media?.plotSize || seed?.plotSize,
    floors: media?.floors ?? seed?.floors,
    shortDescription: row.description || seed?.shortDescription || "",
    longDescription: seed?.longDescription || row.description || "",
    discipline: seed?.discipline || deliverables.map((d) => d.kind),
    formats: seed?.formats || ["PDF"],
    inclusions: seed?.inclusions || [],
    exclusions: seed?.exclusions || [],
    deliverables,
    measurementBasis: seed?.measurementBasis,
    units: seed?.units,
  };
}

export const formatKES = (n: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);
