import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { SectionHeader } from "@/components/site/SectionHeader";
import { CTABanner } from "@/components/site/CTABanner";
import {
  seedBlogPosts,
  blogFromDb,
  formatBlogDate,
  type BlogPost,
} from "@/lib/blogs";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Construction insights · Jmax Builders" },
      {
        name: "description",
        content:
          "Practical construction blogs from Jmax Builders — BOQs, foundations, programmes and site tips for builds across Kenya.",
      },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const [dbPosts, setDbPosts] = useState<BlogPost[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, body, cover_url, category, author, published_at, is_published")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (cancelled || error || !data) return;
      setDbPosts(data.map(blogFromDb));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const all = useMemo(() => {
    const seen = new Set<string>();
    return [...dbPosts, ...seedBlogPosts].filter((p) =>
      seen.has(p.slug) ? false : (seen.add(p.slug), true),
    );
  }, [dbPosts]);

  const categories = useMemo(() => {
    const set = new Set(all.map((p) => p.category));
    return ["All", ...[...set].sort()];
  }, [all]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (!q) return true;
      return [p.title, p.excerpt, p.category, p.author].join(" ").toLowerCase().includes(q);
    });
  }, [all, category, query]);

  return (
    <Layout>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-page py-16">
          <SectionHeader
            eyebrow="Blog"
            title="Construction notes from the site"
            description="Practical articles on estimating, foundations, programmes and delivery — written for owners and builders across Kenya."
          />
        </div>
      </section>

      <section className="container-page py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search blogs…"
              className="w-full rounded-md border border-input bg-background py-2.5 pl-9 pr-3 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-md border px-3 py-2 text-base font-semibold transition ${
                  category === c
                    ? "border-ink bg-ink text-ink-foreground"
                    : "border-border bg-card hover:border-primary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {list.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-secondary/30 p-10 text-center text-base text-muted-foreground">
            No articles match that search.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.map((post) => (
              <Link
                key={post.slug}
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
              >
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={post.coverUrl}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                    <span className="font-mono uppercase tracking-wider text-primary">{post.category}</span>
                    <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
                  </div>
                  <h2 className="mt-2 font-display text-xl font-bold leading-snug md:text-2xl">{post.title}</h2>
                  <p className="mt-2 flex-1 text-base text-muted-foreground line-clamp-3">{post.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-base font-semibold text-primary">
                    Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <CTABanner
        eyebrow="Have a project?"
        title="Talk through your brief with the team."
        subtitle="Whether you are planning a home, church, or commercial shell, we can scope the next step."
        primary={{ label: "Request a consultation", to: "/contact" }}
        secondary={{ label: "View portfolio", to: "/portfolio" }}
      />
    </Layout>
  );
}
