import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Activity, Building2, Truck, AlertTriangle, RefreshCw, ChevronRight,
  MessageCircle, CalendarCheck, UserX, UserPlus, ArrowUpRight, ArrowDownRight,
  TrendingUp, Clock, Map as MapIcon, BellRing, ShieldCheck, BadgeCheck,
  FileSignature, FileCheck2, FileMinus2, IdCard, Briefcase, ClipboardList,
  CheckCircle2, Circle, Timer, Users, FilePlus2, Wallet, BadgeDollarSign,
  ArrowDownToLine, Coins, ShieldAlert, Headset, BarChart3, Filter,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { OperationContextBar } from "@/components/OperationContextBar";
import { StatusDot } from "@/components/StatusDot";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { IconTile } from "@/components/IconTile";
import { Spark } from "@/components/operacao/Spark";
import { TaskCard, tarefaMeta } from "@/components/operacao/TaskCard";
import { TaskExecutionDialog } from "@/components/operacao/TaskExecutionDialog";
import { CycleEventsTable } from "@/components/operacao/CycleEventsTable";
import { operacaoApi } from "@/lib/operacaoApi";
import type {
  FarmaciaOperacional, LiderResumo, EntregadorOperacional, AlertaOperacional, KpiOperacional, EntregadorStatus,
  ComplianceEntregador, TarefaAtendimento, NotificacaoPendencia, EventoCiclo, PerfilOperacao,
} from "@/data/operacaoMock";

// Reaproveita ícones por tipo de tarefa — sobrescreve o ícone genérico do tarefaMeta para algumas variantes
const taskIconOverride = {
  finalizar_cadastro: FilePlus2,
  gerar_matricula: IdCard,
  gerar_termo_desligamento: FileMinus2,
  acerto_desligamento: Wallet,
  lancamento_cotas: Coins,
  autorizar_adiantamento: BadgeDollarSign,
} as const;

type Periodo = "hoje" | "7d" | "30d";

const periodos: { id: Periodo; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "7d", label: "7 dias" },
  { id: "30d", label: "30 dias" },
];

const perfilMeta: Record<PerfilOperacao, { label: string; eyebrow: string; description: string; icon: any }> = {
  analista_operacional: {
    label: "Analista Operacional",
    eyebrow: "Operação",
    description: "Visão consolidada das farmácias, líderes, entregadores e compliance.",
    icon: Activity,
  },
  atendente_geral: {
    label: "Atendente · Atendimento Geral",
    eyebrow: "Operação · Atendimento",
    description: "Tarefas de cadastro, matrícula e termo de desligamento dos cooperados.",
    icon: Headset,
  },
  atendente_financeiro: {
    label: "Atendente Financeiro",
    eyebrow: "Operação · Financeiro",
    description: "Acertos de desligamento, lançamento de cotas e adiantamentos.",
    icon: Wallet,
  },
  gestor_financeiro: {
    label: "Gestor Financeiro",
    eyebrow: "Operação · Gestão Financeira",
    description: "Indicadores do setor, autorizações e desempenho dos atendentes.",
    icon: BarChart3,
  },
};

