import type { DeliveryRecord, DeliverySource } from "@/data/financeiroMock";

export const sourceLabel: Record<DeliverySource, string> = {
  flux_api: "Flux API", flux_db: "Flux DB", manual: "Manual", csv: "CSV", external_app: "App externo",
};

export const sourceTone: Record<DeliverySource, string> = {
  flux_api: "bg-success/15 text-success ring-success/20",
  flux_db: "bg-primary/15 text-primary ring-primary/20",
  manual: "bg-warning/15 text-warning ring-warning/20",
  csv: "bg-channel-instagram/15 text-channel-instagram ring-channel-instagram/20",
  external_app: "bg-muted text-muted-foreground ring-border",
};

export function contagemPorOrigem(rs: DeliveryRecord[]): Partial<Record<DeliverySource, number>> {
  const out: Partial<Record<DeliverySource, number>> = {};
  rs.forEach((r) => { if (!r.cancelled && r.verified) out[r.source] = (out[r.source] ?? 0) + 1; });
  return out;
}

export function dedupe(rs: DeliveryRecord[]): DeliveryRecord[] {
  const seen = new Set<string>();
  return rs.filter((r) => {
    const k = `${r.source}::${r.externalId}`;
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });
}

export function parseCsvDeliveries(text: string): Array<Pick<DeliveryRecord, "externalId" | "documentNumber" | "deliveredAt">> {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];
  const [header, ...rows] = lines;
  const cols = header.split(",").map((c) => c.trim().toLowerCase());
  const idxExt = cols.indexOf("external_id");
  const idxDoc = cols.indexOf("document_number");
  const idxDate = cols.indexOf("delivered_at");
  return rows.map((r) => {
    const parts = r.split(",");
    return {
      externalId: parts[idxExt]?.trim() ?? "",
      documentNumber: parts[idxDoc]?.trim(),
      deliveredAt: parts[idxDate]?.trim() ?? "",
    };
  });
}
