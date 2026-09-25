import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Plus, Image as ImageIcon, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { seedBlogPosts } from "@/lib/blogs";
import { fileToBase64, uploadAdminFile } from "@/lib/storage.functions";

type BlogRow = {
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
  sort_order: number;
};

export const Route = createFileRoute("/admin/blog")({
  component: BlogAdmin,
});

const empty: Partial<BlogRow> = {
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  category: "Construction",
  author: "Jmax Builders",
  is_published: true,
  published_at: new Date().toISOString(),
  sort_order: 0,
};

function BlogAdmin() {
  const [rows, setRows] = useState<BlogRow[] | null>(null);
  const [editing, setEditing] = useState<Partial<BlogRow> | null>(null);
  const [busy, setBusy] = useState(false);
  const [importingSlug, setImportingSlug] = useState<string | null>(null);
  const [dbReady, setDbReady] = useState(true);
  const uploadFileFn = useServerFn(uploadAdminFile);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const seedOnly = useMemo(() => {
    const dbSlugs = new Set((rows || []).map((r) => r.slug));
    return seedBlogPosts.filter((p) => !dbSlugs.has(p.slug));
  }, [rows]);

  const load = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("published_at", { ascending: false });
    if (error) {
      if (error.message.toLowerCase().includes("blog_posts") || error.code === "PGRST205") {
        setDbReady(false);
        setRows([]);
        return;
      }
      toast.error(error.message);
      setRows([]);
      return;
    }
    setDbReady(true);
    setRows((data as BlogRow[]) || []);
  };

  useEffect(() => {
    void load();
  }, []);

  const slugify = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);

  const importSeed = async (slug: string, openEditor: boolean) => {
    const seed = seedBlogPosts.find((p) => p.slug === slug);
    if (!seed) return;
    if (!dbReady) {
      toast.error("Run the blog_posts migration in Supabase first.");
      return;
    }
    setImportingSlug(slug);
    try {
      const payload = {
        slug: seed.slug,
        title: seed.title,
        excerpt: seed.excerpt,
        body: seed.body,
        cover_url: seed.coverUrl === "/placeholder.svg" ? null : seed.coverUrl,
        category: seed.category,
        author: seed.author,
        published_at: seed.publishedAt,
        is_published: true,
        sort_order: 0,
      };
      const { data, error } = await supabase.from("blog_posts").insert([payload]).select("*").single();
      if (error) throw error;
      toast.success(`Imported “${seed.title}”`);
      await load();
      if (openEditor && data) setEditing(data as BlogRow);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImportingSlug(null);
    }
  };

  const save = async () => {
    if (!editing) return;
    if (!dbReady) {
      toast.error("Run the blog_posts migration in Supabase first.");
      return;
    }
    setBusy(true);
    try {
      if (!editing.title?.trim()) throw new Error("Title required");
      const slug = (editing.slug || slugify(editing.title)).trim();
      if (!slug) throw new Error("Slug required");
      const payload = {
        slug,
        title: editing.title.trim(),
        excerpt: editing.excerpt || null,
        body: editing.body || "",
        cover_url: editing.cover_url || null,
        category: editing.category || "Construction",
        author: editing.author || "Jmax Builders",
        published_at: editing.published_at || new Date().toISOString(),
        is_published: editing.is_published ?? true,
        sort_order: editing.sort_order ?? 0,
      };
      const { error } = editing.id
        ? await supabase.from("blog_posts").update(payload).eq("id", editing.id)
        : await supabase.from("blog_posts").insert([payload]);
      if (error) throw error;
      toast.success("Saved");
      setEditing(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    await load();
  };

  const uploadCover = async (file: File) => {
    if (!editing) return;
    try {
      const path = `blog/${editing.slug || "tmp"}-${Date.now()}-${file.name}`;
      const res = await uploadFileFn({
        data: {
          bucket: "product-covers",
          path,
          contentType: file.type || "image/jpeg",
          dataBase64: await fileToBase64(file),
        },
      });
      if (!res.publicUrl) throw new Error("Upload succeeded without a public URL");
      setEditing({ ...editing, cover_url: res.publicUrl });
      toast.success("Cover uploaded — click Save to apply");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cover upload failed");
    }
  };

  const insertAtCursor = (snippet: string) => {
    if (!editing) return;
    const el = bodyRef.current;
    const body = editing.body || "";
    if (!el) {
      setEditing({ ...editing, body: `${body.trimEnd()}\n\n${snippet}\n\n` });
      return;
    }
    const start = el.selectionStart ?? body.length;
    const end = el.selectionEnd ?? body.length;
    const before = body.slice(0, start);
    const after = body.slice(end);
    const needsLead = before.length > 0 && !before.endsWith("\n\n");
    const needsTrail = after.length > 0 && !after.startsWith("\n\n");
    const block = `${needsLead ? "\n\n" : ""}${snippet}${needsTrail ? "\n\n" : ""}`;
    const next = `${before}${block}${after}`;
    setEditing({ ...editing, body: next });
    requestAnimationFrame(() => {
      const pos = before.length + block.length;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  };

  const uploadInlineImage = async (file: File) => {
    if (!editing) return;
    try {
      const path = `blog/inline/${editing.slug || "tmp"}-${Date.now()}-${file.name}`;
      const res = await uploadFileFn({
        data: {
          bucket: "product-covers",
          path,
          contentType: file.type || "image/jpeg",
          dataBase64: await fileToBase64(file),
        },
      });
      if (!res.publicUrl) throw new Error("Upload did not return a public URL");
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      insertAtCursor(`![${alt}](${res.publicUrl})`);
      toast.success("Image inserted into body — click Save to publish");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Blog posts</h2>
          <p className="text-sm text-muted-foreground">Write and publish construction articles for the public blog.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing({ ...empty })}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" /> New post
        </button>
      </div>

      {!dbReady && (
        <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          The <code className="font-mono text-xs">blog_posts</code> table is missing. Run the migration{" "}
          <code className="font-mono text-xs">20260926001000_blog_posts.sql</code> in the Supabase SQL editor, then refresh.
          Example articles still show on the public blog from seed content.
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">Status</th>
              <th className="p-3">Published</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows === null ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No posts in the database yet. Import an example or create one.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="p-3 font-medium">{r.title}</td>
                  <td className="p-3 text-muted-foreground">{r.category}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        r.is_published ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {r.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {r.published_at ? new Date(r.published_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => setEditing(r)}
                      className="mr-2 text-xs font-semibold text-primary hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(r.id)}
                      className="text-xs font-semibold text-destructive hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {seedOnly.length > 0 && (
        <div className="mt-8">
          <h3 className="font-display text-lg font-bold">Example posts</h3>
          <p className="text-sm text-muted-foreground">Import seed articles into the database so you can edit them.</p>
          <div className="mt-3 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[520px] text-left text-sm">
              <tbody>
                {seedOnly.map((p) => (
                  <tr key={p.slug} className="border-b border-border last:border-0">
                    <td className="p-3 font-medium">{p.title}</td>
                    <td className="p-3 text-muted-foreground">{p.category}</td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        disabled={importingSlug === p.slug || !dbReady}
                        onClick={() => importSeed(p.slug, true)}
                        className="inline-flex items-center gap-1 rounded-md bg-ink px-2.5 py-1.5 text-xs font-bold text-ink-foreground hover:opacity-90 disabled:opacity-50"
                      >
                        {importingSlug === p.slug ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Download className="h-3 w-3" />
                        )}
                        Import & edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setEditing(null)}>
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-background p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-bold">{editing.id ? "Edit" : "New"} blog post</h3>
            <div className="mt-4 grid gap-3">
              <Field
                label="Title"
                value={editing.title || ""}
                onChange={(v) =>
                  setEditing({
                    ...editing,
                    title: v,
                    slug: editing.id ? editing.slug : slugify(v),
                  })
                }
              />
              <Field label="Slug" value={editing.slug || ""} onChange={(v) => setEditing({ ...editing, slug: v })} />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Category"
                  value={editing.category || ""}
                  onChange={(v) => setEditing({ ...editing, category: v })}
                />
                <Field
                  label="Author"
                  value={editing.author || ""}
                  onChange={(v) => setEditing({ ...editing, author: v })}
                />
              </div>
              <label className="text-sm">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Excerpt
                </span>
                <textarea
                  value={editing.excerpt || ""}
                  onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Body
                </span>
                <p className="mb-2 text-xs text-muted-foreground">
                  Use <code className="font-mono">## Heading</code> for sections. Separate paragraphs with a blank line.
                  Insert mid-article images with the button below (or paste{" "}
                  <code className="font-mono">![caption](https://…)</code>).
                </p>
                <textarea
                  ref={bodyRef}
                  value={editing.body || ""}
                  onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                  rows={12}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 font-mono text-sm"
                />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-accent">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Insert image in body
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        if (f) void uploadInlineImage(f);
                      }}
                    />
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    Place the cursor where the image should appear, then upload.
                  </span>
                </div>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Published date
                  </span>
                  <input
                    type="date"
                    value={(editing.published_at || "").slice(0, 10)}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        published_at: e.target.value
                          ? new Date(`${e.target.value}T08:00:00.000Z`).toISOString()
                          : null,
                      })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                  />
                </label>
                <label className="flex items-end gap-2 pb-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editing.is_published ?? true}
                    onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })}
                  />
                  <span className="font-semibold">Published (visible on site)</span>
                </label>
              </div>

              <div className="rounded-md border border-border bg-card p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold">
                  <ImageIcon className="h-3.5 w-3.5" /> Cover image
                </p>
                {editing.cover_url && (
                  <img src={editing.cover_url} alt="" className="mt-2 h-32 w-full rounded object-cover" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])}
                  className="mt-2 text-xs"
                />
                {editing.cover_url && (
                  <button
                    type="button"
                    onClick={() => setEditing({ ...editing, cover_url: null })}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-destructive"
                  >
                    <Trash2 className="h-3 w-3" /> Remove cover
                  </button>
                )}
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-md border border-border px-4 py-2 text-xs font-semibold hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={save}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="text-sm">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
      />
    </label>
  );
}
