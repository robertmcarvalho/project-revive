import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { financeiroApi } from "@/lib/financeiroApi";
import { fmtBRL, fmtDate } from "@/lib/baixas";
import { EmpresaBadge } from "@/components/financeiro/EmpresaBadge";
import { SaldoCell } from "@/components/financeiro/SaldoCell";
import { BaixaDialog } from "@/components/financeiro/BaixaDialog";
import type { ContaPagar, ContaBancaria, Cartao, Entregador } from "@/data/financeiroMock";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const statusCls: Record<string, string> = {
  aberta: "text-muted-foreground", parcial: "text-warning",
  paga: "text-success", vencida: "text-destructive", agendada: "text-primary",
};

const APagar = () => {
  const [cp, setCp] = useState<ContaPagar[]>([]);
  const [contas, setContas] = useState<ContaBancaria[]>([]);
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [entregadores, setEntregadores] = useState<Entregador[]>([]);
  const [sel, setSel] = useState<ContaPagar | null>(null);
  const [aba, setAba] = useState("entregadores");

  const load = () => financeiroApi.listContasPagar().then(setCp);
  useEffect(() => {
    load();
    financeiroApi.catalogos().then((c) => { setContas(c.contasBancarias); setCartoes(c.cartoes); setEntregadores(c.entregadores); });
  }, []);

  const grupos = useMemo(() => ({
    entregadores: cp.filter((c) => c.tipo === "entregador"),
    op_coop: cp.filter((c) => c.tipo === "operacional" && c.empresa === "coop"),
    op_flux: cp.filter((c) => c.tipo === "operacional" && c.empresa === "flux"),
  }), [cp]);

  const renderTabela = (lista: ContaPagar[]) => (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-[10px] uppercase tracking-wider text-subtle-foreground">
          <tr>
            <th className="px-4 py-3">Descrição</th>
            <th className="px-4 py-3">Empresa</th>
            <th className="px-4 py-3">Categoria</th>
            <th className="px-4 py-3">Vencimento</th>
            <th className="px-4 py-3 text-right">Valor</th>
            <th className="px-4 py-3">Saldo</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {lista.map((c) => (
            <tr key={c.id} className="border-b border-border/40 last:border-0">
              <td className="px-4 py-3">
                <div className="font-medium">{c.descricao}</div>
                {c.entregadorId && <div className="text-[11px] text-muted-foreground">{entregadores.find((e) => e.id === c.entregadorId)?.nome}</div>}
              </td>
              <td className="px-4 py-3"><EmpresaBadge empresa={c.empresa} /></td>
              <td className="px-4 py-3 text-xs">{c.categoria}</td>
              <td className="px-4 py-3 font-mono text-[11px]">{fmtDate(c.vencimento)}</td>
              <td className="px-4 py-3 text-right font-mono">{fmtBRL(c.valor)}</td>
              <td className="px-4 py-3"><SaldoCell valor={c.valor} valorPago={c.valorPago} status={c.status} /></td>
              <td className={cn("px-4 py-3 text-xs capitalize", statusCls[c.status])}>{c.status}</td>
              <td className="px-4 py-3 text-right">
                {c.status !== "paga" && <Button size="sm" variant="outline" onClick={() => setSel(c)}>Baixar</Button>}
              </td>
            </tr>
          ))}
          {!lista.length && <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">Nenhum lançamento.</td></tr>}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <Tabs value={aba} onValueChange={setAba}>
        <TabsList>
          <TabsTrigger value="entregadores">Entregadores · {grupos.entregadores.length}</TabsTrigger>
          <TabsTrigger value="op_coop">Operacional · Coop · {grupos.op_coop.length}</TabsTrigger>
          <TabsTrigger value="op_flux">Operacional · Flux · {grupos.op_flux.length}</TabsTrigger>
        </TabsList>
        <TabsContent value="entregadores" className="mt-4">{renderTabela(grupos.entregadores)}</TabsContent>
        <TabsContent value="op_coop" className="mt-4">{renderTabela(grupos.op_coop)}</TabsContent>
        <TabsContent value="op_flux" className="mt-4">{renderTabela(grupos.op_flux)}</TabsContent>
      </Tabs>

      {sel && (
        <BaixaDialog open={!!sel} onOpenChange={(v) => !v && setSel(null)} lancamento={sel} tipo="pagamento"
          contas={contas} cartoes={cartoes}
          onConfirm={async (input) => {
            await financeiroApi.baixar({ tipo: "pagamento", lancamentoId: sel.id, ...input, usuarioId: "u-admin" });
            await load();
            toast({ title: "Pagamento registrado", description: fmtBRL(input.valor) });
          }}
        />
      )}
    </div>
  );
};

export default APagar;
