import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import { projects as seedProjects, type Project, type ProjectCategory } from "@/lib/projects";

type ProjectDbRow = Database["public"]["Tables"]["projects"]["Row"];

type UploadFn = (args: {
  data: {
    bucket: "product-covers" | "product-files";
    path: string;
    contentType: string;
    dataBase64: string;
  };
}) => Promise<unknown>;

/**
 * Built-in sample slugs the admin has imported or removed. Once listed here,
 * the sample never falls back onto the public site; the database row (if any) decides.
 */
export const PORTFOLIO_SETTINGS_PATH = "site/portfolio-settings.json";

export function parseHiddenSamples(raw: unknown): Set<string> {
  const list = (raw as { hiddenSamples?: unknown } | null)?.hiddenSamples;
  return new Set(Array.isArray(list) ? list.filter((s): s is string => typeof s === "string") : []);
}

export async function loadHiddenSamples(): Promise<Set<string>> {
  const base = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!base) return new Set();
  try {
    const url = `${base.replace(/\/$/, "")}/storage/v1/object/public/product-covers/${PORTFOLIO_SETTINGS_PATH}`;
    const res = await fetch(`${url}?t=${Date.now()}`);
    if (!res.ok) return new Set();
    return parseHiddenSamples(await res.json());
  } catch {
    return new Set();
  }
}

export async function saveHiddenSamples(uploadFn: UploadFn, slugs: Set<string>) {
  const body = JSON.stringify({ hiddenSamples: [...slugs].sort() });
  await uploadFn({
    data: {
      bucket: "product-covers",
      path: PORTFOLIO_SETTINGS_PATH,
      contentType: "application/json",
      dataBase64: btoa(body),
    },
  });
}

export const isSampleSlug = (slug: string) => seedProjects.some((p) => p.slug === slug);

const asArray = <T>(value: Json | null | undefined): T[] =>
  Array.isArray(value) ? (value as unknown as T[]) : [];

export function projectFromDb(row: ProjectDbRow): Project {
  const seed = seedProjects.find((p) => p.slug === row.slug);
  const gallery = asArray<string | { src: string; caption?: string }>(row.gallery).map((item) =>
    typeof item === "string"
      ? { src: item, caption: row.title }
      : { src: item.src, caption: item.caption ?? row.title },
  );
  const scope = asArray<string>(row.scope);
  const outcomes = asArray<string>(row.outcomes);
  const challenges = asArray<Project["challenges"][number]>(row.challenges);
  const stats = asArray<Project["stats"][number]>(row.stats);
  const cover = row.cover_url || seed?.cover || "/placeholder.svg";

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: (row.category as ProjectCategory) || seed?.category || "Residential",
    year: row.year || seed?.year || "",
    location: row.location || seed?.location || "",
    duration: row.duration || seed?.duration || "",
    buildingType: row.building_type || seed?.buildingType || "",
    size: row.size || seed?.size || "",
    client: row.client || seed?.client || "",
    cover,
    gallery: gallery.length ? gallery : seed?.gallery?.length ? seed.gallery : [{ src: cover, caption: row.title }],
    summary: row.summary || seed?.summary || "",
    brief: row.brief || seed?.brief || "",
    scope: scope.length ? scope : seed?.scope || [],
    challenges: challenges.length ? challenges : seed?.challenges || [],
    outcomes: outcomes.length ? outcomes : seed?.outcomes || [],
    stats: stats.length ? stats : seed?.stats || [],
    testimonial: (row.testimonial as Project["testimonial"] | null) || seed?.testimonial,
  };
}

/** Samples that should still appear publicly: not imported, not removed. */
export function visibleSamples(dbSlugs: Set<string>, hidden: Set<string>) {
  return seedProjects.filter((p) => !dbSlugs.has(p.slug) && !hidden.has(p.slug));
}

/** Everything the public portfolio shows: active DB projects first, then remaining samples. */
export async function loadPortfolio(): Promise<Project[]> {
  const [{ data }, hidden] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
    loadHiddenSamples(),
  ]);
  const dbProjects = (data || []).map(projectFromDb);
  const dbSlugs = new Set(dbProjects.map((p) => p.slug));
  return [...dbProjects, ...visibleSamples(dbSlugs, hidden)];
}
