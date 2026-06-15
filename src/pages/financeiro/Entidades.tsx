import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { financeiroApi } from "@/lib/financeiroApi";
import { EmpresaBadge } from "@/components/financeiro/EmpresaBadge";
import type { LegalEntity, Empresa, PixKeyType } from "@/data/financeiroMock";
import { toast } from "@/hooks/use-toast";

const empty: LegalEntity = {
  id: "", entityType: "coop", legalName: "", tradeName: "", cnpj: "",
  address: { cep: "", logradouro: "", numero: "", bairro: "", cidade: "", uf: "" },
  financialEmail: "", commercialEmail: "", phone: "",
  bank: { code: "", name: "", branch: "", account: "", digit: "", type: "checking" },
  defaultSplitCoopPct: 70, defaultSplitFluxPct: 30,
};

const Entidades = () => {
  const [ents, setEnts] = useState<LegalEntity[]>([]);
  const [edit, setEdit] = useState<LegalEntity | null>(null);

  const load = () => financeiroApi.listLegalEntities().then(setEnts);
  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Cadastre as duas entidades jurídicas que faturam: <strong>CoopMob</strong> e <strong>Flux Farma</strong>.</p>
        <Button size="sm" onClick={() => setEdit({ ...empty })}><Plus className="h-3.5 w-3.5 mr-1" /> Nova entidade</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {ents.map((e) => (
          <div key={e.id} className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <EmpresaBadge empresa={e.entityType} />
              <button onClick={() => setEdit({ ...e })} className="text-xs text-primary hover:underline">
                <Pencil className="inline h-3 w-3 mr-1" /> Editar
              </button>
            </div>
            <h3 className="mt-3 text-sm font-semibold">{e.tradeName}</h3>
            <p className="text-xs text-muted-foreground">{e.legalName}</p>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
              <dt className="text-muted-foreground">CNPJ</dt><dd className="font-mono">{e.cnpj}</dd>
              <dt className="text-muted-foreground">Banco</dt><dd className="font-mono">{e.bank.name} ag {e.bank.branch} · cc {e.bank.account}-{e.bank.digit}</dd>
              <dt className="text-muted-foreground">PIX</dt><dd className="font-mono">{e.pixKey ?? "—"}</dd>
              <dt className="text-muted-foreground">Financeiro</dt><dd className="truncate">{e.financialEmail}</dd>
              <dt className="text-muted-foreground">Split default</dt><dd>{e.defaultSplitCoopPct}% Coop · {e.defaultSplitFluxPct}% Flux</dd>
            </dl>
          </div>
        ))}
      </div>

      {edit && <EntityDialog entity={edit} onClose={() => setEdit(null)}
        onSave={async (le) => { await financeiroApi.saveLegalEntity(le); await load(); setEdit(null); toast({ title: "Entidade salva" }); }} />}
    </div>
  );
};

