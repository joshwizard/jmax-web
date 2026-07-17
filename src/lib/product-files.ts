import type { Deliverable } from "@/lib/products";

export type DeliverableFiles = Partial<Record<Deliverable, string>>;

const KINDS: Deliverable[] = ["Architectural", "Structural", "BOQ"];

/** Parse products.file_path — JSON map or legacy single path. */
export function parseDeliverableFiles(filePath: string | null | undefined): DeliverableFiles {
  if (!filePath?.trim()) return {};
  const trimmed = filePath.trim();
  if (trimmed.startsWith("{")) {
    try {
      const obj = JSON.parse(trimmed) as Record<string, unknown>;
      const out: DeliverableFiles = {};
      for (const k of KINDS) {
        const v = obj[k];
        if (typeof v === "string" && v.trim()) out[k] = v.trim();
      }
      return out;
    } catch {
      // fall through to legacy
    }
  }
  // Legacy single file: treat as Architectural only so Structural/BOQ aren't falsely unlocked
  // once separate files exist. Until remapped, admins should re-upload per kind.
  return { Architectural: trimmed };
}

export function serializeDeliverableFiles(files: DeliverableFiles): string | null {
  const out: Record<string, string> = {};
  for (const k of KINDS) {
    const v = files[k]?.trim();
    if (v) out[k] = v;
  }
  if (Object.keys(out).length === 0) return null;
  return JSON.stringify(out);
}

export function filePathForLicense(
  filePath: string | null | undefined,
  license: string,
): string | null {
  const files = parseDeliverableFiles(filePath);
  const key = KINDS.find((k) => k === license);
  if (!key) return null;
  return files[key] ?? null;
}

export function deliverableLabel(kind: string): string {
  if (kind === "BOQ") return "Bill of Quantities (BOQ)";
  if (kind === "Architectural" || kind === "Structural") return `${kind} drawings`;
  return kind;
}
