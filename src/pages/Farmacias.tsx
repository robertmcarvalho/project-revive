import { useState } from "react";
import { Plus, Search, MapPin, Phone, Users, Truck, MoreHorizontal, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { StatusDot } from "@/components/StatusDot";
import { cn } from "@/lib/utils";

const pharmacies = [
  { id: 1, name: "Farmácia Central", code: "FC-001", city: "São Paulo / SP", phone: "+55 11 3000-0001", leader: "Marina Souza", drivers: 12, openConvs: 47, sla: 98, status: "online" as const },
  { id: 2, name: "Drogaria São Paulo - Vila Olímpia", code: "DSP-145", city: "São Paulo / SP", phone: "+55 11 3000-0145", leader: "Lucas Andrade", drivers: 8, openConvs: 31, sla: 95, status: "online" as const },
  { id: 3, name: "Farmácia Popular Centro", code: "FP-022", city: "Rio de Janeiro / RJ", phone: "+55 21 3000-0022", leader: "Carla Mendes", drivers: 15, openConvs: 62, sla: 92, status: "online" as const },
  { id: 4, name: "Drogasil Pinheiros", code: "DGS-078", city: "São Paulo / SP", phone: "+55 11 3000-0078", leader: "Rafael Pinto", drivers: 6, openConvs: 18, sla: 88, status: "busy" as const },
  { id: 5, name: "Pague Menos Setor Bueno", code: "PM-201", city: "Goiânia / GO", phone: "+55 62 3000-0201", leader: "Beatriz Lima", drivers: 9, openConvs: 24, sla: 91, status: "online" as const },
  { id: 6, name: "Farmácia Indiana", code: "FI-014", city: "Belo Horizonte / MG", phone: "+55 31 3000-0014", leader: "—", drivers: 4, openConvs: 7, sla: 78, status: "offline" as const },
];

const Farmacias = () => {
  const [q, setQ] = useState("");
  const filtered = pharmacies.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.code.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <PageHeader
          eyebrow="Operação"
          title="Farmácias"
          description="Unidades parceiras conectadas à plataforma."
          actions={
            <Link to="/farmacias/nova" className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow transition-colors">
              <Plus className="h-3.5 w-3.5" /> Nova farmácia
            </Link>
          }
        />

        {/* KPIs */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Farmácias ativas", value: "147", icon: Building2 },
            { label: "Online agora", value: "132", accent: "text-success", icon: StatusDot },
            { label: "Entregadores totais", value: "1.284", icon: Truck },
            { label: "SLA médio", value: "93.7%", accent: "text-success", icon: Users },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-border bg-surface p-4">
              <div className={cn("text-xl font-semibold tracking-tight", s.accent)}>{s.value}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-4 flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar farmácia por nome ou código..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-subtle-foreground"
          />
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(p => (
            <div key={p.id} className="group rounded-xl border border-border bg-surface p-5 hover:bg-surface-elevated transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
                    <Building2 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="font-mono text-[10px] text-subtle-foreground">{p.code}</div>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="mt-4 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {p.city}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
                  <Phone className="h-3 w-3" /> {p.phone}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-3 w-3" /> Líder: <span className="text-foreground">{p.leader}</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
                <div>
                  <div className="font-mono text-sm font-semibold">{p.drivers}</div>
                  <div className="text-[10px] text-subtle-foreground">Entregadores</div>
                </div>
                <div>
                  <div className="font-mono text-sm font-semibold">{p.openConvs}</div>
                  <div className="text-[10px] text-subtle-foreground">Conv. abertas</div>
                </div>
                <div>
                  <div className={cn("font-mono text-sm font-semibold", p.sla >= 95 ? "text-success" : p.sla >= 85 ? "text-warning" : "text-destructive")}>{p.sla}%</div>
                  <div className="text-[10px] text-subtle-foreground">SLA</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <StatusDot status={p.status} pulse={p.status === "online"} />
                  <span className="text-[10px] capitalize text-muted-foreground">{p.status}</span>
                </div>
                <button className="text-[11px] font-medium text-primary hover:underline">Detalhes →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Farmacias;