const EntityDialog = ({ entity, onClose, onSave }: {
  entity: LegalEntity; onClose: () => void; onSave: (le: LegalEntity) => Promise<void>;
}) => {
  const [e, setE] = useState<LegalEntity>(entity);
  const set = <K extends keyof LegalEntity>(k: K, v: LegalEntity[K]) => setE((p) => ({ ...p, [k]: v }));
  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle>{e.id ? "Editar" : "Nova"} entidade jurídica</DialogTitle></DialogHeader>
        <Tabs defaultValue="ident">
          <TabsList>
            <TabsTrigger value="ident">Identificação</TabsTrigger>
            <TabsTrigger value="end">Endereço</TabsTrigger>
            <TabsTrigger value="bank">Bancário</TabsTrigger>
            <TabsTrigger value="com">Comercial</TabsTrigger>
          </TabsList>

          <TabsContent value="ident" className="mt-4 grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Tipo</Label>
              <Select value={e.entityType} onValueChange={(v) => set("entityType", v as Empresa)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="coop">Cooperativa</SelectItem><SelectItem value="flux">Flux Farma</SelectItem></SelectContent></Select></div>
            <div><Label className="text-xs">CNPJ</Label><Input value={e.cnpj} onChange={(ev) => set("cnpj", ev.target.value)} /></div>
            <div><Label className="text-xs">Razão social</Label><Input value={e.legalName} onChange={(ev) => set("legalName", ev.target.value)} /></div>
            <div><Label className="text-xs">Nome fantasia</Label><Input value={e.tradeName} onChange={(ev) => set("tradeName", ev.target.value)} /></div>
            <div><Label className="text-xs">Inscrição estadual</Label><Input value={e.stateReg ?? ""} onChange={(ev) => set("stateReg", ev.target.value)} /></div>
            <div><Label className="text-xs">Inscrição municipal</Label><Input value={e.municipalReg ?? ""} onChange={(ev) => set("municipalReg", ev.target.value)} /></div>
            <div><Label className="text-xs">Regime tributário</Label><Input value={e.taxRegime ?? ""} onChange={(ev) => set("taxRegime", ev.target.value)} /></div>
            <div><Label className="text-xs">Telefone</Label><Input value={e.phone} onChange={(ev) => set("phone", ev.target.value)} /></div>
            <div><Label className="text-xs">E-mail financeiro</Label><Input value={e.financialEmail} onChange={(ev) => set("financialEmail", ev.target.value)} /></div>
            <div><Label className="text-xs">E-mail comercial</Label><Input value={e.commercialEmail} onChange={(ev) => set("commercialEmail", ev.target.value)} /></div>
          </TabsContent>

          <TabsContent value="end" className="mt-4 grid grid-cols-3 gap-3">
            <div><Label className="text-xs">CEP</Label><Input value={e.address.cep} onChange={(ev) => set("address", { ...e.address, cep: ev.target.value })} /></div>
            <div className="col-span-2"><Label className="text-xs">Logradouro</Label><Input value={e.address.logradouro} onChange={(ev) => set("address", { ...e.address, logradouro: ev.target.value })} /></div>
            <div><Label className="text-xs">Número</Label><Input value={e.address.numero} onChange={(ev) => set("address", { ...e.address, numero: ev.target.value })} /></div>
            <div><Label className="text-xs">Bairro</Label><Input value={e.address.bairro} onChange={(ev) => set("address", { ...e.address, bairro: ev.target.value })} /></div>
            <div><Label className="text-xs">Cidade</Label><Input value={e.address.cidade} onChange={(ev) => set("address", { ...e.address, cidade: ev.target.value })} /></div>
            <div><Label className="text-xs">UF</Label><Input value={e.address.uf} onChange={(ev) => set("address", { ...e.address, uf: ev.target.value })} /></div>
          </TabsContent>

          <TabsContent value="bank" className="mt-4 grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Código banco</Label><Input value={e.bank.code} onChange={(ev) => set("bank", { ...e.bank, code: ev.target.value })} /></div>
            <div><Label className="text-xs">Nome banco</Label><Input value={e.bank.name} onChange={(ev) => set("bank", { ...e.bank, name: ev.target.value })} /></div>
            <div><Label className="text-xs">Agência</Label><Input value={e.bank.branch} onChange={(ev) => set("bank", { ...e.bank, branch: ev.target.value })} /></div>
            <div className="grid grid-cols-[1fr_60px] gap-2">
              <div><Label className="text-xs">Conta</Label><Input value={e.bank.account} onChange={(ev) => set("bank", { ...e.bank, account: ev.target.value })} /></div>
              <div><Label className="text-xs">Dígito</Label><Input value={e.bank.digit} onChange={(ev) => set("bank", { ...e.bank, digit: ev.target.value })} /></div>
            </div>
            <div><Label className="text-xs">Tipo</Label>
              <Select value={e.bank.type} onValueChange={(v) => set("bank", { ...e.bank, type: v as "checking" | "savings" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="checking">Corrente</SelectItem><SelectItem value="savings">Poupança</SelectItem></SelectContent></Select></div>
            <div><Label className="text-xs">Tipo chave PIX</Label>
              <Select value={e.pixKeyType ?? "cnpj"} onValueChange={(v) => set("pixKeyType", v as PixKeyType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpf">CPF</SelectItem><SelectItem value="cnpj">CNPJ</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem><SelectItem value="telefone">Telefone</SelectItem>
                  <SelectItem value="aleatoria">Aleatória</SelectItem>
                </SelectContent></Select></div>
            <div className="col-span-2"><Label className="text-xs">Chave PIX</Label><Input value={e.pixKey ?? ""} onChange={(ev) => set("pixKey", ev.target.value)} /></div>
          </TabsContent>

          <TabsContent value="com" className="mt-4 grid grid-cols-2 gap-3">
            <div><Label className="text-xs">% Coop padrão (split)</Label><Input type="number" value={e.defaultSplitCoopPct} onChange={(ev) => set("defaultSplitCoopPct", +ev.target.value)} /></div>
            <div><Label className="text-xs">% Flux padrão (split)</Label><Input type="number" value={e.defaultSplitFluxPct} onChange={(ev) => set("defaultSplitFluxPct", +ev.target.value)} /></div>
            <div><Label className="text-xs">Margem de serviço Flux (%)</Label><Input type="number" value={e.fluxServiceMarginPct ?? 0} onChange={(ev) => set("fluxServiceMarginPct", +ev.target.value)} /></div>
            <div className="col-span-2"><Label className="text-xs">Cabeçalho fatura</Label>
              <Input value={e.invoiceHeaderNotes ?? ""} onChange={(ev) => set("invoiceHeaderNotes", ev.target.value)} /></div>
            <div className="col-span-2"><Label className="text-xs">Rodapé fatura</Label>
              <Input value={e.invoiceFooterNotes ?? ""} onChange={(ev) => set("invoiceFooterNotes", ev.target.value)} /></div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSave(e)} disabled={!e.legalName || !e.cnpj}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Entidades;
