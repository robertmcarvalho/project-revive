import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Entidades from "./Entidades";
import TiposDespesa from "./TiposDespesa";
import { useEffect } from "react";
import { financeiroApi } from "@/lib/financeiroApi";
import type { CentroCusto, SplitFaturamento, RegraVinculo, Entregador, Farmacia } from "@/data/financeiroMock";
import { fmtBRL } from "@/lib/baixas";

const Configuracoes = () => (
  <Tabs defaultValue="entidades">
    <TabsList className="flex-wrap">
      <TabsTrigger value="entidades">Entidades</TabsTrigger>
      <TabsTrigger value="tipos">Tipos de despesa</TabsTrigger>
      <TabsTrigger value="split">Split Coop × Flux</TabsTrigger>
      <TabsTrigger value="regras">Regras de vínculo</TabsTrigger>
    </TabsList>
    <TabsContent value="entidades" className="mt-4"><Entidades /></TabsContent>
    <TabsContent value="tipos" className="mt-4"><TiposDespesa /></TabsContent>
    <TabsContent value="split" className="mt-4"><SplitAndRegras only="split" /></TabsContent>
    <TabsContent value="regras" className="mt-4"><SplitAndRegras only="regras" /></TabsContent>
  </Tabs>
);

const SplitAndRegras = ({ only }: { only: "split" | "regras" }) => {
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

  if (only === "split") return (
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
  );

  return (
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
  );
};

export default Configuracoes;
