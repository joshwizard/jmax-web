import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const slugSchema = z.string().trim().min(1).max(160);
const visitorSchema = z.string().trim().min(8).max(64).regex(/^[A-Za-z0-9-]+$/);

async function countFor(slug: string) {
  const { count, error } = await supabaseAdmin
    .from("project_likes")
    .select("id", { count: "exact", head: true })
    .eq("project_slug", slug);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

/** Like counts for every project, plus the slugs this visitor has liked. */
export const getProjectLikes = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ visitorId: visitorSchema.optional() }).parse(d))
  .handler(async ({ data }) => {
    const [stats, mine] = await Promise.all([
      supabaseAdmin.from("project_like_stats").select("project_slug,likes"),
      data.visitorId
        ? supabaseAdmin.from("project_likes").select("project_slug").eq("visitor_id", data.visitorId)
        : Promise.resolve({ data: [] as { project_slug: string }[], error: null }),
    ]);
    // Table missing (migration not applied yet) or transient failure: show no counts.
    if (stats.error || mine.error) return { counts: {} as Record<string, number>, liked: [] as string[] };

    const counts: Record<string, number> = {};
    for (const row of stats.data || []) {
      if (row.project_slug) counts[row.project_slug] = row.likes ?? 0;
    }
    return { counts, liked: (mine.data || []).map((r) => r.project_slug) };
  });

export const setProjectLike = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ slug: slugSchema, visitorId: visitorSchema, liked: z.boolean() }).parse(d),
  )
  .handler(async ({ data }) => {
    if (data.liked) {
      const { error } = await supabaseAdmin
        .from("project_likes")
        .upsert(
          { project_slug: data.slug, visitor_id: data.visitorId },
          { onConflict: "project_slug,visitor_id", ignoreDuplicates: true },
        );
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("project_likes")
        .delete()
        .eq("project_slug", data.slug)
        .eq("visitor_id", data.visitorId);
      if (error) throw new Error(error.message);
    }
    return { liked: data.liked, likes: await countFor(data.slug) };
  });
