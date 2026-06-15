import { useEffect, useState } from "react";
import { Plus, Power, CalendarClock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { financeiroApi } from "@/lib/financeiroApi";
import { fmtBRL } from "@/lib/baixas";
import { diaSemanaLabel, ocorrenciaLabel, proximosVencimentos } from "@/lib/billing/cotas";
import type { QuotaSchedule, QuotaTemplate, Entregador } from "@/data/financeiroMock";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Cotas = () => {
  const [quotas, setQuotas] = useState<QuotaSchedule[]>([]);
  const [templates, setTemplates] = useState<QuotaTemplate[]>([]);
  const [ents, setEnts] = useState<Entregador[]>([]);
  const [open, setOpen] = useState(false);
  const [tplOpen, setTplOpen] = useState(false);

  const load = async () => {
    setQuotas(await financeiroApi.listCotas());
    setTemplates(await financeiroApi.listQuotaTemplates());
  };
  useEffect(() => { load(); financeiroApi.catalogos().then((c) => setEnts(c.entregadores)); }, []);

  const vencimentos = proximosVencimentos(quotas, templates, 2);
  const tplLabel = (id: string) => {
    const t = templates.find((x) => x.id === id);
    return t ? `${ocorrenciaLabel[t.ocorrenciaNoMes]} ${diaSemanaLabel[t.diaSemana]} do mês` : "—";
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Cotas cooperativas</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setTplOpen(true)}>
              <CalendarClock className="h-3.5 w-3.5 mr-1" /> Modelos de agenda
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" /> Nova cota</Button>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-[10px] uppercase tracking-wider text-subtle-foreground">
              <tr>
                <th className="px-4 py-3">Entregador</th>
                <th className="px-4 py-3">Agenda</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 text-right">Parcelas</th>
                <th className="px-4 py-3">Início</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {quotas.map((q) => (
                <tr key={q.id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-2.5 font-medium">{ents.find((e) => e.id === q.entregadorId)?.nome}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{tplLabel(q.templateId)}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{fmtBRL(q.valor)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs">
                    {q.parcelas != null ? `${q.parcelasPagas ?? 0}/${q.parcelas}` : "—"}
                  </td>
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
              {!quotas.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">Nenhuma cota configurada.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Lance o <strong>valor</strong> e número de <strong>parcelas</strong> aqui. A ocorrência (dia da semana, semana do mês)
          é definida em <em>Modelos de agenda</em> e reaproveitada por todas as cotas.
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

      <NovaCotaDialog open={open} onOpenChange={setOpen} ents={ents} templates={templates}
        onSave={async (q) => { await financeiroApi.saveCota(q); await load(); toast({ title: "Cota salva" }); }} />

      <TemplatesDialog open={tplOpen} onOpenChange={setTplOpen} templates={templates}
        onSave={async (t) => { await financeiroApi.saveQuotaTemplate(t); await load(); }} />
    </div>
  );
};

const NovaCotaDialog = ({ open, onOpenChange, ents, templates, onSave }: {
  open: boolean; onOpenChange: (v: boolean) => void; ents: Entregador[]; templates: QuotaTemplate[];
  onSave: (q: QuotaSchedule) => Promise<void>;
}) => {
  const [entId, setEntId] = useState("");
  const [valor, setValor] = useState(80);
  const [parcelas, setParcelas] = useState<number | "">("");
  const [templateId, setTemplateId] = useState<string>(templates[0]?.id ?? "");
  useEffect(() => { if (!templateId && templates[0]) setTemplateId(templates[0].id); }, [templates, templateId]);
  const submit = async () => {
    if (!entId || !templateId) return;
    await onSave({
      id: "", entregadorId: entId, valor, templateId,
      parcelas: parcelas === "" ? undefined : Number(parcelas),
      parcelasPagas: 0, ativa: true,
      inicioEm: new Date().toISOString().slice(0, 10),
    });
    onOpenChange(false); setEntId(""); setValor(80); setParcelas("");
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nova cota cooperativa</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label className="text-xs">Entregador</Label>
            <Select value={entId} onValueChange={setEntId}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{ents.map((e) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}</SelectContent></Select></div>
          <div><Label className="text-xs">Valor por parcela</Label>
            <Input type="number" step="0.01" value={valor} onChange={(e) => setValor(+e.target.value)} /></div>
          <div><Label className="text-xs">Parcelas (vazio = recorrente)</Label>
            <Input type="number" min={1} value={parcelas} onChange={(e) => setParcelas(e.target.value === "" ? "" : +e.target.value)} /></div>
          <div className="col-span-2"><Label className="text-xs">Modelo de agenda</Label>
            <Select value={templateId} onValueChange={setTemplateId}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>)}
              </SelectContent></Select>
            <p className="mt-1 text-[10px] text-muted-foreground">Dia da semana / ocorrência mensal vêm do modelo.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={!entId || !templateId}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const TemplatesDialog = ({ open, onOpenChange, templates, onSave }: {
  open: boolean; onOpenChange: (v: boolean) => void; templates: QuotaTemplate[];
  onSave: (t: QuotaTemplate) => Promise<void>;
}) => {
  const [editing, setEditing] = useState<QuotaTemplate | null>(null);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Modelos de agenda</DialogTitle></DialogHeader>
        <div className="space-y-2">
          {templates.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-xs">
              <div>
                <div className="font-medium">{t.nome}</div>
                <div className="text-[10px] text-muted-foreground">{ocorrenciaLabel[t.ocorrenciaNoMes]} {diaSemanaLabel[t.diaSemana]} do mês</div>
              </div>
              <button onClick={() => setEditing({ ...t })} className="text-primary hover:underline inline-flex items-center gap-1">
                <Pencil className="h-3 w-3" /> Editar
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setEditing({ id: "", nome: "", regra: "monthly_weekday", diaSemana: 1, ocorrenciaNoMes: 1 })}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Novo modelo
          </Button>
        </div>
        {editing && (
          <div className="mt-3 rounded-md border border-border p-3 grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label className="text-xs">Nome</Label>
              <Input value={editing.nome} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} /></div>
            <div><Label className="text-xs">Ocorrência</Label>
              <Select value={String(editing.ocorrenciaNoMes)} onValueChange={(v) => setEditing({ ...editing, ocorrenciaNoMes: +v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{ocorrenciaLabel[n]}</SelectItem>)}</SelectContent>
              </Select></div>
            <div><Label className="text-xs">Dia da semana</Label>
              <Select value={String(editing.diaSemana)} onValueChange={(v) => setEditing({ ...editing, diaSemana: +v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{diaSemanaLabel.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}</SelectContent>
              </Select></div>
            <div className="col-span-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button size="sm" disabled={!editing.nome} onClick={async () => { await onSave(editing); setEditing(null); }}>Salvar modelo</Button>
            </div>
          </div>
        )}
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Cotas;
