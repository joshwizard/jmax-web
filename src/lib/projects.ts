import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";

export type ProjectCategory = "Residential" | "Commercial";

export interface ProjectStat {
  label: string;
  value: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: ProjectCategory;
  year: string;
  location: string;
  duration: string;
  buildingType: string;
  size: string;
  client: string;
  cover: string;
  gallery: { src: string; caption: string }[];
  summary: string;
  brief: string;
  scope: string[];
  challenges: { title: string; body: string }[];
  outcomes: string[];
  stats: ProjectStat[];
  testimonial?: { quote: string; author: string; role: string };
}

export const projects: Project[] = [
  {
    id: "1",
    slug: "karen-family-residence",
    title: "Karen Family Residence",
    category: "Residential",
    year: "2024",
    location: "Karen, Nairobi",
    duration: "9 months",
    buildingType: "4-bedroom maisonette",
    size: "3,200 sq ft",
    client: "Private family",
    cover: project1,
    gallery: [
      { src: project1, caption: "Front elevation at handover" },
      { src: project3, caption: "Living and dining wing" },
      { src: project2, caption: "Double garage and driveway" },
    ],
    summary: "Two-storey 4-bedroom maisonette with double garage, ensuite master, and a generous outdoor entertainment area.",
    brief:
      "The client wanted a contemporary family home that maximised natural light, separated public and private zones, and stayed within a fixed budget. The site sloped gently toward the rear, requiring careful setting-out and a stepped foundation.",
    scope: [
      "Architectural plans, structural coordination and MEP layout",
      "Substructure: stepped strip foundation on improved ground",
      "Superstructure: stone walling, RC columns, beams and slab",
      "Roof: timber trusses with stone-coated tiles",
      "Internal finishes: porcelain tiling, hardwood joinery, painted plaster",
      "External works: driveway, perimeter wall, basic landscaping",
    ],
    challenges: [
      {
        title: "Sloped site, fixed budget",
        body: "A 1.4 m fall across the rear of the plot meant the foundation strategy and earthworks had to be priced before the client committed. We absorbed the variance by re-sequencing the substructure and value-engineering the perimeter wall.",
      },
      {
        title: "Long-lead joinery",
        body: "Hardwood for the staircase and main doors was procured early in week 6 to avoid pushing the finishing programme. We tracked it weekly against the master schedule.",
      },
    ],
    outcomes: [
      "Delivered on the agreed programme with snag-free handover",
      "Final cost within 4% of the contract sum, with no scope cuts",
      "Zero lost-time incidents across 9 months on site",
    ],
    stats: [
      { label: "Programme", value: "9 months" },
      { label: "Floor area", value: "3,200 sq ft" },
      { label: "Bedrooms", value: "4 + DSQ" },
      { label: "Cost variance", value: "+4%" },
    ],
    testimonial: {
      quote: "We moved in on the date promised. Snagging took two days, not two months.",
      author: "D. K.",
      role: "Homeowner",
    },
  },
  {
    id: "2",
    slug: "meru-commercial-block",
    title: "Meru Commercial Block",
    category: "Commercial",
    year: "2023",
    location: "Meru CBD",
    duration: "14 months",
    buildingType: "Ground + 2 commercial shell",
    size: "8,400 sq ft (GFA)",
    client: "Local property investor",
    cover: project2,
    gallery: [
      { src: project2, caption: "Completed façade with curtain glazing" },
      { src: project1, caption: "Site progress at first-floor slab" },
      { src: project3, caption: "Internal core and stair" },
    ],
    summary: "A ground + two commercial shell building with retail at ground level and lettable office floors above.",
    brief:
      "The investor needed a tenant-ready shell building completed inside a tight commercial leasing window. Spec was deliberately lean — services to riser stubs, fit-out to be priced separately by tenants.",
    scope: [
      "Foundation: pad and ground-beam system on stiff residual soils",
      "Frame: RC columns and beams with one-way slabs",
      "Façade: aluminium-framed curtain wall with tinted glazing",
      "Core: lift shaft (provisional), staircases and risers",
      "MEP: services to floor risers, tenant fit-out excluded",
    ],
    challenges: [
      {
        title: "Leasing-driven programme",
        body: "Two anchor tenants had signed letters of intent contingent on a handover date. We re-organised the programme to handover ground floor early so retail fit-out could start while we finished the upper floors.",
      },
      {
        title: "Façade procurement risk",
        body: "Aluminium and glass lead times were volatile. We split the order, locked the first phase early, and used the second-phase delivery as float against the slab pour schedule.",
      },
    ],
    outcomes: [
      "Anchor tenants moved in within 30 days of handover",
      "All three floors leased within 90 days of practical completion",
      "Façade works completed without re-work or replacement glazing",
    ],
    stats: [
      { label: "Programme", value: "14 months" },
      { label: "Gross floor area", value: "8,400 sq ft" },
      { label: "Floors", value: "Ground + 2" },
      { label: "Lease-up", value: "90 days" },
    ],
  },
  {
    id: "3",
    slug: "highlands-bungalow",
    title: "Highlands Bungalow",
    category: "Residential",
    year: "2024",
    location: "Nyeri County",
    duration: "6 months",
    buildingType: "3-bedroom bungalow",
    size: "1,850 sq ft",
    client: "Owner-builder",
    cover: project3,
    gallery: [
      { src: project3, caption: "Completed front elevation" },
      { src: project1, caption: "Open-plan living area" },
      { src: project2, caption: "Driveway and approach" },
    ],
    summary: "A modern 3-bedroom bungalow on a 50x100 ft plot, built directly from our marketplace plan set with minor customisations.",
    brief:
      "The client purchased the 3-Bedroom Modern Bungalow plan set from our marketplace and asked us to build it. Two minor adjustments were made to the kitchen layout and the master ensuite.",
    scope: [
      "Set-out and substructure on virgin ground",
      "Standard block walling, RC ring beams",
      "Conventional truss roof with stone-coated tiles",
      "Kitchen, bathrooms and finishes per client selections",
      "External: paved apron, perimeter chain-link with hedge",
    ],
    challenges: [
      {
        title: "Owner-supplied finishes",
        body: "Tiles and sanitary ware were procured by the client. We coordinated quantities and delivery windows weekly to avoid stalling the finishing trades.",
      },
    ],
    outcomes: [
      "Built within 8% of the estimated budget",
      "Owner moved in two weeks earlier than the original programme",
      "Plan set required only minor on-site clarifications",
    ],
    stats: [
      { label: "Programme", value: "6 months" },
      { label: "Floor area", value: "1,850 sq ft" },
      { label: "Bedrooms", value: "3" },
      { label: "Cost variance", value: "+8%" },
    ],
    testimonial: {
      quote: "Buying the plan and having the same team build it removed every guess from the process.",
      author: "Wanjiru K.",
      role: "Owner-builder",
    },
  },
  {
    id: "4",
    slug: "town-centre-retail-fitout",
    title: "Town Centre Retail Fit-Out",
    category: "Commercial",
    year: "2023",
    location: "Meru CBD",
    duration: "6 weeks",
    buildingType: "Retail interior fit-out",
    size: "1,400 sq ft",
    client: "Retail brand",
    cover: project2,
    gallery: [
      { src: project2, caption: "Completed shopfront" },
      { src: project1, caption: "Joinery installation in progress" },
    ],
    summary: "Retail interior fit-out delivered inside a 6-week shutdown window, including bespoke joinery, lighting and finishes.",
    brief:
      "The brand had a hard reopening date tied to a national campaign. Programme certainty was the single most important constraint — finishes were second.",
    scope: [
      "Strip-out of existing finishes and partitions",
      "New stud partitions with acoustic insulation",
      "Bespoke display joinery in painted MDF and hardwood trim",
      "Track lighting, power and data to retail layout",
      "Vinyl flooring, painted walls, signage substrate",
    ],
    challenges: [
      {
        title: "Shutdown window",
        body: "Six weeks meant finishes had to overlap with second-fix MEP. We ran two shifts in weeks 4 and 5 and pre-fabricated joinery off-site.",
      },
    ],
    outcomes: [
      "Reopened on the campaign launch date",
      "Zero defects raised in the first 30 days post-opening",
    ],
    stats: [
      { label: "Programme", value: "6 weeks" },
      { label: "Floor area", value: "1,400 sq ft" },
      { label: "Shifts", value: "2 (final fortnight)" },
    ],
  },
  {
    id: "5",
    slug: "family-holiday-home",
    title: "Family Holiday Home",
    category: "Residential",
    year: "2022",
    location: "Coastal Kenya",
    duration: "8 months",
    buildingType: "Coastal-style bungalow",
    size: "2,100 sq ft",
    client: "Private family",
    cover: project3,
    gallery: [
      { src: project3, caption: "Veranda and entry" },
      { src: project1, caption: "Hardwood joinery detail" },
    ],
    summary: "Coastal-style holiday bungalow with deep verandas and hand-finished hardwood joinery throughout.",
    brief:
      "The client wanted a low-maintenance holiday home tuned for the coastal climate — generous shading, cross-ventilation, and finishes that age gracefully in salt air.",
    scope: [
      "Raised plinth foundation for ventilation and termite protection",
      "Block walling with lime-rich render finish",
      "Deep timber-framed veranda with stone paving",
      "Hardwood doors, windows and built-in furniture",
      "Pitched tile roof with generous overhangs",
    ],
    challenges: [
      {
        title: "Salt-air durability",
        body: "Hardware specifications were upgraded to marine-grade across hinges, locks and external fixings to avoid early corrosion.",
      },
    ],
    outcomes: [
      "Hand-finished hardwood joinery delivered on schedule",
      "Client used the home in the first holiday season after handover",
    ],
    stats: [
      { label: "Programme", value: "8 months" },
      { label: "Floor area", value: "2,100 sq ft" },
      { label: "Bedrooms", value: "3" },
    ],
  },
  {
    id: "6",
    slug: "office-refurbishment",
    title: "Office Refurbishment",
    category: "Commercial",
    year: "2024",
    location: "Meru",
    duration: "10 weeks",
    buildingType: "Two-floor office refurbishment",
    size: "4,200 sq ft",
    client: "Professional services firm",
    cover: project2,
    gallery: [
      { src: project2, caption: "Refurbished open-plan floor" },
      { src: project3, caption: "Meeting room joinery" },
    ],
    summary: "Two-floor office refurbishment delivered without business downtime — staff relocated floor-by-floor as works progressed.",
    brief:
      "The client could not vacate. Our remit was a phased refurbishment that kept one floor fully operational at all times while the other was under works.",
    scope: [
      "Phased strip-out and rebuild, one floor at a time",
      "New partitioned offices and meeting rooms",
      "Acoustic ceiling system with integrated lighting",
      "Carpet tiles, painted walls, joinery to brand standard",
      "Power, data and HVAC adjustments to new layout",
    ],
    challenges: [
      {
        title: "Live-work site management",
        body: "Noise, dust and movement controls were planned per phase. Heavy works were scheduled outside core hours; daily site walks were carried out with the client lead.",
      },
    ],
    outcomes: [
      "Zero business downtime across 10 weeks of works",
      "Client retained all client-facing meeting capacity throughout",
    ],
    stats: [
      { label: "Programme", value: "10 weeks" },
      { label: "Floor area", value: "4,200 sq ft" },
      { label: "Phases", value: "2" },
    ],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
