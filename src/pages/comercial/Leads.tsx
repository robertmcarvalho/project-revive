import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Plus, Search, MessageCircle, ArrowRight, Trophy, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { comercialApi } from "@/lib/comercialApi";
import type { Lead, PipelineStage } from "@/data/comercialMock";
import { users } from "@/data/comercialMock";
import { cn } from "@/lib/utils";

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [q, setQ] = useState("");
  const [stageId, setStageId] = useState<string>("all");
  const [ownerId, setOwnerId] = useState<string>("all");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    comercialApi.listStages().then(setStages);
    comercialApi.listLeads().then((ls) => { setLeads(ls); setSelected(ls[0]?.id ?? null); });
  }, []);

  const filtered = useMemo(() => leads.filter((l) => {
    if (q && !`${l.fantasyName} ${l.city} ${l.decisorName}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (stageId !== "all" && l.stageId !== stageId) return false;
    if (ownerId !== "all" && l.ownerId !== ownerId) return false;
    return true;
  }), [leads, q, stageId, ownerId]);

  const current = leads.find((l) => l.id === selected) ?? null;
  const stageOf = (id?: string) => stages.find((s) => s.id === id);
  const ownerOf = (id?: string) => users.find((u) => u.id === id);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 px-8 pt-8">
        <PageHeader
          icon={Briefcase}
          eyebrow="Comercial"
          title="Leads"
          description="Busca rápida e ficha lateral do prospect."
          actions={
            <Link to="/comercial/leads/novo" className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow">
              <Plus className="h-3.5 w-3.5" /> Novo lead
            </Link>
          }
        />
      </div>

      <div className="grid flex-1 grid-cols-12 gap-4 overflow-hidden px-8 pb-8">
        {/* Lista */}
        <div className="col-span-12 flex flex-col gap-3 overflow-hidden lg:col-span-7">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-md border border-border bg-surface px-3 py-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar lead..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-subtle-foreground" />
            </div>
            <select value={stageId} onChange={(e) => setStageId(e.target.value)} className="rounded-md border border-border bg-surface px-2.5 py-2 text-xs">
              <option value="all">Todos os estágios</option>
              {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)} className="rounded-md border border-border bg-surface px-2.5 py-2 text-xs">
              <option value="all">Todos os owners</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-surface">
            {filtered.length === 0 && <div className="p-8 text-center text-xs text-muted-foreground">Nenhum lead encontrado.</div>}
            {filtered.map((l) => {
              const st = stageOf(l.stageId);
              const u = ownerOf(l.ownerId);
              const active = selected === l.id;
              return (
                <button key={l.id} onClick={() => setSelected(l.id)} className={cn("flex w-full items-center gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-surface-hover", active && "bg-surface-elevated")}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-xs font-semibold text-primary-foreground">{l.fantasyName.slice(0, 2).toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{l.fantasyName}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{l.city}/{l.uf} · {l.decisorName}</div>
                  </div>
                  <div className="hidden flex-col items-end gap-1 md:flex">
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ background: `hsl(${st?.color}/0.15)`, color: `hsl(${st?.color})` }}>{st?.name}</span>
                    <span className="font-mono text-[10px] text-subtle-foreground">{u?.initials}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detalhe */}
        <div className="hidden lg:col-span-5 lg:flex lg:flex-col lg:overflow-hidden">
          {current ? (
            <div className="flex h-full flex-col overflow-y-auto rounded-xl border border-border bg-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">{current.city}/{current.uf}</div>
                  <h2 className="text-lg font-semibold tracking-tight">{current.fantasyName}</h2>
                </div>
                <Link to={`/comercial/leads/${current.id}`} className="flex items-center gap-1 rounded-md border border-border bg-background/40 px-2.5 py-1.5 text-[11px] hover:bg-surface-hover">
                  Abrir ficha <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <Field label="Decisor" value={current.decisorName} />
                <Field label="WhatsApp" value={current.whatsapp} mono />
                <Field label="Estágio" value={stageOf(current.stageId)?.name ?? "—"} />
                <Field label="Owner" value={ownerOf(current.ownerId)?.name ?? "—"} />
                {current.estDeliveries && <Field label="Entregas/mês" value={String(current.estDeliveries)} mono />}
                {current.estDrivers && <Field label="Entregadores" value={String(current.estDrivers)} mono />}
              </div>

              {current.notes && (
                <div className="mt-4 rounded-md border border-border bg-background/40 p-3 text-xs text-muted-foreground">{current.notes}</div>
              )}

              <div className="mt-auto pt-5">
                <div className="grid grid-cols-3 gap-2">
                  <button className="flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary-glow">
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </button>
                  <button className="flex items-center justify-center gap-1.5 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-xs font-medium text-success hover:bg-success/15">
                    <Trophy className="h-3.5 w-3.5" /> Ganho
                  </button>
                  <button className="flex items-center justify-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/15">
                    <X className="h-3.5 w-3.5" /> Perdido
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border bg-surface text-xs text-muted-foreground">Selecione um lead</div>
          )}
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div className="rounded-md border border-border bg-background/40 px-3 py-2">
    <div className="text-[10px] uppercase tracking-wider text-subtle-foreground">{label}</div>
    <div className={cn("mt-0.5 text-xs text-foreground", mono && "font-mono")}>{value}</div>
  </div>
);

export default Leads;
