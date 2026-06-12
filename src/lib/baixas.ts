// Baixas (pagamento/recebimento), com suporte a baixa parcial e estorno.
import type { Baixa, ContaPagar, ContaReceber, StatusConta } from "@/data/financeiroMock";

export function statusAposBaixa(valor: number, valorBaixado: number, vencimento: string): StatusConta {
  const saldo = +(valor - valorBaixado).toFixed(2);
  if (saldo <= 0.001) return valor > 0 ? "paga" : "aberta";
  if (valorBaixado > 0) return "parcial";
  const venc = new Date(vencimento);
  return venc.getTime() < Date.now() ? "vencida" : "aberta";
}

export function aplicarBaixa<T extends ContaPagar | ContaReceber>(
  conta: T,
  baixa: Baixa,
): T {
  const valorPagoCampo = "valorPago" in conta ? "valorPago" : "valorRecebido";
  const novoPago = +((conta as any)[valorPagoCampo] + baixa.valor).toFixed(2);
  const novoSaldo = +(conta.valor - novoPago).toFixed(2);
  return {
    ...conta,
    [valorPagoCampo]: novoPago,
    saldo: novoSaldo,
    status: statusAposBaixa(conta.valor, novoPago, conta.vencimento),
  } as T;
}

export function estornarBaixa<T extends ContaPagar | ContaReceber>(conta: T, baixa: Baixa): T {
  const valorPagoCampo = "valorPago" in conta ? "valorPago" : "valorRecebido";
  const novoPago = +(Math.max(0, (conta as any)[valorPagoCampo] - baixa.valor)).toFixed(2);
  const novoSaldo = +(conta.valor - novoPago).toFixed(2);
  return {
    ...conta,
    [valorPagoCampo]: novoPago,
    saldo: novoSaldo,
    status: statusAposBaixa(conta.valor, novoPago, conta.vencimento),
  } as T;
}

export const fmtBRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const fmtDate = (s: string) => new Date(s + (s.length === 10 ? "T00:00:00" : "")).toLocaleDateString("pt-BR");
