import { useEffect, useState } from "react";
import { Plus, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { financeiroApi } from "@/lib/financeiroApi";
import { fmtBRL } from "@/lib/baixas";
import { diaSemanaLabel, ocorrenciaLabel, proximosVencimentos } from "@/lib/billing/cotas";
import type { QuotaSchedule, Entregador } from "@/data/financeiroMock";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Cotas = () => {
  const [quotas, setQuotas] = useState<QuotaSchedule[]>([]);
  const [ents, setEnts] = useState<Entregador[]>([]);
  const [open, setOpen] = useState(false);

  const load = () => financeiroApi.listCotas().then(setQuotas);
  useEffect(() => { load(); financeiroApi.catalogos().then((c) => setEnts(c.entregadores)); }, []);

  const vencimentos = proximosVencimentos(quotas, 2);

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Cotas cooperativas</h3>
          <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" /> Nova cota</Button>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-[10px] uppercase tracking-wider text-subtle-foreground">
              <tr>
                <th className="px-4 py-3">Entregador</th><th className="px-4 py-3">Regra</th>
                <th className="px-4 py-3 text-right">Valor</th><th className="px-4 py-3">Início</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {quotas.map((q) => (
                <tr key={q.id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-2.5 font-medium">{ents.find((e) => e.id === q.entregadorId)?.nome}</td>
                  <td className="px-4 py-2.5 text-xs">{ocorrenciaLabel[q.ocorrenciaNoMes]} {diaSemanaLabel[q.diaSemana]} do mês</td>
                  <td className="px-4 py-2.5 text-right font-mono">{fmtBRL(q.valor)}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px]">{q.inicioEm}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => financeiroApi.toggleCota(q.id, !q.ativa).then(load)}
                      className={cn("inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium",
                        q.ativa ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
                      <Power className="h-3 w-3" /> {q.ativa ? "Ativa" : "Inativa"}
                    </button>
                  </td>
                </tr>
              ))}
              {!quotas.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">Nenhuma cota configurada.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Cotas são descontadas no pagamento do entregador (separadas do INSS, que é custo da Cooperativa).
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Próximos vencimentos</h3>
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <ul className="divide-y divide-border/40">
            {vencimentos.slice(0, 12).map((v, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-2 text-xs">
                <div>
                  <div className="font-medium">{ents.find((e) => e.id === v.entregadorId)?.nome}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{v.data}</div>
                </div>
                <span className="font-mono font-semibold">{fmtBRL(v.valor)}</span>
              </li>
            ))}
            {!vencimentos.length && <li className="px-4 py-8 text-center text-xs text-muted-foreground">Nenhum vencimento próximo.</li>}
          </ul>
        </div>
      </div>

      <NovaCotaDialog open={open} onOpenChange={setOpen} ents={ents}
        onSave={async (q) => { await financeiroApi.saveCota(q); await load(); toast({ title: "Cota salva" }); }} />
    </div>
  );
};

const NovaCotaDialog = ({ open, onOpenChange, ents, onSave }: {
  open: boolean; onOpenChange: (v: boolean) => void; ents: Entregador[];
  onSave: (q: QuotaSchedule) => Promise<void>;
}) => {
  const [entId, setEntId] = useState("");
  const [valor, setValor] = useState(80);
  const [diaSemana, setDS] = useState(4);
  const [ocorrencia, setOc] = useState(2);
  const submit = async () => {
    if (!entId) return;
    await onSave({
      id: "", entregadorId: entId, valor, regra: "monthly_weekday",
      diaSemana, ocorrenciaNoMes: ocorrencia, ativa: true,
      inicioEm: new Date().toISOString().slice(0, 10),
    });
    onOpenChange(false); setEntId(""); setValor(80);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nova cota cooperativa</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label className="text-xs">Entregador</Label>
            <Select value={entId} onValueChange={setEntId}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{ents.map((e) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}</SelectContent></Select></div>
          <div><Label className="text-xs">Valor</Label><Input type="number" step="0.01" value={valor} onChange={(e) => setValor(+e.target.value)} /></div>
          <div><Label className="text-xs">Ocorrência no mês</Label>
            <Select value={String(ocorrencia)} onValueChange={(v) => setOc(+v)}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{ocorrenciaLabel[n]}</SelectItem>)}</SelectContent></Select></div>
          <div className="col-span-2"><Label className="text-xs">Dia da semana</Label>
            <Select value={String(diaSemana)} onValueChange={(v) => setDS(+v)}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{diaSemanaLabel.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={!entId}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Cotas;
