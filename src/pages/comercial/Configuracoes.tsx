import { useEffect, useState } from "react";
import { Briefcase, Workflow, ListChecks, XOctagon, DollarSign, Plug, ChevronRight, Plus, Trash2, GripVertical } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { comercialApi } from "@/lib/comercialApi";
import type { CustomFieldDef, LossReason, PipelineStage } from "@/data/comercialMock";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const sections = [
  { id: "pipeline", label: "Pipeline", icon: Workflow, desc: "Estágios, cores e probabilidades" },
  { id: "fields", label: "Campos customizados", icon: ListChecks, desc: "Campos extras nos leads" },
  { id: "reasons", label: "Motivos de perda", icon: XOctagon, desc: "Catálogo para fechamento" },
  { id: "pricing", label: "Catálogo de preços", icon: DollarSign, desc: "Faixas e pacotes (P2)" },
  { id: "integrations", label: "Integrações", icon: Plug, desc: "Instagram, Flux" },
];

const Configuracoes = () => {
  const [active, setActive] = useState("pipeline");

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <PageHeader icon={Briefcase} eyebrow="Comercial" title="Configurações" description="Funil, campos e catálogos do CRM comercial." />

        <div className="grid grid-cols-12 gap-6">
          <nav className="col-span-12 space-y-0.5 lg:col-span-4 xl:col-span-3">
            {sections.map((s) => (
              <button key={s.id} onClick={() => setActive(s.id)}
                className={cn("flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors", active === s.id ? "bg-surface-elevated" : "hover:bg-surface")}>
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", active === s.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                  <s.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{s.label}</div>
                  <div className="truncate text-[10px] text-subtle-foreground">{s.desc}</div>
                </div>
                <ChevronRight className={cn("h-3.5 w-3.5", active === s.id ? "text-primary" : "text-subtle-foreground")} />
              </button>
            ))}
          </nav>

          <div className="col-span-12 space-y-4 lg:col-span-8 xl:col-span-9">
            {active === "pipeline" && <PipelinePanel />}
            {active === "fields" && <FieldsPanel />}
            {active === "reasons" && <ReasonsPanel />}
            {active === "pricing" && <PricingPanel />}
            {active === "integrations" && <IntegrationsPanel />}
          </div>
        </div>
      </div>
    </div>
  );
};

