import { useSearchParams } from "react-router-dom";
import { ArrowDown, ArrowUp, MessageSquare, Clock, Users, CheckCircle2, TrendingUp, LayoutDashboard } from "lucide-react";
import { ChannelBadge, type Channel } from "@/components/ChannelBadge";
import { StatusDot } from "@/components/StatusDot";
import { PageHeader } from "@/components/PageHeader";
import { IconTile, type IconTileTone } from "@/components/IconTile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PresencaKpis } from "@/components/dashboard/PresencaKpis";
import { AtendentesStatusTable } from "@/components/dashboard/AtendentesStatusTable";
import { LoginHistoryTable } from "@/components/dashboard/LoginHistoryTable";
import { SessionProductivityTable } from "@/components/dashboard/SessionProductivityTable";
import { useCurrentUser } from "@/lib/workspace";
import { cn } from "@/lib/utils";

const kpis: { label: string; value: string; delta: number; up: boolean; icon: typeof MessageSquare; tone: IconTileTone }[] = [
  { label: "Conversas hoje", value: "247", delta: 12.4, up: true, icon: MessageSquare, tone: "primary" },
  { label: "Tempo médio resposta", value: "1m 42s", delta: 8.1, up: false, icon: Clock, tone: "success" },
  { label: "Taxa resolução", value: "94.2%", delta: 2.3, up: true, icon: CheckCircle2, tone: "info" },
  { label: "Agentes online", value: "18 / 24", delta: 0, up: true, icon: Users, tone: "warning" },
];

const channelStats: { ch: Channel; pct: number; count: number }[] = [
  { ch: "whatsapp", pct: 58, count: 143 },
  { ch: "instagram", pct: 18, count: 45 },
  { ch: "email", pct: 14, count: 35 },
  { ch: "webchat", pct: 7, count: 18 },
  { ch: "telegram", pct: 3, count: 6 },
];

const agents = [
  { name: "Marina Souza", initials: "MS", chats: 47, csat: 4.9, status: "online" as const },
  { name: "Lucas Andrade", initials: "LA", chats: 41, csat: 4.8, status: "online" as const },
  { name: "Carla Mendes", initials: "CM", chats: 38, csat: 4.9, status: "busy" as const },
  { name: "Rafael Pinto", initials: "RP", chats: 33, csat: 4.7, status: "online" as const },
  { name: "Beatriz Lima", initials: "BL", chats: 28, csat: 4.6, status: "idle" as const },
];

// Sparkline pseudoaleatório
const sparkPoints = (seed: number) => {
  const pts: number[] = [];
  for (let i = 0; i < 24; i++) {
    pts.push(40 + Math.sin(i * 0.5 + seed) * 15 + Math.cos(i * 0.3 + seed * 2) * 10 + (i * 0.8));
  }
  return pts;
};

