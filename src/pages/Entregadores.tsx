import { useState } from "react";
import { Plus, Search, Truck, Star, MapPin, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { StatusDot } from "@/components/StatusDot";
import { cn } from "@/lib/utils";

type DriverStatus = "online" | "busy" | "idle" | "offline";

const drivers = [
  { id: 1, name: "João Silva", initials: "JS", phone: "+55 11 99000-1111", pharmacy: "Farmácia Central", deliveries: 47, rating: 4.9, region: "Zona Sul - SP", status: "online" as DriverStatus, vehicle: "Moto" },
  { id: 2, name: "Pedro Henrique", initials: "PH", phone: "+55 11 99000-2222", pharmacy: "Drogaria São Paulo", deliveries: 38, rating: 4.8, region: "Vila Olímpia", status: "busy" as DriverStatus, vehicle: "Moto" },
  { id: 3, name: "Marcos Antônio", initials: "MA", phone: "+55 21 99000-3333", pharmacy: "Farmácia Popular", deliveries: 52, rating: 4.7, region: "Centro - RJ", status: "online" as DriverStatus, vehicle: "Bicicleta" },
  { id: 4, name: "Ricardo Souza", initials: "RS", phone: "+55 11 99000-4444", pharmacy: "Drogasil Pinheiros", deliveries: 29, rating: 4.6, region: "Pinheiros", status: "idle" as DriverStatus, vehicle: "Moto" },
  { id: 5, name: "André Luiz", initials: "AL", phone: "+55 62 99000-5555", pharmacy: "Pague Menos", deliveries: 41, rating: 4.9, region: "Setor Bueno", status: "online" as DriverStatus, vehicle: "Carro" },
  { id: 6, name: "Bruno Cardoso", initials: "BC", phone: "+55 31 99000-6666", pharmacy: "Farmácia Indiana", deliveries: 18, rating: 4.4, region: "Savassi", status: "offline" as DriverStatus, vehicle: "Moto" },
  { id: 7, name: "Felipe Moreira", initials: "FM", phone: "+55 11 99000-7777", pharmacy: "Farmácia Central", deliveries: 33, rating: 4.8, region: "Moema", status: "busy" as DriverStatus, vehicle: "Moto" },
  { id: 8, name: "Gabriel Santos", initials: "GS", phone: "+55 11 99000-8888", pharmacy: "Drogaria São Paulo", deliveries: 25, rating: 4.5, region: "Itaim Bibi", status: "online" as DriverStatus, vehicle: "Moto" },
];

const statusLabel: Record<DriverStatus, string> = { online: "Disponível", busy: "Em rota", idle: "Pausa", offline: "Offline" };

const Entregadores = () => {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | DriverStatus>("all");
  const filtered = drivers.filter(d =>
    (tab === "all" || d.status === tab) &&
    (d.name.toLowerCase().includes(q.toLowerCase()) || d.phone.includes(q))
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <PageHeader
          eyebrow="Operação"
          title="Entregadores"
          description="Equipe de entrega vinculada às farmácias."
          actions={
            <Link to="/entregadores/novo" className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow transition-colors">
              <Plus className="h-3.5 w-3.5" /> Cadastrar entregador
            </Link>
          }
        />

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Total cadastrados", value: "1.284" },
            { label: "Disponíveis agora", value: "382", accent: "text-success" },
            { label: "Em rota", value: "147", accent: "text-warning" },
            { label: "Avaliação média", value: "4.78★" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-border bg-surface p-4">
              <div className={cn("text-xl font-semibold tracking-tight", s.accent)}>{s.value}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-surface px-3 py-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar entregador..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-subtle-foreground"
            />
          </div>
          <div className="flex gap-0.5 rounded-md border border-border bg-surface p-0.5">
            {(["all", "online", "busy", "idle", "offline"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded px-2.5 py-1 text-[11px] font-medium transition-colors",
                  tab === t ? "bg-surface-elevated text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t === "all" ? "Todos" : statusLabel[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">
                <th className="px-4 py-3">Entregador</th>
                <th className="px-4 py-3">Farmácia</th>
                <th className="px-4 py-3">Região</th>
                <th className="px-4 py-3">Veículo</th>
                <th className="px-4 py-3 text-right">Entregas (mês)</th>
                <th className="px-4 py-3 text-right">Avaliação</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} onClick={() => window.location.assign(`/entregadores/${d.id}`)} className="border-b border-border/50 last:border-0 hover:bg-surface-hover transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-channel-whatsapp/40 to-primary/40 text-[11px] font-semibold">
                          {d.initials}
                        </div>
                        <StatusDot status={d.status} className="absolute -bottom-0.5 -right-0.5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{d.name}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{d.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{d.pharmacy}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {d.region}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                      <Truck className="h-2.5 w-2.5" /> {d.vehicle}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm">{d.deliveries}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1 font-mono text-sm">
                      <Star className="h-3 w-3 fill-warning text-warning" /> {d.rating}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "rounded px-2 py-0.5 text-[10px] font-medium",
                      d.status === "online" && "bg-success/15 text-success",
                      d.status === "busy" && "bg-warning/15 text-warning",
                      d.status === "idle" && "bg-muted text-muted-foreground",
                      d.status === "offline" && "bg-muted/50 text-subtle-foreground"
                    )}>
                      {statusLabel[d.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="flex h-7 w-7 items-center justify-center rounded hover:bg-surface-elevated">
                      <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Entregadores;
