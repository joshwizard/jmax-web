import {
  PRODUCT_GALLERY_MAX,
  PRODUCT_SHEETS_MAX,
  normalizeProductImages,
  normalizeProductSheets,
  productGalleryManifestPath,
  slugify,
} from "@/lib/products";
import { fileToBase64, uploadAdminFile } from "@/lib/storage.functions";

type UploadFn = (args: {
  data: {
    bucket: "product-covers" | "product-files";
    path: string;
    contentType: string;
    dataBase64: string;
  };
}) => Promise<{ ok: true; path: string; publicUrl: string | null }>;

export type ProductSheet = { src: string; label: string };

export type ProductMediaManifest = {
  images: string[];
  sheets: ProductSheet[];
  plotSize?: string | null;
  floors?: number | null;
};

const emptyManifest = (coverUrl?: string | null): ProductMediaManifest => ({
  images: normalizeProductImages(coverUrl, []),
  sheets: [],
  plotSize: null,
  floors: null,
});

/** Load product media (photos + drawing sheets + plot/floors meta) from storage manifest. */
export async function loadProductMedia(
  slug: string,
  coverUrl?: string | null,
): Promise<ProductMediaManifest> {
  const clean = slugify(slug);
  if (!clean) return emptyManifest(coverUrl);
  const base = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!base) return emptyManifest(coverUrl);
  try {
    const url = `${base.replace(/\/$/, "")}/storage/v1/object/public/product-covers/${productGalleryManifestPath(clean)}`;
    const res = await fetch(`${url}?t=${Date.now()}`);
    if (res.ok) {
      const data = (await res.json()) as {
        images?: unknown;
        sheets?: unknown;
        plotSize?: unknown;
        floors?: unknown;
      };
      return {
        images: normalizeProductImages(coverUrl, data?.images),
        sheets: normalizeProductSheets(data?.sheets),
        plotSize: typeof data?.plotSize === "string" && data.plotSize.trim() ? data.plotSize.trim() : null,
        floors: typeof data?.floors === "number" && Number.isFinite(data.floors) ? data.floors : null,
      };
    }
  } catch {
    // fall through
  }
  return emptyManifest(coverUrl);
}

/** @deprecated Prefer loadProductMedia */
export async function loadProductGallery(slug: string, coverUrl?: string | null): Promise<string[]> {
  const media = await loadProductMedia(slug, coverUrl);
  return media.images;
}

/** Persist gallery + sheets + meta to a public manifest; returns cover (first image) URL. */
export async function saveProductGalleryManifest(
  uploadFn: UploadFn,
  slug: string,
  images: string[],
  extras?: {
    sheets?: ProductSheet[];
    plotSize?: string | null;
    floors?: number | null;
  },
): Promise<string | null> {
  const clean = slugify(slug);
  if (!clean) throw new Error("Slug required before saving images");
  const unique = normalizeProductImages(null, images);
  const sheets = normalizeProductSheets(extras?.sheets ?? []);
  const body = JSON.stringify({
    images: unique,
    sheets,
    plotSize: extras?.plotSize?.trim() || null,
    floors: extras?.floors ?? null,
  } satisfies ProductMediaManifest);
  const dataBase64 = btoa(body);
  await uploadFn({
    data: {
      bucket: "product-covers",
      path: productGalleryManifestPath(clean),
      contentType: "application/json",
      dataBase64,
    },
  });
  return unique[0] ?? null;
}

export async function uploadProductGalleryImages(
  uploadFn: UploadFn,
  slug: string,
  files: File[],
  current: string[],
): Promise<string[]> {
  const remaining = PRODUCT_GALLERY_MAX - current.length;
  if (remaining <= 0) throw new Error(`Maximum ${PRODUCT_GALLERY_MAX} images`);
  const toUpload = files.slice(0, remaining);
  const urls: string[] = [];
  const base = slugify(slug) || "tmp";
  for (const file of toUpload) {
    const path = `gallery/${base}/${Date.now()}-${file.name}`;
    const res = await uploadFn({
      data: {
        bucket: "product-covers",
        path,
        contentType: file.type || "image/jpeg",
        dataBase64: await fileToBase64(file),
      },
    });
    if (res.publicUrl) urls.push(res.publicUrl);
  }
  return normalizeProductImages(null, [...current, ...urls]);
}

export async function uploadProductSheets(
  uploadFn: UploadFn,
  slug: string,
  files: File[],
  current: ProductSheet[],
  label: string,
): Promise<ProductSheet[]> {
  const remaining = PRODUCT_SHEETS_MAX - current.length;
  if (remaining <= 0) throw new Error(`Maximum ${PRODUCT_SHEETS_MAX} drawing sheets`);
  const toUpload = files.slice(0, remaining);
  const next = [...current];
  const base = slugify(slug) || "tmp";
  for (const file of toUpload) {
    const path = `gallery/${base}/sheets/${Date.now()}-${file.name}`;
    const res = await uploadFn({
      data: {
        bucket: "product-covers",
        path,
        contentType: file.type || "image/jpeg",
        dataBase64: await fileToBase64(file),
      },
    });
    if (res.publicUrl) next.push({ src: res.publicUrl, label: label || "Drawing sheet" });
  }
  return normalizeProductSheets(next);
}

export { PRODUCT_GALLERY_MAX, PRODUCT_SHEETS_MAX };
