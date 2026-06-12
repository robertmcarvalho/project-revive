import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { financeiroApi } from "@/lib/financeiroApi";
import { fmtBRL, fmtDate } from "@/lib/baixas";
import type { Acerto, Farmacia, CentroCusto } from "@/data/financeiroMock";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

const statusCls: Record<Acerto["status"], string> = {
  aberto: "bg-muted text-muted-foreground",
  em_revisao: "bg-warning/15 text-warning",
  aprovado: "bg-success/15 text-success",
  pago: "bg-primary/15 text-primary",
};
const statusLabel: Record<Acerto["status"], string> = {
  aberto: "Aberto", em_revisao: "Em revisão", aprovado: "Aprovado", pago: "Pago",
};

const Acertos = () => {
  const [acertos, setAcertos] = useState<Acerto[]>([]);
  const [farmacias, setFarmacias] = useState<Farmacia[]>([]);
  const [ccs, setCcs] = useState<CentroCusto[]>([]);

  useEffect(() => {
    financeiroApi.listAcertos().then(setAcertos);
    financeiroApi.catalogos().then((c) => { setFarmacias(c.farmacias); setCcs(c.centrosCusto); });
  }, []);

  const farma = (id: string) => farmacias.find((f) => f.id === id)?.nome ?? id;
  const cc = (id: string) => ccs.find((c) => c.id === id)?.nome ?? id;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-[10px] uppercase tracking-wider text-subtle-foreground">
          <tr>
            <th className="px-4 py-3">Ciclo</th>
            <th className="px-4 py-3">Farmácia / Centro de custo</th>
            <th className="px-4 py-3 text-center">Entregadores</th>
            <th className="px-4 py-3 text-right">Repasse total</th>
            <th className="px-4 py-3 text-right">A faturar</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {acertos.map((a) => (
            <tr key={a.id} className="border-b border-border/40 last:border-0 hover:bg-surface-hover transition-colors">
              <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{fmtDate(a.cicloInicio)} → {fmtDate(a.cicloFim)}</td>
              <td className="px-4 py-3"><div className="font-medium">{farma(a.farmaciaId)}</div><div className="text-xs text-muted-foreground">{cc(a.centroCustoId)}</div></td>
              <td className="px-4 py-3 text-center">{a.linhas.filter((l) => l.qtdEntregas > 0).length}</td>
              <td className="px-4 py-3 text-right font-mono">{fmtBRL(a.totalRepasse)}</td>
              <td className="px-4 py-3 text-right font-mono font-semibold">{fmtBRL(a.totalFaturado)}</td>
              <td className="px-4 py-3"><span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", statusCls[a.status])}>{statusLabel[a.status]}</span></td>
              <td className="px-4 py-3 text-right">
                <Link to={`/financeiro/acertos/${a.id}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  Abrir <ArrowRight className="h-3 w-3" />
                </Link>
              </td>
            </tr>
          ))}
          {acertos.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">Nenhum acerto no ciclo atual.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Acertos;
