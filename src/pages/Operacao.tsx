import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity, Building2, Truck, AlertTriangle, RefreshCw, ChevronRight,
  MessageCircle, CalendarCheck, UserX, UserPlus, ArrowUpRight, ArrowDownRight,
  TrendingUp, Clock, Map as MapIcon, BellRing, ShieldCheck, BadgeCheck,
  FileSignature, FileCheck2, FileMinus2, IdCard, Briefcase, ClipboardList,
  CheckCircle2, Circle, Timer, Users, FilePlus2,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { OperationContextBar } from "@/components/OperationContextBar";
import { StatusDot } from "@/components/StatusDot";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { operacaoApi } from "@/lib/operacaoApi";
import type {
  FarmaciaOperacional, LiderResumo, EntregadorOperacional, AlertaOperacional, KpiOperacional, EntregadorStatus,
  ComplianceEntregador, TarefaAtendimento, NotificacaoPendencia, TarefaTipo, TarefaStatus,
} from "@/data/operacaoMock";

type Periodo = "hoje" | "7d" | "30d";

const periodos: { id: Periodo; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "7d", label: "7 dias" },
  { id: "30d", label: "30 dias" },
];

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

// Premium icon tile — substitui ícones "soltos" por chips arredondados com cor temática
const IconTile = ({
  icon: Icon, tone = "primary", size = "md",
}: {
  icon: any;
  tone?: "primary" | "success" | "warning" | "destructive" | "muted";
  size?: "sm" | "md" | "lg";
}) => {
  const toneCls = {
    primary: "bg-primary/15 text-primary ring-primary/20",
    success: "bg-success/15 text-success ring-success/20",
    warning: "bg-warning/15 text-warning ring-warning/20",
    destructive: "bg-destructive/15 text-destructive ring-destructive/20",
    muted: "bg-muted text-muted-foreground ring-border",
  }[tone];
  const sizeCls = { sm: "h-7 w-7 rounded-md", md: "h-9 w-9 rounded-lg", lg: "h-11 w-11 rounded-xl" }[size];
  const iconSize = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" }[size];
  return (
    <div className={cn("flex items-center justify-center ring-1", sizeCls, toneCls)}>
      <Icon className={iconSize} strokeWidth={1.75} />
    </div>
  );
};

