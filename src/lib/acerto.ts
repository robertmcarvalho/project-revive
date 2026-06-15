// Cálculo puro do Acerto Semanal. Sem side-effects, testável.
import type { AcertoLinha, Entrega, RegraVinculo } from "@/data/financeiroMock";

export interface AjusteEntrada {
  entregadorId: string;
  farmaciaId: string;
  centroCustoId: string;
  diarias?: number;
  adicionais?: number;
  descontos?: number;
  adiantamentos?: number;
  ajustesRateio?: number;
  ajustesFaturar?: number;
  diasFaltaSemDiarista?: number; // descontos MG/6 por dia
}

const DIAS_SEMANA_OPERACIONAL = 6;

export function descontoFaltaSemDiarista(mg: number, dias: number): number {
  if (!mg || dias <= 0) return 0;
  return +((mg / DIAS_SEMANA_OPERACIONAL) * dias).toFixed(2);
}

export function calcularLinha(
  regra: RegraVinculo,
  entregasDoVinculo: Entrega[],
  ajuste: AjusteEntrada = { entregadorId: regra.entregadorId, farmaciaId: regra.farmaciaId, centroCustoId: regra.centroCustoId },
): AcertoLinha {
  const qtdEntregas = entregasDoVinculo.length;
  const somaPorTaxa = +(qtdEntregas * regra.taxaEntrega).toFixed(2);

  const aplicaMinimo = !!regra.minimoGarantidoSemanal && somaPorTaxa <= regra.minimoGarantidoSemanal;
  const baseBruta = aplicaMinimo ? regra.minimoGarantidoSemanal! : somaPorTaxa;
  const baseRepasse = +(baseBruta * (regra.pctRepasse / 100)).toFixed(2);

  const diarias = ajuste.diarias ?? 0;
  const adicionais = ajuste.adicionais ?? 0;
  const descontos = ajuste.descontos ?? 0;
  const adiantamentos = ajuste.adiantamentos ?? 0;
  const ajustesRateio = ajuste.ajustesRateio ?? 0;
  const ajustesFaturar = ajuste.ajustesFaturar ?? 0;
  const diasFalta = ajuste.diasFaltaSemDiarista ?? 0;
  const descFalta = descontoFaltaSemDiarista(regra.minimoGarantidoSemanal ?? 0, diasFalta);

  const valorEntregador = +(
    baseRepasse + diarias + adicionais - descontos - adiantamentos - ajustesRateio - descFalta
  ).toFixed(2);

  const valorFaturadoFarmacia = +(
    somaPorTaxa + diarias + adicionais + ajustesFaturar - descFalta
  ).toFixed(2);

  return {
    entregadorId: regra.entregadorId,
    qtdEntregas, somaPorTaxa, minimoAplicado: aplicaMinimo,
    baseRepasse, diarias, adicionais, descontos, adiantamentos,
    ajustesRateio,
    descontoFaltaSemDiarista: descFalta,
    diasFaltaSemDiarista: diasFalta,
    valorEntregador, valorFaturadoFarmacia,
  };
}

export function calcularAcerto(
  regrasFarmaciaCC: RegraVinculo[],
  entregas: Entrega[],
  ajustes: AjusteEntrada[] = [],
) {
  const linhas: AcertoLinha[] = regrasFarmaciaCC.map((r) => {
    const ents = entregas.filter(
      (e) => e.entregadorId === r.entregadorId && e.farmaciaId === r.farmaciaId && e.centroCustoId === r.centroCustoId,
    );
    const aj = ajustes.find(
      (a) => a.entregadorId === r.entregadorId && a.farmaciaId === r.farmaciaId && a.centroCustoId === r.centroCustoId,
    );
    return calcularLinha(r, ents, aj);
  });
  const totalRepasse = +linhas.reduce((s, l) => s + l.valorEntregador, 0).toFixed(2);
  const totalFaturado = +linhas.reduce((s, l) => s + l.valorFaturadoFarmacia, 0).toFixed(2);
  return { linhas, totalRepasse, totalFaturado };
}
