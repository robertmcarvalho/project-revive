import { useEffect, useState } from "react";
import { financeiroApi } from "@/lib/financeiroApi";
import type { CentroCusto, SplitFaturamento, RegraVinculo, Entregador, Farmacia } from "@/data/financeiroMock";
import { fmtBRL } from "@/lib/baixas";

const Configuracoes = () => {
  const [ccs, setCcs] = useState<CentroCusto[]>([]);
  const [split, setSplit] = useState<SplitFaturamento[]>([]);
  const [regras, setRegras] = useState<RegraVinculo[]>([]);
  const [ents, setEnts] = useState<Entregador[]>([]);
  const [farm, setFarm] = useState<Farmacia[]>([]);

  useEffect(() => {
    financeiroApi.catalogos().then((c) => {
      setCcs(c.centrosCusto); setSplit(c.splitFaturamento);
      setRegras(c.regrasVinculo); setEnts(c.entregadores); setFarm(c.farmacias);
    });
  }, []);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-4 py-3 text-sm font-semibold">Split de faturamento — Cooperativa × Flux Farma</div>
        <table className="w-full text-sm">
          <thead className="text-left text-[10px] uppercase text-subtle-foreground">
            <tr><th className="px-4 py-2">Centro de custo</th><th className="px-4 py-2 text-right">% Cooperativa</th><th className="px-4 py-2 text-right">% Flux Farma</th></tr>
          </thead>
          <tbody>
            {split.map((s) => {
              const cc = ccs.find((c) => c.id === s.centroCustoId);
              return (
                <tr key={s.centroCustoId} className="border-t border-border/40">
                  <td className="px-4 py-2">{cc?.nome ?? s.centroCustoId}</td>
                  <td className="px-4 py-2 text-right font-mono">{s.pctCooperativa}%</td>
                  <td className="px-4 py-2 text-right font-mono">{s.pctFlux}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-4 py-3 text-sm font-semibold">Regras de vínculo — entregadores × farmácias</div>
        <table className="w-full text-sm">
          <thead className="text-left text-[10px] uppercase text-subtle-foreground">
            <tr>
              <th className="px-4 py-2">Entregador</th><th className="px-4 py-2">Farmácia / CC</th>
              <th className="px-4 py-2 text-right">Taxa entrega</th><th className="px-4 py-2 text-right">Mínimo semanal</th>
              <th className="px-4 py-2 text-right">% Repasse</th>
            </tr>
          </thead>
          <tbody>
            {regras.map((r) => (
              <tr key={r.id} className="border-t border-border/40">
                <td className="px-4 py-2">{ents.find((e) => e.id === r.entregadorId)?.nome}</td>
                <td className="px-4 py-2 text-xs">
                  {farm.find((f) => f.id === r.farmaciaId)?.nome}
                  <span className="text-muted-foreground"> · {ccs.find((c) => c.id === r.centroCustoId)?.nome}</span>
                </td>
                <td className="px-4 py-2 text-right font-mono">{fmtBRL(r.taxaEntrega)}</td>
                <td className="px-4 py-2 text-right font-mono">{r.minimoGarantidoSemanal ? fmtBRL(r.minimoGarantidoSemanal) : "—"}</td>
                <td className="px-4 py-2 text-right font-mono">{r.pctRepasse}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="text-[11px] text-muted-foreground">
        Edição inline de regras e split entra na próxima etapa (UI já preparada; persistência aguarda backend).
      </p>
    </div>
  );
};

export default Configuracoes;
