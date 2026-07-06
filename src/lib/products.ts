import planImg from "@/assets/product-plan.jpg";
import boqImg from "@/assets/product-boq.jpg";

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

export const formatKES = (n: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);
