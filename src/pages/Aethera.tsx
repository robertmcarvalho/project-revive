import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowUpRight, Bot, CheckCircle2, Circle, Clock,
  Filter, MapPin, MessageSquare, Plus, Radio, Search, Sparkles, Ticket, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Mock data ---------- */
const kpis = [
  { label: "Operações ativas", value: "142", delta: "+8", icon: Activity, tone: "text-[hsl(190_90%_55%)]" },
  { label: "Tickets abertos", value: "27", delta: "-3", icon: Ticket, tone: "text-warning" },
  { label: "SLA crítico", value: "4", delta: "+1", icon: AlertTriangle, tone: "text-destructive" },
  { label: "Entregadores online", value: "318 / 412", delta: "+12", icon: Radio, tone: "text-success" },
];

const opsRegions = [
  { name: "Zona Sul", x: 22, y: 68, active: 48, alert: 1 },
  { name: "Centro", x: 44, y: 52, active: 62, alert: 0 },
  { name: "Zona Norte", x: 58, y: 30, active: 39, alert: 2 },
  { name: "Zona Oeste", x: 16, y: 38, active: 27, alert: 0 },
  { name: "Zona Leste", x: 78, y: 58, active: 51, alert: 1 },
  { name: "ABC", x: 38, y: 82, active: 33, alert: 0 },
];

type Severity = "low" | "med" | "high" | "critical";
const tickets: { id: string; titulo: string; setor: string; sev: Severity; sla: string; agente: string; status: string }[] = [
  { id: "AET-2841", titulo: "Entregador sem bag — região Centro", setor: "Operação", sev: "critical", sla: "00:08", agente: "Marina S.", status: "Em ação" },
  { id: "AET-2840", titulo: "Cliente farmácia cobrando reembolso de taxa", setor: "Financeiro", sev: "high", sla: "00:42", agente: "Lucas A.", status: "Aguardando" },
  { id: "AET-2839", titulo: "Certificado digital MEI expirado (3 entregadores)", setor: "Contábil", sev: "med", sla: "02:10", agente: "Carla M.", status: "Em ação" },
  { id: "AET-2838", titulo: "Líder com 4 faltas pendentes de validação", setor: "Operação", sev: "med", sla: "03:00", agente: "—", status: "Novo" },
  { id: "AET-2837", titulo: "Webhook de pagamento falhou (Pix)", setor: "Tecnologia", sev: "high", sla: "00:23", agente: "Rafael P.", status: "Em ação" },
  { id: "AET-2836", titulo: "Solicitar nova bag — Líder Zona Norte", setor: "Suprimentos", sev: "low", sla: "12:00", agente: "—", status: "Novo" },
];

const sevStyle: Record<Severity, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-warning/15 text-warning border-warning/30",
  med: "bg-[hsl(190_90%_55%/.12)] text-[hsl(190_90%_60%)] border-[hsl(190_90%_55%/.3)]",
  low: "bg-muted text-muted-foreground border-border",
};
const sevLabel: Record<Severity, string> = { critical: "Crítico", high: "Alto", med: "Médio", low: "Baixo" };

const queues = [
  { tag: "WhatsApp · Operação", count: 18, color: "text-channel-whatsapp" },
  { tag: "WhatsApp · Financeiro", count: 7, color: "text-channel-whatsapp" },
  { tag: "Instagram · SAC", count: 4, color: "text-channel-instagram" },
  { tag: "E-mail · Contábil", count: 11, color: "text-channel-email" },
  { tag: "Webchat · Suporte TI", count: 2, color: "text-channel-webchat" },
  { tag: "Telegram · Líderes", count: 9, color: "text-channel-telegram" },
];

const stream = [
  { t: "agora", txt: "IA roteou ticket AET-2841 para Operação · Centro", icon: Bot, tone: "text-[hsl(190_90%_60%)]" },
  { t: "12s", txt: "Líder Zona Norte lançou 3 diárias", icon: CheckCircle2, tone: "text-success" },
  { t: "48s", txt: "Falta validada · Entregador João P.", icon: CheckCircle2, tone: "text-success" },
  { t: "1m", txt: "SLA crítico em AET-2837 (Pix)", icon: AlertTriangle, tone: "text-destructive" },
  { t: "2m", txt: "Pagamento processado · ciclo 21/05", icon: Zap, tone: "text-warning" },
  { t: "3m", txt: "Nova solicitação de uniforme · Zona Sul", icon: Plus, tone: "text-muted-foreground" },
];

