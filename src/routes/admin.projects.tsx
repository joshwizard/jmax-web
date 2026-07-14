import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Upload, Image as ImageIcon, Download } from "lucide-react";
import { projects as seedProjects } from "@/lib/projects";
import { fileToBase64, uploadAdminFile } from "@/lib/storage.functions";

type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  year: string | null;
  location: string | null;
  duration: string | null;
  building_type: string | null;
  size: string | null;
  client: string | null;
  cover_url: string | null;
  summary: string | null;
  brief: string | null;
  scope: string[];
  outcomes: string[];
  gallery: string[];
  is_active: boolean;
  sort_order: number;
};

export const Route = createFileRoute("/admin/projects")({
  component: ProjectsAdmin,
});

const empty: Partial<ProjectRow> = {
  slug: "",
  title: "",
  category: "Residential",
  is_active: true,
  scope: [],
  outcomes: [],
  gallery: [],
  sort_order: 0,
};

function ProjectsAdmin() {
  const [rows, setRows] = useState<ProjectRow[] | null>(null);
  const [editing, setEditing] = useState<Partial<ProjectRow> | null>(null);
  const [busy, setBusy] = useState(false);
  const [importingSlug, setImportingSlug] = useState<string | null>(null);
  const uploadFileFn = useServerFn(uploadAdminFile);

  const seedOnly = useMemo(() => {
    const dbSlugs = new Set((rows || []).map((r) => r.slug));
    return seedProjects.filter((p) => !dbSlugs.has(p.slug));
  }, [rows]);

  const importSeed = async (slug: string, openEditor: boolean) => {
    const seed = seedProjects.find((p) => p.slug === slug);
    if (!seed) return;
    setImportingSlug(slug);
    try {
      const payload = {
        slug: seed.slug,
        title: seed.title,
        category: seed.category,
        year: seed.year,
        location: seed.location,
        duration: seed.duration,
        building_type: seed.buildingType,
        size: seed.size,
        client: seed.client,
        cover_url: seed.cover,
        summary: seed.summary,
        brief: seed.brief,
        scope: seed.scope,
        outcomes: seed.outcomes,
        gallery: seed.gallery.map((g) => g.src),
        is_active: true,
        sort_order: 0,
      };
      const { data, error } = await supabase.from("projects").insert([payload]).select("*").single();
      if (error) throw error;
      toast.success(`Imported "${seed.title}"`);
      await load();
      if (openEditor && data) setEditing(data as ProjectRow);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImportingSlug(null);
    }
  };

  const load = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows(((data as unknown) as ProjectRow[]) || []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    try {
      if (!editing.slug?.trim() || !editing.title?.trim()) throw new Error("Slug and title required");
      const payload = {
        slug: editing.slug.trim(),
        title: editing.title.trim(),
        category: editing.category || "Residential",
        year: editing.year || null,
        location: editing.location || null,
        duration: editing.duration || null,
        building_type: editing.building_type || null,
        size: editing.size || null,
        client: editing.client || null,
        cover_url: editing.cover_url || null,
        summary: editing.summary || null,
        brief: editing.brief || null,
        scope: editing.scope || [],
        outcomes: editing.outcomes || [],
        gallery: editing.gallery || [],
        is_active: editing.is_active ?? true,
        sort_order: editing.sort_order ?? 0,
      };
      const { error } = editing.id
        ? await supabase.from("projects").update(payload).eq("id", editing.id)
        : await supabase.from("projects").insert([payload]);
      if (error) throw error;
      toast.success("Saved");
      setEditing(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const uploadCover = async (file: File) => {
    if (!editing) return;
    try {
      const path = `projects/${editing.slug || "tmp"}-${Date.now()}-${file.name}`;
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

  const uploadGallery = async (files: FileList) => {
    if (!editing) return;
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const path = `projects/${editing.slug || "tmp"}-gallery-${Date.now()}-${file.name}`;
        const res = await uploadFileFn({
          data: {
            bucket: "product-covers",
            path,
            contentType: file.type || "image/jpeg",
            dataBase64: await fileToBase64(file),
          },
        });
        if (res.publicUrl) urls.push(res.publicUrl);
      } catch (err) {
        toast.error(`${file.name}: ${err instanceof Error ? err.message : "upload failed"}`);
      }
    }
    if (urls.length) {
      setEditing({ ...editing, gallery: [...((editing.gallery as string[]) || []), ...urls] });
      toast.success(`${urls.length} image(s) added to gallery — click Save to apply`);
    }
  };

  const removeGalleryImage = (url: string) => {
    if (!editing) return;
    setEditing({ ...editing, gallery: ((editing.gallery as string[]) || []).filter((u) => u !== url) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Portfolio projects</h2>
        <button
          onClick={() => setEditing({ ...empty })}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" /> New project
        </button>
      </div>

      {rows === null ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No projects yet. Click "New project" to add one — it will appear on the portfolio page.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Slug</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Year</th>
                <th className="p-3 text-left">Active</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3 font-medium">{r.title}</td>
                  <td className="p-3 font-mono text-xs">{r.slug}</td>
                  <td className="p-3">{r.category}</td>
                  <td className="p-3">{r.year || "—"}</td>
                  <td className="p-3 text-xs">{r.is_active ? "✓" : "—"}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => setEditing(r)} className="text-xs font-semibold text-primary hover:underline">Edit</button>
                    <button onClick={() => remove(r.id)} className="ml-3 text-xs font-semibold text-destructive hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {seedOnly.length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-4">
            <div>
              <h3 className="font-display text-base font-bold">Sample portfolio (not yet imported)</h3>
              <p className="text-xs text-muted-foreground">These ship with the site. Import a copy to the database to edit it.</p>
            </div>
            <span className="text-xs text-muted-foreground">{seedOnly.length} available</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Slug</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Year</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {seedOnly.map((p) => (
                <tr key={p.slug} className="border-t border-border">
                  <td className="p-3 font-medium">{p.title}</td>
                  <td className="p-3 font-mono text-xs">{p.slug}</td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3">{p.year}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => importSeed(p.slug, true)}
                      disabled={importingSlug === p.slug}
                      className="inline-flex items-center gap-1 rounded-md bg-ink px-2.5 py-1.5 text-xs font-bold text-ink-foreground hover:opacity-90 disabled:opacity-50"
                    >
                      {importingSlug === p.slug ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                      Import & edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setEditing(null)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-background p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold">{editing.id ? "Edit" : "New"} project</h3>
            <div className="mt-4 grid gap-3">
              <Field label="Title" value={editing.title || ""} onChange={(v) => setEditing({ ...editing, title: v })} />
              <Field label="Slug" value={editing.slug || ""} onChange={(v) => setEditing({ ...editing, slug: v })} />
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</span>
                  <select
                    value={editing.category || "Residential"}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                  >
                    <option>Residential</option>
                    <option>Commercial</option>
                  </select>
                </label>
                <Field label="Year" value={editing.year || ""} onChange={(v) => setEditing({ ...editing, year: v })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Location" value={editing.location || ""} onChange={(v) => setEditing({ ...editing, location: v })} />
                <Field label="Duration" value={editing.duration || ""} onChange={(v) => setEditing({ ...editing, duration: v })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Building type" value={editing.building_type || ""} onChange={(v) => setEditing({ ...editing, building_type: v })} />
                <Field label="Size" value={editing.size || ""} onChange={(v) => setEditing({ ...editing, size: v })} />
              </div>
              <Field label="Client" value={editing.client || ""} onChange={(v) => setEditing({ ...editing, client: v })} />

              <label className="text-sm">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Summary (1–2 sentences)</span>
                <textarea value={editing.summary || ""} onChange={(e) => setEditing({ ...editing, summary: e.target.value })} rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm" />
              </label>
              <label className="text-sm">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Brief</span>
                <textarea value={editing.brief || ""} onChange={(e) => setEditing({ ...editing, brief: e.target.value })} rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm" />
              </label>
              <ListField label="Scope (one per line)" value={editing.scope || []} onChange={(v) => setEditing({ ...editing, scope: v })} />
              <ListField label="Outcomes (one per line)" value={editing.outcomes || []} onChange={(v) => setEditing({ ...editing, outcomes: v })} />

              <div className="rounded-md border border-border bg-card p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold"><ImageIcon className="h-3.5 w-3.5" /> Cover image</p>
                {editing.cover_url && <img src={editing.cover_url} alt="" className="mt-2 h-32 w-full rounded object-cover" />}
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])} className="mt-2 text-xs" />
              </div>

              <div className="rounded-md border border-border bg-card p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold"><ImageIcon className="h-3.5 w-3.5" /> Gallery images ({(editing.gallery || []).length})</p>
                {(editing.gallery || []).length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {(editing.gallery || []).map((url) => (
                      <div key={url} className="group relative">
                        <img src={url} alt="" className="h-20 w-full rounded object-cover" />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(url)}
                          className="absolute right-1 top-1 rounded bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground opacity-0 transition group-hover:opacity-100"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files && uploadGallery(e.target.files)}
                  className="mt-2 text-xs"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">Select multiple files to upload at once.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Sort order" type="number" value={String(editing.sort_order ?? 0)} onChange={(v) => setEditing({ ...editing, sort_order: Number(v) || 0 })} />
                <label className="inline-flex items-end gap-2 text-sm">
                  <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                  Active (visible on portfolio)
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="rounded-md border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-accent">Cancel</button>
              <button onClick={save} disabled={busy} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50">
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="text-sm">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm" />
    </label>
  );
}

function ListField({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <label className="text-sm">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <textarea
        value={value.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
        rows={4}
        className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
      />
    </label>
  );
}
