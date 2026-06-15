import { useEffect, useState } from "react";
import { Download, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { financeiroApi } from "@/lib/financeiroApi";
import { fmtBRL } from "@/lib/baixas";
import { gerarInssContabilidade, csvInss, type InssLine } from "@/lib/billing/inssReport";
import { toast } from "@/hooks/use-toast";

const baixarCsv = (nome: string, conteudo: string) => {
  const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = nome; a.click();
  URL.revokeObjectURL(url);
};

const RelatorioInss = () => {
  const [mes, setMes] = useState(new Date().toISOString().slice(0, 7));
  const [lines, setLines] = useState<InssLine[]>([]);

  useEffect(() => {
    Promise.all([financeiroApi.listAcertos(), financeiroApi.catalogos()])
      .then(([ac, c]) => setLines(gerarInssContabilidade(ac, c.entregadores, mes)));
  }, [mes]);

  const total = lines.reduce((s, l) => s + l.valorFaturadoNoMes, 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <Label className="text-[10px] uppercase text-subtle-foreground">Competência (mês)</Label>
          <Input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className="h-8 w-40" />
        </div>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={() => baixarCsv(`inss-${mes}.csv`, csvInss(lines))}>
            <Download className="h-3.5 w-3.5 mr-1" /> Exportar CSV
          </Button>
          <Button size="sm" onClick={() => {
            financeiroApi.registrarMonthlyReport({ tipo: "inss", competencia: mes,
              geradoPor: "Operador financeiro", enviadoEm: new Date().toISOString(),
              totais: { linhas: lines.length, valor: total } });
            toast({ title: "Envio à contabilidade registrado" });
          }}>
            <Send className="h-3.5 w-3.5 mr-1" /> Marcar enviado
          </Button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <KPI label="Cooperados no mês" value={String(lines.length)} />
        <KPI label="Valor faturado total" value={fmtBRL(total)} />
        <KPI label="INSS calculado por" value="Contabilidade" mute />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-[10px] uppercase tracking-wider text-subtle-foreground">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">CPF</th>
              <th className="px-4 py-3 text-right">Valor faturado no mês</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.entregadorId} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-2.5 font-medium">{l.nome}</td>
                <td className="px-4 py-2.5 font-mono text-xs">{l.cpf ?? "—"}</td>
                <td className="px-4 py-2.5 text-right font-mono">{fmtBRL(l.valorFaturadoNoMes)}</td>
              </tr>
            ))}
            {!lines.length && <tr><td colSpan={3} className="px-4 py-10 text-center text-sm text-muted-foreground">Sem cooperados com remuneração no mês.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Sistema não desconta INSS do entregador. CoopMob arca como custo; contabilidade recolhe a partir desta lista.
      </p>
    </div>
  );
};

const KPI = ({ label, value, mute }: { label: string; value: string; mute?: boolean }) => (
  <div className="rounded-lg border border-border bg-surface px-3 py-2">
    <div className="text-[10px] uppercase text-subtle-foreground">{label}</div>
    <div className={`text-lg font-semibold ${mute ? "text-muted-foreground" : ""}`}>{value}</div>
  </div>
);

export default RelatorioInss;