// Sparkline minimalista em SVG (sem libs)
const Spark = ({ data, color = "hsl(var(--primary))" }: { data: number[]; color?: string }) => {
  const w = 80, h = 24;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// Pílula sim/não usada na grade de compliance
const ComplianceBadge = ({ ok, label }: { ok: boolean; label: string }) => (
  <span className={cn(
    "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
    ok ? "bg-success/10 text-success border-success/30" : "bg-destructive/10 text-destructive border-destructive/30",
  )}>
    {ok ? <CheckCircle2 className="h-3 w-3" strokeWidth={2} /> : <Circle className="h-3 w-3" strokeWidth={2} />}
    {label}
  </span>
);

const tarefaMeta: Record<TarefaTipo, { label: string; icon: any; tone: "primary" | "warning" | "destructive" }> = {
  finalizar_cadastro: { label: "Finalizar cadastro", icon: FilePlus2, tone: "primary" },
  gerar_matricula: { label: "Gerar matrícula", icon: IdCard, tone: "warning" },
  gerar_termo_desligamento: { label: "Termo de desligamento", icon: FileMinus2, tone: "destructive" },
};

const tarefaStatusMeta: Record<TarefaStatus, { label: string; cls: string }> = {
  em_andamento: { label: "Em andamento", cls: "bg-primary/15 text-primary border-primary/30" },
  atrasada: { label: "Atrasada", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  concluida: { label: "Concluída", cls: "bg-success/15 text-success border-success/30" },
  aguardando: { label: "Aguardando atendente", cls: "bg-warning/15 text-warning border-warning/30" },
};

const fmtMin = (m: number) => m >= 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}` : `${m}min`;

const Operacao = () => {
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
  const [statusFiltro, setStatusFiltro] = useState<EntregadorStatus | "todos">("todos");
  const [tarefaFiltro, setTarefaFiltro] = useState<TarefaTipo | "todas">("todas");
  const [refreshedAt, setRefreshedAt] = useState<string>(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));

  const carregar = async () => {
    setLoading(true);
    const [k, f, l, e, a, c, comp, ts, ns] = await Promise.all([
      operacaoApi.listKpis(), operacaoApi.listFarmacias(), operacaoApi.listLideres(),
      operacaoApi.listEntregadores(), operacaoApi.listAlertas(), operacaoApi.charts(),
      operacaoApi.listCompliance(), operacaoApi.listTarefas(), operacaoApi.listNotificacoes(),
    ]);
    setKpis(k); setFarmacias(f); setLideres(l); setEntregadores(e); setAlertas(a); setCharts(c);
    setCompliance(comp); setTarefas(ts); setNotificacoes(ns);
    setRefreshedAt(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    setLoading(false);
  };

  useEffect(() => { carregar(); }, [periodo]);

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

  // === Compliance agregados ===
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

  const tarefasFiltradas = useMemo(
    () => tarefaFiltro === "todas" ? tarefas : tarefas.filter((t) => t.tipo === tarefaFiltro),
    [tarefas, tarefaFiltro],
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <PageHeader
          live
          icon={Activity}
          eyebrow="Operação"
          title="Painel Operacional"
          description="Visão consolidada das farmácias sob sua responsabilidade — líderes, entregadores, compliance e fila de atendimento."
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

        <OperationContextBar breadcrumb={[`${farmacias.length || 4} farmácias`, "turno atual"]} />

        {/* KPIs */}
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

        {/* Farmácias + Alertas */}
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

          {/* Coluna B: Alertas + Notificações + Ações */}
          <aside className="space-y-4">
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
                <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
              ) : (
                <ul className="space-y-2">
                  {alertas.map((a) => (
                    <li key={a.id} className="rounded-lg border border-border bg-background/40 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider", nivelCls[a.nivel])}>
                            {a.tipo}
                          </span>
                          <div className="mt-1 text-xs">{a.descricao}</div>
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-subtle-foreground">
                            <Building2 className="h-3 w-3" strokeWidth={1.75} /> {a.farmacia}
                            <Clock className="ml-1 h-3 w-3" strokeWidth={1.75} /> {a.timestamp}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Notificações de pendência de assinatura */}
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <IconTile icon={FileSignature} tone="destructive" size="sm" /> Pendências de assinatura
                </h3>
                <span className="rounded bg-warning/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-warning">
                  {notificacoes.length}
                </span>
              </div>
              {loading ? (
                <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
              ) : notificacoes.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">Sem pendências.</div>
              ) : (
                <ul className="space-y-2">
                  {notificacoes.map((n) => {
                    const atrasada = n.diasPendente > n.prazoDias;
                    const pct = Math.min(100, Math.round((n.diasPendente / n.prazoDias) * 100));
                    return (
                      <li key={n.id} className={cn("rounded-lg border bg-background/40 p-3", atrasada ? "border-destructive/40" : "border-border")}>
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-primary text-[10px] font-semibold text-primary-foreground">
                            {n.entregadorIniciais}
                          </div>
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
                          <span className="flex items-center gap-1">
                            <Timer className="h-3 w-3" strokeWidth={1.75} />
                            {n.diasPendente}/{n.prazoDias} dias
                          </span>
                          <span className={atrasada ? "text-destructive font-medium" : ""}>
                            {atrasada ? "SLA estourado" : "No prazo"}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn("h-full transition-all", atrasada ? "bg-destructive" : "bg-warning")}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

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

        {/* === COMPLIANCE DOCUMENTAL === */}
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
                  {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}><td colSpan={5} className="p-2"><Skeleton className="h-8 rounded" /></td></tr>
                    ))
                    : compliance.map((c) => (
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

        {/* === TAREFAS — ATENDIMENTO GERAL === */}
        <section className="mb-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <IconTile icon={ClipboardList} tone="primary" size="sm" /> Tarefas · Fila Atendimento Geral
            </h2>
            <div className="flex items-center gap-1.5">
              {(["todas", "finalizar_cadastro", "gerar_matricula", "gerar_termo_desligamento"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTarefaFiltro(t)}
                  className={cn(
                    "rounded-md border px-2 py-1 text-[11px] transition-colors",
                    tarefaFiltro === t ? "border-primary/40 bg-primary/15 text-primary" : "border-border bg-background/40 text-muted-foreground",
                  )}
                >
                  {t === "todas" ? `Todas · ${tarefas.length}` : tarefaMeta[t].label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
            </div>
          ) : tarefasFiltradas.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface/50 p-10 text-center text-sm text-muted-foreground">
              Nenhuma tarefa neste filtro.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {tarefasFiltradas.map((t) => {
                const meta = tarefaMeta[t.tipo];
                const pct = Math.min(100, Math.round((t.decorridoMinutos / t.slaMinutos) * 100));
                const checkPct = Math.round((t.checklist.filter((c) => c.done).length / t.checklist.length) * 100);
                const slaCor = t.status === "concluida" ? "bg-success" : pct >= 100 ? "bg-destructive" : pct >= 75 ? "bg-warning" : "bg-primary";
                return (
                  <div key={t.id} className={cn(
                    "rounded-xl border bg-surface p-5",
                    t.status === "atrasada" ? "border-destructive/40" : "border-border",
                  )}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <IconTile icon={meta.icon} tone={meta.tone} />
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{meta.label}</div>
                          <div className="truncate text-sm font-semibold">{t.entregadorNome}</div>
                          <div className="text-[11px] text-muted-foreground">{t.farmacia}</div>
                        </div>
                      </div>
                      <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-medium", tarefaStatusMeta[t.status].cls)}>
                        {tarefaStatusMeta[t.status].label}
                      </span>
                    </div>

                    {/* Checklist */}
                    <div className="mt-4">
                      <div className="mb-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Checklist · {t.checklist.filter((c) => c.done).length}/{t.checklist.length}</span>
                        <span className="font-mono">{checkPct}%</span>
                      </div>
                      <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-primary transition-all" style={{ width: `${checkPct}%` }} />
                      </div>
                      <ul className="space-y-1">
                        {t.checklist.map((c, i) => (
                          <li key={i} className="flex items-center gap-2 text-[11px]">
                            {c.done
                              ? <CheckCircle2 className="h-3.5 w-3.5 text-success" strokeWidth={2} />
                              : <Circle className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />}
                            <span className={cn(c.done && "text-muted-foreground line-through")}>{c.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* SLA + prazo */}
                    <div className="mt-4 border-t border-border pt-3">
                      <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Timer className="h-3 w-3" strokeWidth={1.75} /> SLA {fmtMin(t.decorridoMinutos)} / {fmtMin(t.slaMinutos)}</span>
                        <span className={cn("font-mono", pct >= 100 ? "text-destructive font-medium" : "")}>{pct}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className={cn("h-full transition-all", slaCor)} style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="h-3 w-3" strokeWidth={1.75} />
                          Atendente <span className="font-medium text-foreground">{t.atendenteNome}</span>
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" strokeWidth={1.75} /> Prazo: {t.prazo}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                  {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i}><td colSpan={6} className="p-2"><Skeleton className="h-8 rounded" /></td></tr>
                      ))
                    : lideres.map((l) => (
                        <tr key={l.id + l.farmacia} className="border-t border-border hover:bg-background/40">
                          <td className="px-4 py-2">
                            <Link to={`/lideres/${l.id}`} className="flex items-center gap-2 hover:text-primary">
                              <div className="relative">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-primary text-[10px] font-semibold text-primary-foreground">
                                  {l.iniciais}
                                </div>
                                <StatusDot status={l.status} pulse={l.status === "online"} className="absolute -bottom-0.5 -right-0.5" />
                              </div>
                              <span className="font-medium">{l.nome}</span>
                            </Link>
                          </td>
                          <td className="px-2 py-2 text-muted-foreground">{l.farmacia}</td>
                          <td className="px-2 py-2 text-right font-mono">{l.equipe}</td>
                          <td className={cn("px-2 py-2 text-right font-mono", l.sla >= 95 ? "text-success" : l.sla >= 88 ? "text-warning" : "text-destructive")}>
                            {l.sla.toFixed(1)}%
                          </td>
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
              {loading ? (
                <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}</div>
              ) : entregadoresFiltrados.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">Nenhum entregador neste status.</div>
              ) : (
                <ul className="divide-y divide-border">
                  {entregadoresFiltrados.map((e) => (
                    <li key={e.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-background/40">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-primary text-[10px] font-semibold text-primary-foreground">
                        {e.iniciais}
                      </div>
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

        {/* Mapa placeholder */}
        <div className="mb-6 flex items-center justify-between rounded-xl border border-dashed border-border bg-surface/50 p-5">
          <div className="flex items-center gap-3">
            <IconTile icon={MapIcon} tone="muted" />
            <div>
              <div className="text-sm font-medium">Mapa de entregadores em tempo real</div>
              <div className="text-[11px] text-muted-foreground">Disponível em uma próxima iteração — integração com Mapbox.</div>
            </div>
          </div>
          <span className="rounded bg-warning/15 px-2 py-1 text-[10px] font-medium text-warning">Em breve</span>
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
      </div>
    </div>
  );
};

export default Operacao;
