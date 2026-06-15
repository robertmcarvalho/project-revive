import type { ContaPagar, Entregador, PixKeyType } from "@/data/financeiroMock";

export interface PixBatchLine {
  entregadorId: string; nome: string; cpf?: string;
  pixKey?: string; pixKeyType?: PixKeyType;
  valorLiquido: number;
  contaPagarIds: string[];
  bloqueado: boolean; motivoBloqueio?: string;
}

export function gerarPrevia(
  contasPagar: ContaPagar[], entregadores: Entregador[],
): PixBatchLine[] {
  const porEnt = new Map<string, ContaPagar[]>();
  contasPagar
    .filter((c) => c.tipo === "entregador" && c.empresa === "coop" && c.status !== "paga" && !!c.entregadorId)
    .forEach((c) => {
      const k = c.entregadorId!;
      const arr = porEnt.get(k) ?? [];
      arr.push(c); porEnt.set(k, arr);
    });
  const lines: PixBatchLine[] = [];
  porEnt.forEach((arr, entId) => {
    const ent = entregadores.find((e) => e.id === entId);
    const total = +arr.reduce((s, c) => s + c.saldo, 0).toFixed(2);
    if (!ent) return;
    const sem = !ent.pixKey;
    lines.push({
      entregadorId: entId, nome: ent.nome, cpf: ent.cpf,
      pixKey: ent.pixKey, pixKeyType: ent.pixKeyType,
      valorLiquido: total, contaPagarIds: arr.map((c) => c.id),
      bloqueado: sem || total <= 0,
      motivoBloqueio: sem ? "Sem chave PIX cadastrada" : total <= 0 ? "Valor zerado" : undefined,
    });
  });
  return lines.sort((a, b) => a.nome.localeCompare(b.nome));
}

export function totaisPrevia(lines: PixBatchLine[]) {
  const validos = lines.filter((l) => !l.bloqueado);
  return {
    total: +validos.reduce((s, l) => s + l.valorLiquido, 0).toFixed(2),
    qtd: validos.length,
    bloqueados: lines.length - validos.length,
  };
}

export function csvPixGenerico(lines: PixBatchLine[]): string {
  const head = ["nome", "cpf", "tipo_chave_pix", "chave_pix", "valor_liquido", "identificador"].join(",");
  const rows = lines.filter((l) => !l.bloqueado).map((l) =>
    [l.nome, l.cpf ?? "", l.pixKeyType ?? "", l.pixKey ?? "", l.valorLiquido.toFixed(2), l.entregadorId].join(","));
  return [head, ...rows].join("\n");
}
