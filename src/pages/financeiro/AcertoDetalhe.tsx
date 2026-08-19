import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, RotateCw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { financeiroApi } from "@/lib/financeiroApi";
import { fmtBRL, fmtDate } from "@/lib/baixas";
import type { Acerto, Entregador, Farmacia, CentroCusto } from "@/data/financeiroMock";
import { toast } from "@/hooks/use-toast";

const AcertoDetalhe = () => {
  const { id = "" } = useParams();
  const [a, setA] = useState<Acerto | null>(null);
  const [entregadores, setEntregadores] = useState<Entregador[]>([]);
  const [farmacias, setFarmacias] = useState<Farmacia[]>([]);
  const [ccs, setCcs] = useState<CentroCusto[]>([]);
  const [busy, setBusy] = useState(false);

  const load = () => financeiroApi.getAcerto(id).then(setA);
  useEffect(() => {
    load();
    financeiroApi.catalogos().then((c) => { setEntregadores(c.entregadores); setFarmacias(c.farmacias); setCcs(c.centrosCusto); });
  }, [id]);

  if (!a) return <div className="text-sm text-muted-foreground">Carregando…</div>;

  const nomeE = (id: string) => entregadores.find((e) => e.id === id)?.nome ?? id;
  const farm = farmacias.find((f) => f.id === a.farmaciaId)?.nome ?? a.farmaciaId;
  const cc = ccs.find((c) => c.id === a.centroCustoId)?.nome ?? a.centroCustoId;

  const recalc = async () => { setBusy(true); await financeiroApi.recalcularAcerto(id); await load(); setBusy(false); toast({ title: "Recalculado" }); };
  const enviar = async () => { setBusy(true); await financeiroApi.enviarParaRevisao(id); await load(); setBusy(false); toast({ title: "Enviado para revisão" }); };
  const aprovar = async () => {
    setBusy(true); await financeiroApi.aprovarAcerto(id); await load(); setBusy(false);
    toast({ title: "Acerto aprovado", description: "Faturas Coop/Flux e contas a pagar foram geradas." });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link to="/financeiro/acertos" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para acertos
        </Link>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={recalc} disabled={busy}><RotateCw className="h-3.5 w-3.5 mr-1" /> Recalcular</Button>
          {a.status === "aberto" && <Button size="sm" variant="outline" onClick={enviar} disabled={busy}><Send className="h-3.5 w-3.5 mr-1" /> Enviar revisão</Button>}
          {(a.status === "aberto" || a.status === "em_revisao") &&
            <Button size="sm" onClick={aprovar} disabled={busy}><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Aprovar acerto</Button>}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-4"><div className="text-xs text-muted-foreground">Farmácia</div><div className="font-medium">{farm}</div><div className="text-xs text-muted-foreground">{cc}</div></div>
        <div className="rounded-xl border border-border bg-surface p-4"><div className="text-xs text-muted-foreground">Ciclo</div><div className="font-mono text-sm">{fmtDate(a.cicloInicio)} → {fmtDate(a.cicloFim)}</div></div>
        <div className="rounded-xl border border-border bg-surface p-4"><div className="text-xs text-muted-foreground">Repasse aos entregadores</div><div className="font-mono text-lg font-semibold">{fmtBRL(a.totalRepasse)}</div></div>
        <div className="rounded-xl border border-border bg-surface p-4"><div className="text-xs text-muted-foreground">Faturado à farmácia</div><div className="font-mono text-lg font-semibold text-success">{fmtBRL(a.totalFaturado)}</div></div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-[10px] uppercase tracking-wider text-subtle-foreground">
            <tr>
              <th className="px-4 py-3">Entregador</th>
              <th className="px-4 py-3 text-center">Entregas</th>
              <th className="px-4 py-3 text-right">Base (qtd × taxa)</th>
              <th className="px-4 py-3 text-right">Diárias</th>
              <th className="px-4 py-3 text-right">Adic.</th>
              <th className="px-4 py-3 text-right">Desc.</th>
              <th className="px-4 py-3 text-right">Adiant.</th>
              <th className="px-4 py-3 text-right">Rateio</th>
              <th className="px-4 py-3 text-right">A pagar</th>
              <th className="px-4 py-3 text-right">A faturar</th>
              <th className="px-4 py-3 text-right">Demonstrativo</th>

            </tr>
          </thead>
          <tbody>
            {a.linhas.map((l) => (
              <tr key={l.entregadorId} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-3 font-medium">{nomeE(l.entregadorId)}</td>
                <td className="px-4 py-3 text-center font-mono">{l.qtdEntregas}</td>
                <td className="px-4 py-3 text-right font-mono">
                  {fmtBRL(l.baseRepasse)}
                  {l.minimoAplicado && <div className="text-[10px] text-warning">mínimo garantido</div>}
                </td>
                <td className="px-4 py-3 text-right font-mono">{fmtBRL(l.diarias)}</td>
                <td className="px-4 py-3 text-right font-mono">{fmtBRL(l.adicionais)}</td>
                <td className="px-4 py-3 text-right font-mono">{fmtBRL(l.descontos)}</td>
                <td className="px-4 py-3 text-right font-mono">{fmtBRL(l.adiantamentos)}</td>
                <td className="px-4 py-3 text-right font-mono">{fmtBRL(l.ajustesRateio)}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold">{fmtBRL(l.valorEntregador)}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-success">{fmtBRL(l.valorFaturadoFarmacia)}</td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={`/public/holerite/${holeriteToken(a.id, l.entregadorId)}`}
                    target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> ver
                  </a>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AcertoDetalhe;
