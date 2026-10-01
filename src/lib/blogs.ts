import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverUrl: string;
  category: string;
  author: string;
  publishedAt: string;
  isPublished: boolean;
};

/** Example construction blogs — used until (and alongside) admin-published posts. */
export const seedBlogPosts: BlogPost[] = [
  {
    id: "seed-1",
    slug: "how-to-read-a-boq-before-you-tender",
    title: "How to read a BOQ before you tender",
    excerpt:
      "A Bill of Quantities is only useful if you know what to check. Here is a builder’s walkthrough of the sections that matter most on Kenyan residential jobs.",
    category: "Estimating",
    author: "Jmax Builders",
    publishedAt: "2026-08-12T08:00:00.000Z",
    isPublished: true,
    coverUrl: project1,
    body: `A good BOQ is a map of the build — not a wishlist. Before you float it to contractors, walk these checks.

## Start with the preliminaries
Preliminaries cover site establishment, insurance, temporary works and mobilisation. If this section is thin, every tenderer will invent their own allowance — and your “lowest” quote will not be comparable.

## Match quantities to drawings
Pick three high-cost items (foundations, walling, roofing). Reconcile the measured quantities against the latest architectural and structural drawings. Mismatches here are the usual source of mid-contract claims.

## Read the exclusions aloud
Exclusions are where budgets blow up. Confirm whether VAT, external works, septic, power connection and kitchen joinery are in or out. Write the answer into the tender invitation so every bidder prices the same scope.

## Ask for a rate build-up on key trades
For concrete, reinforcement and roof covering, ask tenderers to show how they arrived at the rate. You will quickly see who is guessing and who has current supplier quotes.

## Close with a site visit
Invite shortlisted contractors to walk the plot together. Note ground conditions, access for trucks, and neighbouring boundary constraints. Capture those notes as an addendum before award.

Done consistently, this discipline keeps tender sums honest and protects both client and builder when work starts on site.`,
  },
  {
    id: "seed-2",
    slug: "foundation-choices-for-sloped-nairobi-plots",
    title: "Foundation choices for sloped Nairobi plots",
    excerpt:
      "Many Nairobi plots fall more than a metre across the site. Here is how we choose between strip, stepped, and raft foundations without burning the budget.",
    category: "Siteworks",
    author: "Jmax Builders",
    publishedAt: "2026-07-28T08:00:00.000Z",
    isPublished: true,
    coverUrl: project2,
    body: `A gentle slope looks harmless until excavation begins. On many Nairobi and satellite-town plots, the fall across a 50×100 is enough to change the whole substructure strategy.

## Measure the fall first
Before sketching footings, survey levels at the four corners and along the building footprint. A fall under 600 mm can often be absorbed with a conventional strip foundation and modest fill. Beyond that, stepped foundations usually win.

## When stepped strips make sense
Stepped strip foundations follow the natural ground in risers. They cut fill volumes and keep retaining walls modest. Detail the steps carefully so reinforcement continues through the change of level.

## When a raft is worth it
On soft or variable soils — or where the house footprint is compact — a raft can reduce differential settlement risk. It costs more up front, but it can remove expensive ground improvement and endless trench excavation.

## Budget the retaining works early
Clients often price the house and forget boundary retaining. If your neighbour is lower than your finished ground floor, design and cost that wall in the first estimate. Surprises here are expensive mid-programme.

## Coordinate with drainage
Every slope wants to move water. Set out falls for surface drains and soakaways before pouring. Redirecting water after the slab is cast is far harder than getting it right in the foundation package.

Get the substructure right and the rest of the build stays calmer — fewer claims, cleaner finishes, and a house that sits naturally on its plot.`,
  },
  {
    id: "seed-3",
    slug: "what-to-expect-in-a-9-month-residential-build",
    title: "What to expect in a 9-month residential build",
    excerpt:
      "From groundbreaking to keys: a realistic month-by-month outline for a typical maisonette or bungalow programme in Kenya.",
    category: "Project delivery",
    author: "Jmax Builders",
    publishedAt: "2026-06-18T08:00:00.000Z",
    isPublished: true,
    coverUrl: project3,
    body: `Clients often ask: “How long will it really take?” For a well-scoped residential maisonette with clear drawings and steady cashflow, nine months is a realistic working programme — not a marketing promise.

## Months 1–2: Substructure
Site clearance, setting out, excavation, foundations and ground-floor slab. Rain and soil surprises belong here, so build float into this phase.

## Months 3–5: Superstructure
Walling, columns, beams, first-floor slab and staircase. This is when the house becomes visible. Keep reinforcement inspections and concrete cube tests on schedule.

## Months 6–7: Roof and first fix
Roof structure and covering, followed by electrical and plumbing first fix. Order long-lead joinery and windows early so finishing is not blocked later.

## Months 8–9: Finishes and handover
Plaster, tiling, painting, fittings, external works and snagging. Weekly progress photos and a clear snag list make handover calmer for everyone.

## What usually delays the programme
Late design changes, unpaid interim certificates, and materials ordered “when we get there.” Protect the programme with a frozen scope, a payment calendar, and early procurement of critical items.

A predictable build is less about rushing and more about sequencing. Agree the programme, publish it, and manage every change as a dated decision — not a hallway conversation.`,
  },
];

