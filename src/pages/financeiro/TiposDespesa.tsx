import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { financeiroApi } from "@/lib/financeiroApi";
import type { ExpenseType, CentroCusto } from "@/data/financeiroMock";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const empty: ExpenseType = {
  id: "", name: "", kind: "variavel", defaultEntity: "ambos",
  allocationMode: "none", active: true,
};

const TiposDespesa = () => {
  const [types, setTypes] = useState<ExpenseType[]>([]);
  const [ccs, setCcs] = useState<CentroCusto[]>([]);
  const [edit, setEdit] = useState<ExpenseType | null>(null);
  const [filtro, setFiltro] = useState<"todas" | "fixa" | "variavel">("todas");

  const load = () => financeiroApi.listExpenseTypes().then(setTypes);
  useEffect(() => { load(); financeiroApi.catalogos().then((c) => setCcs(c.centrosCusto)); }, []);

  const lista = types.filter((t) => filtro === "todas" || t.kind === filtro);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex gap-1 rounded-md border border-border bg-surface p-0.5">
          {(["todas", "fixa", "variavel"] as const).map((f) => (
            <button key={f} onClick={() => setFiltro(f)}
              className={cn("rounded px-2.5 py-1 text-[11px] font-medium capitalize transition-colors",
                filtro === f ? "bg-surface-elevated text-foreground" : "text-muted-foreground")}>{f}</button>
          ))}
        </div>
        <Button size="sm" onClick={() => setEdit({ ...empty })}><Plus className="h-3.5 w-3.5 mr-1" /> Novo tipo</Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-[10px] uppercase tracking-wider text-subtle-foreground">
            <tr>
              <th className="px-4 py-3">Nome</th><th className="px-4 py-3">Classif.</th>
              <th className="px-4 py-3">Entidade default</th><th className="px-4 py-3">Alocação</th>
              <th className="px-4 py-3">Recorrência</th><th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {lista.map((t) => (
              <tr key={t.id} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-2.5 font-medium">{t.name}</td>
                <td className="px-4 py-2.5 text-xs capitalize">{t.kind}</td>
                <td className="px-4 py-2.5 text-xs capitalize">{t.defaultEntity}</td>
                <td className="px-4 py-2.5 text-xs">{t.allocationMode}</td>
                <td className="px-4 py-2.5 text-xs">{t.recurrence ?? "—"}</td>
                <td className="px-4 py-2.5">
                  <span className={cn("inline-flex rounded px-2 py-0.5 text-[10px] font-medium",
                    t.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
                    {t.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => setEdit({ ...t })} className="text-xs text-primary hover:underline">
                    <Pencil className="inline h-3 w-3 mr-1" /> Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {edit && <Form e={edit} ccs={ccs} onClose={() => setEdit(null)}
        onSave={async (et) => { await financeiroApi.saveExpenseType(et); await load(); setEdit(null); toast({ title: "Tipo salvo" }); }} />}
    </div>
  );
};

const Form = ({ e, ccs, onClose, onSave }: {
  e: ExpenseType; ccs: CentroCusto[]; onClose: () => void; onSave: (t: ExpenseType) => Promise<void>;
}) => {
  const [t, setT] = useState<ExpenseType>(e);
  const set = <K extends keyof ExpenseType>(k: K, v: ExpenseType[K]) => setT((p) => ({ ...p, [k]: v }));
  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t.id ? "Editar" : "Novo"} tipo de despesa</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label className="text-xs">Nome</Label><Input value={t.name} onChange={(ev) => set("name", ev.target.value)} /></div>
          <div><Label className="text-xs">Classificação</Label>
            <Select value={t.kind} onValueChange={(v) => set("kind", v as "fixa" | "variavel")}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="fixa">Fixa</SelectItem><SelectItem value="variavel">Variável</SelectItem></SelectContent></Select></div>
          <div><Label className="text-xs">Entidade default</Label>
            <Select value={t.defaultEntity} onValueChange={(v) => set("defaultEntity", v as "coop" | "flux" | "ambos")}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="coop">Cooperativa</SelectItem>
                <SelectItem value="flux">Flux Farma</SelectItem>
                <SelectItem value="ambos">Ambas (a definir)</SelectItem>
              </SelectContent></Select></div>
          <div><Label className="text-xs">Modo alocação</Label>
            <Select value={t.allocationMode} onValueChange={(v) => set("allocationMode", v as ExpenseType["allocationMode"])}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem rateio</SelectItem>
                <SelectItem value="per_pharmacy">Por farmácia</SelectItem>
                <SelectItem value="per_driver">Por entregador</SelectItem>
                <SelectItem value="per_delivery">Por entrega</SelectItem>
              </SelectContent></Select></div>
          <div><Label className="text-xs">Recorrência</Label>
            <Select value={t.recurrence ?? "none"} onValueChange={(v) => set("recurrence", v === "none" ? undefined : v as ExpenseType["recurrence"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Nenhuma —</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent></Select></div>
          <div className="col-span-2"><Label className="text-xs">Centro de custo padrão (opcional)</Label>
            <Select value={t.defaultCentroCustoId ?? "none"} onValueChange={(v) => set("defaultCentroCustoId", v === "none" ? undefined : v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Nenhum —</SelectItem>
                {ccs.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
              </SelectContent></Select></div>
          <div className="col-span-2 flex items-center gap-2">
            <input id="ativo" type="checkbox" checked={t.active} onChange={(ev) => set("active", ev.target.checked)} className="h-4 w-4" />
            <Label htmlFor="ativo" className="text-xs">Tipo ativo</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSave(t)} disabled={!t.name}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TiposDespesa;
