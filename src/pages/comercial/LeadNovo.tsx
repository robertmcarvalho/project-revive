import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Briefcase, ArrowLeft, Save } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { comercialApi } from "@/lib/comercialApi";
import type { CustomFieldDef, DealOrigin } from "@/data/comercialMock";
import { users } from "@/data/comercialMock";
import { toast } from "@/hooks/use-toast";

const LeadNovo = () => {
  const nav = useNavigate();
  const [fields, setFields] = useState<CustomFieldDef[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fantasyName: "", companyName: "", cnpj: "", city: "", uf: "", whatsapp: "",
    decisorName: "", decisorEmail: "", decisorRole: "",
    ownerId: users[0].id, origin: "manual" as DealOrigin, campaign: "",
    estDeliveries: "", estDrivers: "", erp: "", peakHours: "", notes: "",
    customFields: {} as Record<string, string | number | boolean>,
  });

  useEffect(() => { comercialApi.listFieldDefs().then(setFields); }, []);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const setCustom = (slug: string, v: string | number | boolean) =>
    setForm((f) => ({ ...f, customFields: { ...f.customFields, [slug]: v } }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fantasyName || !form.whatsapp || !form.city || !form.decisorName) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    setSaving(true);
    const lead = await comercialApi.createLead({
      fantasyName: form.fantasyName, companyName: form.companyName || undefined, cnpj: form.cnpj || undefined,
      city: form.city, uf: form.uf, whatsapp: form.whatsapp,
      decisorName: form.decisorName, decisorEmail: form.decisorEmail || undefined, decisorRole: form.decisorRole || undefined,
      ownerId: form.ownerId, stageId: "s1", origin: form.origin, campaign: form.campaign || undefined,
      estDeliveries: form.estDeliveries ? Number(form.estDeliveries) : undefined,
      estDrivers: form.estDrivers ? Number(form.estDrivers) : undefined,
      erp: form.erp || undefined, peakHours: form.peakHours || undefined, notes: form.notes || undefined,
      customFields: form.customFields,
    });
    toast({ title: "Lead cadastrado", description: lead.fantasyName });
    nav(`/comercial/leads/${lead.id}`);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-8 py-8">
        <Link to="/comercial/leads" className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Voltar
        </Link>
        <PageHeader icon={Briefcase} eyebrow="Comercial · Novo lead" title="Cadastrar prospect" description="Lead comercial — não é o cadastro definitivo da farmácia." />

        <form onSubmit={submit} className="space-y-4">
          <Section title="Identificação" hint="Dados mínimos para começar a abordagem.">
            <Grid>
              <Input label="Nome fantasia *" value={form.fantasyName} onChange={(v) => set("fantasyName", v)} />
              <Input label="WhatsApp *" value={form.whatsapp} onChange={(v) => set("whatsapp", v)} placeholder="+55 11 99000-0000" mono />
              <Input label="Cidade *" value={form.city} onChange={(v) => set("city", v)} />
              <Input label="UF *" value={form.uf} onChange={(v) => set("uf", v.toUpperCase())} maxLength={2} mono />
              <Input label="Razão social" value={form.companyName} onChange={(v) => set("companyName", v)} />
              <Input label="CNPJ" value={form.cnpj} onChange={(v) => set("cnpj", v)} placeholder="00.000.000/0000-00" mono />
            </Grid>
          </Section>

          <Section title="Contato" hint="Quem decide.">
            <Grid>
              <Input label="Nome do decisor *" value={form.decisorName} onChange={(v) => set("decisorName", v)} />
              <Input label="E-mail" value={form.decisorEmail} onChange={(v) => set("decisorEmail", v)} />
              <Input label="Cargo" value={form.decisorRole} onChange={(v) => set("decisorRole", v)} />
            </Grid>
          </Section>

          <Section title="Operação (estimativa)" hint="Opcional. Ajuda no diagnóstico inicial.">
            <Grid>
              <Input label="Entregas/mês" value={form.estDeliveries} onChange={(v) => set("estDeliveries", v)} mono />
              <Input label="Nº entregadores" value={form.estDrivers} onChange={(v) => set("estDrivers", v)} mono />
              <Input label="ERP" value={form.erp} onChange={(v) => set("erp", v)} />
              <Input label="Horário de pico" value={form.peakHours} onChange={(v) => set("peakHours", v)} placeholder="18h–21h" />
            </Grid>
          </Section>

          <Section title="Comercial">
            <Grid>
              <Select label="Owner" value={form.ownerId} onChange={(v) => set("ownerId", v)}
                options={users.map((u) => ({ value: u.id, label: u.name }))} />
              <Select label="Origem" value={form.origin} onChange={(v) => set("origin", v as DealOrigin)}
                options={[
                  { value: "manual", label: "Manual" }, { value: "instagram", label: "Instagram" },
                  { value: "indicacao", label: "Indicação" }, { value: "site", label: "Site" }, { value: "campanha", label: "Campanha" },
                ]} />
              <Input label="Campanha" value={form.campaign} onChange={(v) => set("campaign", v)} />
            </Grid>
            <div className="mt-3">
              <label className="text-[10px] uppercase tracking-wider text-subtle-foreground">Notas</label>
              <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary/60" />
            </div>
          </Section>

          {fields.length > 0 && (
            <Section title="Campos personalizados" hint="Configurados no workspace.">
              <Grid>
                {fields.map((f) => (
                  <div key={f.id}>
                    <label className="text-[10px] uppercase tracking-wider text-subtle-foreground">{f.label}{f.required && " *"}</label>
                    {f.type === "boolean" ? (
                      <select className="mt-1 w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary/60"
                        value={String(form.customFields[f.slug] ?? "")} onChange={(e) => setCustom(f.slug, e.target.value === "true")}>
                        <option value="">—</option><option value="true">Sim</option><option value="false">Não</option>
                      </select>
                    ) : (
                      <input type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                        value={(form.customFields[f.slug] as string) ?? ""} onChange={(e) => setCustom(f.slug, f.type === "number" ? Number(e.target.value) : e.target.value)}
                        className="mt-1 w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary/60" />
                    )}
                  </div>
                ))}
              </Grid>
            </Section>
          )}

          <div className="flex justify-end gap-2">
            <Link to="/comercial/leads" className="rounded-md border border-border bg-surface px-4 py-2 text-xs hover:bg-surface-hover">Cancelar</Link>
            <button type="submit" disabled={saving} className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary-glow disabled:opacity-70">
              <Save className="h-3.5 w-3.5" /> {saving ? "Salvando..." : "Cadastrar lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Section = ({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-border bg-surface p-6">
    <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
    {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    <div className="mt-4">{children}</div>
  </div>
);
const Grid = ({ children }: { children: React.ReactNode }) => <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{children}</div>;
const Input = ({ label, value, onChange, mono, placeholder, maxLength }: { label: string; value: string; onChange: (v: string) => void; mono?: boolean; placeholder?: string; maxLength?: number }) => (
  <div>
    <label className="text-[10px] uppercase tracking-wider text-subtle-foreground">{label}</label>
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength}
      className={`mt-1 w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary/60 ${mono ? "font-mono" : ""}`} />
  </div>
);
const Select = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
  <div>
    <label className="text-[10px] uppercase tracking-wider text-subtle-foreground">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary/60">
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

export default LeadNovo;
