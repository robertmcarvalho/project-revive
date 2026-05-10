import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus, Search, Workflow, Copy, MoreHorizontal, Play, Pause,
  Clock, GitBranch, Activity, Filter, Tag, Sparkles, ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

type FlowStatus = "active" | "paused" | "draft";
type Flow = {
  id: string;
  name: string;
  description: string;
  status: FlowStatus;
  trigger: string;
  nodes: number;
  runs: number;
  success: number;
  sla: string;
  tags: string[];
  updated: string;
  owner: string;
};

const flows: Flow[] = [
  { id: "FLW-001", name: "Triagem WhatsApp → IA", description: "Classifica intenção, coleta dados e roteia para fila correta", status: "active", trigger: "Mensagem recebida (WhatsApp)", nodes: 9, runs: 12480, success: 98.4, sla: "5min", tags: ["bot", "triagem", "ia"], updated: "há 2h", owner: "RC" },
  { id: "FLW-002", name: "Pedido em rota — atualização cliente", description: "Notifica cliente quando entregador inicia rota e ao chegar", status: "active", trigger: "Pedido status = em_rota", nodes: 6, runs: 8932, success: 99.1, sla: "1min", tags: ["logística", "notificação"], updated: "há 6h", owner: "MA" },
  { id: "FLW-003", name: "Cobrança automática D+3", description: "Envia lembrete amigável no WhatsApp para parcelas vencidas", status: "active", trigger: "Parcela vencida +3d", nodes: 4, runs: 287, success: 92.7, sla: "—", tags: ["financeiro", "cobrança"], updated: "ontem", owner: "RC" },
  { id: "FLW-004", name: "Reabertura por inatividade 24h", description: "Detecta conversas sem resposta e reabre com novo agente", status: "paused", trigger: "Conversa sem resposta 24h", nodes: 5, runs: 712, success: 88.2, sla: "10min", tags: ["sla", "reabertura"], updated: "há 3 dias", owner: "JS" },
  { id: "FLW-005", name: "CSAT pós-atendimento", description: "Dispara pesquisa de satisfação após resolução", status: "active", trigger: "Conversa resolvida", nodes: 3, runs: 2104, success: 94.8, sla: "—", tags: ["csat", "qualidade"], updated: "há 1 dia", owner: "MA" },
  { id: "FLW-006", name: "Escalação SLA crítico", description: "Notifica líder e move conversa quando SLA < 5min", status: "active", trigger: "SLA < 5min", nodes: 7, runs: 156, success: 99.4, sla: "5min", tags: ["sla", "escalação"], updated: "há 4h", owner: "RC" },
  { id: "FLW-007", name: "Onboarding nova farmácia", description: "Coleta documentos, cria contas e envia kit boas-vindas", status: "draft", trigger: "Manual", nodes: 12, runs: 0, success: 0, sla: "—", tags: ["onboarding"], updated: "agora", owner: "JS" },
];

const statusMeta: Record<FlowStatus, { label: string; cls: string; dot: string }> = {
  active: { label: "Ativo", cls: "text-success bg-success/10 border-success/20", dot: "bg-success" },
  paused: { label: "Pausado", cls: "text-warning bg-warning/10 border-warning/20", dot: "bg-warning" },
  draft: { label: "Rascunho", cls: "text-muted-foreground bg-muted border-border", dot: "bg-muted-foreground" },
};

