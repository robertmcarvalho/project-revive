import { useEffect, useState } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { financeiroApi } from "@/lib/financeiroApi";
import { fmtBRL, fmtDate } from "@/lib/baixas";
import type { Baixa, MovimentoBancario, ContaBancaria } from "@/data/financeiroMock";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Conciliacao = () => {
  const [baixas, setBaixas] = useState<Baixa[]>([]);
  const [movs, setMovs] = useState<MovimentoBancario[]>([]);
  const [contas, setContas] = useState<ContaBancaria[]>([]);

  const load = async () => {
    setBaixas(await financeiroApi.listBaixas());
    setMovs(await financeiroApi.listMovimentos());
  };
  useEffect(() => {
    load();
    financeiroApi.catalogos().then((c) => setContas(c.contasBancarias));
  }, []);

  const conciliar = async (b: Baixa) => { await financeiroApi.marcarConciliada(b.id); await load(); toast({ title: "Baixa conciliada" }); };
  const estornar = async (b: Baixa) => {
    const m = window.prompt("Motivo do estorno");
    if (!m) return;
    await financeiroApi.estornar(b.id, m); await load();
    toast({ title: "Baixa estornada" });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-4 py-3 text-sm font-semibold">Baixas registradas</div>
        <table className="w-full text-sm">
          <thead className="text-left text-[10px] uppercase text-subtle-foreground">
            <tr><th className="px-4 py-2">Data</th><th className="px-4 py-2">Tipo</th><th className="px-4 py-2 text-right">Valor</th><th className="px-4 py-2">Status</th><th></th></tr>
          </thead>
          <tbody>
            {baixas.map((b) => (
              <tr key={b.id} className={cn("border-t border-border/40", b.estornadaEm && "opacity-50")}>
                <td className="px-4 py-2 font-mono text-[11px]">{fmtDate(b.data)}</td>
                <td className="px-4 py-2 text-xs capitalize">{b.tipo}</td>
                <td className="px-4 py-2 text-right font-mono">{fmtBRL(b.valor)}</td>
                <td className="px-4 py-2 text-[11px]">
                  {b.estornadaEm ? <span className="text-destructive">Estornada</span>
                    : b.conciliada ? <span className="text-success">Conciliada</span>
                    : <span className="text-warning">Pendente</span>}
                </td>
                <td className="px-4 py-2 text-right">
                  {!b.estornadaEm && !b.conciliada && (
                    <Button size="sm" variant="outline" onClick={() => conciliar(b)}><CheckCircle2 className="h-3 w-3 mr-1" /> Conciliar</Button>
                  )}
                  {!b.estornadaEm && (
                    <Button size="sm" variant="ghost" className="ml-1" onClick={() => estornar(b)}><RotateCcw className="h-3 w-3" /></Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-4 py-3 text-sm font-semibold">Movimentos bancários (importados)</div>
        <table className="w-full text-sm">
          <thead className="text-left text-[10px] uppercase text-subtle-foreground">
            <tr><th className="px-4 py-2">Data</th><th className="px-4 py-2">Conta</th><th className="px-4 py-2">Descrição</th><th className="px-4 py-2 text-right">Valor</th></tr>
          </thead>
          <tbody>
            {movs.map((m) => {
              const c = contas.find((x) => x.id === m.contaBancariaId);
              return (
                <tr key={m.id} className="border-t border-border/40">
                  <td className="px-4 py-2 font-mono text-[11px]">{fmtDate(m.data)}</td>
                  <td className="px-4 py-2 text-[11px]">{c ? `${c.banco} ${c.conta}` : m.contaBancariaId}</td>
                  <td className="px-4 py-2 text-xs">{m.descricao}</td>
                  <td className={cn("px-4 py-2 text-right font-mono", m.valor < 0 ? "text-destructive" : "text-success")}>{fmtBRL(m.valor)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Conciliacao;