const insights = [
  { titulo: "Pico previsto às 18h", desc: "Centro e Zona Leste devem ultrapassar capacidade em ~14%.", action: "Sugerir cobertura" },
  { titulo: "3 entregadores com MEI vencendo em 7 dias", desc: "Disparar fluxo de renovação automática.", action: "Acionar contábil" },
  { titulo: "Taxa de resolução IA: 73%", desc: "Subiu 6pp na semana. Sugira mais respostas no Copiloto.", action: "Abrir Copiloto" },
];

/* ---------- Subcomponents ---------- */
const Kpi = ({ k }: { k: (typeof kpis)[number] }) => (
  <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-all hover:border-border-strong">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(190_90%_55%/.4)] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    <div className="flex items-start justify-between">
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</div>
        <div className="mt-2 font-mono text-3xl font-semibold tracking-tight">{k.value}</div>
      </div>
      <div className={cn("rounded-lg border border-border bg-background/40 p-2", k.tone)}>
        <k.icon className="h-4 w-4" />
      </div>
    </div>
    <div className="mt-3 flex items-center gap-1.5 text-xs">
      <ArrowUpRight className="h-3 w-3 text-success" />
      <span className="font-mono text-success">{k.delta}</span>
      <span className="text-muted-foreground">vs ontem</span>
    </div>
  </div>
);

