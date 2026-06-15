import { useEffect, useState } from "react";
import { Plus, Trash2, Save, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { financeiroApi } from "@/lib/financeiroApi";
import type {
  Farmacia, CentroCusto, SplitFaturamento, ContractScope,
} from "@/data/financeiroMock";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  farmacia: Farmacia;
  onClose: () => void;
  onSaved: () => void;
}

/**
 * Editor central de faturamento da farmácia.
 * Escopo (após simplificação): contrato (escopo + e-mail + split default + integração Flux)
 * e CRUD de centros de custo desta farmácia com split por CC.
 *
 * Não duplica: taxas de entrega/repasse, mínimo garantido (definidos em "Condições comerciais")
 * nem vínculos entregadores (visíveis em "Entregadores vinculados").
 */
export const FarmaciaFaturamentoEditor = ({ open, farmacia, onClose, onSaved }: Props) => {
  const [f, setF] = useState<Farmacia>(farmacia);
  const [allCcs, setAllCcs] = useState<CentroCusto[]>([]);
  const [splits, setSplits] = useState<SplitFaturamento[]>([]);
  const [removedCcIds, setRemovedCcIds] = useState<string[]>([]);

  useEffect(() => { setF(farmacia); }, [farmacia]);

  useEffect(() => {
    if (!open) return;
    setRemovedCcIds([]);
    financeiroApi.catalogos().then((c) => {
      setAllCcs(c.centrosCusto.filter((x) => x.farmaciaId === farmacia.id));
      setSplits(c.splitFaturamento.filter((s) =>
        c.centrosCusto.some((cc) => cc.id === s.centroCustoId && cc.farmaciaId === farmacia.id)));
    });
  }, [open, farmacia.id]);

  const set = <K extends keyof Farmacia>(k: K, v: Farmacia[K]) => setF((p) => ({ ...p, [k]: v }));

  const upsertSplit = (ccId: string, patch: Partial<SplitFaturamento>) => {
    setSplits((prev) => {
      const idx = prev.findIndex((s) => s.centroCustoId === ccId);
      const base = idx >= 0 ? prev[idx] : { centroCustoId: ccId, pctCooperativa: f.splitCoopPct, pctFlux: f.splitFluxPct };
      const next = { ...base, ...patch };
      const out = idx >= 0 ? [...prev] : [...prev, next];
      if (idx >= 0) out[idx] = next;
      return out;
    });
  };

  const addCc = () => {
    setAllCcs((prev) => [...prev, {
      id: `tmp-${Date.now()}`, nome: "Novo CC", farmaciaId: f.id, cnpj: "",
    }]);
  };
  const updateCc = (id: string, patch: Partial<CentroCusto>) => {
    setAllCcs((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };
  const removeCc = (id: string) => {
    setAllCcs((prev) => prev.filter((c) => c.id !== id));
    setSplits((prev) => prev.filter((s) => s.centroCustoId !== id));
    if (!id.startsWith("tmp-")) setRemovedCcIds((prev) => [...prev, id]);
  };

  const handleSave = async () => {
    await financeiroApi.saveFarmacia(f);
    // CCs: remover apagados, depois upsert restantes
    await Promise.all(removedCcIds.map((id) => financeiroApi.removeCentroCusto(id)));
    for (const cc of allCcs) {
      const saved = await financeiroApi.saveCentroCusto(cc.id.startsWith("tmp-") ? { ...cc, id: "" } : cc);
      // Se foi novo, reaproveita o id retornado p/ split
      const ccId = (saved as CentroCusto)?.id ?? cc.id;
      const sp = splits.find((s) => s.centroCustoId === cc.id);
      if (sp) await financeiroApi.saveSplitFaturamento({ ...sp, centroCustoId: ccId });
    }
    toast({ title: "Faturamento atualizado" });
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Faturamento — {farmacia.nome}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="contrato">
          <TabsList>
            <TabsTrigger value="contrato">Contrato</TabsTrigger>
            <TabsTrigger value="ccs">Centros de custo & split</TabsTrigger>
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
              <Label className="text-xs">Flux · codpes</Label>
              <Input type="number" value={f.fluxCodpes ?? 0} onChange={(e) => set("fluxCodpes", +e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Flux · codloc</Label>
              <Input type="number" value={f.fluxCodloc ?? 0} onChange={(e) => set("fluxCodloc", +e.target.value)} />
            </div>
            <p className="col-span-2 mt-1 rounded-md border border-dashed border-border bg-background/40 p-2 text-[11px] text-muted-foreground">
              Taxa de entrega, taxa de repasse e mínimo garantido são definidos em <strong>Condições comerciais</strong>.
              Vínculos entregadores aparecem em <strong>Entregadores vinculados</strong>.
            </p>
          </TabsContent>

          <TabsContent value="ccs" className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">
                Crie/edite os centros de custo (matriz/filiais) e o split Coop × Flux por CC.
              </p>
              <Button size="sm" variant="outline" onClick={addCc}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Novo CC
              </Button>
            </div>
            <div className="overflow-hidden rounded-md border border-border">
              <table className="w-full text-xs">
                <thead className="bg-background text-left text-[10px] uppercase text-subtle-foreground">
                  <tr>
                    <th className="px-2 py-2">Nome</th>
                    <th className="px-2 py-2">CNPJ</th>
                    <th className="px-2 py-2 text-right">% Coop</th>
                    <th className="px-2 py-2 text-right">% Flux</th>
                    <th className="px-2 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {allCcs.map((cc) => {
                    const sp = splits.find((s) => s.centroCustoId === cc.id) ?? {
                      centroCustoId: cc.id, pctCooperativa: f.splitCoopPct, pctFlux: f.splitFluxPct,
                    };
                    return (
                      <tr key={cc.id} className="border-t border-border/60">
                        <td className="px-2 py-2">
                          <Input className="h-8" value={cc.nome}
                            onChange={(e) => updateCc(cc.id, { nome: e.target.value })} />
                        </td>
                        <td className="px-2 py-2">
                          <Input className="h-8 font-mono" value={cc.cnpj ?? ""}
                            onChange={(e) => updateCc(cc.id, { cnpj: e.target.value })} />
                        </td>
                        <td className="px-2 py-2 text-right">
                          <Input className="h-8 w-20 text-right ml-auto" type="number" value={sp.pctCooperativa}
                            onChange={(e) => {
                              const v = +e.target.value;
                              upsertSplit(cc.id, { pctCooperativa: v, pctFlux: Math.max(0, 100 - v) });
                            }} />
                        </td>
                        <td className="px-2 py-2 text-right font-mono text-muted-foreground">{sp.pctFlux}%</td>
                        <td className="px-2 py-2 text-right">
                          <button onClick={() => removeCc(cc.id)} className="text-destructive hover:opacity-80">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!allCcs.length && (
                    <tr><td colSpan={5} className="px-2 py-4 text-center text-muted-foreground">
                      Nenhum CC. Use "Novo CC".
                    </td></tr>
                  )}
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
