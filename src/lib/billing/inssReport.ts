import type { Acerto, Entregador } from "@/data/financeiroMock";

export interface InssLine { entregadorId: string; nome: string; cpf?: string; valorFaturadoNoMes: number }

export function gerarInssContabilidade(
  acertos: Acerto[], entregadores: Entregador[], competenciaYYYYMM: string,
): InssLine[] {
  const inMes = (s: string) => s.startsWith(competenciaYYYYMM);
  const acertosMes = acertos.filter((a) => inMes(a.cicloInicio) || inMes(a.cicloFim));
  const porEnt = new Map<string, number>();
  acertosMes.forEach((a) =>
    a.linhas.forEach((l) => {
      const cur = porEnt.get(l.entregadorId) ?? 0;
      // INSS é sobre remuneração bruta da Coop (não desconta do entregador)
      porEnt.set(l.entregadorId, +(cur + l.baseRepasse + l.diarias + l.adicionais).toFixed(2));
    }));
  const out: InssLine[] = [];
  porEnt.forEach((v, id) => {
    if (v <= 0) return;
    const ent = entregadores.find((e) => e.id === id);
    if (!ent) return;
    out.push({ entregadorId: id, nome: ent.nome, cpf: ent.cpf, valorFaturadoNoMes: v });
  });
  return out.sort((a, b) => a.nome.localeCompare(b.nome));
}

export function csvInss(lines: InssLine[]): string {
  const head = ["nome", "cpf", "valor_faturado_mes"].join(",");
  return [head, ...lines.map((l) => [l.nome, l.cpf ?? "", l.valorFaturadoNoMes.toFixed(2)].join(","))].join("\n");
}
