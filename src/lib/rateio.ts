// Helpers para rateio de despesas entre centros de custo / farmácias.
import type { RateioItem } from "@/data/financeiroMock";

export type ModoRateio = "igual" | "manual_pct" | "manual_valor" | "proporcional_entregas";

export function dividirIgual(total: number, ccIds: { centroCustoId: string; farmaciaId?: string }[]): RateioItem[] {
  const n = ccIds.length;
  if (!n) return [];
  const pct = +(100 / n).toFixed(2);
  const valor = +(total / n).toFixed(2);
  const itens = ccIds.map((c) => ({ centroCustoId: c.centroCustoId, farmaciaId: c.farmaciaId, percentual: pct, valor }));
  // Ajusta o último item para fechar centavo
  const somaV = +itens.reduce((s, i) => s + i.valor, 0).toFixed(2);
  const somaP = +itens.reduce((s, i) => s + i.percentual, 0).toFixed(2);
  itens[n - 1].valor = +(itens[n - 1].valor + (total - somaV)).toFixed(2);
  itens[n - 1].percentual = +(itens[n - 1].percentual + (100 - somaP)).toFixed(2);
  return itens;
}

export function dividirProporcionalEntregas(
  total: number,
  vinculos: { centroCustoId: string; farmaciaId?: string; qtdEntregas: number }[],
): RateioItem[] {
  const somaQtd = vinculos.reduce((s, v) => s + v.qtdEntregas, 0);
  if (!somaQtd) return dividirIgual(total, vinculos);
  const itens: RateioItem[] = vinculos.map((v) => {
    const pct = +((v.qtdEntregas / somaQtd) * 100).toFixed(2);
    const valor = +((v.qtdEntregas / somaQtd) * total).toFixed(2);
    return { centroCustoId: v.centroCustoId, farmaciaId: v.farmaciaId, percentual: pct, valor };
  });
  const somaV = +itens.reduce((s, i) => s + i.valor, 0).toFixed(2);
  const somaP = +itens.reduce((s, i) => s + i.percentual, 0).toFixed(2);
  const last = itens[itens.length - 1];
  last.valor = +(last.valor + (total - somaV)).toFixed(2);
  last.percentual = +(last.percentual + (100 - somaP)).toFixed(2);
  return itens;
}

export function validarRateio(itens: RateioItem[], total: number): { ok: boolean; erro?: string } {
  if (!itens.length) return { ok: false, erro: "Adicione ao menos um item." };
  const sp = +itens.reduce((s, i) => s + i.percentual, 0).toFixed(2);
  const sv = +itens.reduce((s, i) => s + i.valor, 0).toFixed(2);
  if (Math.abs(sp - 100) > 0.05) return { ok: false, erro: `Soma de %% = ${sp.toFixed(2)} (esperado 100)` };
  if (Math.abs(sv - total) > 0.05) return { ok: false, erro: `Soma R$ = ${sv.toFixed(2)} (esperado ${total.toFixed(2)})` };
  return { ok: true };
}

export function recalcularDePercentual(itens: RateioItem[], total: number): RateioItem[] {
  return itens.map((i) => ({ ...i, valor: +((i.percentual / 100) * total).toFixed(2) }));
}
export function recalcularDeValor(itens: RateioItem[], total: number): RateioItem[] {
  if (!total) return itens.map((i) => ({ ...i, percentual: 0 }));
  return itens.map((i) => ({ ...i, percentual: +((i.valor / total) * 100).toFixed(2) }));
}
