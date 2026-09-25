import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import {
  seedBlogPosts,
  blogFromDb,
  formatBlogDate,
  renderBlogBody,
  type BlogPost,
} from "@/lib/blogs";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => {
    const seed = seedBlogPosts.find((p) => p.slug === params.slug);
    return {
      meta: [
        { title: `${seed?.title ?? "Article"} · Jmax Builders Blog` },
        {
          name: "description",
          content: seed?.excerpt ?? "Construction insights from Jmax Builders.",
        },
      ],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const [post, setPost] = useState<BlogPost | null>(
    () => seedBlogPosts.find((p) => p.slug === slug) ?? null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, body, cover_url, category, author, published_at, is_published")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (cancelled) return;
      if (data) setPost(blogFromDb(data));
      else if (!seedBlogPosts.some((p) => p.slug === slug)) setPost(null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!loading && !post) {
    throw notFound();
  }

  if (!post) {
    return (
      <Layout>
        <div className="container-page py-20 text-center text-sm text-muted-foreground">Loading article…</div>
      </Layout>
    );
  }

  const blocks = renderBlogBody(post.body);

  return (
    <Layout>
      <article>
        <section className="border-b border-border bg-secondary/40">
          <div className="container-page py-10 md:py-14">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-normal uppercase tracking-wider text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All blogs
            </Link>
            <p className="mt-6 text-xs font-normal uppercase tracking-[0.2em] text-primary">{post.category}</p>
            <h1 className="mt-3 max-w-3xl font-sans text-3xl font-bold tracking-tight md:text-4xl text-balance">
              {post.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base font-normal text-muted-foreground md:text-lg">{post.excerpt}</p>
            <p className="mt-4 text-sm font-normal text-muted-foreground">
              {post.author} · <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
            </p>
          </div>
        </section>

        {post.coverUrl && post.coverUrl !== "/placeholder.svg" && (
          <div className="container-page pt-8">
            <div className="overflow-hidden rounded-2xl border border-border bg-muted">
              <img src={post.coverUrl} alt="" className="aspect-[21/9] w-full object-cover" />
            </div>
          </div>
        )}

        <section className="container-page py-10 md:py-14">
          <div className="prose-blog mx-auto max-w-2xl space-y-5">
            {blocks.map((b, i) =>
              b.type === "h2" ? (
                <h2 key={i} className="pt-4 font-sans text-lg font-bold tracking-tight text-foreground md:text-xl">
                  {b.text}
                </h2>
              ) : b.type === "h1" ? (
                <h2 key={i} className="pt-4 font-sans text-xl font-bold tracking-tight text-foreground md:text-2xl">
                  {b.text}
                </h2>
              ) : b.type === "img" ? (
                <figure key={i} className="my-2 overflow-hidden rounded-xl border border-border bg-muted">
                  <img src={b.src} alt={b.alt || ""} className="w-full object-cover" loading="lazy" />
                  {b.alt ? (
                    <figcaption className="border-t border-border px-4 py-2.5 text-sm font-normal text-muted-foreground">
                      {b.alt}
                    </figcaption>
                  ) : null}
                </figure>
              ) : (
                <p key={i} className="font-sans text-sm font-normal leading-[1.75] text-foreground/85 md:text-base md:leading-[1.75]">
                  {b.text}
                </p>
              ),
            )}
          </div>

          <div className="mx-auto mt-12 max-w-2xl border-t border-border pt-8">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-normal text-primary-foreground hover:opacity-90"
            >
              Discuss your project with us
            </Link>
          </div>
        </section>
      </article>
    </Layout>
  );
}
