import { Link } from "react-router-dom";
import {
  Building2, Truck, CalendarCheck, UserX, UserPlus, MessageCircle,
  TrendingUp, AlertTriangle, ArrowRight, Clock,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const kpis = [
  { label: "Farmácias ativas", value: "8", trend: "+1 este mês", icon: Building2, color: "text-primary" },
  { label: "Entregadores", value: "24", trend: "21 disponíveis", icon: Truck, color: "text-success" },
  { label: "Diárias hoje", value: "18", trend: "6 pendentes", icon: CalendarCheck, color: "text-warning" },
  { label: "Faltas (semana)", value: "3", trend: "-2 vs anterior", icon: UserX, color: "text-destructive" },
];

const quick = [
  { to: "/lider/diarias", label: "Lançar diária", icon: CalendarCheck, desc: "Registrar entregadores em campo hoje" },
  { to: "/lider/faltas", label: "Registrar falta", icon: UserX, desc: "Comunicar ausência de entregador" },
  { to: "/lider/pre-cadastro", label: "Pré-cadastro", icon: UserPlus, desc: "Novo entregador para aprovação" },
  { to: "/lider/chat", label: "Abrir chat", icon: MessageCircle, desc: "Falar com setor de atendimento" },
];

const alerts = [
  { tipo: "Falta", texto: "João P. não compareceu — Farmácia São Bento", time: "08:42", level: "destructive" },
  { tipo: "Diária", texto: "6 diárias aguardando confirmação para hoje", time: "07:30", level: "warning" },
  { tipo: "Cadastro", texto: "Maria L. aprovada pelo RH — pode iniciar", time: "Ontem", level: "success" },
];

export default function LiderDashboard() {
  return (
    <div className="p-8 max-w-7xl">
      <PageHeader
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
              <k.icon className={`h-4 w-4 ${k.color}`} />
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
              <q.icon className="h-5 w-5 text-primary" />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-medium">{q.label}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{q.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Alerts + Agenda */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Alertas operacionais
            </h3>
            <span className="text-[10px] text-muted-foreground">3 novos</span>
          </div>
          <ul className="space-y-2">
            {alerts.map((a, i) => (
              <li key={i} className="flex items-start gap-3 rounded-lg border border-border bg-background/40 p-3">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full bg-${a.level}`} />
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
          <h3 className="text-sm font-semibold mb-3">Escala de hoje</h3>
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
                <span className={`text-xs font-mono ${r.ok < r.e ? "text-warning" : "text-success"}`}>
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
