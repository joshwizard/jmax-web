type CompressOptions = {
  /** Longest edge in pixels after resizing. */
  maxDimension?: number;
  /** Encoder quality between 0 and 1. */
  quality?: number;
};

const SKIP_BELOW_BYTES = 300 * 1024;

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Resize and re-encode an image in the browser before upload.
 * Returns the original file when it is already small, not a raster image,
 * or when the browser cannot decode it (e.g. HEIC on Chrome).
 */
export async function compressImage(file: File, options: CompressOptions = {}): Promise<File> {
  const { maxDimension = 2000, quality = 0.82 } = options;
  if (typeof window === "undefined" || typeof document === "undefined") return file;
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return file;
  if (file.size <= SKIP_BELOW_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    // JPEG has no alpha channel, so transparent areas would otherwise turn black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    let blob = await canvasToBlob(canvas, "image/webp", quality);
    let ext = "webp";
    // Older Safari silently falls back to PNG when WebP encoding is unsupported.
    if (!blob || blob.type !== "image/webp") {
      blob = await canvasToBlob(canvas, "image/jpeg", quality);
      ext = "jpg";
    }
    if (!blob || blob.size >= file.size) return file;

    const base = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${base}.${ext}`, { type: blob.type, lastModified: Date.now() });
  } catch {
    return file;
  }
}

/** Run async work over items with at most `limit` tasks in flight, preserving input order. */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index], index);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
