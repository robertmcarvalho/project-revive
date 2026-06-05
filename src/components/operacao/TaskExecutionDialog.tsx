import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IconTile } from "@/components/IconTile";
import { tarefaMeta, tarefaStatusMeta } from "@/components/operacao/TaskCard";
import { Send, ArrowRightLeft, ArrowUpFromLine, CheckCircle2, MessageSquare, StickyNote, Timer, AtSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { operacaoApi } from "@/lib/operacaoApi";
import type { TarefaAtendimento, Comentario } from "@/data/operacaoMock";

const parseMencoes = (texto: string) =>
  Array.from(texto.matchAll(/@([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)?)/g)).map((m) => m[1]);

export const TaskExecutionDialog = ({
  tarefa,
  open,
  onOpenChange,
  onChanged,
}: {
  tarefa: TarefaAtendimento | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onChanged?: () => void;
}) => {
  const [draft, setDraft] = useState<TarefaAtendimento | null>(tarefa);
  const [comentario, setComentario] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setDraft(tarefa); setComentario(""); setTransferTo(""); }, [tarefa]);

  if (!draft) return null;
  const meta = tarefaMeta[draft.tipo];
  const checkPct = Math.round((draft.checklist.filter((c) => c.done).length / draft.checklist.length) * 100);
  const pct = Math.min(100, Math.round((draft.decorridoMinutos / draft.slaMinutos) * 100));

  const toggleItem = (i: number) =>
    setDraft({ ...draft, checklist: draft.checklist.map((c, idx) => (idx === i ? { ...c, done: !c.done } : c)) });

  const addComentario = () => {
    if (!comentario.trim()) return;
    const novo: Comentario = {
      id: `c${Date.now()}`,
      autor: "Você",
      iniciais: "EU",
      texto: comentario,
      mencoes: parseMencoes(comentario),
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };
    setDraft({ ...draft, comentarios: [...(draft.comentarios ?? []), novo] });
    setComentario("");
  };

  const salvar = async () => {
    setSaving(true);
    await operacaoApi.updateTarefa(draft.id, draft);
    setSaving(false);
    onChanged?.();
    onOpenChange(false);
  };

  const finalizar = async () => {
    setSaving(true);
    await operacaoApi.finalizarTarefa(draft.id);
    setSaving(false);
    onChanged?.();
    onOpenChange(false);
  };

  const transferir = async () => {
    if (!transferTo.trim()) return;
    setSaving(true);
    await operacaoApi.updateTarefa(draft.id, {
      atendenteNome: transferTo,
      atendenteIniciais: transferTo.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(),
    });
    setSaving(false);
    onChanged?.();
    onOpenChange(false);
  };

  const escalar = async () => {
    setSaving(true);
    await operacaoApi.updateTarefa(draft.id, { escaladaPara: "Gestor Financeiro", prioridade: "alta" });
    setSaving(false);
    onChanged?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <IconTile icon={meta.icon} tone={meta.tone} size="lg" />
            <div className="flex-1">
              <DialogTitle className="text-base">{meta.label} · {draft.entregadorNome}</DialogTitle>
              <DialogDescription className="text-xs">
                {draft.farmacia} · prazo {draft.prazo}
              </DialogDescription>
            </div>
            <Badge className={cn("border", tarefaStatusMeta[draft.status].cls)} variant="outline">
              {tarefaStatusMeta[draft.status].label}
            </Badge>
          </div>
        </DialogHeader>

        {/* SLA bar */}
        <div className="rounded-lg border border-border bg-background/40 p-3">
          <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Timer className="h-3 w-3" strokeWidth={1.75} /> SLA</span>
            <span className="font-mono">{pct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full transition-all", pct >= 100 ? "bg-destructive" : pct >= 75 ? "bg-warning" : "bg-primary")} style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Checklist editável */}
        <section>
          <div className="mb-2 flex items-center justify-between text-xs">
            <h4 className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Checklist</h4>
            <span className="font-mono text-muted-foreground">{checkPct}%</span>
          </div>
          <ul className="space-y-1.5 rounded-lg border border-border bg-background/40 p-3">
            {draft.checklist.map((c, i) => (
              <li key={i} className="flex items-center gap-2 text-xs">
                <Checkbox checked={c.done} onCheckedChange={() => toggleItem(i)} />
                <span className={cn(c.done && "text-muted-foreground line-through")}>{c.label}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Anotações */}
        <section>
          <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold"><StickyNote className="h-3.5 w-3.5 text-warning" /> Anotações</h4>
          <Textarea
            value={draft.anotacoes ?? ""}
            onChange={(e) => setDraft({ ...draft, anotacoes: e.target.value })}
            placeholder="Anotações internas sobre a tarefa…"
            className="min-h-20 text-xs"
          />
        </section>

        {/* Comentários com menções */}
        <section>
          <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold">
            <MessageSquare className="h-3.5 w-3.5 text-primary" /> Comentários · {draft.comentarios?.length ?? 0}
          </h4>
          <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-border bg-background/40 p-3">
            {(draft.comentarios ?? []).length === 0 && <div className="text-center text-[11px] text-muted-foreground">Sem comentários.</div>}
            {(draft.comentarios ?? []).map((c) => (
              <div key={c.id} className="flex gap-2 text-xs">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-[10px] font-semibold text-primary-foreground">{c.iniciais}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{c.autor}</span>
                    <span className="text-[10px] text-muted-foreground">{c.timestamp}</span>
                  </div>
                  <p className="text-[11px]">
                    {c.texto.split(/(@[A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)?)/g).map((part, i) =>
                      part.startsWith("@") ? (
                        <span key={i} className="rounded bg-primary/15 px-1 text-primary">{part}</span>
                      ) : <span key={i}>{part}</span>,
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <div className="relative flex-1">
              <AtSign className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Comente e use @nome para mencionar"
                className="h-8 pl-7 text-xs"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addComentario())}
              />
            </div>
            <Button size="sm" variant="outline" onClick={addComentario}><Send className="h-3.5 w-3.5" /></Button>
          </div>
        </section>

        {/* Transferir */}
        <section className="rounded-lg border border-border bg-background/40 p-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <h4 className="flex items-center gap-2 font-semibold"><ArrowRightLeft className="h-3.5 w-3.5 text-warning" /> Transferir tarefa</h4>
          </div>
          <div className="flex gap-2">
            <Input value={transferTo} onChange={(e) => setTransferTo(e.target.value)} placeholder="Nome do atendente" className="h-8 text-xs" />
            <Button size="sm" variant="outline" onClick={transferir} disabled={!transferTo.trim()}>Transferir</Button>
          </div>
        </section>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" size="sm" onClick={escalar}>
            <ArrowUpFromLine className="mr-1 h-3.5 w-3.5" /> Escalar p/ gestor
          </Button>
          <Button variant="outline" size="sm" onClick={salvar} disabled={saving}>Salvar</Button>
          <Button size="sm" onClick={finalizar} disabled={saving}>
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Finalizar tarefa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskExecutionDialog;
