import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Circle, Clock, Timer, Users, AlertTriangle, ChevronRight } from "lucide-react";
import { IconTile, type IconTileTone } from "@/components/IconTile";
import { cn } from "@/lib/utils";
import type { TarefaAtendimento, TarefaTipo, TarefaStatus, TarefaPrioridade } from "@/data/operacaoMock";

export const tarefaMeta: Record<TarefaTipo, { label: string; icon: LucideIcon; tone: IconTileTone }> = {
  finalizar_cadastro: { label: "Finalizar cadastro", icon: Users, tone: "primary" },
  gerar_matricula: { label: "Gerar matrícula", icon: Users, tone: "warning" },
  gerar_termo_desligamento: { label: "Termo de desligamento", icon: Users, tone: "destructive" },
  acerto_desligamento: { label: "Acerto de desligamento", icon: Users, tone: "destructive" },
  lancamento_cotas: { label: "Lançamento de cotas", icon: Users, tone: "success" },
  autorizar_adiantamento: { label: "Autorizar adiantamento", icon: Users, tone: "info" },
};

export const tarefaStatusMeta: Record<TarefaStatus, { label: string; cls: string }> = {
  em_andamento: { label: "Em andamento", cls: "bg-primary/15 text-primary border-primary/30" },
  atrasada: { label: "Atrasada", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  concluida: { label: "Concluída", cls: "bg-success/15 text-success border-success/30" },
  aguardando: { label: "Aguardando atendente", cls: "bg-warning/15 text-warning border-warning/30" },
};

const prioridadeMeta: Record<TarefaPrioridade, { label: string; cls: string }> = {
  alta: { label: "Alta", cls: "bg-destructive/15 text-destructive" },
  media: { label: "Média", cls: "bg-warning/15 text-warning" },
  baixa: { label: "Baixa", cls: "bg-muted text-muted-foreground" },
};

const fmtMin = (m: number) =>
  m >= 60 * 24 ? `${Math.floor(m / (60 * 24))}d` : m >= 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}` : `${m}min`;

export const TaskCard = ({
  tarefa,
  icon,
  onOpen,
}: {
  tarefa: TarefaAtendimento;
  icon?: LucideIcon;
  onOpen?: (t: TarefaAtendimento) => void;
}) => {
  const meta = tarefaMeta[tarefa.tipo];
  const Icon = icon ?? meta.icon;
  const pct = Math.min(100, Math.round((tarefa.decorridoMinutos / tarefa.slaMinutos) * 100));
  const checkPct = Math.round((tarefa.checklist.filter((c) => c.done).length / tarefa.checklist.length) * 100);
  const slaCor =
    tarefa.status === "concluida" ? "bg-success" : pct >= 100 ? "bg-destructive" : pct >= 75 ? "bg-warning" : "bg-primary";

  return (
    <button
      type="button"
      onClick={() => onOpen?.(tarefa)}
      className={cn(
        "group w-full rounded-xl border bg-surface p-5 text-left transition-all hover:border-primary/40 hover:shadow-sm",
        tarefa.status === "atrasada" ? "border-destructive/40" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <IconTile icon={Icon} tone={meta.tone} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{meta.label}</span>
              <span className={cn("rounded px-1 py-px text-[9px] font-medium", prioridadeMeta[tarefa.prioridade].cls)}>
                {prioridadeMeta[tarefa.prioridade].label}
              </span>
            </div>
            <div className="truncate text-sm font-semibold">{tarefa.entregadorNome}</div>
            <div className="text-[11px] text-muted-foreground">{tarefa.farmacia}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-medium", tarefaStatusMeta[tarefa.status].cls)}>
            {tarefaStatusMeta[tarefa.status].label}
          </span>
          {tarefa.status === "atrasada" && <AlertTriangle className="h-3.5 w-3.5 text-destructive" strokeWidth={1.75} />}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Checklist · {tarefa.checklist.filter((c) => c.done).length}/{tarefa.checklist.length}</span>
          <span className="font-mono">{checkPct}%</span>
        </div>
        <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${checkPct}%` }} />
        </div>
        <ul className="space-y-1">
          {tarefa.checklist.slice(0, 4).map((c, i) => (
            <li key={i} className="flex items-center gap-2 text-[11px]">
              {c.done ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-success" strokeWidth={2} />
              ) : (
                <Circle className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
              )}
              <span className={cn(c.done && "text-muted-foreground line-through")}>{c.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 border-t border-border pt-3">
        <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Timer className="h-3 w-3" strokeWidth={1.75} /> SLA {fmtMin(tarefa.decorridoMinutos)} / {fmtMin(tarefa.slaMinutos)}
          </span>
          <span className={cn("font-mono", pct >= 100 ? "text-destructive font-medium" : "")}>{pct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className={cn("h-full transition-all", slaCor)} style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px]">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-3 w-3" strokeWidth={1.75} />
            Atendente <span className="font-medium text-foreground">{tarefa.atendenteNome}</span>
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" strokeWidth={1.75} /> {tarefa.prazo}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Abrir tarefa <ChevronRight className="h-3 w-3" strokeWidth={2} />
      </div>
    </button>
  );
};

export default TaskCard;