const Flows = () => {
  const [filter, setFilter] = useState<"all" | FlowStatus>("all");
  const [query, setQuery] = useState("");

  const filtered = flows.filter(f =>
    (filter === "all" || f.status === filter) &&
    (f.name.toLowerCase().includes(query.toLowerCase()) || f.tags.some(t => t.includes(query.toLowerCase())))
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <PageHeader
          eyebrow="Inteligência · Plug-and-play"
          title="Flows"
          description="Construa, gerencie e monitore fluxos de atendimento visuais."
          actions={
            <>
              <button className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-hover transition-colors">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Templates
              </button>
              <Link
                to="/flows/new"
                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Novo flow
              </Link>
            </>
          }
        />

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Flows ativos", value: "5 / 7", icon: Activity, accent: "text-success" },
            { label: "Execuções (mês)", value: "24.6k", icon: Play },
            { label: "Taxa de sucesso", value: "96.3%", icon: GitBranch, accent: "text-primary" },
            { label: "SLA médio", value: "3m 42s", icon: Clock, accent: "text-warning" },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className={cn("text-xl font-semibold tracking-tight", s.accent)}>{s.value}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{s.label}</div>
                  </div>
                  <Icon className="h-4 w-4 text-subtle-foreground" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle-foreground" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por nome ou tag..."
              className="w-full rounded-md border border-border bg-surface pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-subtle-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-1 rounded-md border border-border bg-surface p-0.5">
            {(["all", "active", "paused", "draft"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded px-2.5 py-1 text-[11px] font-medium transition-colors",
                  filter === f ? "bg-surface-elevated text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f === "all" ? "Todos" : statusMeta[f].label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover">
            <Filter className="h-3.5 w-3.5" /> Filtros
          </button>
        </div>

        {/* Grid de cards */}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(f => {
            const sm = statusMeta[f.status];
            return (
              <Link
                key={f.id}
                to={`/flows/${f.id}`}
                className="group flex flex-col rounded-xl border border-border bg-surface p-4 transition-all hover:border-border-strong hover:bg-surface-hover"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-channel-instagram/20 text-primary">
                      <Workflow className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{f.name}</div>
                      <div className="font-mono text-[10px] text-subtle-foreground">{f.id}</div>
                    </div>
                  </div>
                  <button onClick={e => { e.preventDefault(); }} className="opacity-0 group-hover:opacity-100 transition-opacity flex h-7 w-7 items-center justify-center rounded hover:bg-surface-elevated">
                    <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>

                <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{f.description}</p>

                <div className="mb-3 flex items-center gap-1.5">
                  <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium", sm.cls)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", sm.dot)} />
                    {sm.label}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    <Play className="h-2.5 w-2.5" /> {f.trigger}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
                  <div>
                    <div className="font-mono text-sm">{f.nodes}</div>
                    <div className="text-[10px] text-subtle-foreground">nós</div>
                  </div>
                  <div>
                    <div className="font-mono text-sm">{f.runs.toLocaleString("pt-BR")}</div>
                    <div className="text-[10px] text-subtle-foreground">execuções</div>
                  </div>
                  <div>
                    <div className={cn("font-mono text-sm", f.success >= 95 ? "text-success" : f.success >= 85 ? "text-warning" : f.success > 0 ? "text-destructive" : "text-subtle-foreground")}>
                      {f.success > 0 ? `${f.success}%` : "—"}
                    </div>
                    <div className="text-[10px] text-subtle-foreground">sucesso</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <div className="flex flex-wrap gap-1">
                    {f.tags.slice(0, 3).map(t => (
                      <span key={t} className="inline-flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        <Tag className="h-2 w-2" />{t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-subtle-foreground">
                    <Clock className="h-3 w-3" /> {f.updated}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button onClick={e => e.preventDefault()} className="flex items-center gap-1 rounded border border-border bg-background/40 px-2 py-1 text-[10px] text-muted-foreground hover:bg-surface-hover">
                      <Copy className="h-3 w-3" /> Duplicar
                    </button>
                    <button onClick={e => e.preventDefault()} className={cn(
                      "flex items-center gap-1 rounded border px-2 py-1 text-[10px] transition-colors",
                      f.status === "active"
                        ? "border-warning/30 bg-warning/10 text-warning hover:bg-warning/20"
                        : "border-success/30 bg-success/10 text-success hover:bg-success/20"
                    )}>
                      {f.status === "active" ? <><Pause className="h-3 w-3" /> Pausar</> : <><Play className="h-3 w-3" /> Ativar</>}
                    </button>
                  </div>
                  <span className="flex items-center gap-0.5 text-[10px] font-medium text-primary group-hover:gap-1 transition-all">
                    Editar <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Flows;
