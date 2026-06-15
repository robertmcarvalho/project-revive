import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { financeiroApi } from "@/lib/financeiroApi";
import type { CentroCusto, Farmacia } from "@/data/financeiroMock";
import { toast } from "@/hooks/use-toast";

const CentrosCusto = () => {
  const [ccs, setCcs] = useState<CentroCusto[]>([]);
  const [farm, setFarm] = useState<Farmacia[]>([]);
  const [edit, setEdit] = useState<CentroCusto | null>(null);

  const load = () => financeiroApi.catalogos().then((c) => { setCcs(c.centrosCusto); setFarm(c.farmacias); });
  useEffect(() => { load(); }, []);

  const handleSave = async (cc: CentroCusto) => {
    await financeiroApi.saveCentroCusto(cc);
    await load();
    setEdit(null);
    toast({ title: "Centro de custo salvo" });
  };
  const handleRemove = async (id: string) => {
    if (!confirm("Remover este centro de custo? Splits e vínculos relacionados serão limpos.")) return;
    await financeiroApi.removeCentroCusto(id);
    await load();
    toast({ title: "Centro de custo removido" });
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Centros de custo representam unidades faturáveis (matriz/filiais). Vínculos, split e taxas são editados na <strong>ficha da farmácia</strong>.
        </p>
        <Button size="sm" onClick={() => setEdit({ id: "", nome: "", farmaciaId: farm[0]?.id ?? "", cnpj: "" })}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Novo CC
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-[10px] uppercase tracking-wider text-subtle-foreground">
            <tr>
              <th className="px-4 py-3">Centro de custo</th>
              <th className="px-4 py-3">Farmácia</th>
              <th className="px-4 py-3">CNPJ</th>
              <th className="px-4 py-3 w-32 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {ccs.map((c) => (
              <tr key={c.id} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-2.5 font-medium">{c.nome}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{farm.find((f) => f.id === c.farmaciaId)?.nome ?? "—"}</td>
                <td className="px-4 py-2.5 font-mono text-xs">{c.cnpj ?? "—"}</td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => setEdit({ ...c })} className="mr-2 text-primary hover:underline inline-flex items-center gap-1 text-xs">
                    <Pencil className="h-3 w-3" /> Editar
                  </button>
                  <button onClick={() => handleRemove(c.id)} className="text-destructive hover:underline inline-flex items-center gap-1 text-xs">
                    <Trash2 className="h-3 w-3" /> Remover
                  </button>
                </td>
              </tr>
            ))}
            {!ccs.length && <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">Nenhum centro de custo cadastrado.</td></tr>}
          </tbody>
        </table>
      </div>

      {edit && (
        <Dialog open onOpenChange={(v) => { if (!v) setEdit(null); }}>
          <DialogContent>
            <DialogHeader><DialogTitle>{edit.id ? "Editar" : "Novo"} centro de custo</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div><Label className="text-xs">Nome</Label>
                <Input value={edit.nome} onChange={(e) => setEdit({ ...edit, nome: e.target.value })} /></div>
              <div><Label className="text-xs">Farmácia</Label>
                <Select value={edit.farmaciaId} onValueChange={(v) => setEdit({ ...edit, farmaciaId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{farm.map((f) => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}</SelectContent>
                </Select></div>
              <div><Label className="text-xs">CNPJ (opcional)</Label>
                <Input value={edit.cnpj ?? ""} onChange={(e) => setEdit({ ...edit, cnpj: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEdit(null)}>Cancelar</Button>
              <Button disabled={!edit.nome || !edit.farmaciaId} onClick={() => handleSave(edit)}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CentrosCusto;
