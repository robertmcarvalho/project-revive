import { useEffect, useState } from "react";
import { financeiroApi } from "@/lib/financeiroApi";
import { sourceLabel, sourceTone, contagemPorOrigem, parseCsvDeliveries } from "@/lib/billing/entregas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Upload, Plus, CheckCircle2, RefreshCw } from "lucide-react";
import type { DeliveryRecord, Farmacia, Entregador } from "@/data/financeiroMock";
import { cn } from "@/lib/utils";

const Entregas = () => {
  const [recs, setRecs] = useState<DeliveryRecord[]>([]);
  const [farms, setFarms] = useState<Farmacia[]>([]);
  const [ents, setEnts] = useState<Entregador[]>([]);
  const [farmId, setFarmId] = useState<string>("todas");
  const [entId, setEntId] = useState<string>("todos");
  const [openImport, setOpenImport] = useState(false);
  const [openManual, setOpenManual] = useState(false);

  const load = () => financeiroApi.listDeliveryRecords({ cicloId: "cycle-current" }).then(setRecs);
  useEffect(() => {
    load();
    financeiroApi.catalogos().then((c) => { setFarms(c.farmacias); setEnts(c.entregadores); });
  }, []);

  const filtered = recs.filter((r) =>
    (farmId === "todas" || r.farmaciaId === farmId) &&
    (entId === "todos" || r.entregadorId === entId));
  const origemKpis = contagemPorOrigem(filtered);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <div>
          <Label className="text-[10px] uppercase text-subtle-foreground">Farmácia</Label>
          <Select value={farmId} onValueChange={setFarmId}>
            <SelectTrigger className="h-8 w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[10px] uppercase text-subtle-foreground">Entregador</Label>
          <Select value={entId} onValueChange={setEntId}>
            <SelectTrigger className="h-8 w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {ents.map((e) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={() => toast({ title: "Sync Flux solicitada (mock)" })}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Sync Flux
          </Button>
          <Button size="sm" variant="outline" onClick={() => setOpenImport(true)}>
            <Upload className="h-3.5 w-3.5 mr-1" /> Importar CSV
          </Button>
          <Button size="sm" onClick={() => setOpenManual(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Lançar manual
          </Button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-5">
        <div className="rounded-lg border border-border bg-surface px-3 py-2">
          <div className="text-[10px] uppercase text-subtle-foreground">Total apurado</div>
          <div className="text-lg font-semibold">{filtered.filter((r) => !r.cancelled && r.verified).length}</div>
        </div>
        {(["flux_api", "flux_db", "manual", "csv"] as const).map((s) => (
          <div key={s} className="rounded-lg border border-border bg-surface px-3 py-2">
            <div className="text-[10px] uppercase text-subtle-foreground">{sourceLabel[s]}</div>
            <div className="text-lg font-semibold">{origemKpis[s] ?? 0}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-[10px] uppercase tracking-wider text-subtle-foreground">
            <tr>
              <th className="px-4 py-3">Origem</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Doc.</th>
              <th className="px-4 py-3">Rota</th>
              <th className="px-4 py-3">Farmácia</th>
              <th className="px-4 py-3">Entregador</th>
              <th className="px-4 py-3">External ID</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-2.5">
                  <span className={cn("inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ring-1", sourceTone[r.source])}>
                    {sourceLabel[r.source]}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-mono text-[11px]">{new Date(r.deliveredAt).toLocaleString("pt-BR")}</td>
                <td className="px-4 py-2.5 text-xs">{r.documentNumber ?? "—"}</td>
                <td className="px-4 py-2.5 text-xs">{r.routeId ?? "—"}</td>
                <td className="px-4 py-2.5 text-xs">{farms.find((f) => f.id === r.farmaciaId)?.nome}</td>
                <td className="px-4 py-2.5 text-xs">{ents.find((e) => e.id === r.entregadorId)?.nome}</td>
                <td className="px-4 py-2.5 font-mono text-[10px] text-muted-foreground">{r.externalId}</td>
                <td className="px-4 py-2.5 text-right">
                  {r.cancelled ? <span className="text-[11px] text-destructive">Cancelada</span>
                    : r.verified ? <span className="inline-flex items-center gap-1 text-[11px] text-success"><CheckCircle2 className="h-3 w-3" /> Verificada</span>
                    : <Button size="sm" variant="outline" className="h-6 text-[10px]"
                        onClick={() => financeiroApi.verificarEntrega(r.id).then(load)}>Marcar verificada</Button>}
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">Nenhum registro de entrega.</td></tr>}
          </tbody>
        </table>
      </div>

      <ImportDialog open={openImport} onOpenChange={setOpenImport} farms={farms} ents={ents} onDone={load} />
      <ManualDialog open={openManual} onOpenChange={setOpenManual} farms={farms} ents={ents} onDone={load} />
    </div>
  );
};

const ImportDialog = ({ open, onOpenChange, farms, ents, onDone }: {
  open: boolean; onOpenChange: (v: boolean) => void; farms: Farmacia[]; ents: Entregador[]; onDone: () => void;
}) => {
  const [csv, setCsv] = useState("external_id,document_number,delivered_at\n");
  const [farmId, setFarmId] = useState(farms[0]?.id ?? "");
  const [entId, setEntId] = useState(ents[0]?.id ?? "");
  const submit = async () => {
    const parsed = parseCsvDeliveries(csv);
    const farm = farms.find((f) => f.id === farmId);
    if (!parsed.length || !farm) { toast({ title: "CSV vazio ou farmácia inválida", variant: "destructive" }); return; }
    const cc = farm.centrosCusto[0];
    await financeiroApi.importarEntregasCSV(parsed.map((p) => ({
      externalId: p.externalId, documentNumber: p.documentNumber, deliveredAt: p.deliveredAt,
      farmaciaId: farmId, entregadorId: entId, fluxCodpes: farm.fluxCodpes, fluxCodloc: farm.fluxCodloc,
      cicloId: "cycle-current",
    })) as never);
    toast({ title: `${parsed.length} entregas importadas` });
    onOpenChange(false); onDone();
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Importar entregas (CSV)</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Farmácia</Label>
            <Select value={farmId} onValueChange={setFarmId}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}</SelectContent></Select></div>
          <div><Label className="text-xs">Entregador</Label>
            <Select value={entId} onValueChange={setEntId}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ents.map((e) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}</SelectContent></Select></div>
          <div className="col-span-2"><Label className="text-xs">CSV — colunas: external_id,document_number,delivered_at</Label>
            <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={8}
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit}>Importar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ManualDialog = ({ open, onOpenChange, farms, ents, onDone }: {
  open: boolean; onOpenChange: (v: boolean) => void; farms: Farmacia[]; ents: Entregador[]; onDone: () => void;
}) => {
  const [farmId, setFarmId] = useState(farms[0]?.id ?? "");
  const [entId, setEntId] = useState(ents[0]?.id ?? "");
  const [doc, setDoc] = useState("");
  const [data, setData] = useState(new Date().toISOString().slice(0, 16));
  const submit = async () => {
    const farm = farms.find((f) => f.id === farmId)!;
    const cc = farm.centrosCusto[0];
    await financeiroApi.lancarEntregaManual({
      farmaciaId: farmId, entregadorId: entId, deliveredAt: new Date(data).toISOString(),
      documentNumber: doc, fluxCodpes: farm.fluxCodpes, fluxCodloc: farm.fluxCodloc, cicloId: "cycle-current",
    });
    toast({ title: "Entrega lançada (aguardando verificação)" });
    onOpenChange(false); onDone();
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Lançar entrega manual</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Farmácia</Label>
            <Select value={farmId} onValueChange={setFarmId}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}</SelectContent></Select></div>
          <div><Label className="text-xs">Entregador</Label>
            <Select value={entId} onValueChange={setEntId}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ents.map((e) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}</SelectContent></Select></div>
          <div><Label className="text-xs">Documento (NF)</Label><Input value={doc} onChange={(e) => setDoc(e.target.value)} /></div>
          <div><Label className="text-xs">Data/hora</Label><Input type="datetime-local" value={data} onChange={(e) => setData(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit}>Lançar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Entregas;
