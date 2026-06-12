import { useEffect, useState } from "react";
import { Send, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { financeiroApi } from "@/lib/financeiroApi";
import { fmtBRL, fmtDate } from "@/lib/baixas";
import { EmpresaBadge } from "@/components/financeiro/EmpresaBadge";
import type { Fatura, Farmacia, CentroCusto } from "@/data/financeiroMock";
import { toast } from "@/hooks/use-toast";

const Faturamento = () => {
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [farmacias, setFarmacias] = useState<Farmacia[]>([]);
  const [ccs, setCcs] = useState<CentroCusto[]>([]);

  const load = () => financeiroApi.listFaturas().then(setFaturas);
  useEffect(() => {
    load();
    financeiroApi.catalogos().then((c) => { setFarmacias(c.farmacias); setCcs(c.centrosCusto); });
  }, []);

  const enviar = async (id: string) => { await financeiroApi.marcarFaturaEnviada(id); await load(); toast({ title: "Fatura enviada" }); };
  const farm = (id: string) => farmacias.find((f) => f.id === id)?.nome ?? id;
  const cc = (id: string) => ccs.find((c) => c.id === id)?.nome ?? id;

  if (!faturas.length)
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center">
        <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <div className="font-medium">Nenhuma fatura emitida ainda</div>
        <div className="mt-1 text-xs text-muted-foreground">Aprove um acerto para gerar faturas divididas entre Cooperativa e Flux Farma.</div>
      </div>
    );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-[10px] uppercase tracking-wider text-subtle-foreground">
          <tr>
            <th className="px-4 py-3">Número</th>
            <th className="px-4 py-3">Empresa</th>
            <th className="px-4 py-3">Farmácia / CC</th>
            <th className="px-4 py-3">Ciclo</th>
            <th className="px-4 py-3">Vencimento</th>
            <th className="px-4 py-3 text-right">Valor</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {faturas.map((f) => (
            <tr key={f.id} className="border-b border-border/40 last:border-0">
              <td className="px-4 py-3 font-mono text-[11px]">{f.numero}</td>
              <td className="px-4 py-3"><EmpresaBadge empresa={f.empresa} /></td>
              <td className="px-4 py-3"><div className="font-medium">{farm(f.farmaciaId)}</div><div className="text-xs text-muted-foreground">{cc(f.centroCustoId)}</div></td>
              <td className="px-4 py-3 font-mono text-[11px]">{fmtDate(f.cicloInicio)} → {fmtDate(f.cicloFim)}</td>
              <td className="px-4 py-3 font-mono text-[11px]">{fmtDate(f.vencimento)}</td>
              <td className="px-4 py-3 text-right font-mono font-semibold">{fmtBRL(f.valor)}</td>
              <td className="px-4 py-3 text-xs capitalize">{f.status}</td>
              <td className="px-4 py-3 text-right">
                {f.status === "aberta" && <Button size="sm" variant="outline" onClick={() => enviar(f.id)}><Send className="h-3 w-3 mr-1" /> Enviar</Button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Faturamento;
