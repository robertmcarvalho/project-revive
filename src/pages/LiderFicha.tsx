import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, Crown, Phone, Mail, Building2, Truck, MapPin, ChevronRight, Edit3,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusDot } from "@/components/StatusDot";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const LIDERES_DB: Record<string, any> = {
  "1": {
    nome: "Marina Souza", iniciais: "MS", email: "marina@aethera.com", telefone: "+55 11 99100-2030",
    status: "online", regiao: "Zona Sul · SP",
    farmacias: [
      { id: "1", nome: "Farmácia Central", code: "FC-001", cidade: "São Paulo / SP", entregadoresAtivos: 9 },
      { id: "7", nome: "Drogasil Moema", code: "DGS-204", cidade: "São Paulo / SP", entregadoresAtivos: 6 },
    ],
    entregadoresPorFarmacia: {
      "Farmácia Central": [
        { nome: "João Silva", iniciais: "JS", status: "online" as const, telefone: "+55 11 99000-1111" },
        { nome: "Felipe Moreira", iniciais: "FM", status: "busy" as const, telefone: "+55 11 99000-7777" },
      ],
      "Drogasil Moema": [
        { nome: "Ricardo Souza", iniciais: "RS", status: "idle" as const, telefone: "+55 11 99000-4444" },
      ],
    },
  },
};

const STATUS_LABEL: Record<string, string> = { online: "Disponível", busy: "Em rota", idle: "Pausa", offline: "Offline" };

const LiderFicha = () => {
  const { id = "1" } = useParams();
  const l = LIDERES_DB[id] ?? LIDERES_DB["1"];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-8 py-8">
        <Link to="/lideres" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Voltar para líderes
        </Link>

        <PageHeader
          eyebrow="Pessoas · Ficha"
          title="Ficha do líder"
          description="Visão consolidada do líder, farmácias e equipe ativa."
          actions={<Button variant="outline" size="sm" className="gap-1.5"><Edit3 className="h-3.5 w-3.5" /> Editar</Button>}
        />

        {/* Card identificação */}
        <section className="mb-5 rounded-xl border border-border bg-surface p-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-lg font-semibold text-primary-foreground">
                {l.iniciais}
              </div>
              <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-warning text-warning-foreground">
                <Crown className="h-3.5 w-3.5" />
              </div>
              <StatusDot status={l.status} pulse={l.status === "online"} className="absolute -bottom-0.5 -right-0.5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">{l.nome}</h2>
                <span className={cn(
                  "rounded px-2 py-0.5 text-[10px] font-medium",
                  l.status === "online" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                )}>
                  {l.status === "online" ? "Online" : "Offline"}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Mail className="h-3 w-3" /> {l.email}</span>
                <span className="inline-flex items-center gap-1.5 font-mono"><Phone className="h-3 w-3" /> {l.telefone}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {l.regiao}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-l border-border pl-6">
              <div>
                <div className="font-mono text-2xl font-semibold">{l.farmacias.length}</div>
                <div className="text-[10px] uppercase tracking-wider text-subtle-foreground">Farmácias</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-semibold text-success">
                  {Object.values(l.entregadoresPorFarmacia).flat().length}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-subtle-foreground">Entregadores</div>
              </div>
            </div>
          </div>
        </section>

        {/* Farmácias vinculadas */}
        <section className="mb-5 rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-3 text-sm font-semibold">Farmácias vinculadas</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {l.farmacias.map((f: any) => (
              <Link key={f.id} to={`/farmacias`}
                className="group flex items-center gap-3 rounded-lg border border-border bg-background p-3 hover:border-primary/40 hover:bg-surface-elevated transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
                  <Building2 className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{f.nome}</div>
                  <div className="font-mono text-[10px] text-subtle-foreground">{f.code} · {f.cidade}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-semibold text-success">{f.entregadoresAtivos}</div>
                  <div className="text-[9px] uppercase text-subtle-foreground">ativos</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
              </Link>
            ))}
          </div>
        </section>

        {/* Entregadores por farmácia */}
        <section className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-4 text-sm font-semibold">Entregadores ativos por farmácia</h3>
          <div className="space-y-4">
            {Object.entries(l.entregadoresPorFarmacia).map(([farm, ents]: any) => (
              <div key={farm}>
                <div className="mb-2 flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold">{farm}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{ents.length}</span>
                </div>
                <div className="overflow-hidden rounded-md border border-border">
                  <table className="w-full text-xs">
                    <thead className="bg-background">
                      <tr className="text-left text-[10px] uppercase tracking-wider text-subtle-foreground">
                        <th className="px-3 py-2">Entregador</th>
                        <th className="px-3 py-2">Telefone</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ents.map((e: any) => (
                        <tr key={e.nome} className="border-t border-border/60">
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-channel-whatsapp/40 to-primary/40 text-[10px] font-semibold">
                                  {e.iniciais}
                                </div>
                                <StatusDot status={e.status} className="absolute -bottom-0.5 -right-0.5" />
                              </div>
                              <span className="font-medium">{e.nome}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 font-mono text-muted-foreground">{e.telefone}</td>
                          <td className="px-3 py-2">
                            <span className={cn(
                              "rounded px-2 py-0.5 text-[10px] font-medium",
                              e.status === "online" && "bg-success/15 text-success",
                              e.status === "busy" && "bg-warning/15 text-warning",
                              e.status === "idle" && "bg-muted text-muted-foreground",
                              e.status === "offline" && "bg-muted/50 text-subtle-foreground"
                            )}>{STATUS_LABEL[e.status]}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LiderFicha;
