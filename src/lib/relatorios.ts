import type { Ticket } from "@/data/relatoriosMock";

export type Kpis = {
  tickets: number;
  resolvidos: number;
  reabertos: number;
  msgEnv: number;
  msgRec: number;
  tmr: number;       // s
  tma: number;       // s
  tme: number;       // s
  slaPct: number;    // 0..100
  csat: number;      // 0..5
  fcrPct: number;    // 0..100
  reaberturaPct: number;
  transferenciaPct: number;
  ocupacaoPct: number;
};

export function aggregate(tickets: Ticket[]): Kpis {
  const n = tickets.length || 1;
  const resolvidos = tickets.filter(t => t.status === "resolvido").length;
  const reabertos = tickets.filter(t => t.reaberto).length;
  const csats = tickets.map(t => t.csat).filter((x): x is number => x != null);
  return {
    tickets: tickets.length,
    resolvidos,
    reabertos,
    msgEnv: tickets.reduce((s, t) => s + t.mensagensEnviadas, 0),
    msgRec: tickets.reduce((s, t) => s + t.mensagensRecebidas, 0),
    tmr: Math.round(tickets.reduce((s, t) => s + t.tmrSeg, 0) / n),
    tma: Math.round(tickets.reduce((s, t) => s + t.tmaSeg, 0) / n),
    tme: Math.round(tickets.reduce((s, t) => s + t.tmeSeg, 0) / n),
    slaPct: Math.round((tickets.filter(t => t.slaCumprido).length / n) * 100),
    csat: csats.length ? +(csats.reduce((s, x) => s + x, 0) / csats.length).toFixed(2) : 0,
    fcrPct: Math.round((tickets.filter(t => t.fcr).length / n) * 100),
    reaberturaPct: Math.round((reabertos / n) * 100),
    transferenciaPct: Math.round((tickets.filter(t => t.transferido).length / n) * 100),
    ocupacaoPct: Math.min(100, Math.round(40 + (tickets.length / Math.max(1, n)) * 40 + (n > 50 ? 20 : n / 5))),
  };
}

export function deltaPct(curr: number, prev: number): number {
  if (!prev) return curr ? 100 : 0;
  return +(((curr - prev) / prev) * 100).toFixed(1);
}

export function fmtSec(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m < 60) return r ? `${m}m ${r}s` : `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export function exportCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map(r => r.map(c => {
    const v = String(c ?? "");
    return /[",\n;]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  }).join(",")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

export type Metas = {
  tmr: number;        // <= s
  tma: number;        // <= s
  slaPct: number;     // >=
  csat: number;       // >=
  fcrPct: number;     // >=
  reaberturaPct: number; // <=
};

export const METAS_PADRAO: Metas = {
  tmr: 120, tma: 1200, slaPct: 95, csat: 4.5, fcrPct: 75, reaberturaPct: 10,
};

export type Sentido = "menor" | "maior";

export function statusMeta(valor: number, meta: number, sentido: Sentido): "ok" | "warn" | "bad" {
  if (sentido === "menor") {
    if (valor <= meta) return "ok";
    if (valor <= meta * 1.15) return "warn";
    return "bad";
  } else {
    if (valor >= meta) return "ok";
    if (valor >= meta * 0.9) return "warn";
    return "bad";
  }
}
