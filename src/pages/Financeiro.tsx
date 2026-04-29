import { Plus, Download, TrendingUp, TrendingDown, DollarSign, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

type EntryStatus = "paid" | "pending" | "overdue" | "scheduled";

const entries = [
  { id: 1, ref: "FIN-2026-0247", contact: "Ana Beatriz Lima", pharmacy: "Farmácia Central", total: 1280.00, installments: "3/6", nextDue: "02/05/2026", paid: 640.00, status: "pending" as EntryStatus },
  { id: 2, ref: "FIN-2026-0246", contact: "Carlos E. Souza", pharmacy: "Drogaria São Paulo", total: 480.00, installments: "1/1", nextDue: "—", paid: 480.00, status: "paid" as EntryStatus },
  { id: 3, ref: "FIN-2026-0245", contact: "Mariana Costa", pharmacy: "Farmácia Popular", total: 2150.00, installments: "5/10", nextDue: "20/04/2026", paid: 1075.00, status: "overdue" as EntryStatus },
  { id: 4, ref: "FIN-2026-0244", contact: "Patrícia Ferreira", pharmacy: "Farmácia Central", total: 890.00, installments: "2/4", nextDue: "15/05/2026", paid: 445.00, status: "pending" as EntryStatus },
  { id: 5, ref: "FIN-2026-0243", contact: "Juliana Martins", pharmacy: "Farmácia Popular", total: 3400.00, installments: "0/12", nextDue: "01/05/2026", paid: 0, status: "scheduled" as EntryStatus },
  { id: 6, ref: "FIN-2026-0242", contact: "Diego Pereira", pharmacy: "Drogasil Pinheiros", total: 620.00, installments: "1/3", nextDue: "10/04/2026", paid: 206.67, status: "overdue" as EntryStatus },
];

const statusMeta: Record<EntryStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  paid: { label: "Pago", color: "bg-success/15 text-success", icon: CheckCircle2 },
  pending: { label: "Em dia", color: "bg-primary/15 text-primary", icon: Clock },
  overdue: { label: "Vencido", color: "bg-destructive/15 text-destructive", icon: AlertCircle },
  scheduled: { label: "Agendado", color: "bg-muted text-muted-foreground", icon: Clock },
};

const fmtBRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Financeiro = () => (
  <div className="h-full overflow-y-auto">
    <div className="mx-auto max-w-7xl px-8 py-8">
      <PageHeader
        eyebrow="Financeiro"
        title="Cobranças e parcelamentos"
        description="Acompanhe lançamentos, parcelas e inadimplência."
        actions={
          <>
            <button className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-surface-hover transition-colors">
              <Download className="h-3.5 w-3.5" /> Exportar CSV
            </button>
            <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow transition-colors">
              <Plus className="h-3.5 w-3.5" /> Novo lançamento
            </button>
          </>
        }
      />

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/15 text-success">
              <DollarSign className="h-4 w-4" />
            </div>
            <span className="inline-flex items-center gap-0.5 rounded bg-success/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-success">
              <TrendingUp className="h-2.5 w-2.5" /> 8.4%
            </span>
          </div>
          <div className="mt-4 text-2xl font-semibold tracking-tight">{fmtBRL(248750)}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">Recebido este mês</div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 text-2xl font-semibold tracking-tight">{fmtBRL(127400)}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">A receber (próx. 30d)</div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
              <AlertCircle className="h-4 w-4" />
            </div>
            <span className="inline-flex items-center gap-0.5 rounded bg-destructive/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-destructive">
              <TrendingDown className="h-2.5 w-2.5" /> 2.1%
            </span>
          </div>
          <div className="mt-4 text-2xl font-semibold tracking-tight text-destructive">{fmtBRL(34280)}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">Em atraso · 47 parcelas</div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/15 text-warning">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 text-2xl font-semibold tracking-tight">94.7%</div>
          <div className="mt-0.5 text-xs text-muted-foreground">Taxa de adimplência</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex gap-0.5 rounded-md border border-border bg-surface p-0.5">
          {["Todos", "Em dia", "Vencidos", "Pagos", "Agendados"].map((t, i) => (
            <button key={t} className={cn(
              "rounded px-2.5 py-1 text-[11px] font-medium transition-colors",
              i === 0 ? "bg-surface-elevated text-foreground" : "text-muted-foreground hover:text-foreground"
            )}>{t}</button>
          ))}
        </div>
        <div className="ml-auto text-xs text-muted-foreground">{entries.length} lançamentos</div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">
              <th className="px-4 py-3">Referência</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Farmácia</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-center">Parcelas</th>
              <th className="px-4 py-3">Próx. vencimento</th>
              <th className="px-4 py-3">Progresso</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(e => {
              const meta = statusMeta[e.status];
              const Icon = meta.icon;
              const pct = (e.paid / e.total) * 100;
              return (
                <tr key={e.id} className="border-b border-border/50 last:border-0 hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{e.ref}</td>
                  <td className="px-4 py-3 text-sm font-medium">{e.contact}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{e.pharmacy}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-semibold">{fmtBRL(e.total)}</td>
                  <td className="px-4 py-3 text-center font-mono text-xs">{e.installments}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{e.nextDue}</td>
                  <td className="px-4 py-3 w-40">
                    <div className="flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-background/60">
                        <div
                          className={cn("h-full", e.status === "overdue" ? "bg-destructive" : "bg-success")}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-subtle-foreground w-8 text-right">{pct.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium", meta.color)}>
                      <Icon className="h-2.5 w-2.5" /> {meta.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default Financeiro;
