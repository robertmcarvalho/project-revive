import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, Plus, Search, Settings as SettingsIcon, MapPin, Calendar } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { comercialApi } from "@/lib/comercialApi";
import type { Lead, PipelineStage } from "@/data/comercialMock";
import { users } from "@/data/comercialMock";

const originLabel: Record<string, string> = {
  manual: "Manual", instagram: "Instagram", indicacao: "Indicação", site: "Site", campanha: "Campanha",
};

const daysIn = (iso: string) => Math.max(0, Math.floor((Date.now() - +new Date(iso)) / 86400000));

const Pipeline = () => {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [q, setQ] = useState("");
  const [owner, setOwner] = useState<string>("all");
  const [origin, setOrigin] = useState<string>("all");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    comercialApi.listStages().then(setStages);
    comercialApi.listLeads().then(setLeads);
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (q && !`${l.fantasyName} ${l.city} ${l.decisorName}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (owner !== "all" && l.ownerId !== owner) return false;
      if (origin !== "all" && l.origin !== origin) return false;
      return true;
    });
  }, [leads, q, owner, origin]);

  const move = async (leadId: string, stageId: string) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stageId, stageEnteredAt: new Date().toISOString() } : l)));
    await comercialApi.updateLead(leadId, { stageId });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 px-8 pt-8">
        <PageHeader
          icon={Briefcase}
          eyebrow="Comercial"
          title="Pipeline"
          description="Negócios em andamento. Arraste para mudar de estágio."
          actions={
            <>
              <Link to="/comercial/leads/novo" className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-glow">
                <Plus className="h-3.5 w-3.5" /> Novo lead
              </Link>
              <Link to="/comercial/configuracoes" className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-surface-hover">
                <SettingsIcon className="h-3.5 w-3.5" /> Configurar
              </Link>
            </>
          }
        />

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex flex-1 min-w-[240px] items-center gap-2 rounded-md border border-border bg-surface px-3 py-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, cidade ou decisor..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-subtle-foreground" />
          </div>
          <select value={owner} onChange={(e) => setOwner(e.target.value)} className="rounded-md border border-border bg-surface px-3 py-2 text-xs">
            <option value="all">Todos os owners</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <select value={origin} onChange={(e) => setOrigin(e.target.value)} className="rounded-md border border-border bg-surface px-3 py-2 text-xs">
            <option value="all">Todas as origens</option>
            {Object.entries(originLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden px-8 pb-8">
        <div className="flex h-full min-w-max gap-3">
          {stages.map((s) => {
            const colLeads = filteredLeads.filter((l) => l.stageId === s.id);
            return (
              <div
                key={s.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => { if (draggingId) { move(draggingId, s.id); setDraggingId(null); } }}
                className="flex h-full w-72 shrink-0 flex-col rounded-xl border border-border bg-surface"
              >
                <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: `hsl(${s.color})` }} />
                    <span className="text-xs font-semibold">{s.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">({colLeads.length})</span>
                  </div>
                  <span className="font-mono text-[10px] text-subtle-foreground">{s.probability}%</span>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto p-2">
                  {colLeads.length === 0 && (
                    <div className="rounded-md border border-dashed border-border/60 p-4 text-center text-[11px] text-subtle-foreground">Sem leads</div>
                  )}
                  {colLeads.map((l) => {
                    const u = users.find((x) => x.id === l.ownerId);
                    return (
                      <div
                        key={l.id}
                        draggable
                        onDragStart={() => setDraggingId(l.id)}
                        onClick={() => navigate(`/comercial/leads/${l.id}`)}
                        className="cursor-pointer rounded-lg border border-border bg-surface-elevated p-3 transition-colors hover:bg-surface-hover"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-medium leading-tight">{l.fantasyName}</div>
                          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[9px] uppercase text-muted-foreground">{originLabel[l.origin]}</span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {l.city}/{l.uf}
                        </div>
                        {l.estDeliveries && (
                          <div className="mt-1 text-[11px] text-muted-foreground">
                            <span className="font-mono text-foreground">{l.estDeliveries}</span> entregas/mês
                          </div>
                        )}
                        <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2">
                          <div className="flex items-center gap-1.5">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[9px] font-semibold text-primary">{u?.initials ?? "—"}</div>
                            <span className="text-[10px] text-muted-foreground">{u?.name.split(" ")[0]}</span>
                          </div>
                          <div className="flex items-center gap-1 font-mono text-[10px] text-subtle-foreground">
                            <Calendar className="h-2.5 w-2.5" /> {daysIn(l.stageEnteredAt)}d
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Pipeline;
