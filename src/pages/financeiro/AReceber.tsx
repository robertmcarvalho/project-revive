import { useEffect, useState } from "react";
import { ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { financeiroApi } from "@/lib/financeiroApi";
import { fmtBRL, fmtDate } from "@/lib/baixas";
import { EmpresaBadge } from "@/components/financeiro/EmpresaBadge";
import { SaldoCell } from "@/components/financeiro/SaldoCell";
import { BaixaDialog } from "@/components/financeiro/BaixaDialog";
import type { ContaReceber, ContaBancaria, Cartao, Farmacia } from "@/data/financeiroMock";
import { toast } from "@/hooks/use-toast";

const AReceber = () => {
  const [cr, setCr] = useState<ContaReceber[]>([]);
  const [contas, setContas] = useState<ContaBancaria[]>([]);
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [farm, setFarm] = useState<Farmacia[]>([]);
  const [sel, setSel] = useState<ContaReceber | null>(null);

  const load = () => financeiroApi.listContasReceber().then(setCr);
  useEffect(() => {
    load();
    financeiroApi.catalogos().then((c) => { setContas(c.contasBancarias); setCartoes(c.cartoes); setFarm(c.farmacias); });
  }, []);

  if (!cr.length)
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center">
        <ArrowDownToLine className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <div className="font-medium">Nada a receber ainda</div>
        <div className="mt-1 text-xs text-muted-foreground">Aprove um acerto para gerar contas a receber.</div>
      </div>
    );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-[10px] uppercase tracking-wider text-subtle-foreground">
          <tr>
            <th className="px-4 py-3">Fatura</th>
            <th className="px-4 py-3">Empresa</th>
            <th className="px-4 py-3">Farmácia</th>
            <th className="px-4 py-3">Vencimento</th>
            <th className="px-4 py-3 text-right">Valor</th>
            <th className="px-4 py-3">Saldo</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {cr.map((c) => (
            <tr key={c.id} className="border-b border-border/40 last:border-0">
              <td className="px-4 py-3 font-mono text-[11px]">{c.faturaId}</td>
              <td className="px-4 py-3"><EmpresaBadge empresa={c.empresa} /></td>
              <td className="px-4 py-3 text-xs">{farm.find((f) => f.id === c.farmaciaId)?.nome ?? c.farmaciaId}</td>
              <td className="px-4 py-3 font-mono text-[11px]">{fmtDate(c.vencimento)}</td>
              <td className="px-4 py-3 text-right font-mono">{fmtBRL(c.valor)}</td>
              <td className="px-4 py-3"><SaldoCell valor={c.valor} valorPago={c.valorRecebido} status={c.status} /></td>
              <td className="px-4 py-3 text-right">
                {c.status !== "paga" && (
                  <Button size="sm" variant="outline" onClick={() => setSel(c)}>Baixar</Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sel && (
        <BaixaDialog open={!!sel} onOpenChange={(v) => !v && setSel(null)} lancamento={sel} tipo="recebimento"
          contas={contas} cartoes={cartoes}
          onConfirm={async (input) => {
            await financeiroApi.baixar({
              tipo: "recebimento", lancamentoId: sel.id, ...input,
              usuarioId: "u-admin",
            });
            await load();
            toast({ title: "Recebimento registrado", description: fmtBRL(input.valor) });
          }}
        />
      )}
    </div>
  );
};

export default AReceber;
