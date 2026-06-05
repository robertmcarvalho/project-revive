import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Building2, Truck, CalendarCheck, UserX, UserPlus, MessageCircle,
  TrendingUp, AlertTriangle, ArrowRight, Clock, ShieldCheck, ClipboardList,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { IconTile, type IconTileTone } from "@/components/IconTile";
import { operacaoApi } from "@/lib/operacaoApi";
import type { TarefaAtendimento, NotificacaoPendencia } from "@/data/operacaoMock";
import { tarefaMeta, tarefaStatusMeta } from "@/components/operacao/TaskCard";
import { cn } from "@/lib/utils";

const kpis: { label: string; value: string; trend: string; icon: any; tone: IconTileTone }[] = [
  { label: "Farmácias ativas", value: "8", trend: "+1 este mês", icon: Building2, tone: "primary" },
  { label: "Entregadores", value: "24", trend: "21 disponíveis", icon: Truck, tone: "success" },
  { label: "Diárias hoje", value: "18", trend: "6 pendentes", icon: CalendarCheck, tone: "warning" },
  { label: "Faltas (semana)", value: "3", trend: "-2 vs anterior", icon: UserX, tone: "destructive" },
];

const quick: { to: string; label: string; icon: any; desc: string; tone: IconTileTone }[] = [
  { to: "/lider/diarias", label: "Lançar diária", icon: CalendarCheck, desc: "Registrar entregadores em campo hoje", tone: "primary" },
  { to: "/lider/faltas", label: "Registrar falta", icon: UserX, desc: "Comunicar ausência de entregador", tone: "destructive" },
  { to: "/lider/pre-cadastro", label: "Pré-cadastro", icon: UserPlus, desc: "Novo entregador para aprovação", tone: "success" },
  { to: "/lider/chat", label: "Abrir chat", icon: MessageCircle, desc: "Falar com setor de atendimento", tone: "warning" },
];

const alerts = [
  { tipo: "Falta", texto: "João P. não compareceu — Farmácia São Bento", time: "08:42", level: "destructive" as const },
  { tipo: "Diária", texto: "6 diárias aguardando confirmação para hoje", time: "07:30", level: "warning" as const },
  { tipo: "Cadastro", texto: "Maria L. aprovada pelo RH — pode iniciar", time: "Ontem", level: "success" as const },
];

export default function LiderDashboard() {
  const [tarefas, setTarefas] = useState<TarefaAtendimento[]>([]);
  const [notif, setNotif] = useState<NotificacaoPendencia[]>([]);

  useEffect(() => {
    Promise.all([operacaoApi.listTarefas(), operacaoApi.listNotificacoes()]).then(([t, n]) => {
      setTarefas(t); setNotif(n);
    });
  }, []);

  const tarefasEntregadores = tarefas.filter((t) => t.status !== "concluida").slice(0, 6);

  return (
    <div className="p-8 max-w-7xl">
      <PageHeader
        icon={ShieldCheck}
        eyebrow="Painel do líder"
        title="Bom dia, Marcos"
        description="Acompanhe sua zona, lance diárias e cuide da operação do dia."
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{k.label}</span>
              <IconTile icon={k.icon} tone={k.tone} size="sm" />
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">{k.value}</div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <TrendingUp className="h-3 w-3" /> {k.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Ações rápidas */}
      <div className="mb-8">
        <h3 className="mb-3 text-sm font-semibold">Ações rápidas</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quick.map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="group rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-all"
            >
              <IconTile icon={q.icon} tone={q.tone} />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-medium">{q.label}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{q.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Status de tarefas dos entregadores vinculados */}
      <div className="mb-8 rounded-xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <IconTile icon={ClipboardList} tone="primary" size="sm" /> Tarefas dos meus entregadores
          </h3>
          <span className="text-[10px] text-muted-foreground">Acompanhe o status sem precisar acionar atendimento.</span>
        </div>
        {tarefasEntregadores.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">Nenhuma tarefa em aberto.</div>
        ) : (
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {tarefasEntregadores.map((t) => {
              const meta = tarefaMeta[t.tipo];
              const pct = Math.min(100, Math.round((t.decorridoMinutos / t.slaMinutos) * 100));
              return (
                <li key={t.id} className={cn(
                  "rounded-lg border bg-background/40 p-3",
                  t.status === "atrasada" ? "border-destructive/40" : "border-border",
                )}>
                  <div className="flex items-start gap-2.5">
                    <IconTile icon={meta.icon} tone={meta.tone} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{meta.label}</div>
                      <div className="truncate text-xs font-semibold">{t.entregadorNome}</div>
                      <div className="text-[10px] text-muted-foreground">{t.farmacia} · prazo {t.prazo}</div>
                    </div>
                    <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-medium", tarefaStatusMeta[t.status].cls)}>
                      {tarefaStatusMeta[t.status].label}
                    </span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full", pct >= 100 ? "bg-destructive" : pct >= 75 ? "bg-warning" : "bg-primary")} style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Notificações de assinatura para o líder */}
      {notif.length > 0 && (
        <div className="mb-8 rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <IconTile icon={AlertTriangle} tone="warning" size="sm" /> Assinaturas pendentes da minha equipe
          </h3>
          <ul className="space-y-2">
            {notif.map((n) => {
              const atrasada = n.diasPendente > n.prazoDias;
              return (
                <li key={n.id} className={cn(
                  "flex items-center gap-2 rounded-lg border bg-background/40 p-2.5",
                  atrasada ? "border-destructive/40" : "border-border",
                )}>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-primary text-[10px] font-semibold text-primary-foreground">
                    {n.entregadorIniciais}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium">{n.entregadorNome}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {n.tipo === "matricula" ? "Matrícula" : "Termo de desligamento"} · {n.farmacia}
                    </div>
                  </div>
                  <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-mono", atrasada ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning")}>
                    {n.diasPendente}/{n.prazoDias}d
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Alerts + Agenda */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <IconTile icon={AlertTriangle} tone="warning" size="sm" /> Alertas operacionais
            </h3>
            <span className="text-[10px] text-muted-foreground">3 novos</span>
          </div>
          <ul className="space-y-2">
            {alerts.map((a, i) => (
              <li key={i} className="flex items-start gap-3 rounded-lg border border-border bg-background/40 p-3">
                <span className={cn(
                  "mt-1 h-2 w-2 shrink-0 rounded-full",
                  a.level === "destructive" && "bg-destructive",
                  a.level === "warning" && "bg-warning",
                  a.level === "success" && "bg-success",
                )} />
                <div className="flex-1">
                  <div className="text-xs font-medium">{a.tipo}</div>
                  <div className="text-xs text-muted-foreground">{a.texto}</div>
                </div>
                <span className="text-[10px] text-subtle-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />{a.time}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <IconTile icon={CalendarCheck} tone="primary" size="sm" /> Escala de hoje
          </h3>
          <div className="space-y-2">
            {[
              { f: "Farmácia São Bento", e: 4, ok: 4 },
              { f: "Drogaria Vida+", e: 3, ok: 2 },
              { f: "Farma Express Centro", e: 5, ok: 5 },
              { f: "Pharma Zona Sul", e: 6, ok: 4 },
            ].map((r) => (
              <div key={r.f} className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs">{r.f}</span>
                </div>
                <span className={cn("text-xs font-mono", r.ok < r.e ? "text-warning" : "text-success")}>
                  {r.ok}/{r.e}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
