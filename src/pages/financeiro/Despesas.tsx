import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { financeiroApi } from "@/lib/financeiroApi";
import { fmtBRL, fmtDate } from "@/lib/baixas";
import { EmpresaBadge } from "@/components/financeiro/EmpresaBadge";
import { RateioEditor } from "@/components/financeiro/RateioEditor";
import type { ContaPagar, CategoriaDespesa, CentroCusto, Empresa, Entregador, RateioItem, Entrega } from "@/data/financeiroMock";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Despesas = () => {
  const [cp, setCp] = useState<ContaPagar[]>([]);
  const [cats, setCats] = useState<CategoriaDespesa[]>([]);
  const [ccs, setCcs] = useState<CentroCusto[]>([]);
  const [entregadores, setEntregadores] = useState<Entregador[]>([]);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [open, setOpen] = useState(false);
  const [filtro, setFiltro] = useState<"todas" | "fixa" | "variavel">("todas");

  const load = () => financeiroApi.listContasPagar().then((all) => setCp(all.filter((c) => c.tipo === "operacional" || c.entregadorId)));
  useEffect(() => {
    load();
    financeiroApi.catalogos().then((c) => { setCats(c.categoriasDespesa); setCcs(c.centrosCusto); setEntregadores(c.entregadores); });
    import("@/data/financeiroMock").then((m) => setEntregas(m.entregas));
  }, []);

  const lista = cp.filter((c) => filtro === "todas" || c.classificacao === filtro);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex gap-1 rounded-md border border-border bg-surface p-0.5">
          {(["todas", "fixa", "variavel"] as const).map((f) => (
            <button key={f} onClick={() => setFiltro(f)}
              className={cn("rounded px-2.5 py-1 text-[11px] font-medium capitalize transition-colors",
                filtro === f ? "bg-surface-elevated text-foreground" : "text-muted-foreground")}>
              {f}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" /> Nova despesa</Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-[10px] uppercase tracking-wider text-subtle-foreground">
            <tr>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">Classif.</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Rateio</th>
              <th className="px-4 py-3">Vencimento</th>
              <th className="px-4 py-3 text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((c) => (
              <tr key={c.id} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-3 font-medium">{c.descricao}</td>
                <td className="px-4 py-3"><EmpresaBadge empresa={c.empresa} /></td>
                <td className="px-4 py-3 text-xs capitalize">{c.classificacao}</td>
                <td className="px-4 py-3 text-xs">{cats.find((x) => x.id === c.categoria)?.nome ?? c.categoria}</td>
                <td className="px-4 py-3 text-[11px] text-muted-foreground">{c.rateio?.length ? `${c.rateio.length} CCs` : "—"}</td>
                <td className="px-4 py-3 font-mono text-[11px]">{fmtDate(c.vencimento)}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold">{fmtBRL(c.valor)}</td>
              </tr>
            ))}
            {!lista.length && <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">Nenhuma despesa.</td></tr>}
          </tbody>
        </table>
      </div>

      <NovaDespesaDialog open={open} onOpenChange={setOpen} cats={cats} ccs={ccs} entregadores={entregadores} entregas={entregas}
        onCreate={async (d) => { await financeiroApi.criarDespesa(d); await load(); toast({ title: "Despesa lançada" }); }} />
    </div>
  );
};

interface NovaProps {
  open: boolean; onOpenChange: (v: boolean) => void;
  cats: CategoriaDespesa[]; ccs: CentroCusto[]; entregadores: Entregador[]; entregas: Entrega[];
  onCreate: (d: Omit<ContaPagar, "id" | "valorPago" | "saldo" | "status">) => Promise<void>;
}
const NovaDespesaDialog = ({ open, onOpenChange, cats, ccs, entregadores, entregas, onCreate }: NovaProps) => {
  const [descricao, setDescricao] = useState("");
  const [empresa, setEmpresa] = useState<Empresa>("flux");
  const [classificacao, setClass] = useState<"fixa" | "variavel">("variavel");
  const [categoria, setCat] = useState(cats[0]?.id ?? "");
  const [valor, setValor] = useState(0);
  const [venc, setVenc] = useState(new Date().toISOString().slice(0, 10));
  const [recorrencia, setRec] = useState<"unica" | "mensal" | "semanal" | "anual">("unica");
  const [entregadorId, setEnt] = useState<string | undefined>(undefined);
  const [usaRateio, setUsaRateio] = useState(false);
  const [rateio, setRateio] = useState<RateioItem[]>([]);

  useEffect(() => { if (!categoria && cats.length) setCat(cats[0].id); }, [cats, categoria]);

  const vinculosDoEnt = entregadorId
    ? Array.from(new Set(entregas.filter((e) => e.entregadorId === entregadorId).map((e) => `${e.farmaciaId}::${e.centroCustoId}`)))
        .map((k) => {
          const [farmaciaId, centroCustoId] = k.split("::");
          const qtd = entregas.filter((e) => e.entregadorId === entregadorId && e.farmaciaId === farmaciaId && e.centroCustoId === centroCustoId).length;
          return { centroCustoId, farmaciaId, qtdEntregas: qtd };
        })
    : [];

  const submit = async () => {
    await onCreate({
      tipo: entregadorId ? "entregador" : "operacional",
      empresa, categoria, descricao, valor, vencimento: venc,
      recorrencia, classificacao,
      entregadorId, rateio: usaRateio ? rateio : undefined,
    });
    onOpenChange(false);
    setDescricao(""); setValor(0); setRateio([]); setUsaRateio(false); setEnt(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Nova despesa</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label className="text-xs">Descrição</Label><Input value={descricao} onChange={(e) => setDescricao(e.target.value)} /></div>
          <div>
            <Label className="text-xs">Empresa</Label>
            <Select value={empresa} onValueChange={(v) => setEmpresa(v as Empresa)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="coop">Cooperativa</SelectItem><SelectItem value="flux">Flux Farma</SelectItem></SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Classificação</Label>
            <Select value={classificacao} onValueChange={(v) => setClass(v as "fixa" | "variavel")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="fixa">Fixa</SelectItem><SelectItem value="variavel">Variável</SelectItem></SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Categoria</Label>
            <Select value={categoria} onValueChange={setCat}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{cats.filter((c) => c.classificacao === classificacao).map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Recorrência</Label>
            <Select value={recorrencia} onValueChange={(v) => setRec(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unica">Única</SelectItem><SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem><SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Valor</Label><Input type="number" step="0.01" value={valor} onChange={(e) => setValor(+e.target.value)} /></div>
          <div><Label className="text-xs">Vencimento</Label><Input type="date" value={venc} onChange={(e) => setVenc(e.target.value)} /></div>
          <div className="col-span-2">
            <Label className="text-xs">Entregador (opcional — para despesas como diárias/auxílio)</Label>
            <Select value={entregadorId ?? "none"} onValueChange={(v) => setEnt(v === "none" ? undefined : v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Nenhum (despesa operacional) —</SelectItem>
                {entregadores.map((e) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input id="usa-rateio" type="checkbox" checked={usaRateio} onChange={(e) => setUsaRateio(e.target.checked)} className="h-4 w-4" />
            <Label htmlFor="usa-rateio" className="text-xs">Ratear esta despesa entre centros de custo</Label>
          </div>
          {usaRateio && (
            <div className="col-span-2">
              <RateioEditor total={valor} centrosCusto={ccs} vinculosEntregador={vinculosDoEnt}
                value={rateio} onChange={setRateio} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={!descricao || valor <= 0}>Lançar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Despesas;
