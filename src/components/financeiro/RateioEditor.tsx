import { useMemo, useState, useEffect } from "react";
import { Plus, Trash2, Calculator } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RateioItem, CentroCusto } from "@/data/financeiroMock";
import { dividirIgual, dividirProporcionalEntregas, recalcularDePercentual, recalcularDeValor, validarRateio, type ModoRateio } from "@/lib/rateio";
import { cn } from "@/lib/utils";

interface VinculoSugestao { centroCustoId: string; farmaciaId: string; qtdEntregas: number }

interface Props {
  total: number;
  centrosCusto: CentroCusto[];
  vinculosEntregador?: VinculoSugestao[]; // se vier, habilita modo proporcional
  value: RateioItem[];
  onChange: (itens: RateioItem[]) => void;
}

export const RateioEditor = ({ total, centrosCusto, vinculosEntregador = [], value, onChange }: Props) => {
  const [modo, setModo] = useState<ModoRateio>(value.length ? "manual_pct" : "igual");

  const validacao = useMemo(() => validarRateio(value, total), [value, total]);

  const aplicarModo = (m: ModoRateio) => {
    setModo(m);
    if (m === "igual") {
      const alvos = value.length ? value : vinculosEntregador.map((v) => ({ centroCustoId: v.centroCustoId, farmaciaId: v.farmaciaId }));
      onChange(dividirIgual(total, alvos));
    } else if (m === "proporcional_entregas" && vinculosEntregador.length) {
      onChange(dividirProporcionalEntregas(total, vinculosEntregador));
    }
  };

  useEffect(() => {
    if (modo === "manual_pct") onChange(recalcularDePercentual(value, total));
    if (modo === "manual_valor") onChange(recalcularDeValor(value, total));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const addLinha = () => {
    const cc = centrosCusto[0];
    if (!cc) return;
    onChange([...value, { centroCustoId: cc.id, farmaciaId: cc.farmaciaId, percentual: 0, valor: 0 }]);
  };
  const remLinha = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const setLinha = (i: number, patch: Partial<RateioItem>) => {
    const next = value.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
    if (modo === "manual_pct" && patch.percentual !== undefined) onChange(recalcularDePercentual(next, total));
    else if (modo === "manual_valor" && patch.valor !== undefined) onChange(recalcularDeValor(next, total));
    else onChange(next);
  };

  return (
    <div className="rounded-md border border-border bg-surface p-3">
      <div className="mb-2 flex items-center justify-between">
        <Label className="text-xs font-medium flex items-center gap-1.5"><Calculator className="h-3.5 w-3.5" /> Rateio</Label>
        <div className="flex items-center gap-1">
          {(["igual", "manual_pct", "manual_valor", "proporcional_entregas"] as ModoRateio[]).map((m) => (
            <button key={m}
              disabled={m === "proporcional_entregas" && !vinculosEntregador.length}
              onClick={() => aplicarModo(m)}
              className={cn("rounded px-2 py-1 text-[10px] font-medium border transition-colors",
                modo === m ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-surface-hover",
                m === "proporcional_entregas" && !vinculosEntregador.length && "opacity-40 cursor-not-allowed")}
            >
              {m === "igual" ? "% igual" : m === "manual_pct" ? "% manual" : m === "manual_valor" ? "R$ manual" : "∝ entregas"}
            </button>
          ))}
        </div>
      </div>
      <table className="w-full text-xs">
        <thead className="text-[10px] uppercase text-subtle-foreground">
          <tr><th className="text-left py-1.5">Centro de custo</th><th className="text-right">%</th><th className="text-right">Valor</th><th></th></tr>
        </thead>
        <tbody>
          {value.map((it, i) => (
            <tr key={i} className="border-t border-border/60">
              <td className="py-1.5 pr-2">
                <Select value={it.centroCustoId} onValueChange={(v) => {
                  const cc = centrosCusto.find((c) => c.id === v);
                  setLinha(i, { centroCustoId: v, farmaciaId: cc?.farmaciaId });
                }}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{centrosCusto.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                </Select>
              </td>
              <td className="py-1.5 pl-2 text-right">
                <Input type="number" step="0.01" className="h-8 w-20 text-right ml-auto"
                  value={it.percentual} disabled={modo !== "manual_pct"}
                  onChange={(e) => setLinha(i, { percentual: +e.target.value })} />
              </td>
              <td className="py-1.5 pl-2 text-right">
                <Input type="number" step="0.01" className="h-8 w-28 text-right ml-auto"
                  value={it.valor} disabled={modo !== "manual_valor"}
                  onChange={(e) => setLinha(i, { valor: +e.target.value })} />
              </td>
              <td className="pl-2">
                <button onClick={() => remLinha(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 flex items-center justify-between">
        <Button size="sm" variant="outline" onClick={addLinha} className="h-7 text-xs"><Plus className="h-3 w-3 mr-1" /> Adicionar CC</Button>
        <div className={cn("text-[11px]", validacao.ok ? "text-success" : "text-destructive")}>
          {validacao.ok ? "✓ Rateio fechado" : validacao.erro}
        </div>
      </div>
    </div>
  );
};