const PipelinePanel = () => {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  useEffect(() => { comercialApi.listStages().then(setStages); }, []);

  const update = (id: string, patch: Partial<PipelineStage>) => {
    const next = stages.map((s) => (s.id === id ? { ...s, ...patch } : s));
    setStages(next); comercialApi.updateStages(next);
  };
  const add = () => {
    const next = [...stages, { id: `s_${Date.now()}`, name: "Novo estágio", color: "var(--info)", probability: 20, sort_order: stages.length + 1 }];
    setStages(next); comercialApi.updateStages(next);
  };
  const remove = (id: string) => {
    const next = stages.filter((s) => s.id !== id);
    setStages(next); comercialApi.updateStages(next);
    toast({ title: "Estágio removido" });
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Estágios do pipeline</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Ordene, edite cores e probabilidades por estágio.</p>
        </div>
        <button onClick={add} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow">
          <Plus className="h-3.5 w-3.5" /> Estágio
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {stages.map((s) => (
          <div key={s.id} className="flex items-center gap-2 rounded-md border border-border bg-background/40 px-3 py-2">
            <GripVertical className="h-3.5 w-3.5 cursor-grab text-subtle-foreground" />
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: `hsl(${s.color})` }} />
            <input value={s.name} onChange={(e) => update(s.id, { name: e.target.value })} className="flex-1 bg-transparent text-sm outline-none" />
            <input type="number" min={0} max={100} value={s.probability} onChange={(e) => update(s.id, { probability: Number(e.target.value) })}
              className="w-16 rounded border border-border bg-background/40 px-2 py-1 text-right font-mono text-xs" />
            <span className="text-[10px] text-subtle-foreground">%</span>
            {s.is_won && <span className="rounded bg-success/15 px-1.5 py-0.5 text-[9px] font-medium text-success">GANHO</span>}
            {s.is_lost && <span className="rounded bg-destructive/15 px-1.5 py-0.5 text-[9px] font-medium text-destructive">PERDIDO</span>}
            {s.is_entry && <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-medium text-primary">ENTRADA</span>}
            <button onClick={() => remove(s.id)} className="rounded p-1 text-subtle-foreground hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const FieldsPanel = () => {
  const [fields, setFields] = useState<CustomFieldDef[]>([]);
  useEffect(() => { comercialApi.listFieldDefs().then(setFields); }, []);

  const update = (id: string, patch: Partial<CustomFieldDef>) => {
    const next = fields.map((f) => (f.id === id ? { ...f, ...patch } : f));
    setFields(next); comercialApi.updateFieldDefs(next);
  };
  const add = () => {
    const next = [...fields, { id: `f_${Date.now()}`, slug: "novo_campo", label: "Novo campo", type: "text" as const, required: false, sort_order: fields.length + 1 }];
    setFields(next); comercialApi.updateFieldDefs(next);
  };
  const remove = (id: string) => {
    const next = fields.filter((f) => f.id !== id);
    setFields(next); comercialApi.updateFieldDefs(next);
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Campos personalizados</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Renderizados no form de novo lead e na ficha.</p>
        </div>
        <button onClick={add} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow">
          <Plus className="h-3.5 w-3.5" /> Campo
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-md border border-border">
        <table className="w-full text-xs">
          <thead className="bg-background/40 text-[10px] uppercase tracking-wider text-subtle-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Slug</th>
              <th className="px-3 py-2 text-left">Label</th>
              <th className="px-3 py-2 text-left">Tipo</th>
              <th className="px-3 py-2 text-left">Obrig.</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => (
              <tr key={f.id} className="border-t border-border">
                <td className="px-3 py-2"><input value={f.slug} onChange={(e) => update(f.id, { slug: e.target.value })} className="w-full bg-transparent font-mono outline-none" /></td>
                <td className="px-3 py-2"><input value={f.label} onChange={(e) => update(f.id, { label: e.target.value })} className="w-full bg-transparent outline-none" /></td>
                <td className="px-3 py-2">
                  <select value={f.type} onChange={(e) => update(f.id, { type: e.target.value as CustomFieldDef["type"] })} className="bg-transparent outline-none">
                    <option value="text">text</option><option value="number">number</option><option value="select">select</option><option value="date">date</option><option value="boolean">boolean</option>
                  </select>
                </td>
                <td className="px-3 py-2"><input type="checkbox" checked={f.required} onChange={(e) => update(f.id, { required: e.target.checked })} /></td>
                <td className="px-3 py-2 text-right">
                  <button onClick={() => remove(f.id)} className="rounded p-1 text-subtle-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ReasonsPanel = () => {
  const [reasons, setReasons] = useState<LossReason[]>([]);
  useEffect(() => { comercialApi.listLossReasons().then(setReasons); }, []);

  const update = (id: string, patch: Partial<LossReason>) => {
    const next = reasons.map((r) => (r.id === id ? { ...r, ...patch } : r));
    setReasons(next); comercialApi.updateLossReasons(next);
  };
  const add = () => {
    const next = [...reasons, { id: `l_${Date.now()}`, name: "Novo motivo", active: true }];
    setReasons(next); comercialApi.updateLossReasons(next);
  };
  const remove = (id: string) => {
    const next = reasons.filter((r) => r.id !== id);
    setReasons(next); comercialApi.updateLossReasons(next);
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Motivos de perda</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Aparecem no modal ao marcar um lead como perdido.</p>
        </div>
        <button onClick={add} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow">
          <Plus className="h-3.5 w-3.5" /> Motivo
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {reasons.map((r) => (
          <div key={r.id} className="flex items-center gap-2 rounded-md border border-border bg-background/40 px-3 py-2">
            <input value={r.name} onChange={(e) => update(r.id, { name: e.target.value })} className="flex-1 bg-transparent text-sm outline-none" />
            <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <input type="checkbox" checked={r.active} onChange={(e) => update(r.id, { active: e.target.checked })} /> Ativo
            </label>
            <button onClick={() => remove(r.id)} className="rounded p-1 text-subtle-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const PricingPanel = () => (
  <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center">
    <DollarSign className="mx-auto h-8 w-8 text-muted-foreground" />
    <h3 className="mt-3 text-sm font-semibold">Catálogo de preços</h3>
    <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">Faixas por volume, MDR e setup para o gerador de propostas. Disponível na fase P2.</p>
  </div>
);

const IntegrationsPanel = () => (
  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Instagram Lead Ads</h3>
        <span className="rounded bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">Conectado</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Webhook ativo. Último evento há 12 min.</p>
      <button className="mt-3 rounded-md border border-border bg-background/40 px-3 py-1.5 text-xs hover:bg-surface-hover">Ver logs</button>
    </div>
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Flux · Viabilidade</h3>
        <span className="rounded bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">OK</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Consultas de cobertura e volume disponíveis na ficha do lead.</p>
      <button className="mt-3 rounded-md border border-border bg-background/40 px-3 py-1.5 text-xs hover:bg-surface-hover">Testar viabilidade</button>
    </div>
  </div>
);

export default Configuracoes;