export function blogFromDb(row: {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  cover_url: string | null;
  category: string;
  author: string;
  published_at: string | null;
  is_published: boolean;
}): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || "",
    body: row.body || "",
    coverUrl: row.cover_url || "/placeholder.svg",
    category: row.category || "Construction",
    author: row.author || "Jmax Builders",
    publishedAt: row.published_at || row.id,
    isPublished: row.is_published,
  };
}

export function formatBlogDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" });
}

/** Inline markdown: **bold**, *italic*, [links](url). */
export type InlineNode =
  | string
  | { type: "strong"; children: InlineNode[] }
  | { type: "em"; children: InlineNode[] }
  | { type: "link"; href: string; children: InlineNode[] };

type TextBlockType = "h1" | "h2" | "h3" | "p";
type ListBlockType = "ul" | "ol";

/** Small markdown renderer for blog bodies (headings, paragraphs, lists, rules, images). */
export type BlogBlock =
  | { [K in TextBlockType]: { type: K; content: InlineNode[] } }[TextBlockType]
  | { [K in ListBlockType]: { type: K; items: InlineNode[][] } }[ListBlockType]
  | { type: "hr" }
  | { type: "img"; src: string; alt: string };

const IMAGE_RE = /^!\[([^\]]*)\]\(([^)\s]+)\)(?:\s*"([^"]*)")?\s*$/;
const HEADING_RE = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const RULE_RE = /^(?:-{3,}|\*{3,}|_{3,})$/;
const BULLET_RE = /^[-*+•]\s+(.*)$/;
const NUMBERED_RE = /^\d+[.)]\s+(.*)$/;

const INLINE_RE =
  /\*\*(.+?)\*\*|__(.+?)__|\*(?!\s)(.+?)(?<!\s)\*|(?<![A-Za-z0-9])_(?!\s)(.+?)(?<!\s)_(?![A-Za-z0-9])|\[([^\]]+)\]\(([^)\s]+)\)/g;

function safeHref(href: string) {
  return /^(https?:|mailto:|tel:|\/|#)/i.test(href) ? href : null;
}

export function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE_RE)) {
    const start = m.index ?? 0;
    if (start > last) nodes.push(text.slice(last, start));
    const [whole, b1, b2, i1, i2, linkText, href] = m;
    if (b1 || b2) nodes.push({ type: "strong", children: parseInline((b1 || b2)!) });
    else if (i1 || i2) nodes.push({ type: "em", children: parseInline((i1 || i2)!) });
    else if (linkText) {
      const safe = safeHref(href);
      nodes.push(safe ? { type: "link", href: safe, children: parseInline(linkText) } : whole);
    }
    last = start + whole.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function inlineToText(nodes: InlineNode[]): string {
  return nodes.map((n) => (typeof n === "string" ? n : inlineToText(n.children))).join("");
}

export function renderBlogBody(body: string, title?: string): BlogBlock[] {
  const result: BlogBlock[] = [];
  let para: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushPara = () => {
    if (para.length) result.push({ type: "p", content: parseInline(para.join(" ")) });
    para = [];
  };
  const flushList = () => {
    if (list) result.push({ type: list.type, items: list.items.map(parseInline) });
    list = null;
  };
  const flush = () => {
    flushPara();
    flushList();
  };

  for (const raw of body.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }

    const img = line.match(IMAGE_RE);
    if (img) {
      flush();
      result.push({ type: "img", alt: img[1].trim() || img[3]?.trim() || "", src: img[2].trim() });
      continue;
    }

    const heading = line.match(HEADING_RE);
    if (heading) {
      flush();
      const level = heading[1].length;
      const type = level === 1 ? "h1" : level === 2 ? "h2" : "h3";
      result.push({ type, content: parseInline(heading[2]) });
      continue;
    }

    if (RULE_RE.test(line)) {
      flush();
      result.push({ type: "hr" });
      continue;
    }

    const bullet = line.match(BULLET_RE);
    const numbered = bullet ? null : line.match(NUMBERED_RE);
    if (bullet || numbered) {
      flushPara();
      const type = bullet ? "ul" : "ol";
      if (!list || list.type !== type) {
        flushList();
        list = { type, items: [] };
      }
      list.items.push((bullet ?? numbered)![1]);
      continue;
    }

    if (list && /^\s{2,}/.test(raw)) {
      list.items[list.items.length - 1] += ` ${line}`;
      continue;
    }

    flushList();
    para.push(line);
  }
  flush();

  // A leading "# Title" repeats the page title shown above the article.
  const first = result[0];
  if (
    title &&
    first?.type === "h1" &&
    inlineToText(first.content).trim().toLowerCase() === title.trim().toLowerCase()
  ) {
    result.shift();
  }

  return result;
}