const statusEntregadorMeta: Record<EntregadorStatus, { label: string; cls: string; dot: string }> = {
  rota: { label: "Em rota", cls: "bg-primary/15 text-primary border-primary/30", dot: "bg-primary" },
  disponivel: { label: "Disponível", cls: "bg-success/15 text-success border-success/30", dot: "bg-success" },
  pausa: { label: "Em pausa", cls: "bg-warning/15 text-warning border-warning/30", dot: "bg-warning" },
  offline: { label: "Offline", cls: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground/50" },
};

const nivelCls: Record<AlertaOperacional["nivel"], string> = {
  destructive: "bg-destructive/15 text-destructive border-destructive/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  success: "bg-success/15 text-success border-success/30",
  info: "bg-primary/15 text-primary border-primary/30",
};

const slaCls = (sla: number) =>
  sla >= 95 ? "bg-success/15 text-success" : sla >= 88 ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive";

const ComplianceBadge = ({ ok, label }: { ok: boolean; label: string }) => (
  <span className={cn(
    "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
    ok ? "bg-success/10 text-success border-success/30" : "bg-destructive/10 text-destructive border-destructive/30",
  )}>
    {ok ? <CheckCircle2 className="h-3 w-3" strokeWidth={2} /> : <Circle className="h-3 w-3" strokeWidth={2} />}
    {label}
  </span>
);

// ============================================================
// Reusable widgets
// ============================================================
const KpiGrid = ({ kpis, loading }: { kpis: KpiOperacional[]; loading: boolean }) => (
  <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
    {loading
      ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
      : kpis.map((k) => (
          <div key={k.label} className={cn("rounded-xl border bg-surface p-4", k.alerta ? "border-destructive/40" : "border-border")}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">{k.label}</span>
              {k.alerta && <AlertTriangle className="h-3.5 w-3.5 text-destructive" strokeWidth={1.75} />}
            </div>
            <div className="mt-1 flex items-end justify-between">
              <div className="font-mono text-xl font-semibold tracking-tight">{k.valor}</div>
              <Spark data={k.spark} color={k.alerta ? "hsl(var(--destructive))" : "hsl(var(--primary))"} />
            </div>
            {k.delta && (
              <div className={cn(
                "mt-1 flex items-center gap-1 text-[10px]",
                k.deltaTipo === "up" && "text-success",
                k.deltaTipo === "down" && "text-destructive",
                (!k.deltaTipo || k.deltaTipo === "neutral") && "text-muted-foreground",
              )}>
                {k.deltaTipo === "up" && <ArrowUpRight className="h-3 w-3" strokeWidth={2} />}
                {k.deltaTipo === "down" && <ArrowDownRight className="h-3 w-3" strokeWidth={2} />}
                {k.delta}
              </div>
            )}
          </div>
        ))}
  </div>
);

const AlertasPanel = ({ alertas, loading }: { alertas: AlertaOperacional[]; loading: boolean }) => (
  <div className="rounded-xl border border-border bg-surface p-5">
    <div className="mb-3 flex items-center justify-between">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <IconTile icon={BellRing} tone="warning" size="sm" /> Alertas operacionais
      </h3>
      <span className="rounded bg-destructive/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-destructive">
        {alertas.filter((a) => a.nivel !== "success").length}
      </span>
    </div>
    {loading ? (
      <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
    ) : (
      <ul className="space-y-2">
        {alertas.map((a) => (
          <li key={a.id} className="rounded-lg border border-border bg-background/40 p-3">
            <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider", nivelCls[a.nivel])}>
              {a.tipo}
            </span>
            <div className="mt-1 text-xs">{a.descricao}</div>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-subtle-foreground">
              <Building2 className="h-3 w-3" strokeWidth={1.75} /> {a.farmacia}
              <Clock className="ml-1 h-3 w-3" strokeWidth={1.75} /> {a.timestamp}
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const NotificacoesPanel = ({ notificacoes, onOpenTarefa }: {
  notificacoes: NotificacaoPendencia[];
  onOpenTarefa?: (id: string) => void;
}) => (
  <div className="rounded-xl border border-border bg-surface p-5">
    <div className="mb-3 flex items-center justify-between">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <IconTile icon={FileSignature} tone="destructive" size="sm" /> Pendências de assinatura
      </h3>
      <span className="rounded bg-warning/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-warning">
        {notificacoes.length}
      </span>
    </div>
    {notificacoes.length === 0 ? (
      <div className="py-6 text-center text-xs text-muted-foreground">Sem pendências.</div>
    ) : (
      <ul className="space-y-2">
        {notificacoes.map((n) => {
          const atrasada = n.diasPendente > n.prazoDias;
          const pct = Math.min(100, Math.round((n.diasPendente / n.prazoDias) * 100));
          return (
            <li
              key={n.id}
              className={cn(
                "rounded-lg border bg-background/40 p-3 transition-colors",
                atrasada ? "border-destructive/40" : "border-border",
                n.tarefaId && "cursor-pointer hover:border-primary/40",
              )}
              onClick={() => n.tarefaId && onOpenTarefa?.(n.tarefaId)}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-primary text-[10px] font-semibold text-primary-foreground">{n.entregadorIniciais}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium">{n.entregadorNome}</div>
                  <div className="text-[10px] text-subtle-foreground">{n.farmacia}</div>
                </div>
                <span className={cn(
                  "rounded border px-1.5 py-0.5 text-[10px]",
                  n.tipo === "matricula" ? "bg-warning/15 text-warning border-warning/30" : "bg-destructive/15 text-destructive border-destructive/30",
                )}>
                  {n.tipo === "matricula" ? "Matrícula" : "Desligamento"}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><Timer className="h-3 w-3" strokeWidth={1.75} /> {n.diasPendente}/{n.prazoDias} dias</span>
                <span className={atrasada ? "text-destructive font-medium" : ""}>{atrasada ? "SLA estourado" : "No prazo"}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className={cn("h-full transition-all", atrasada ? "bg-destructive" : "bg-warning")} style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);

const TaskBoard = ({
  tarefas, loading, onOpen, mostraFinalizadas, onToggleFinalizadas,
}: {
  tarefas: TarefaAtendimento[];
  loading: boolean;
  onOpen: (t: TarefaAtendimento) => void;
  mostraFinalizadas: boolean;
  onToggleFinalizadas: (v: boolean) => void;
}) => {
  const visiveis = mostraFinalizadas
    ? tarefas.filter((t) => t.status === "concluida")
    : tarefas.filter((t) => t.status !== "concluida");

  return (
    <section className="mb-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <IconTile icon={ClipboardList} tone="primary" size="sm" /> Tarefas do setor
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleFinalizadas(false)}
            className={cn(
              "rounded-md border px-2 py-1 text-[11px] transition-colors",
              !mostraFinalizadas ? "border-primary/40 bg-primary/15 text-primary" : "border-border bg-background/40 text-muted-foreground",
            )}
          >
            <Filter className="mr-1 inline h-3 w-3" strokeWidth={1.75} />
            Em execução · {tarefas.filter((t) => t.status !== "concluida").length}
          </button>
          <button
            onClick={() => onToggleFinalizadas(true)}
            className={cn(
              "rounded-md border px-2 py-1 text-[11px] transition-colors",
              mostraFinalizadas ? "border-primary/40 bg-primary/15 text-primary" : "border-border bg-background/40 text-muted-foreground",
            )}
          >
            <CheckCircle2 className="mr-1 inline h-3 w-3" strokeWidth={1.75} />
            Finalizadas · {tarefas.filter((t) => t.status === "concluida").length}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
        </div>
      ) : visiveis.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/50 p-10 text-center text-sm text-muted-foreground">
          {mostraFinalizadas ? "Nenhuma tarefa finalizada no período." : "Nenhuma tarefa em execução."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {visiveis.map((t) => (
            <TaskCard key={t.id} tarefa={t} icon={taskIconOverride[t.tipo]} onOpen={onOpen} />
          ))}
        </div>
      )}
    </section>
  );
};

// ============================================================
// Página
// ============================================================
const Operacao = () => {
  const [params, setParams] = useSearchParams();
  const perfilParam = params.get("perfil") as PerfilOperacao | null;
  const tarefaParam = params.get("tarefa");

  const [perfil, setPerfil] = useState<PerfilOperacao>(perfilParam ?? "analista_operacional");
  const [periodo, setPeriodo] = useState<Periodo>("hoje");
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KpiOperacional[]>([]);
  const [farmacias, setFarmacias] = useState<FarmaciaOperacional[]>([]);
  const [lideres, setLideres] = useState<LiderResumo[]>([]);
  const [entregadores, setEntregadores] = useState<EntregadorOperacional[]>([]);
  const [alertas, setAlertas] = useState<AlertaOperacional[]>([]);
  const [charts, setCharts] = useState<{ volumePorHora: any[]; slaPorFarmacia: any[]; faltasVsDiarias: any[] } | null>(null);
  const [compliance, setCompliance] = useState<ComplianceEntregador[]>([]);
  const [tarefas, setTarefas] = useState<TarefaAtendimento[]>([]);
  const [notificacoes, setNotificacoes] = useState<NotificacaoPendencia[]>([]);
  const [eventos, setEventos] = useState<EventoCiclo[]>([]);
  const [statusFiltro, setStatusFiltro] = useState<EntregadorStatus | "todos">("todos");
  const [mostraFinalizadas, setMostraFinalizadas] = useState(false);
  const [eventoFiltro, setEventoFiltro] = useState<"todos" | "entrada" | "desligamento">("todos");
  const [refreshedAt, setRefreshedAt] = useState<string>(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
  const [tarefaAtiva, setTarefaAtiva] = useState<TarefaAtendimento | null>(null);

  const carregar = async () => {
    setLoading(true);
    const [k, f, l, e, a, c, comp, ts, ns, ev] = await Promise.all([
      operacaoApi.listKpisPorPerfil(perfil),
      operacaoApi.listFarmacias(),
      operacaoApi.listLideres(),
      operacaoApi.listEntregadores(),
      operacaoApi.listAlertas(),
      operacaoApi.charts(),
      operacaoApi.listCompliance(),
      operacaoApi.listTarefasPorPerfil(perfil),
      operacaoApi.listNotificacoes(),
      operacaoApi.listEventosCiclo(),
    ]);
    setKpis(k); setFarmacias(f); setLideres(l); setEntregadores(e); setAlertas(a); setCharts(c);
    setCompliance(comp); setTarefas(ts); setNotificacoes(ns); setEventos(ev);
    setRefreshedAt(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    setLoading(false);
  };

  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, [periodo, perfil]);

  // Deep-link: abrir tarefa via querystring
  useEffect(() => {
    if (tarefaParam && tarefas.length) {
      const t = tarefas.find((x) => x.id === tarefaParam);
      if (t) setTarefaAtiva(t);
    }
  }, [tarefaParam, tarefas]);

  const abrirTarefaPorId = (id: string) => {
    const t = tarefas.find((x) => x.id === id);
    if (t) setTarefaAtiva(t);
  };

  const handleSetPerfil = (p: PerfilOperacao) => {
    setPerfil(p);
    setParams((prev) => { prev.set("perfil", p); return prev; }, { replace: true });
  };

  const contagemPorStatus = useMemo(() => ({
    rota: entregadores.filter((x) => x.status === "rota").length,
    disponivel: entregadores.filter((x) => x.status === "disponivel").length,
    pausa: entregadores.filter((x) => x.status === "pausa").length,
    offline: entregadores.filter((x) => x.status === "offline").length,
  }), [entregadores]);

  const entregadoresFiltrados = useMemo(
    () => statusFiltro === "todos" ? entregadores : entregadores.filter((x) => x.status === statusFiltro),
    [entregadores, statusFiltro],
  );

  const complianceStats = useMemo(() => {
    const total = compliance.length || 1;
    const cert = compliance.filter((c) => c.certificadoDigital).length;
    const mei = compliance.filter((c) => c.mei).length;
    const mat = compliance.filter((c) => c.matricula).length;
    return [
      { label: "Certificado digital", icon: ShieldCheck, tone: "primary" as const, ok: cert, total, pct: Math.round((cert / total) * 100) },
      { label: "MEI ativo", icon: Briefcase, tone: "success" as const, ok: mei, total, pct: Math.round((mei / total) * 100) },
      { label: "Matrícula emitida", icon: BadgeCheck, tone: "warning" as const, ok: mat, total, pct: Math.round((mat / total) * 100) },
    ];
  }, [compliance]);

  const meta = perfilMeta[perfil];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <PageHeader
          live
          icon={meta.icon}
          eyebrow={meta.eyebrow}
          title="Painel Operacional"
          description={meta.description}
          actions={
            <>
              <div className="flex items-center rounded-md border border-border bg-card p-0.5">
                {periodos.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPeriodo(p.id)}
                    className={cn(
                      "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                      periodo === p.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <button
                onClick={carregar}
                className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs hover:bg-surface-elevated"
                title={`Última atualização: ${refreshedAt}`}
              >
                <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} strokeWidth={1.75} /> {refreshedAt}
              </button>
            </>
          }
        />

        {/* Profile switcher (mock — em produção virá do contexto do usuário) */}
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-border bg-surface/40 p-3">
          <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-subtle-foreground">
            <ShieldAlert className="h-3 w-3" strokeWidth={1.75} /> Perfil
          </span>
          {(Object.keys(perfilMeta) as PerfilOperacao[]).map((p) => {
            const M = perfilMeta[p];
            return (
              <button
                key={p}
                onClick={() => handleSetPerfil(p)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] transition-colors",
                  perfil === p ? "border-primary/40 bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                <M.icon className="h-3 w-3" strokeWidth={1.75} />
                {M.label}
              </button>
            );
          })}
        </div>

        <OperationContextBar breadcrumb={[meta.label, "turno atual"]} />

        <KpiGrid kpis={kpis} loading={loading} />

        {/* === ANALISTA OPERACIONAL === */}
        {perfil === "analista_operacional" && (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <section className="lg:col-span-2">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-semibold">
                    <IconTile icon={Building2} tone="primary" size="sm" /> Farmácias sob responsabilidade
                  </h2>
                  <Link to="/farmacias" className="text-[11px] text-primary hover:underline">Ver todas</Link>
                </div>
                {loading ? (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {farmacias.map((f) => (
                      <div key={f.id} className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-primary/40">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-2.5">
                            <IconTile icon={Building2} tone="primary" size="sm" />
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold">{f.nome}</div>
                              <div className="mt-0.5 text-[11px] text-muted-foreground">{f.cidade}</div>
                            </div>
                          </div>
                          <span className={cn("rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold", slaCls(f.sla))}>
                            {f.sla.toFixed(1)}%
                          </span>
                        </div>

                        <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-background/40 p-2.5">
                          <div className="relative">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-[11px] font-semibold text-primary-foreground">
                              {f.liderIniciais}
                            </div>
                            <StatusDot status={f.liderStatus} pulse={f.liderStatus === "online"} className="absolute -bottom-0.5 -right-0.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-medium">{f.liderNome}</div>
                            <div className="text-[10px] text-subtle-foreground">Líder responsável</div>
                          </div>
                          <Link to={`/lideres/${f.liderId}`} className="rounded border border-border bg-card px-2 py-1 text-[10px] hover:bg-surface-elevated">
                            Abrir
                          </Link>
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-3 border-t border-border pt-3">
                          <div>
                            <div className="font-mono text-sm font-semibold">{f.entregadoresAtivos}/{f.entregadoresTotal}</div>
                            <div className="text-[10px] text-subtle-foreground">Entregadores</div>
                          </div>
                          <div>
                            <div className="font-mono text-sm font-semibold">{f.filaChats}</div>
                            <div className="text-[10px] text-subtle-foreground">Fila chats</div>
                          </div>
                          <div>
                            <div className={cn("font-mono text-sm font-semibold", f.pedidosPendentes > 15 && "text-destructive")}>{f.pedidosPendentes}</div>
                            <div className="text-[10px] text-subtle-foreground">Pedidos pend.</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <aside className="space-y-4">
                <AlertasPanel alertas={alertas} loading={loading} />
                <NotificacoesPanel notificacoes={notificacoes} onOpenTarefa={abrirTarefaPorId} />
                <div className="rounded-xl border border-border bg-surface p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <IconTile icon={ChevronRight} tone="primary" size="sm" /> Ações rápidas
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { to: "/lider/diarias", label: "Diárias", icon: CalendarCheck, tone: "primary" as const },
                      { to: "/lider/faltas", label: "Faltas", icon: UserX, tone: "destructive" as const },
                      { to: "/lider/pre-cadastro", label: "Pré-cadastro", icon: UserPlus, tone: "success" as const },
                      { to: "/lider/chat", label: "Chat", icon: MessageCircle, tone: "warning" as const },
                    ].map((q) => (
                      <Link key={q.to} to={q.to} className="group flex items-center justify-between rounded-lg border border-border bg-background/40 p-2.5 hover:border-primary/40">
                        <span className="flex items-center gap-2 text-xs">
                          <IconTile icon={q.icon} tone={q.tone} size="sm" /> {q.label}
                        </span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
                      </Link>
                    ))}
                  </div>
                </div>
              </aside>
            </div>

            {/* Compliance */}
            <section className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <IconTile icon={ShieldCheck} tone="success" size="sm" /> Compliance documental dos entregadores
                </h2>
                <span className="text-[11px] text-muted-foreground">{compliance.length} entregadores ativos</span>
              </div>

              <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
                  : complianceStats.map((s) => (
                    <div key={s.label} className="rounded-xl border border-border bg-surface p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <IconTile icon={s.icon} tone={s.tone} />
                          <div>
                            <div className="text-[11px] text-muted-foreground">{s.label}</div>
                            <div className="font-mono text-lg font-semibold tracking-tight">{s.ok}<span className="text-muted-foreground">/{s.total}</span></div>
                          </div>
                        </div>
                        <div className={cn("rounded-md px-2 py-0.5 font-mono text-xs font-semibold", s.pct >= 90 ? "bg-success/15 text-success" : s.pct >= 70 ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive")}>
                          {s.pct}%
                        </div>
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className={cn("h-full transition-all", s.pct >= 90 ? "bg-success" : s.pct >= 70 ? "bg-warning" : "bg-destructive")} style={{ width: `${s.pct}%` }} />
                      </div>
                    </div>
                  ))}
              </div>

              <div className="overflow-hidden rounded-xl border border-border bg-surface">
                <div className="max-h-[320px] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-background/80 backdrop-blur text-[10px] uppercase tracking-wider text-subtle-foreground">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Entregador</th>
                        <th className="px-2 py-2 text-left font-medium">Farmácia</th>
                        <th className="px-2 py-2 text-center font-medium">Cert. digital</th>
                        <th className="px-2 py-2 text-center font-medium">MEI</th>
                        <th className="px-4 py-2 text-center font-medium">Matrícula</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compliance.map((c) => (
                        <tr key={c.id} className="border-t border-border hover:bg-background/40">
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-primary text-[10px] font-semibold text-primary-foreground">{c.iniciais}</div>
                              <span className="font-medium">{c.nome}</span>
                            </div>
                          </td>
                          <td className="px-2 py-2 text-muted-foreground">{c.farmacia}</td>
                          <td className="px-2 py-2 text-center"><ComplianceBadge ok={c.certificadoDigital} label={c.certificadoDigital ? "Sim" : "Não"} /></td>
                          <td className="px-2 py-2 text-center"><ComplianceBadge ok={c.mei} label={c.mei ? "Sim" : "Não"} /></td>
                          <td className="px-4 py-2 text-center"><ComplianceBadge ok={c.matricula} label={c.matricula ? "Sim" : "Não"} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Eventos do ciclo */}
            <section className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <IconTile icon={UserPlus} tone="info" size="sm" /> Entradas e desligamentos no ciclo
                </h2>
                <div className="flex items-center gap-1.5">
                  {(["todos", "entrada", "desligamento"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setEventoFiltro(t)}
                      className={cn(
                        "rounded-md border px-2 py-1 text-[11px] transition-colors",
                        eventoFiltro === t ? "border-primary/40 bg-primary/15 text-primary" : "border-border bg-background/40 text-muted-foreground",
                      )}
                    >
                      {t === "todos" ? "Todos" : t === "entrada" ? "Entradas" : "Desligamentos"}
                    </button>
                  ))}
                </div>
              </div>
              <CycleEventsTable eventos={eventos} loading={loading} filter={eventoFiltro} />
            </section>

            {/* Líderes + Entregadores */}
            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <section className="rounded-xl border border-border bg-surface">
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <IconTile icon={Users} tone="primary" size="sm" /> Líderes
                  </h3>
                  <Link to="/lideres" className="text-[11px] text-primary hover:underline">Ver tudo</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-background/40 text-[10px] uppercase tracking-wider text-subtle-foreground">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Líder</th>
                        <th className="px-2 py-2 text-left font-medium">Farmácia</th>
                        <th className="px-2 py-2 text-right font-medium">Equipe</th>
                        <th className="px-2 py-2 text-right font-medium">SLA</th>
                        <th className="px-2 py-2 text-right font-medium">CSAT</th>
                        <th className="px-4 py-2 text-right font-medium">Últ.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lideres.map((l) => (
                        <tr key={l.id + l.farmacia} className="border-t border-border hover:bg-background/40">
                          <td className="px-4 py-2">
                            <Link to={`/lideres/${l.id}`} className="flex items-center gap-2 hover:text-primary">
                              <div className="relative">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-primary text-[10px] font-semibold text-primary-foreground">{l.iniciais}</div>
                                <StatusDot status={l.status} pulse={l.status === "online"} className="absolute -bottom-0.5 -right-0.5" />
                              </div>
                              <span className="font-medium">{l.nome}</span>
                            </Link>
                          </td>
                          <td className="px-2 py-2 text-muted-foreground">{l.farmacia}</td>
                          <td className="px-2 py-2 text-right font-mono">{l.equipe}</td>
                          <td className={cn("px-2 py-2 text-right font-mono", l.sla >= 95 ? "text-success" : l.sla >= 88 ? "text-warning" : "text-destructive")}>{l.sla.toFixed(1)}%</td>
                          <td className="px-2 py-2 text-right font-mono">{l.csat}</td>
                          <td className="px-4 py-2 text-right text-[10px] text-subtle-foreground">{l.ultimaAtividade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="rounded-xl border border-border bg-surface">
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <IconTile icon={Truck} tone="warning" size="sm" /> Entregadores
                  </h3>
                  <Link to="/entregadores" className="text-[11px] text-primary hover:underline">Ver tudo</Link>
                </div>
                <div className="flex flex-wrap gap-1.5 border-b border-border px-5 py-3">
                  <button
                    onClick={() => setStatusFiltro("todos")}
                    className={cn(
                      "rounded-md border px-2 py-1 text-[11px] transition-colors",
                      statusFiltro === "todos" ? "border-primary/40 bg-primary/15 text-primary" : "border-border bg-background/40 text-muted-foreground",
                    )}
                  >
                    Todos · {entregadores.length}
                  </button>
                  {(Object.keys(statusEntregadorMeta) as EntregadorStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFiltro(s)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] transition-colors",
                        statusFiltro === s ? statusEntregadorMeta[s].cls : "border-border bg-background/40 text-muted-foreground",
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", statusEntregadorMeta[s].dot)} />
                      {statusEntregadorMeta[s].label} · {contagemPorStatus[s]}
                    </button>
                  ))}
                </div>
                <div className="max-h-[420px] overflow-y-auto">
                  {entregadoresFiltrados.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground">Nenhum entregador neste status.</div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {entregadoresFiltrados.map((e) => (
                        <li key={e.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-background/40">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-primary text-[10px] font-semibold text-primary-foreground">{e.iniciais}</div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-medium">{e.nome}</div>
                            <div className="text-[10px] text-subtle-foreground">{e.farmacia}</div>
                          </div>
                          <span className={cn("rounded border px-1.5 py-0.5 text-[10px]", statusEntregadorMeta[e.status].cls)}>
                            {statusEntregadorMeta[e.status].label}
                          </span>
                          <div className="w-12 text-right">
                            <div className="font-mono text-xs">{e.pedidosHoje}</div>
                            <div className="text-[9px] text-subtle-foreground">{e.ultimoPing}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-border bg-surface p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <IconTile icon={TrendingUp} tone="primary" size="sm" /> Volume de pedidos por hora
                </h3>
                <div className="h-52">
                  {charts && (
                    <ResponsiveContainer>
                      <LineChart data={charts.volumePorHora}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="hora" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                        <Line type="monotone" dataKey="pedidos" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <IconTile icon={FileCheck2} tone="success" size="sm" /> SLA por farmácia
                </h3>
                <div className="h-52">
                  {charts && (
                    <ResponsiveContainer>
                      <BarChart data={charts.slaPorFarmacia} layout="vertical" margin={{ left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                        <XAxis type="number" domain={[70, 100]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                        <YAxis type="category" dataKey="farmacia" stroke="hsl(var(--muted-foreground))" fontSize={10} width={80} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                        <Bar dataKey="sla" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <IconTile icon={CalendarCheck} tone="warning" size="sm" /> Diárias vs Faltas · semana
                </h3>
                <div className="h-52">
                  {charts && (
                    <ResponsiveContainer>
                      <BarChart data={charts.faltasVsDiarias}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="dia" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="diarias" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="faltas" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* === ATENDENTE GERAL === */}
        {perfil === "atendente_geral" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TaskBoard
                tarefas={tarefas} loading={loading} onOpen={setTarefaAtiva}
                mostraFinalizadas={mostraFinalizadas} onToggleFinalizadas={setMostraFinalizadas}
              />
            </div>
            <aside className="space-y-4">
              <AlertasPanel alertas={alertas.filter((a) => !a.setor || a.setor === "atendimento_geral" || a.setor === "operacao")} loading={loading} />
              <NotificacoesPanel notificacoes={notificacoes} onOpenTarefa={abrirTarefaPorId} />
            </aside>
          </div>
        )}

        {/* === ATENDENTE FINANCEIRO === */}
        {perfil === "atendente_financeiro" && (
          <>
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <TaskBoard
                  tarefas={tarefas} loading={loading} onOpen={setTarefaAtiva}
                  mostraFinalizadas={mostraFinalizadas} onToggleFinalizadas={setMostraFinalizadas}
                />
              </div>
              <aside className="space-y-4">
                <AlertasPanel alertas={alertas.filter((a) => !a.setor || a.setor === "financeiro")} loading={loading} />
                <NotificacoesPanel notificacoes={notificacoes} onOpenTarefa={abrirTarefaPorId} />
              </aside>
            </div>

            <section className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <IconTile icon={ArrowDownToLine} tone="info" size="sm" /> Entradas e desligamentos do ciclo
                </h2>
                <div className="flex items-center gap-1.5">
                  {(["todos", "entrada", "desligamento"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setEventoFiltro(t)}
                      className={cn(
                        "rounded-md border px-2 py-1 text-[11px] transition-colors",
                        eventoFiltro === t ? "border-primary/40 bg-primary/15 text-primary" : "border-border bg-background/40 text-muted-foreground",
                      )}
                    >
                      {t === "todos" ? "Todos" : t === "entrada" ? "Entradas" : "Desligamentos"}
                    </button>
                  ))}
                </div>
              </div>
              <CycleEventsTable eventos={eventos} loading={loading} filter={eventoFiltro} />
            </section>
          </>
        )}

        {/* === GESTOR FINANCEIRO === */}
        {perfil === "gestor_financeiro" && (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <AlertasPanel alertas={alertas.filter((a) => !a.setor || a.setor === "financeiro")} loading={loading} />
              <NotificacoesPanel notificacoes={notificacoes} />
              <div className="rounded-xl border border-border bg-surface p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <IconTile icon={Users} tone="primary" size="sm" /> Desempenho do setor
                </h3>
                <ul className="space-y-2 text-xs">
                  {[
                    { nome: "Helena Costa", iniciais: "HC", tarefas: 9, sla: 94 },
                    { nome: "Marcos Vinícius", iniciais: "MV", tarefas: 7, sla: 88 },
                    { nome: "Tatiane Reis", iniciais: "TR", tarefas: 5, sla: 91 },
                    { nome: "Renan Soares", iniciais: "RS", tarefas: 2, sla: 76 },
                  ].map((a) => (
                    <li key={a.nome} className="flex items-center gap-2 rounded-lg border border-border bg-background/40 p-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-primary text-[10px] font-semibold text-primary-foreground">{a.iniciais}</div>
                      <div className="flex-1 truncate">
                        <div className="truncate font-medium">{a.nome}</div>
                        <div className="text-[10px] text-muted-foreground">{a.tarefas} tarefas</div>
                      </div>
                      <span className={cn("rounded px-1.5 py-0.5 font-mono text-[10px]", a.sla >= 90 ? "bg-success/15 text-success" : a.sla >= 80 ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive")}>
                        {a.sla}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <TaskBoard
              tarefas={tarefas} loading={loading} onOpen={setTarefaAtiva}
              mostraFinalizadas={mostraFinalizadas} onToggleFinalizadas={setMostraFinalizadas}
            />

            <section className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <IconTile icon={ArrowDownToLine} tone="info" size="sm" /> Entradas e desligamentos do ciclo
                </h2>
              </div>
              <CycleEventsTable eventos={eventos} loading={loading} />
            </section>
          </>
        )}

        <TaskExecutionDialog
          tarefa={tarefaAtiva}
          open={!!tarefaAtiva}
          onOpenChange={(o) => { if (!o) setTarefaAtiva(null); }}
          onChanged={carregar}
        />
      </div>
    </div>
  );
};

export default Operacao;
