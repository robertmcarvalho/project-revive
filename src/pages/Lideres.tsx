import { Plus, Crown, Building2, TrendingUp, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { StatusDot } from "@/components/StatusDot";
import { cn } from "@/lib/utils";

const leaders = [
  { id: 1, name: "Marina Souza", initials: "MS", email: "marina@atende.com", pharmacies: ["Farmácia Central", "Drogasil Moema"], teamSize: 18, sla: 98.2, csat: 4.9, status: "online" as const },
  { id: 2, name: "Lucas Andrade", initials: "LA", email: "lucas@atende.com", pharmacies: ["Drogaria São Paulo - Vila Olímpia"], teamSize: 8, sla: 95.4, csat: 4.8, status: "online" as const },
  { id: 3, name: "Carla Mendes", initials: "CM", email: "carla@atende.com", pharmacies: ["Farmácia Popular Centro", "Farmácia Popular Tijuca"], teamSize: 23, sla: 92.7, csat: 4.7, status: "busy" as const },
  { id: 4, name: "Rafael Pinto", initials: "RP", email: "rafael@atende.com", pharmacies: ["Drogasil Pinheiros"], teamSize: 6, sla: 88.1, csat: 4.6, status: "online" as const },
  { id: 5, name: "Beatriz Lima", initials: "BL", email: "beatriz@atende.com", pharmacies: ["Pague Menos Setor Bueno", "Pague Menos Marista"], teamSize: 14, sla: 91.3, csat: 4.7, status: "idle" as const },
];

const Lideres = () => (
  <div className="h-full overflow-y-auto">
    <div className="mx-auto max-w-7xl px-8 py-8">
      <PageHeader live
        eyebrow="Pessoas"
        title="Líderes"
        description="Gestores responsáveis por farmácias e equipes."
        actions={
          <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow transition-colors">
            <Plus className="h-3.5 w-3.5" /> Convidar líder
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Líderes ativos", value: "23" },
          { label: "Farmácias geridas", value: "147" },
          { label: "Equipe total", value: "284" },
          { label: "SLA médio", value: "93.1%", accent: "text-success" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-4">
            <div className={cn("text-xl font-semibold tracking-tight", s.accent)}>{s.value}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {leaders.map(l => (
          <Link key={l.id} to={`/lideres/${l.id}`} className="group rounded-xl border border-border bg-surface p-5 hover:bg-surface-elevated hover:border-primary/40 transition-colors block">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">
                    {l.initials}
                  </div>
                  <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-warning text-warning-foreground">
                    <Crown className="h-3 w-3" />
                  </div>
                  <StatusDot status={l.status} pulse={l.status === "online"} className="absolute -bottom-0.5 -right-0.5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{l.name}</div>
                  <div className="text-[11px] text-muted-foreground">{l.email}</div>
                </div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="mt-4">
              <div className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">Farmácias</div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {l.pharmacies.map(p => (
                  <span key={p} className="inline-flex items-center gap-1 rounded border border-border bg-background/40 px-1.5 py-0.5 text-[10px]">
                    <Building2 className="h-2.5 w-2.5 text-muted-foreground" /> {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-3">
              <div>
                <div className="font-mono text-base font-semibold">{l.teamSize}</div>
                <div className="text-[10px] text-subtle-foreground">Equipe</div>
              </div>
              <div>
                <div className="font-mono text-base font-semibold text-success">{l.sla}%</div>
                <div className="text-[10px] text-subtle-foreground">SLA</div>
              </div>
              <div>
                <div className="font-mono text-base font-semibold">{l.csat}<span className="text-[10px] text-subtle-foreground">/5</span></div>
                <div className="text-[10px] text-subtle-foreground">CSAT</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </div>
);

export default Lideres;
