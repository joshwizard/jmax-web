import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Upload, FileText, Image as ImageIcon, Download } from "lucide-react";
import {
  products as seedProducts,
  slugify,
  PRODUCT_GALLERY_MAX,
  PRODUCT_SHEETS_MAX,
  SHEET_LABEL_OPTIONS,
  type Deliverable,
} from "@/lib/products";
import { fileToBase64, uploadAdminFile } from "@/lib/storage.functions";
import {
  loadProductMedia,
  saveProductGalleryManifest,
  uploadProductGalleryImages,
  uploadProductSheets,
  type ProductSheet,
} from "@/lib/product-gallery";
import {
  parseDeliverableFiles,
  serializeDeliverableFiles,
  type DeliverableFiles,
} from "@/lib/product-files";

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  price_kes: number;
  architectural_price_kes: number | null;
  structural_price_kes: number | null;
  boq_price_kes: number | null;
  description: string | null;
  cover_url: string | null;
  file_path: string | null;
  is_active: boolean;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  gallery?: string[];
  sheets?: ProductSheet[];
  plot_size?: string | null;
  floors?: number | null;
  /** Local editing map — serialized into file_path on save. */
  deliverable_files?: DeliverableFiles;
};

const empty: Partial<ProductRow> = {
  slug: "",
  title: "",
  category: "Plans",
  price_kes: 0,
  description: "",
  is_active: true,
  gallery: [],
  sheets: [],
  plot_size: "",
  floors: null,
  deliverable_files: {},
};

export const Route = createFileRoute("/admin/products")({
  component: ProductsAdmin,
});