const Sparkline = ({ seed, color = "hsl(var(--primary))" }: { seed: number; color?: string }) => {
  const points = sparkPoints(seed);
  const max = Math.max(...points);
  const min = Math.min(...points);
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 100 - ((p - min) / (max - min)) * 100;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-10 w-full">
      <defs>
        <linearGradient id={`grad-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L100,100 L0,100 Z`} fill={`url(#grad-${seed})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

// Gráfico de volume (24h)
const VolumeChart = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const data = hours.map((h) => Math.round(20 + Math.sin(h * 0.4) * 15 + Math.random() * 25 + (h > 8 && h < 20 ? 30 : 0)));
  const max = Math.max(...data);
  return (
    <div className="flex h-48 items-end gap-1.5">
      {data.map((v, i) => (
        <div key={i} className="group flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-gradient-to-t from-primary/40 to-primary transition-all hover:from-primary hover:to-primary-glow"
            style={{ height: `${(v / max) * 100}%`, minHeight: "4px" }}
          />
          {i % 4 === 0 && <span className="font-mono text-[9px] text-subtle-foreground">{i}h</span>}
        </div>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const user = useCurrentUser();
  const canSeeTeam = user.papel === "Admin" || user.papel === "Líder";
  const [params, setParams] = useSearchParams();
  const requested = params.get("tab") ?? "geral";
  const tab = requested === "equipe" && !canSeeTeam ? "geral" : requested;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <PageHeader
          live
          icon={LayoutDashboard}
          eyebrow="Dashboard"
          title="Visão geral"
          description="Acompanhe o desempenho do atendimento em tempo real."
          actions={
            <>
              <button className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-surface-hover transition-colors">
                Hoje · 28 Abr
              </button>
              <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow transition-colors">
                Exportar
              </button>
            </>
          }
        />

        <Tabs value={tab} onValueChange={(v) => setParams({ tab: v })}>
          <TabsList className="mb-6">
            <TabsTrigger value="geral">Visão geral</TabsTrigger>
            {canSeeTeam && <TabsTrigger value="equipe">Equipe</TabsTrigger>}
          </TabsList>

          <TabsContent value="geral" className="mt-0 space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k, i) => (
            <div key={k.label} className="group rounded-xl border border-border bg-surface p-5 transition-colors hover:bg-surface-elevated">
              <div className="flex items-start justify-between">
                <IconTile icon={k.icon} tone={k.tone} size="md" />
                {k.delta !== 0 && (
                  <span className={cn("inline-flex items-center gap-0.5 rounded font-mono text-[10px] font-medium px-1.5 py-0.5",
                    k.up ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive")}>
                    {k.up ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                    {k.delta}%
                  </span>
                )}
              </div>
              <div className="mt-4">
                <div className="text-2xl font-semibold tracking-tight">{k.value}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{k.label}</div>
              </div>
              <div className="mt-3">
                <Sparkline seed={i + 1} color={`hsl(var(--primary))`} />
              </div>
            </div>
          ))}
        </div>

        {/* Volume + Channels */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-border bg-surface p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold tracking-tight">Volume de conversas</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Últimas 24 horas</p>
              </div>
              <div className="flex gap-1 rounded-md border border-border bg-background/40 p-0.5">
                {["24h", "7d", "30d"].map((p, i) => (
                  <button key={p} className={cn(
                    "rounded px-2 py-0.5 text-[10px] font-medium transition-colors",
                    i === 0 ? "bg-surface-elevated text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}>{p}</button>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <VolumeChart />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6">
            <h3 className="text-sm font-semibold tracking-tight">Por canal</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Distribuição hoje</p>
            <div className="mt-5 space-y-3.5">
              {channelStats.map(({ ch, pct, count }) => (
                <div key={ch}>
                  <div className="flex items-center justify-between mb-1.5">
                    <ChannelBadge channel={ch} showLabel />
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-xs">{count}</span>
                      <span className="font-mono text-[10px] text-subtle-foreground">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-background/60">
                    <div
                      className={cn("h-full rounded-full transition-all", `bg-channel-${ch}`)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SLA + Agents */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-tight">SLA</h3>
              <TrendingUp className="h-3.5 w-3.5 text-success" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <div className="text-3xl font-semibold tracking-tight gradient-text">96.4%</div>
              <span className="text-xs text-success font-mono">+1.2pp</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Conversas dentro do SLA</p>

            <div className="mt-5 space-y-2.5">
              {[
                { label: "Primeira resposta", val: "98.1%", color: "bg-success" },
                { label: "Resolução", val: "94.7%", color: "bg-primary" },
                { label: "Tempo de fila", val: "92.3%", color: "bg-warning" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-mono">{s.val}</span>
                  </div>
                  <div className="mt-1 h-1 rounded-full bg-background/60 overflow-hidden">
                    <div className={cn("h-full", s.color)} style={{ width: s.val }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-xl border border-border bg-surface p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold tracking-tight">Top agentes</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Hoje · ordenado por volume</p>
              </div>
              <button className="text-[11px] font-medium text-primary hover:underline">Ver todos →</button>
            </div>

            <div className="mt-5 space-y-1">
              <div className="grid grid-cols-12 gap-3 px-3 pb-2 text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">
                <div className="col-span-5">Agente</div>
                <div className="col-span-3 text-right">Conversas</div>
                <div className="col-span-2 text-right">CSAT</div>
                <div className="col-span-2 text-right">Status</div>
              </div>
              {agents.map((a, i) => (
                <div key={a.name} className="grid grid-cols-12 items-center gap-3 rounded-md px-3 py-2 hover:bg-surface-hover transition-colors">
                  <div className="col-span-5 flex items-center gap-2.5">
                    <span className="font-mono text-[10px] text-subtle-foreground w-4">{i + 1}</span>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/40 to-channel-instagram/40 text-[10px] font-semibold">
                      {a.initials}
                    </div>
                    <span className="text-sm font-medium">{a.name}</span>
                  </div>
                  <div className="col-span-3 text-right">
                    <div className="inline-flex items-baseline gap-1">
                      <span className="font-mono text-sm">{a.chats}</span>
                      <span className="font-mono text-[10px] text-subtle-foreground">conv</span>
                    </div>
                  </div>
                  <div className="col-span-2 text-right font-mono text-sm">{a.csat}<span className="text-subtle-foreground text-[10px]">/5</span></div>
                  <div className="col-span-2 flex items-center justify-end gap-1.5">
                    <StatusDot status={a.status} />
                    <span className="text-[10px] capitalize text-muted-foreground">{a.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
          </TabsContent>

          {canSeeTeam && (
            <TabsContent value="equipe" className="mt-0 space-y-6">
              <PresencaKpis />
              <AtendentesStatusTable />
              <LoginHistoryTable />
              <SessionProductivityTable />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
