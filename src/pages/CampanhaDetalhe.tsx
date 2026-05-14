import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, Square, Copy, Send, CheckCircle2, MessageSquare, Users, Clock, AlertCircle, Calendar, Target, TrendingUp, Activity } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

const CampanhaDetalhe = () => {
  const { id } = useParams();

  const c = {
    id,
    name: "Promoção Dia das Mães",
    template: "promo_maes_2026",
    status: "running" as const,
    createdBy: "Ana Souza",
    createdAt: "25/04/2026 10:32",
    scheduledAt: "27/04/2026 09:00",
    startedAt: "27/04/2026 09:01",
    estimatedEnd: "27/04/2026 17:40",
    audience: { list: "Clientes ativos 60d", filters: ["Cidade: SP", "Tag: VIP"], total: 12480 },
    throttle: 30,
    quietHours: "22h - 8h",
    sent: 8240, delivered: 8102, read: 6521, replied: 1284, failed: 138, optouts: 24,
    progress: 66,
    cost: 2473.20,
  };

  const metrics = [
    { label: "Destinatários", value: c.audience.total.toLocaleString("pt-BR"), icon: Users },
    { label: "Enviadas", value: c.sent.toLocaleString("pt-BR"), icon: Send },
    { label: "Entregues", value: `${((c.delivered / c.sent) * 100).toFixed(1)}%`, icon: CheckCircle2, accent: "text-success" },
    { label: "Lidas", value: `${((c.read / c.delivered) * 100).toFixed(1)}%`, icon: MessageSquare, accent: "text-primary" },
    { label: "Respondidas", value: c.replied.toLocaleString("pt-BR"), icon: TrendingUp, accent: "text-channel-whatsapp" },
    { label: "Falhas", value: c.failed.toLocaleString("pt-BR"), icon: AlertCircle, accent: "text-destructive" },
  ];

  const history = [
    { time: "27/04 14:22", actor: "Sistema", action: "Lote 412 enviado · 30 mensagens", icon: Send },
    { time: "27/04 13:00", actor: "Maria Lima", action: "Throttle ajustado: 25 → 30 msg/min", icon: Activity },
    { time: "27/04 11:15", actor: "Sistema", action: "Pausa automática por janela silenciosa concluída", icon: Clock },
    { time: "27/04 09:01", actor: "Sistema", action: "Campanha iniciada", icon: Play },
    { time: "27/04 09:00", actor: "Cron", action: "Disparo agendado acionado", icon: Calendar },
    { time: "25/04 10:32", actor: "Ana Souza", action: "Campanha criada (rascunho)", icon: AlertCircle },
  ];

  const recent = [
    { phone: "+55 11 9****-1289", status: "read", at: "14:23" },
    { phone: "+55 11 9****-7710", status: "delivered", at: "14:23" },
    { phone: "+55 11 9****-4452", status: "replied", at: "14:22" },
    { phone: "+55 11 9****-2018", status: "failed", at: "14:22", reason: "Número inválido" },
    { phone: "+55 11 9****-9023", status: "read", at: "14:21" },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <Link to="/campanhas" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para campanhas
        </Link>

        <PageHeader
          eyebrow={`Campanha #${id}`}
          title={c.name}
          description={`Template ${c.template} · criada por ${c.createdBy} em ${c.createdAt}`}
          actions={
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-hover"><Copy className="h-3.5 w-3.5" /> Duplicar</button>
              <button className="flex items-center gap-1.5 rounded-md border border-warning/40 bg-warning/10 px-3 py-1.5 text-xs font-medium text-warning hover:bg-warning/20"><Pause className="h-3.5 w-3.5" /> Pausar</button>
              <button className="flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20"><Square className="h-3.5 w-3.5" /> Encerrar</button>
            </div>
          }
        />

        {/* Status banner */}
        <div className="mb-6 flex items-center justify-between rounded-xl border border-success/30 bg-success/5 p-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
            </span>
            <div>
              <div className="text-sm font-medium text-success">Em execução</div>
              <div className="text-[11px] text-muted-foreground">Iniciada {c.startedAt} · término estimado {c.estimatedEnd}</div>
            </div>
          </div>
          <div className="flex items-center gap-6 text-right">
            <div>
              <div className="font-mono text-lg font-semibold">{c.progress}%</div>
              <div className="text-[10px] text-subtle-foreground">{c.sent.toLocaleString("pt-BR")} / {c.audience.total.toLocaleString("pt-BR")}</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <div className="font-mono text-lg font-semibold">R$ {c.cost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
              <div className="text-[10px] text-subtle-foreground">Custo acumulado</div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-6">
          {metrics.map(m => (
            <div key={m.label} className="rounded-xl border border-border bg-surface p-4">
              <m.icon className="h-4 w-4 text-muted-foreground" />
              <div className={cn("mt-3 font-mono text-lg font-semibold tracking-tight", m.accent)}>{m.value}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Schedule + Audience */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <Section title="Agendamento" icon={Calendar}>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Info label="Modo" value="Agendada" />
                <Info label="Início" value={c.scheduledAt} />
                <Info label="Throttle" value={`${c.throttle} msg/min`} />
                <Info label="Janela silenciosa" value={c.quietHours} />
              </div>
            </Section>

            <Section title="Audiência" icon={Target}>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2">
                  <div>
                    <div className="text-xs font-medium">{c.audience.list}</div>
                    <div className="text-[11px] text-muted-foreground">{c.audience.total.toLocaleString("pt-BR")} contatos · filtros aplicados</div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {c.audience.filters.map(f => (
                      <span key={f} className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Histórico de ações" icon={Activity}>
              <div className="space-y-0">
                {history.map((h, i) => (
                  <div key={i} className="flex gap-3 border-b border-border/50 py-3 last:border-0">
                    <div className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <h.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs">{h.action}</div>
                      <div className="mt-0.5 text-[10px] text-subtle-foreground">{h.actor} · {h.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <Section title="Envios recentes" icon={Send}>
              <div className="space-y-1.5">
                {recent.map((r, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md bg-background/40 px-2.5 py-1.5">
                    <span className="font-mono text-[11px]">{r.phone}</span>
                    <span className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-medium",
                      r.status === "read" && "bg-channel-whatsapp/15 text-channel-whatsapp",
                      r.status === "delivered" && "bg-primary/15 text-primary",
                      r.status === "replied" && "bg-success/15 text-success",
                      r.status === "failed" && "bg-destructive/15 text-destructive",
                    )}>{r.status}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Preview da mensagem" icon={MessageSquare}>
              <div className="rounded-lg bg-[#075E54]/10 p-3">
                <div className="rounded-lg bg-background p-3 text-xs leading-relaxed shadow-sm">
                  Olá <span className="font-semibold">{"{{nome}}"}</span>! 💐<br />
                  No Dia das Mães, <span className="font-semibold">15% OFF</span> em vitaminas e cuidados femininos. Use o cupom <span className="font-mono font-semibold">MAE15</span>.
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, icon: Icon, children }: any) => (
  <div className="rounded-xl border border-border bg-surface p-5">
    <div className="mb-4 flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
    </div>
    {children}
  </div>
);

const Info = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">{label}</div>
    <div className="mt-0.5 text-sm font-medium">{value}</div>
  </div>
);

export default CampanhaDetalhe;
