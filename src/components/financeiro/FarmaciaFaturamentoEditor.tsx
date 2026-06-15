import { useEffect, useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { financeiroApi } from "@/lib/financeiroApi";
import type {
  Farmacia, CentroCusto, SplitFaturamento, RegraVinculo, Entregador, ContractScope,
} from "@/data/financeiroMock";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  farmacia: Farmacia;
  onClose: () => void;
  onSaved: () => void;
}

/** Editor central de faturamento da farmácia: contrato, CCs, split por CC, vínculos. */
export const FarmaciaFaturamentoEditor = ({ open, farmacia, onClose, onSaved }: Props) => {
  const [f, setF] = useState<Farmacia>(farmacia);
  const [allCcs, setAllCcs] = useState<CentroCusto[]>([]);
  const [splits, setSplits] = useState<SplitFaturamento[]>([]);
  const [regras, setRegras] = useState<RegraVinculo[]>([]);
  const [ents, setEnts] = useState<Entregador[]>([]);

  useEffect(() => { setF(farmacia); }, [farmacia]);

  useEffect(() => {
    if (!open) return;
    financeiroApi.catalogos().then((c) => {
      setAllCcs(c.centrosCusto.filter((x) => x.farmaciaId === farmacia.id));
      setSplits(c.splitFaturamento.filter((s) => c.centrosCusto.some((cc) => cc.id === s.centroCustoId && cc.farmaciaId === farmacia.id)));
      setRegras(c.regrasVinculo.filter((r) => r.farmaciaId === farmacia.id));
      setEnts(c.entregadores);
    });
  }, [open, farmacia.id]);

  const set = <K extends keyof Farmacia>(k: K, v: Farmacia[K]) => setF((p) => ({ ...p, [k]: v }));

  const upsertSplit = (ccId: string, patch: Partial<SplitFaturamento>) => {
    setSplits((prev) => {
      const idx = prev.findIndex((s) => s.centroCustoId === ccId);
      const base = idx >= 0 ? prev[idx] : { centroCustoId: ccId, pctCooperativa: 70, pctFlux: 30 };
      const next = { ...base, ...patch };
      const out = idx >= 0 ? [...prev] : [...prev, next];
      if (idx >= 0) out[idx] = next;
      return out;
    });
  };

  const addRegra = () => {
    setRegras((prev) => [...prev, {
      id: `tmp-${Date.now()}`, entregadorId: ents[0]?.id ?? "", farmaciaId: f.id,
      centroCustoId: allCcs[0]?.id ?? "", taxaEntrega: f.taxaEntregaDefault ?? 7,
      minimoGarantidoSemanal: undefined, pctRepasse: 100,
    }]);
  };

  const updateRegra = (id: string, patch: Partial<RegraVinculo>) => {
    setRegras((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };
  const removeRegra = (id: string) => setRegras((prev) => prev.filter((r) => r.id !== id));

  const handleSave = async () => {
    await financeiroApi.saveFarmacia(f);
    await Promise.all(splits.map((s) => financeiroApi.saveSplitFaturamento(s)));

    // remover regras apagadas
    const original = (await financeiroApi.catalogos()).regrasVinculo.filter((r) => r.farmaciaId === f.id);
    const keepIds = new Set(regras.filter((r) => !r.id.startsWith("tmp-")).map((r) => r.id));
    await Promise.all(original.filter((r) => !keepIds.has(r.id)).map((r) => financeiroApi.removeRegraVinculo(r.id)));
    await Promise.all(regras.map((r) => financeiroApi.saveRegraVinculo(r.id.startsWith("tmp-") ? { ...r, id: "" } : r)));

    toast({ title: "Faturamento atualizado" });
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Faturamento — {farmacia.nome}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="contrato">
          <TabsList>
            <TabsTrigger value="contrato">Contrato & taxas</TabsTrigger>
            <TabsTrigger value="split">Centros de custo & split</TabsTrigger>
            <TabsTrigger value="vinculos">Vínculos entregadores</TabsTrigger>
          </TabsList>

          <TabsContent value="contrato" className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Escopo de contrato</Label>
              <Select value={f.contractScope} onValueChange={(v) => set("contractScope", v as ContractScope)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Coop + Flux</SelectItem>
                  <SelectItem value="coop_only">Somente Cooperativa</SelectItem>
                  <SelectItem value="flux_only">Somente Flux Farma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">E-mail de faturamento</Label>
              <Input value={f.billingEmail ?? ""} onChange={(e) => set("billingEmail", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Split default — % Cooperativa</Label>
              <Input type="number" value={f.splitCoopPct} onChange={(e) => {
                const v = +e.target.value; set("splitCoopPct", v); set("splitFluxPct", Math.max(0, 100 - v));
              }} />
            </div>
            <div>
              <Label className="text-xs">Split default — % Flux</Label>
              <Input type="number" value={f.splitFluxPct} readOnly className="opacity-70" />
            </div>
            <div>
              <Label className="text-xs">Taxa de entrega default (R$)</Label>
              <Input type="number" step="0.01" value={f.taxaEntregaDefault ?? 0}
                onChange={(e) => set("taxaEntregaDefault", +e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Taxa repasse default (R$)</Label>
              <Input type="number" step="0.01" value={f.taxaRepasseDefault ?? 0}
                onChange={(e) => set("taxaRepasseDefault", +e.target.value)} />
            </div>
            <div className="col-span-2 flex items-center gap-3 rounded-md border border-border bg-background p-3">
              <Switch checked={f.mgEnabled} onCheckedChange={(v) => set("mgEnabled", v)} />
              <div className="flex-1">
                <div className="text-xs font-medium">Mínimo garantido ativo</div>
                <div className="text-[10px] text-muted-foreground">Garante repasse mínimo quando entregas {"<"} mínimo configurado.</div>
              </div>
              <div className="w-40">
                <Label className="text-[10px] uppercase text-subtle-foreground">Mín. entregas/sem.</Label>
                <Input type="number" min={0} value={f.minimumDeliveriesCount ?? 0}
                  onChange={(e) => set("minimumDeliveriesCount", +e.target.value)} disabled={!f.mgEnabled} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Flux · codpes</Label>
              <Input type="number" value={f.fluxCodpes ?? 0} onChange={(e) => set("fluxCodpes", +e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Flux · codloc</Label>
              <Input type="number" value={f.fluxCodloc ?? 0} onChange={(e) => set("fluxCodloc", +e.target.value)} />
            </div>
          </TabsContent>

          <TabsContent value="split" className="mt-4">
            <p className="mb-2 text-[11px] text-muted-foreground">
              Cadastre/edite centros de custo em <strong>Configurações → Centros de custo</strong>. Aqui você define o split por CC.
            </p>
            <div className="overflow-hidden rounded-md border border-border">
              <table className="w-full text-xs">
                <thead className="bg-background text-left text-[10px] uppercase text-subtle-foreground">
                  <tr><th className="px-3 py-2">Centro de custo</th><th className="px-3 py-2">CNPJ</th>
                    <th className="px-3 py-2 text-right">% Cooperativa</th><th className="px-3 py-2 text-right">% Flux</th></tr>
                </thead>
                <tbody>
                  {allCcs.map((cc) => {
                    const sp = splits.find((s) => s.centroCustoId === cc.id) ?? { centroCustoId: cc.id, pctCooperativa: f.splitCoopPct, pctFlux: f.splitFluxPct };
                    return (
                      <tr key={cc.id} className="border-t border-border/60">
                        <td className="px-3 py-2 font-medium">{cc.nome}</td>
                        <td className="px-3 py-2 font-mono text-muted-foreground">{cc.cnpj ?? "—"}</td>
                        <td className="px-3 py-2 text-right">
                          <Input type="number" className="ml-auto w-24 text-right" value={sp.pctCooperativa}
                            onChange={(e) => { const v = +e.target.value; upsertSplit(cc.id, { pctCooperativa: v, pctFlux: Math.max(0, 100 - v) }); }} />
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-muted-foreground">{sp.pctFlux}%</td>
                      </tr>
                    );
                  })}
                  {!allCcs.length && <tr><td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">Nenhum CC vinculado a esta farmácia.</td></tr>}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="vinculos" className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">Regras de taxa/min. semanal/% repasse por entregador × CC.</p>
              <Button size="sm" variant="outline" onClick={addRegra}><Plus className="h-3.5 w-3.5 mr-1" /> Nova regra</Button>
            </div>
            <div className="overflow-hidden rounded-md border border-border">
              <table className="w-full text-xs">
                <thead className="bg-background text-left text-[10px] uppercase text-subtle-foreground">
                  <tr>
                    <th className="px-2 py-2">Entregador</th>
                    <th className="px-2 py-2">CC</th>
                    <th className="px-2 py-2 text-right">Taxa entrega</th>
                    <th className="px-2 py-2 text-right">Mín. semanal</th>
                    <th className="px-2 py-2 text-right">% Repasse</th>
                    <th className="px-2 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {regras.map((r) => (
                    <tr key={r.id} className="border-t border-border/60">
                      <td className="px-2 py-2">
                        <Select value={r.entregadorId} onValueChange={(v) => updateRegra(r.id, { entregadorId: v })}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>{ents.map((e) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}</SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-2">
                        <Select value={r.centroCustoId} onValueChange={(v) => updateRegra(r.id, { centroCustoId: v })}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>{allCcs.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-2"><Input className="h-8 text-right" type="number" step="0.01" value={r.taxaEntrega}
                        onChange={(e) => updateRegra(r.id, { taxaEntrega: +e.target.value })} /></td>
                      <td className="px-2 py-2"><Input className="h-8 text-right" type="number" value={r.minimoGarantidoSemanal ?? 0}
                        onChange={(e) => updateRegra(r.id, { minimoGarantidoSemanal: +e.target.value || undefined })} /></td>
                      <td className="px-2 py-2"><Input className="h-8 text-right" type="number" value={r.pctRepasse}
                        onChange={(e) => updateRegra(r.id, { pctRepasse: +e.target.value })} /></td>
                      <td className="px-2 py-2 text-right">
                        <button onClick={() => removeRegra(r.id)} className="text-destructive hover:opacity-80"><Trash2 className="h-3.5 w-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                  {!regras.length && <tr><td colSpan={6} className="px-2 py-4 text-center text-muted-foreground">Nenhum vínculo. Use “Nova regra”.</td></tr>}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}><Save className="h-3.5 w-3.5 mr-1" /> Salvar tudo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FarmaciaFaturamentoEditor;
