import type { Entregador, RegraVinculo, Farmacia } from "@/data/financeiroMock";

export interface SegLine {
  entregadorId: string; nome: string; cpf?: string; nascimento?: string; telefone?: string;
  vinculoDesde?: string; liderId?: string; farmacias: string[];
  inactiveAt?: string; terminationReason?: string;
}

function farmaciasDoEnt(entId: string, regras: RegraVinculo[], farmacias: Farmacia[]): string[] {
  const ids = Array.from(new Set(regras.filter((r) => r.entregadorId === entId).map((r) => r.farmaciaId)));
  return ids.map((id) => farmacias.find((f) => f.id === id)?.nome ?? id);
}

export function listarAtivos(dataCorteISO: string, ents: Entregador[], regras: RegraVinculo[], farmacias: Farmacia[]): SegLine[] {
  return ents
    .filter((e) => !e.inactiveAt || e.inactiveAt > dataCorteISO)
    .map((e) => ({
      entregadorId: e.id, nome: e.nome, cpf: e.cpf, nascimento: e.dataNascimento, telefone: e.telefone,
      vinculoDesde: e.vinculoDesde, liderId: e.liderId, farmacias: farmaciasDoEnt(e.id, regras, farmacias),
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome));
}

export function listarDesligadosNoMes(competenciaYYYYMM: string, ents: Entregador[], regras: RegraVinculo[], farmacias: Farmacia[]): SegLine[] {
  return ents
    .filter((e) => e.inactiveAt?.startsWith(competenciaYYYYMM))
    .map((e) => ({
      entregadorId: e.id, nome: e.nome, cpf: e.cpf, nascimento: e.dataNascimento, telefone: e.telefone,
      vinculoDesde: e.vinculoDesde, liderId: e.liderId, farmacias: farmaciasDoEnt(e.id, regras, farmacias),
      inactiveAt: e.inactiveAt, terminationReason: e.terminationReason,
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome));
}

export function csvSeguradora(lines: SegLine[], desligados = false): string {
  const headers = ["nome", "cpf", "nascimento", "telefone", "vinculo_desde", "farmacias"];
  if (desligados) headers.push("desligado_em", "motivo");
  const rows = lines.map((l) => {
    const base = [l.nome, l.cpf ?? "", l.nascimento ?? "", l.telefone ?? "", l.vinculoDesde ?? "", l.farmacias.join(" | ")];
    if (desligados) base.push(l.inactiveAt ?? "", l.terminationReason ?? "");
    return base.join(",");
  });
  return [headers.join(","), ...rows].join("\n");
}
