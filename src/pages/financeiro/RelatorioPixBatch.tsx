import { useEffect, useState } from "react";
import { Download, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { financeiroApi } from "@/lib/financeiroApi";
import { fmtBRL } from "@/lib/baixas";
import { gerarPrevia, totaisPrevia, csvPixGenerico, type PixBatchLine } from "@/lib/billing/pixBatch";
import type { Acerto, ContaBancaria } from "@/data/financeiroMock";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const baixarCsv = (nome: string, conteudo: string) => {
  const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = nome; a.click();
  URL.revokeObjectURL(url);
};

const RelatorioPixBatch = () => {
  const [acertos, setAcertos] = useState<Acerto[]>([]);
  const [cicloId, setCicloId] = useState("");
  const [lines, setLines] = useState<PixBatchLine[]>([]);
  const [contas, setContas] = useState<ContaBancaria[]>([]);
  const [contaOrigem, setContaOrigem] = useState<string>("");

  useEffect(() => {
    financeiroApi.listAcertos().then(setAcertos);
    financeiroApi.catalogos().then((c) => {
      setContas(c.contasBancarias);
      const coopConta = c.contasBancarias.find((x) => x.empresa === "coop");
      if (coopConta) setContaOrigem(coopConta.id);
    });
  }, []);

  useEffect(() => {
    if (!cicloId) return;
    Promise.all([financeiroApi.listContasPagar(), financeiroApi.catalogos()]).then(([cps, c]) => {
      const acerto = acertos.find((a) => a.id === cicloId);
      if (!acerto) { setLines([]); return; }
      // contas a pagar geradas pelo acerto (origem = "acerto")
      const filtradas = cps.filter((cp) => cp.id.startsWith(`cp-${acerto.id}-`));
      setLines(gerarPrevia(filtradas, c.entregadores));
    });
  }, [cicloId, acertos]);

  const aprovados = acertos.filter((a) => a.status === "aprovado" || a.status === "pago");
  const tot = totaisPrevia(lines);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <Label className="text-[10px] uppercase text-subtle-foreground">Ciclo aprovado</Label>
          <Select value={cicloId} onValueChange={setCicloId}>
            <SelectTrigger className="h-8 w-72"><SelectValue placeholder="Selecione um ciclo aprovado" /></SelectTrigger>
            <SelectContent>
              {aprovados.length === 0 && <div className="px-3 py-4 text-xs text-muted-foreground">Nenhum ciclo aprovado ainda. Aprove um acerto em Acertos.</div>}
              {aprovados.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.id} · {a.cicloInicio} → {a.cicloFim}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[10px] uppercase text-subtle-foreground">Conta origem</Label>
          <Select value={contaOrigem} onValueChange={setContaOrigem}>
            <SelectTrigger className="h-8 w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              {contas.filter((c) => c.empresa === "coop").map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.banco} · ag {c.agencia} · cc {c.conta}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" className="ml-auto" disabled={!lines.length || tot.qtd === 0}
          onClick={async () => {
            baixarCsv(`pix-batch-${cicloId}.csv`, csvPixGenerico(lines));
            await financeiroApi.registrarPixBatch({
              cicloId, geradoPor: "Gestor financeiro",
              totalEntregadores: tot.qtd, totalValor: tot.total,
              contaOrigemId: contaOrigem, formato: "csv_generico", status: "gerado",
            });
            toast({ title: `Arquivo gerado — ${tot.qtd} entregadores · ${fmtBRL(tot.total)}` });
          }}>
          <Download className="h-3.5 w-3.5 mr-1" /> Exportar CSV PIX
        </Button>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <KPI label="A pagar (válidos)" value={`${tot.qtd}`} />
        <KPI label="Total líquido" value={fmtBRL(tot.total)} />
        <KPI label="Bloqueados" value={`${tot.bloqueados}`} tone={tot.bloqueados ? "warn" : undefined} />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-[10px] uppercase tracking-wider text-subtle-foreground">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">CPF</th>
              <th className="px-4 py-3">Tipo chave</th>
              <th className="px-4 py-3">Chave PIX</th>
              <th className="px-4 py-3 text-right">Valor líquido</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.entregadorId} className={cn("border-b border-border/40 last:border-0", l.bloqueado && "bg-destructive/5")}>
                <td className="px-4 py-2.5 font-medium">{l.nome}</td>
                <td className="px-4 py-2.5 font-mono text-xs">{l.cpf ?? "—"}</td>
                <td className="px-4 py-2.5 text-xs capitalize">{l.pixKeyType ?? "—"}</td>
                <td className="px-4 py-2.5 font-mono text-[11px]">{l.pixKey ?? "—"}</td>
                <td className="px-4 py-2.5 text-right font-mono font-semibold">{fmtBRL(l.valorLiquido)}</td>
                <td className="px-4 py-2.5 text-right">
                  {l.bloqueado
                    ? <span className="inline-flex items-center gap-1 text-[11px] text-destructive"><AlertTriangle className="h-3 w-3" /> {l.motivoBloqueio}</span>
                    : <span className="inline-flex items-center gap-1 text-[11px] text-success"><CheckCircle2 className="h-3 w-3" /> OK</span>}
                </td>
              </tr>
            ))}
            {!lines.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
              Selecione um ciclo aprovado para visualizar a prévia.
            </td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const KPI = ({ label, value, tone }: { label: string; value: string; tone?: "warn" }) => (
  <div className="rounded-lg border border-border bg-surface px-3 py-2">
    <div className="text-[10px] uppercase text-subtle-foreground">{label}</div>
    <div className={cn("text-lg font-semibold", tone === "warn" && "text-warning")}>{value}</div>
  </div>
);

export default RelatorioPixBatch;
