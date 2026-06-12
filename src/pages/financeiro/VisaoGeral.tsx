import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DollarSign, TrendingUp, Clock, AlertCircle, Banknote } from "lucide-react";
import { financeiroApi } from "@/lib/financeiroApi";
import { fmtBRL } from "@/lib/baixas";
import type { ContaPagar, ContaReceber, Baixa } from "@/data/financeiroMock";

const VisaoGeral = () => {
  const [cp, setCp] = useState<ContaPagar[]>([]);
  const [cr, setCr] = useState<ContaReceber[]>([]);
  const [bx, setBx] = useState<Baixa[]>([]);

  useEffect(() => {
    financeiroApi.listContasPagar().then(setCp);
    financeiroApi.listContasReceber().then(setCr);
    financeiroApi.listBaixas().then(setBx);
  }, []);

  const aReceber = cr.filter((c) => c.status !== "paga").reduce((s, c) => s + c.saldo, 0);
  const aPagar = cp.filter((c) => c.status !== "paga").reduce((s, c) => s + c.saldo, 0);
  const vencidas = cp.filter((c) => c.status === "vencida").reduce((s, c) => s + c.saldo, 0);
  const baixasPend = bx.filter((b) => !b.conciliada && !b.estornadaEm).length;

  const cards = [
    { label: "A receber", value: fmtBRL(aReceber), icon: TrendingUp, tone: "success" },
    { label: "A pagar", value: fmtBRL(aPagar), icon: DollarSign, tone: "primary" },
    { label: "Em atraso", value: fmtBRL(vencidas), icon: AlertCircle, tone: "destructive" },
    { label: "Baixas p/ conciliar", value: String(baixasPend), icon: Banknote, tone: "warning" },
  ] as const;

  const toneCls = {
    success: "bg-success/15 text-success",
    primary: "bg-primary/15 text-primary",
    destructive: "bg-destructive/15 text-destructive",
    warning: "bg-warning/15 text-warning",
  };

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-surface p-5">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneCls[c.tone]}`}>
              <c.icon className="h-4 w-4" />
            </div>
            <div className="mt-4 text-2xl font-semibold tracking-tight">{c.value}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Próximos vencimentos — A pagar</h3>
            <Link to="/financeiro/a-pagar" className="text-xs text-primary hover:underline">Ver tudo</Link>
          </div>
          <ul className="space-y-2">
            {cp.filter((c) => c.status !== "paga").slice(0, 6).map((c) => (
              <li key={c.id} className="flex items-center justify-between border-b border-border/40 pb-1.5 text-xs">
                <div className="min-w-0">
                  <div className="truncate font-medium">{c.descricao}</div>
                  <div className="text-muted-foreground">venc. {c.vencimento}</div>
                </div>
                <span className="font-mono font-semibold">{fmtBRL(c.saldo)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">A receber pendente</h3>
            <Link to="/financeiro/a-receber" className="text-xs text-primary hover:underline">Ver tudo</Link>
          </div>
          {cr.length ? (
            <ul className="space-y-2">
              {cr.filter((c) => c.status !== "paga").slice(0, 6).map((c) => (
                <li key={c.id} className="flex items-center justify-between border-b border-border/40 pb-1.5 text-xs">
                  <div className="min-w-0">
                    <div className="truncate font-medium">Fatura {c.faturaId}</div>
                    <div className="text-muted-foreground">venc. {c.vencimento} · {c.empresa.toUpperCase()}</div>
                  </div>
                  <span className="font-mono font-semibold">{fmtBRL(c.saldo)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-md border border-dashed border-border bg-background/40 p-6 text-center text-xs text-muted-foreground">
              <Clock className="mx-auto mb-2 h-5 w-5" />
              Aprove um acerto em <Link to="/financeiro/acertos" className="text-primary">Acertos</Link> para gerar faturas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisaoGeral;
