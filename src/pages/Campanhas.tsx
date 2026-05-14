import { Plus, Send, Users, CheckCircle2, AlertCircle, Clock, Play, Pause, MoreHorizontal, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

type CampaignStatus = "running" | "scheduled" | "completed" | "paused" | "draft";

const campaigns = [
  { id: 1, name: "Promoção Dia das Mães", template: "promo_maes_2026", recipients: 12480, sent: 8240, delivered: 8102, read: 6521, replied: 1284, failed: 138, status: "running" as CampaignStatus, scheduled: "Em andamento", progress: 66 },
  { id: 2, name: "Reativação clientes inativos 90d", template: "reativacao_v3", recipients: 4521, sent: 4521, delivered: 4398, read: 3217, replied: 482, failed: 123, status: "completed" as CampaignStatus, scheduled: "27/04 14:00", progress: 100 },
  { id: 3, name: "Lançamento - Vitamina D3", template: "lancamento_vitd3", recipients: 8945, sent: 0, delivered: 0, read: 0, replied: 0, failed: 0, status: "scheduled" as CampaignStatus, scheduled: "30/04 09:00", progress: 0 },
  { id: 4, name: "Pesquisa CSAT semanal", template: "csat_semanal", recipients: 2104, sent: 1820, delivered: 1798, read: 1402, replied: 891, failed: 22, status: "paused" as CampaignStatus, scheduled: "Pausada há 2h", progress: 86 },
  { id: 5, name: "Black Friday teaser", template: "—", recipients: 0, sent: 0, delivered: 0, read: 0, replied: 0, failed: 0, status: "draft" as CampaignStatus, scheduled: "Rascunho", progress: 0 },
];

const statusMeta: Record<CampaignStatus, { label: string; color: string; icon: typeof Play }> = {
  running: { label: "Em execução", color: "bg-success/15 text-success", icon: Play },
  scheduled: { label: "Agendada", color: "bg-primary/15 text-primary", icon: Clock },
  completed: { label: "Concluída", color: "bg-muted text-muted-foreground", icon: CheckCircle2 },
  paused: { label: "Pausada", color: "bg-warning/15 text-warning", icon: Pause },
  draft: { label: "Rascunho", color: "bg-muted/50 text-subtle-foreground", icon: AlertCircle },
};

const Campanhas = () => (
  <div className="h-full overflow-y-auto">
    <div className="mx-auto max-w-7xl px-8 py-8">
      <PageHeader
        eyebrow="Engajamento"
        title="Campanhas"
        description="Disparos em massa via WhatsApp com anti-ban e templates aprovados."
        actions={
          <Link to="/campanhas/nova" className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow transition-colors">
            <Plus className="h-3.5 w-3.5" /> Nova campanha
          </Link>
        }
      />

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Mensagens enviadas (mês)", value: "247.8k", icon: Send },
          { label: "Taxa de entrega", value: "98.4%", accent: "text-success", icon: CheckCircle2 },
          { label: "Taxa de leitura", value: "76.2%", accent: "text-primary", icon: MessageSquare },
          { label: "Respostas geradas", value: "12.4k", icon: Users },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className={cn("mt-3 text-xl font-semibold tracking-tight", s.accent)}>{s.value}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Campaigns list */}
      <div className="space-y-3">
        {campaigns.map(c => {
          const meta = statusMeta[c.status];
          const Icon = meta.icon;
          return (
            <Link to={`/campanhas/${c.id}`} key={c.id} className="block group rounded-xl border border-border bg-surface p-5 hover:bg-surface-elevated transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold tracking-tight">{c.name}</h3>
                    <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium", meta.color)}>
                      <Icon className="h-2.5 w-2.5" /> {meta.label}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="font-mono">{c.template}</span>
                    <span>·</span>
                    <span>{c.scheduled}</span>
                    <span>·</span>
                    <span>{c.recipients.toLocaleString("pt-BR")} destinatários</span>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Progress */}
              {(c.status === "running" || c.status === "paused" || c.status === "completed") && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[10px] font-mono text-subtle-foreground mb-1.5">
                    <span>{c.sent.toLocaleString("pt-BR")} / {c.recipients.toLocaleString("pt-BR")}</span>
                    <span>{c.progress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-background/60">
                    <div
                      className={cn(
                        "h-full transition-all",
                        c.status === "completed" ? "bg-success" : c.status === "paused" ? "bg-warning" : "bg-gradient-to-r from-primary to-primary-glow"
                      )}
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Funnel */}
              {c.sent > 0 && (
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {[
                    { label: "Enviadas", val: c.sent, color: "text-foreground" },
                    { label: "Entregues", val: c.delivered, color: "text-primary" },
                    { label: "Lidas", val: c.read, color: "text-channel-whatsapp" },
                    { label: "Respondidas", val: c.replied, color: "text-success" },
                    { label: "Falhas", val: c.failed, color: "text-destructive" },
                  ].map(s => (
                    <div key={s.label} className="rounded-md bg-background/40 px-3 py-2">
                      <div className={cn("font-mono text-sm font-semibold", s.color)}>{s.val.toLocaleString("pt-BR")}</div>
                      <div className="text-[10px] text-subtle-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  </div>
);

export default Campanhas;