const OpsMap = () => {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="relative h-full min-h-[320px] overflow-hidden rounded-xl border border-border bg-[hsl(220_30%_6%)]">
      {/* grid */}
      <svg className="absolute inset-0 h-full w-full opacity-30" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="g" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="hsl(190 50% 30% / .3)" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="glow">
            <stop offset="0%" stopColor="hsl(190 90% 55% / .25)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)" />
        <rect width="100%" height="100%" fill="url(#glow)" />
      </svg>

      {/* pings */}
      <div className="absolute inset-0">
        {opsRegions.map((r, i) => (
          <button
            key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{ left: `${r.x}%`, top: `${r.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <span className={cn(
              "absolute inset-0 -m-3 animate-ping rounded-full",
              r.alert > 0 ? "bg-destructive/30" : "bg-[hsl(190_90%_55%/.3)]"
            )} />
            <span className={cn(
              "relative block h-3 w-3 rounded-full ring-2 ring-background",
              r.alert > 0 ? "bg-destructive" : "bg-[hsl(190_90%_55%)]"
            )} />
            {hover === i && (
              <div className="absolute left-4 top-4 z-10 whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-elevated">
                <div className="font-medium">{r.name}</div>
                <div className="font-mono text-muted-foreground">{r.active} ativos · {r.alert} alerta(s)</div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* footer */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-border bg-background/60 px-4 py-2 backdrop-blur">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Radio className="h-3 w-3 text-[hsl(190_90%_55%)]" />
          <span>Tempo real · atualizado há 2s</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[hsl(190_90%_55%)]" />Normal</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive" />Alerta</span>
        </div>
      </div>
    </div>
  );
};

/* ---------- Page ---------- */
export default function Aethera() {
  const [filterSev, setFilterSev] = useState<Severity | "all">("all");
  const filtered = useMemo(
    () => (filterSev === "all" ? tickets : tickets.filter((t) => t.sev === filterSev)),
    [filterSev]
  );

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Brand header */}
      <header className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(800px_circle_at_20%_0%,hsl(190_90%_55%/.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_80%_100%,hsl(175_80%_45%/.08),transparent_60%)]" />
        <div className="relative flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[hsl(190_90%_55%/.3)] bg-gradient-to-br from-[hsl(190_90%_55%/.2)] to-[hsl(175_80%_45%/.1)]">
              <Sparkles className="h-5 w-5 text-[hsl(190_90%_60%)]" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-2xl font-semibold tracking-tightest">Aethera</h1>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[hsl(190_90%_60%)]">Central de Comando</span>
              </div>
              <p className="text-xs text-muted-foreground">Suporte inteligente. Gestão eficiente. Resultados reais.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <span className="text-muted-foreground">Operação</span>
              <span className="font-mono">ONLINE</span>
            </div>
            <button className="flex items-center gap-1.5 rounded-md border border-[hsl(190_90%_55%/.3)] bg-[hsl(190_90%_55%/.1)] px-3 py-1.5 text-xs font-medium text-[hsl(190_90%_65%)] transition-colors hover:bg-[hsl(190_90%_55%/.2)]">
              <Plus className="h-3.5 w-3.5" /> Novo ticket
            </button>
          </div>
        </div>
      </header>

      <div className="space-y-4 p-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((k) => <Kpi key={k.label} k={k} />)}
        </div>

        {/* Mapa + Stream */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[hsl(190_90%_60%)]" />
                <h2 className="text-sm font-semibold">Mapa Operacional</h2>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">6 regiões · 260 ativos</span>
            </div>
            <OpsMap />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[hsl(190_90%_60%)]" />
                <h2 className="text-sm font-semibold">Stream operacional</h2>
              </div>
              <Circle className="h-2 w-2 animate-pulse fill-success text-success" />
            </div>
            <div className="h-full overflow-hidden rounded-xl border border-border bg-card">
              <div className="divide-y divide-border">
                {stream.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 px-3 py-2.5 text-xs transition-colors hover:bg-surface-hover">
                    <s.icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", s.tone)} />
                    <div className="min-w-0 flex-1">
                      <div className="text-foreground/90">{s.txt}</div>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">{s.t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tickets */}
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-[hsl(190_90%_60%)]" />
              <h2 className="text-sm font-semibold">Tickets · roteamento inteligente</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Buscar ticket..."
                  className="h-7 w-48 rounded-md border border-border bg-card pl-7 pr-2 text-xs outline-none focus:border-[hsl(190_90%_55%/.5)]"
                />
              </div>
              <div className="flex items-center gap-1 rounded-md border border-border bg-card p-0.5">
                <Filter className="ml-1.5 h-3 w-3 text-muted-foreground" />
                {(["all", "critical", "high", "med", "low"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterSev(s)}
                    className={cn(
                      "rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider transition-colors",
                      filterSev === s ? "bg-[hsl(190_90%_55%/.15)] text-[hsl(190_90%_65%)]" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s === "all" ? "Todos" : sevLabel[s as Severity]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 py-2 text-left font-medium">ID</th>
                  <th className="px-3 py-2 text-left font-medium">Título</th>
                  <th className="px-3 py-2 text-left font-medium">Setor</th>
                  <th className="px-3 py-2 text-left font-medium">Severidade</th>
                  <th className="px-3 py-2 text-left font-medium">SLA</th>
                  <th className="px-3 py-2 text-left font-medium">Agente</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-hover">
                    <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{t.id}</td>
                    <td className="px-3 py-2.5 font-medium">{t.titulo}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{t.setor}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider", sevStyle[t.sev])}>
                        {sevLabel[t.sev]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn("flex items-center gap-1 font-mono text-xs", t.sla.startsWith("00:0") ? "text-destructive" : "text-muted-foreground")}>
                        <Clock className="h-3 w-3" />{t.sla}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs">{t.agente}</td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs text-muted-foreground">{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filas + Insights IA */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[hsl(190_90%_60%)]" />
              <h2 className="text-sm font-semibold">Filas e tags ativas</h2>
            </div>
            <div className="rounded-xl border border-border bg-card p-2">
              <div className="grid grid-cols-2 gap-1">
                {queues.map((q) => (
                  <button key={q.tag} className="flex items-center justify-between rounded-md px-2.5 py-2 text-left text-xs transition-colors hover:bg-surface-hover">
                    <span className="flex items-center gap-2">
                      <span className={cn("h-1.5 w-1.5 rounded-full", q.color.replace("text-", "bg-"))} />
                      <span className="text-foreground/90">{q.tag}</span>
                    </span>
                    <span className="font-mono text-muted-foreground">{q.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[hsl(190_90%_60%)]" />
              <h2 className="text-sm font-semibold">Insights IA · Aethera Copilot</h2>
            </div>
            <div className="space-y-2">
              {insights.map((i) => (
                <div key={i.titulo} className="group rounded-xl border border-border bg-card p-3 transition-colors hover:border-[hsl(190_90%_55%/.3)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{i.titulo}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{i.desc}</div>
                    </div>
                    <button className="shrink-0 rounded-md border border-border px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition-all group-hover:border-[hsl(190_90%_55%/.4)] group-hover:text-[hsl(190_90%_65%)]">
                      {i.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
