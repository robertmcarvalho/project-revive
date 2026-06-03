import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity, Building2, Truck, AlertTriangle, RefreshCw, ChevronRight,
  MessageCircle, CalendarCheck, UserX, UserPlus, ArrowUpRight, ArrowDownRight,
  TrendingUp, Clock, Map as MapIcon, Bell,
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

const Operacao = () => {
  const [periodo, setPeriodo] = useState<Periodo>("hoje");
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KpiOperacional[]>([]);
  const [farmacias, setFarmacias] = useState<FarmaciaOperacional[]>([]);
  const [lideres, setLideres] = useState<LiderResumo[]>([]);
  const [entregadores, setEntregadores] = useState<EntregadorOperacional[]>([]);
  const [alertas, setAlertas] = useState<AlertaOperacional[]>([]);
  const [charts, setCharts] = useState<{ volumePorHora: any[]; slaPorFarmacia: any[]; faltasVsDiarias: any[] } | null>(null);
  const [statusFiltro, setStatusFiltro] = useState<EntregadorStatus | "todos">("todos");
  const [refreshedAt, setRefreshedAt] = useState<string>(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));

  const carregar = async () => {
    setLoading(true);
    const [k, f, l, e, a, c] = await Promise.all([
      operacaoApi.listKpis(), operacaoApi.listFarmacias(), operacaoApi.listLideres(),
      operacaoApi.listEntregadores(), operacaoApi.listAlertas(), operacaoApi.charts(),
    ]);
    setKpis(k); setFarmacias(f); setLideres(l); setEntregadores(e); setAlertas(a); setCharts(c);
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

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <PageHeader
          live
          icon={Activity}
          eyebrow="Operação"
          title="Painel Operacional"
          description="Visão consolidada das farmácias sob sua responsabilidade — líderes, entregadores e SLA em tempo real."
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
                <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} /> {refreshedAt}
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
                    {k.alerta && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
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
                      {k.deltaTipo === "up" && <ArrowUpRight className="h-3 w-3" />}
                      {k.deltaTipo === "down" && <ArrowDownRight className="h-3 w-3" />}
                      {k.delta}
                    </div>
                  )}
                </div>
              ))}
        </div>

        {/* Farmácias + Alertas */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Coluna A */}
          <section className="lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Farmácias sob responsabilidade</h2>
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
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div className="truncate text-sm font-semibold">{f.nome}</div>
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">{f.cidade}</div>
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

          {/* Coluna B: Alertas + Ações */}
          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Bell className="h-4 w-4 text-warning" /> Alertas
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
                    <li key={a.id} className={cn("rounded-lg border bg-background/40 p-3", nivelCls[a.nivel].split(" ").slice(-1)[0])}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider", nivelCls[a.nivel])}>
                              {a.tipo}
                            </span>
                          </div>
                          <div className="mt-1 text-xs">{a.descricao}</div>
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-subtle-foreground">
                            <Building2 className="h-3 w-3" /> {a.farmacia}
                            <Clock className="ml-1 h-3 w-3" /> {a.timestamp}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-3 text-sm font-semibold">Ações rápidas</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { to: "/lider/diarias", label: "Diárias", icon: CalendarCheck },
                  { to: "/lider/faltas", label: "Faltas", icon: UserX },
                  { to: "/lider/pre-cadastro", label: "Pré-cadastro", icon: UserPlus },
                  { to: "/lider/chat", label: "Chat", icon: MessageCircle },
                ].map((q) => (
                  <Link key={q.to} to={q.to} className="group flex items-center justify-between rounded-lg border border-border bg-background/40 p-2.5 hover:border-primary/40">
                    <span className="flex items-center gap-2 text-xs">
                      <q.icon className="h-3.5 w-3.5 text-primary" /> {q.label}
                    </span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Líderes + Entregadores */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Líderes */}
          <section className="rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h3 className="text-sm font-semibold">Líderes</h3>
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

          {/* Entregadores */}
          <section className="rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Truck className="h-4 w-4" /> Entregadores
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
            <MapIcon className="h-5 w-5 text-muted-foreground" />
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
              <TrendingUp className="h-4 w-4 text-primary" /> Volume de pedidos por hora
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
            <h3 className="mb-3 text-sm font-semibold">SLA por farmácia</h3>
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
            <h3 className="mb-3 text-sm font-semibold">Diárias vs Faltas · semana</h3>
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