function ProductsAdmin() {
  const [rows, setRows] = useState<ProductRow[] | null>(null);
  const [editing, setEditing] = useState<Partial<ProductRow> | null>(null);
  const [busy, setBusy] = useState(false);
  const [importingSlug, setImportingSlug] = useState<string | null>(null);
  const [sheetLabel, setSheetLabel] = useState<string>(SHEET_LABEL_OPTIONS[0]);
  const uploadFileFn = useServerFn(uploadAdminFile);

  const load = async () => {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as ProductRow[]) || []);
  };

  useEffect(() => { load(); }, []);

  const seedOnly = useMemo(() => {
    const dbSlugs = new Set((rows || []).map((r) => r.slug));
    return seedProducts.filter((p) => !dbSlugs.has(p.slug));
  }, [rows]);

  const importSeed = async (slug: string, openEditor: boolean) => {
    const seed = seedProducts.find((p) => p.slug === slug);
    if (!seed) return;
    setImportingSlug(slug);
    try {
      const payload = {
        slug: seed.slug,
        title: seed.title,
        category: seed.type,
        price_kes: seed.price,
        description: seed.shortDescription,
        is_active: true,
      };
      const { data, error } = await supabase.from("products").insert([payload]).select("*").single();
      if (error) throw error;
      toast.success(`Imported "${seed.title}"`);
      await load();
      if (openEditor && data) {
        const row = data as ProductRow;
        const media = await loadProductMedia(row.slug, row.cover_url);
        setEditing({
          ...row,
          gallery: media.images,
          sheets: media.sheets,
          plot_size: media.plotSize,
          floors: media.floors,
          deliverable_files: parseDeliverableFiles(row.file_path),
        });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImportingSlug(null);
    }
  };

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    try {
      if (!editing.slug?.trim() || !editing.title?.trim()) throw new Error("Slug and title required");
      const toIntOrNull = (v: unknown) => {
        if (v === null || v === undefined || v === "") return null;
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
      };
      const cleanSlug = slugify(editing.slug);
      if (!cleanSlug) throw new Error("Slug must contain letters or numbers");
      const gallery = (editing.gallery || []).slice(0, PRODUCT_GALLERY_MAX);
      const sheets = (editing.sheets || []).slice(0, PRODUCT_SHEETS_MAX);
      const coverFromGallery = await saveProductGalleryManifest(uploadFileFn, cleanSlug, gallery, {
        sheets,
        plotSize: editing.plot_size || null,
        floors: editing.floors ?? null,
      });
      const payload = {
        slug: cleanSlug,
        title: editing.title.trim(),
        category: editing.category || "Plans",
        price_kes: Number(editing.price_kes) || 0,
        architectural_price_kes: toIntOrNull(editing.architectural_price_kes),
        structural_price_kes: toIntOrNull(editing.structural_price_kes),
        boq_price_kes: toIntOrNull(editing.boq_price_kes),
        description: editing.description || null,
        cover_url: coverFromGallery || editing.cover_url || null,
        file_path: serializeDeliverableFiles(editing.deliverable_files || {}) || null,
        is_active: editing.is_active ?? true,
        bedrooms: editing.bedrooms ?? null,
        bathrooms: editing.bathrooms ?? null,
        area_sqft: editing.area_sqft ?? null,
      };
      const { error } = editing.id
        ? await supabase.from("products").update(payload).eq("id", editing.id)
        : await supabase.from("products").insert([payload]);

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
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const startEditing = async (row: ProductRow) => {
    const media = await loadProductMedia(row.slug, row.cover_url);
    setEditing({
      ...row,
      gallery: media.images,
      sheets: media.sheets,
      plot_size: media.plotSize,
      floors: media.floors,
      deliverable_files: parseDeliverableFiles(row.file_path),
    });
  };

  const uploadGallery = async (files: FileList | null) => {
    if (!editing || !files?.length) return;
    if (!editing.slug?.trim()) {
      toast.error("Set a slug before uploading images");
      return;
    }
    try {
      const next = await uploadProductGalleryImages(
        uploadFileFn,
        editing.slug,
        Array.from(files),
        editing.gallery || [],
      );
      setEditing({
        ...editing,
        gallery: next,
        cover_url: next[0] || editing.cover_url || null,
      });
      toast.success("Images added — click Save to apply");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed");
    }
  };

  const removeGalleryImage = (url: string) => {
    if (!editing) return;
    const next = (editing.gallery || []).filter((u) => u !== url);
    setEditing({ ...editing, gallery: next, cover_url: next[0] || null });
  };

  const uploadSheets = async (files: FileList | null) => {
    if (!editing || !files?.length) return;
    if (!editing.slug?.trim()) {
      toast.error("Set a slug before uploading sheets");
      return;
    }
    try {
      const next = await uploadProductSheets(
        uploadFileFn,
        editing.slug,
        Array.from(files),
        editing.sheets || [],
        sheetLabel,
      );
      setEditing({ ...editing, sheets: next });
      toast.success("Drawing sheet(s) added — click Save to apply");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sheet upload failed");
    }
  };

  const removeSheet = (src: string) => {
    if (!editing) return;
    setEditing({ ...editing, sheets: (editing.sheets || []).filter((s) => s.src !== src) });
  };

  const uploadDeliverableFile = async (kind: Deliverable, file: File) => {
    if (!editing) return;
    if (!editing.slug?.trim()) {
      toast.error("Set a slug before uploading files");
      return;
    }
    try {
      const path = `files/${slugify(editing.slug) || "tmp"}/${kind.toLowerCase()}-${Date.now()}-${file.name}`;
      const res = await uploadFileFn({
        data: {
          bucket: "product-files",
          path,
          contentType: file.type || "application/octet-stream",
          dataBase64: await fileToBase64(file),
        },
      });
      setEditing({
        ...editing,
        deliverable_files: { ...(editing.deliverable_files || {}), [kind]: res.path },
      });
      toast.success(`${kind} file uploaded — click Save to apply`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "File upload failed");
    }
  };

  const clearDeliverableFile = (kind: Deliverable) => {
    if (!editing) return;
    const next = { ...(editing.deliverable_files || {}) };
    delete next[kind];
    setEditing({ ...editing, deliverable_files: next });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Products</h2>
        <button
          onClick={() => setEditing({ ...empty })}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" /> New product
        </button>
      </div>

      {rows === null ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No products yet. Click "New product" or seed the catalog from Overview.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Slug</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-right">Price</th>
                <th className="p-3 text-left">File</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3 font-medium">{r.title}</td>
                  <td className="p-3 font-mono text-xs">{r.slug}</td>
                  <td className="p-3">{r.category}</td>
                  <td className="p-3 text-right">KES {r.price_kes.toLocaleString()}</td>
                  <td className="p-3 text-xs">
                    {(() => {
                      const n = Object.keys(parseDeliverableFiles(r.file_path)).length;
                      return n ? `${n} file${n === 1 ? "" : "s"}` : "—";
                    })()}
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => startEditing(r)} className="text-xs font-semibold text-primary hover:underline">Edit</button>
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
              <h3 className="font-display text-base font-bold">Sample catalog (not yet imported)</h3>
              <p className="text-xs text-muted-foreground">These ship with the site. Import a copy to the database to edit it.</p>
            </div>
            <span className="text-xs text-muted-foreground">{seedOnly.length} available</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Slug</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-right">Price</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {seedOnly.map((p) => (
                <tr key={p.slug} className="border-t border-border">
                  <td className="p-3 font-medium">{p.title}</td>
                  <td className="p-3 font-mono text-xs">{p.slug}</td>
                  <td className="p-3">{p.type}</td>
                  <td className="p-3 text-right">KES {p.price.toLocaleString()}</td>
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
            <h3 className="font-display text-lg font-bold">{editing.id ? "Edit" : "New"} product</h3>
            <div className="mt-4 grid gap-3">
              <Field label="Title" value={editing.title || ""} onChange={(v) => setEditing({ ...editing, title: v })} />
              <Field label="Slug" value={editing.slug || ""} onChange={(v) => setEditing({ ...editing, slug: v })} />
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</span>
                  <select
                    value={editing.category || "Plans"}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                  >
                    <option>Plans</option>
                    <option>BOQ</option>
                  </select>
                </label>
                <Field label="Base price (KES)" type="number" value={String(editing.price_kes ?? "")} onChange={(v) => setEditing({ ...editing, price_kes: Number(v) })} />
              </div>

              <div className="rounded-md border border-border bg-card p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deliverable prices (KES)</p>
                <p className="mt-1 text-xs text-muted-foreground">Set a price for each document the client can buy. Leave blank to hide that option.</p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <Field
                    label="Architectural"
                    type="number"
                    value={editing.architectural_price_kes == null ? "" : String(editing.architectural_price_kes)}
                    onChange={(v) => setEditing({ ...editing, architectural_price_kes: v === "" ? null : Number(v) })}
                  />
                  <Field
                    label="Structural"
                    type="number"
                    value={editing.structural_price_kes == null ? "" : String(editing.structural_price_kes)}
                    onChange={(v) => setEditing({ ...editing, structural_price_kes: v === "" ? null : Number(v) })}
                  />
                  <Field
                    label="BOQ"
                    type="number"
                    value={editing.boq_price_kes == null ? "" : String(editing.boq_price_kes)}
                    onChange={(v) => setEditing({ ...editing, boq_price_kes: v === "" ? null : Number(v) })}
                  />
                </div>
              </div>



              <label className="text-sm">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</span>
                <textarea
                  value={editing.description || ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                />
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Field label="Bedrooms" type="number" value={String(editing.bedrooms ?? "")} onChange={(v) => setEditing({ ...editing, bedrooms: v ? Number(v) : null })} />
                <Field label="Bathrooms" type="number" value={String(editing.bathrooms ?? "")} onChange={(v) => setEditing({ ...editing, bathrooms: v ? Number(v) : null })} />
                <Field label="Area (sqft)" type="number" value={String(editing.area_sqft ?? "")} onChange={(v) => setEditing({ ...editing, area_sqft: v ? Number(v) : null })} />
                <Field label="Floors" type="number" value={String(editing.floors ?? "")} onChange={(v) => setEditing({ ...editing, floors: v ? Number(v) : null })} />
              </div>
              <Field
                label="Plot size"
                value={editing.plot_size || ""}
                onChange={(v) => setEditing({ ...editing, plot_size: v })}
              />
              <p className="-mt-2 text-xs text-muted-foreground">Example: 50×100 ft</p>

              <div className="rounded-md border border-border bg-card p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold">
                  <ImageIcon className="h-3.5 w-3.5" /> Product images ({(editing.gallery || []).length}/{PRODUCT_GALLERY_MAX})
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Up to {PRODUCT_GALLERY_MAX} photos. First image is the marketplace cover; buyers can scroll through the rest.</p>
                {(editing.gallery || []).length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {(editing.gallery || []).map((url, i) => (
                      <div key={url} className="relative aspect-[4/3] overflow-hidden rounded border border-border">
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        {i === 0 && (
                          <span className="absolute left-1 top-1 rounded bg-ink/80 px-1.5 py-0.5 text-[10px] font-semibold text-ink-foreground">Cover</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(url)}
                          className="absolute right-1 top-1 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-semibold text-destructive"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={(editing.gallery || []).length >= PRODUCT_GALLERY_MAX}
                  onChange={(e) => {
                    void uploadGallery(e.target.files);
                    e.target.value = "";
                  }}
                  className="mt-2 text-xs disabled:opacity-50"
                />
              </div>

              <div className="rounded-md border border-border bg-card p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold">
                  <FileText className="h-3.5 w-3.5" /> Drawing sheet previews ({(editing.sheets || []).length}/{PRODUCT_SHEETS_MAX})
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Floor plans, elevations, sections — shown watermarked on the product page.</p>
                {(editing.sheets || []).length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {(editing.sheets || []).map((sheet) => (
                      <div key={sheet.src} className="relative overflow-hidden rounded border border-border">
                        <img src={sheet.src} alt={sheet.label} className="aspect-[4/3] w-full object-cover" />
                        <p className="truncate bg-secondary px-2 py-1 text-[10px] font-semibold">{sheet.label}</p>
                        <button
                          type="button"
                          onClick={() => removeSheet(sheet.src)}
                          className="absolute right-1 top-1 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-semibold text-destructive"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <select
                    value={sheetLabel}
                    onChange={(e) => setSheetLabel(e.target.value)}
                    className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                  >
                    {SHEET_LABEL_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={(editing.sheets || []).length >= PRODUCT_SHEETS_MAX}
                    onChange={(e) => {
                      void uploadSheets(e.target.files);
                      e.target.value = "";
                    }}
                    className="text-xs disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="rounded-md border border-border bg-card p-3 space-y-3">
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold"><FileText className="h-3.5 w-3.5" /> Deliverable files (private)</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Upload a separate file for each option. Buyers only receive the file(s) they purchase. Set a price above for each kind you sell.
                  </p>
                </div>
                {(["Architectural", "Structural", "BOQ"] as Deliverable[]).map((kind) => {
                  const path = editing.deliverable_files?.[kind];
                  return (
                    <div key={kind} className="rounded-md border border-border bg-background p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold">{kind === "BOQ" ? "BOQ" : `${kind} drawings`}</p>
                        {path ? (
                          <button type="button" onClick={() => clearDeliverableFile(kind)} className="text-[10px] font-semibold text-destructive hover:underline">
                            Remove
                          </button>
                        ) : null}
                      </div>
                      {path ? (
                        <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground" title={path}>{path}</p>
                      ) : (
                        <p className="mt-1 text-[11px] text-muted-foreground">No file yet — this option stays hidden on the product page.</p>
                      )}
                      <input
                        type="file"
                        accept=".pdf,.zip,.dwg,.dxf,application/pdf,application/zip"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void uploadDeliverableFile(kind, f);
                          e.target.value = "";
                        }}
                        className="mt-2 text-xs"
                      />
                    </div>
                  );
                })}
              </div>

              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                Active (visible in marketplace)
              </label>
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
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
      />
    </label>
  );
}
