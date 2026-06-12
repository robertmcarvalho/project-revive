// Mock data for the Financeiro module (Acertos, Faturamento, A Pagar, A Receber,
// Despesas, Baixas, Conciliação, DRE). Replace by real API later.

export type Empresa = "coop" | "flux";
export type StatusAcerto = "aberto" | "em_revisao" | "aprovado" | "pago";
export type StatusFatura = "aberta" | "enviada" | "paga" | "vencida";
export type StatusConta = "aberta" | "parcial" | "paga" | "vencida" | "agendada";
export type TipoConta = "entregador" | "operacional";
export type Classificacao = "fixa" | "variavel";
export type FormaPagamento = "pix" | "ted" | "boleto" | "dinheiro" | "cartao" | "compensacao";
export type AplicarEm = "a_pagar" | "a_faturar" | "ambos";

export interface CentroCusto { id: string; nome: string; farmaciaId: string; cnpj?: string }
export interface Farmacia { id: string; nome: string; centrosCusto: string[]; cicloDia: "segunda" }

export interface RegraVinculo {
  id: string;
  entregadorId: string;
  farmaciaId: string;
  centroCustoId: string;
  taxaEntrega: number;
  minimoGarantidoSemanal?: number;
  pctRepasse: number; // 0..100
}

export interface SplitFaturamento {
  centroCustoId: string;
  pctCooperativa: number;
  pctFlux: number;
}

export interface Entrega {
  id: string; entregadorId: string; farmaciaId: string; centroCustoId: string;
  dataHora: string; valor: number; origem: "app" | "manual"; lancadoPor?: string; obs?: string;
}

export interface RateioItem { centroCustoId: string; farmaciaId?: string; percentual: number; valor: number }

export interface ContaPagar {
  id: string; tipo: TipoConta; empresa: Empresa;
  categoria: string; fornecedorId?: string; entregadorId?: string;
  centroCustoId?: string; descricao: string;
  valor: number; valorPago: number; saldo: number;
  vencimento: string; recorrencia: "unica" | "mensal" | "semanal" | "anual";
  classificacao: Classificacao;
  formaPagamento?: FormaPagamento; contaBancariaId?: string; cartaoId?: string;
  status: StatusConta;
  rateio?: RateioItem[];
  comprovanteUrl?: string;
}

export interface ContaReceber {
  id: string; faturaId: string; farmaciaId: string; centroCustoId: string; empresa: Empresa;
  valor: number; valorRecebido: number; saldo: number;
  vencimento: string; status: StatusConta;
}

export interface Fatura {
  id: string; numero: string; farmaciaId: string; centroCustoId: string; empresa: Empresa;
  cicloInicio: string; cicloFim: string; valor: number; status: StatusFatura;
  vencimento: string; origemAcertoId: string;
}

export interface AcertoLinha {
  entregadorId: string;
  qtdEntregas: number;
  somaPorTaxa: number;
  minimoAplicado: boolean;
  baseRepasse: number;
  diarias: number;
  adicionais: number;
  descontos: number;
  adiantamentos: number;
  ajustesRateio: number; // soma de AcertoAjusteRateio incidentes
  valorEntregador: number;
  valorFaturadoFarmacia: number;
}

export interface Acerto {
  id: string; farmaciaId: string; centroCustoId: string;
  cicloInicio: string; cicloFim: string; status: StatusAcerto;
  totalRepasse: number; totalFaturado: number;
  linhas: AcertoLinha[];
  aprovadoPor?: string; aprovadoEm?: string;
}

export interface Baixa {
  id: string; tipo: "pagamento" | "recebimento";
  lancamentoId: string; data: string; valor: number; forma: FormaPagamento;
  contaBancariaId?: string; cartaoId?: string;
  juros?: number; desconto?: number; taxa?: number;
  comprovanteUrl?: string; obs?: string;
  usuarioId: string; criadoEm: string;
  estornadaEm?: string; estornoMotivo?: string;
  conciliada?: boolean;
}

export interface CategoriaDespesa { id: string; nome: string; classificacao: Classificacao; grupo: string }
export interface Fornecedor { id: string; nome: string; cnpjCpf: string; categoria: string }
export interface ContaBancaria { id: string; banco: string; agencia: string; conta: string; empresa: Empresa; saldo: number }
export interface Cartao { id: string; bandeira: string; final: string; limite: number; fechamento: number; vencimento: number; empresa: Empresa }
export interface Entregador { id: string; nome: string; pix?: string }

// ─── seeds ──────────────────────────────────────────────────────────────

export const farmacias: Farmacia[] = [
  { id: "f1", nome: "Farmácia Central", centrosCusto: ["cc1", "cc2"], cicloDia: "segunda" },
  { id: "f2", nome: "Drogaria São Paulo", centrosCusto: ["cc3"], cicloDia: "segunda" },
  { id: "f3", nome: "Farmácia Popular", centrosCusto: ["cc4"], cicloDia: "segunda" },
];

export const centrosCusto: CentroCusto[] = [
  { id: "cc1", nome: "Central — Matriz", farmaciaId: "f1", cnpj: "11.111.111/0001-11" },
  { id: "cc2", nome: "Central — Filial Sul", farmaciaId: "f1", cnpj: "11.111.111/0002-92" },
  { id: "cc3", nome: "São Paulo — Pinheiros", farmaciaId: "f2" },
  { id: "cc4", nome: "Popular — Centro", farmaciaId: "f3" },
];

export const entregadores: Entregador[] = [
  { id: "e1", nome: "João Silva", pix: "joao@pix.com" },
  { id: "e2", nome: "Marcos Lima", pix: "marcos@pix.com" },
  { id: "e3", nome: "Carla Souza", pix: "11999990000" },
];

export const regrasVinculo: RegraVinculo[] = [
  { id: "r1", entregadorId: "e1", farmaciaId: "f1", centroCustoId: "cc1", taxaEntrega: 7, minimoGarantidoSemanal: 350, pctRepasse: 100 },
  { id: "r2", entregadorId: "e1", farmaciaId: "f2", centroCustoId: "cc3", taxaEntrega: 8, pctRepasse: 100 },
  { id: "r3", entregadorId: "e2", farmaciaId: "f1", centroCustoId: "cc2", taxaEntrega: 6, minimoGarantidoSemanal: 300, pctRepasse: 90 },
  { id: "r4", entregadorId: "e3", farmaciaId: "f3", centroCustoId: "cc4", taxaEntrega: 7.5, pctRepasse: 100 },
];

export const splitFaturamento: SplitFaturamento[] = [
  { centroCustoId: "cc1", pctCooperativa: 70, pctFlux: 30 },
  { centroCustoId: "cc2", pctCooperativa: 70, pctFlux: 30 },
  { centroCustoId: "cc3", pctCooperativa: 65, pctFlux: 35 },
  { centroCustoId: "cc4", pctCooperativa: 75, pctFlux: 25 },
];

// Ciclo de exemplo: 02/06/2026 a 08/06/2026
const cicloIni = "2026-06-02";
const cicloFim = "2026-06-08";

// Entregas simuladas no ciclo (qtd × taxa)
function geraEntregas(): Entrega[] {
  const out: Entrega[] = [];
  const add = (n: number, eId: string, fId: string, ccId: string, valor: number) => {
    for (let i = 0; i < n; i++)
      out.push({ id: `en-${out.length + 1}`, entregadorId: eId, farmaciaId: fId, centroCustoId: ccId,
        dataHora: `${cicloIni} 0${(i % 9) + 1}:30`, valor, origem: "app" });
  };
  add(62, "e1", "f1", "cc1", 7);   // > mínimo (62*7=434 > 350)
  add(18, "e1", "f2", "cc3", 8);   // 144
  add(40, "e2", "f1", "cc2", 6);   // 240 < 300 → aplica mínimo
  add(55, "e3", "f3", "cc4", 7.5); // 412.5
  return out;
}
export const entregas: Entrega[] = geraEntregas();

export const categoriasDespesa: CategoriaDespesa[] = [
  { id: "cat-sal", nome: "Salários e encargos", classificacao: "fixa", grupo: "Pessoal" },
  { id: "cat-alug", nome: "Aluguel de sala", classificacao: "fixa", grupo: "Estrutura" },
  { id: "cat-sw-g", nome: "Softwares de gestão", classificacao: "fixa", grupo: "Tecnologia" },
  { id: "cat-sw-op", nome: "Software de operação", classificacao: "fixa", grupo: "Tecnologia" },
  { id: "cat-conv", nome: "Convênio médico", classificacao: "fixa", grupo: "Pessoal" },
  { id: "cat-comb", nome: "Auxílio combustível", classificacao: "fixa", grupo: "Pessoal" },
  { id: "cat-net", nome: "Internet/telefonia", classificacao: "fixa", grupo: "Estrutura" },
  { id: "cat-banc", nome: "Despesas bancárias", classificacao: "variavel", grupo: "Financeiro" },
  { id: "cat-cart", nome: "Cartão de crédito", classificacao: "variavel", grupo: "Financeiro" },
  { id: "cat-com", nome: "Comissões", classificacao: "variavel", grupo: "Pessoal" },
  { id: "cat-lucro", nome: "Distribuição de lucros", classificacao: "variavel", grupo: "Sócios" },
  { id: "cat-ev", nome: "Eventos", classificacao: "variavel", grupo: "Marketing" },
  { id: "cat-viag", nome: "Despesas de viagem", classificacao: "variavel", grupo: "Operação" },
  { id: "cat-div", nome: "Diversos", classificacao: "variavel", grupo: "Outros" },
];

export const fornecedores: Fornecedor[] = [
  { id: "fr1", nome: "WeWork SP", cnpjCpf: "33.000.000/0001-00", categoria: "cat-alug" },
  { id: "fr2", nome: "Microsoft 365", cnpjCpf: "00.000.000/0001-91", categoria: "cat-sw-g" },
  { id: "fr3", nome: "Unimed", cnpjCpf: "12.345.678/0001-00", categoria: "cat-conv" },
  { id: "fr4", nome: "Banco Itaú — tarifas", cnpjCpf: "60.701.190/0001-04", categoria: "cat-banc" },
];

export const contasBancarias: ContaBancaria[] = [
  { id: "cb1", banco: "Itaú", agencia: "0001", conta: "12345-6", empresa: "coop", saldo: 84320.55 },
  { id: "cb2", banco: "Bradesco", agencia: "0123", conta: "98765-4", empresa: "flux", saldo: 52110.20 },
];

export const cartoes: Cartao[] = [
  { id: "cr1", bandeira: "Visa", final: "4421", limite: 30000, fechamento: 25, vencimento: 5, empresa: "flux" },
];

// ─── lançamentos iniciais ────────────────────────────────────────────────

export const despesasIniciais: ContaPagar[] = [
  { id: "cp-100", tipo: "operacional", empresa: "flux", categoria: "cat-alug", fornecedorId: "fr1",
    descricao: "Aluguel sala — Junho/2026", valor: 6800, valorPago: 0, saldo: 6800,
    vencimento: "2026-06-10", recorrencia: "mensal", classificacao: "fixa",
    formaPagamento: "pix", contaBancariaId: "cb2", status: "aberta" },
  { id: "cp-101", tipo: "operacional", empresa: "flux", categoria: "cat-sw-g", fornecedorId: "fr2",
    descricao: "Microsoft 365 — assinatura", valor: 980, valorPago: 980, saldo: 0,
    vencimento: "2026-06-05", recorrencia: "mensal", classificacao: "fixa",
    formaPagamento: "cartao", cartaoId: "cr1", status: "paga" },
  { id: "cp-102", tipo: "operacional", empresa: "coop", categoria: "cat-sal",
    descricao: "Folha — Operação (Coop)", valor: 28400, valorPago: 0, saldo: 28400,
    vencimento: "2026-06-05", recorrencia: "mensal", classificacao: "fixa", status: "aberta" },
  { id: "cp-103", tipo: "operacional", empresa: "flux", categoria: "cat-sal",
    descricao: "Folha — Tecnologia (Flux)", valor: 41200, valorPago: 0, saldo: 41200,
    vencimento: "2026-06-05", recorrencia: "mensal", classificacao: "fixa", status: "aberta" },
  { id: "cp-104", tipo: "operacional", empresa: "coop", categoria: "cat-conv", fornecedorId: "fr3",
    descricao: "Convênio médico — equipe coop", valor: 3450, valorPago: 1725, saldo: 1725,
    vencimento: "2026-06-12", recorrencia: "mensal", classificacao: "fixa", status: "parcial" },
  { id: "cp-105", tipo: "operacional", empresa: "flux", categoria: "cat-banc", fornecedorId: "fr4",
    descricao: "Tarifas bancárias maio", valor: 240, valorPago: 0, saldo: 240,
    vencimento: "2026-05-30", recorrencia: "unica", classificacao: "variavel", status: "vencida" },
];

export const baixasIniciais: Baixa[] = [
  { id: "bx-1", tipo: "pagamento", lancamentoId: "cp-101", data: "2026-06-05", valor: 980,
    forma: "cartao", cartaoId: "cr1", usuarioId: "u-admin", criadoEm: "2026-06-05T10:00:00", conciliada: true },
  { id: "bx-2", tipo: "pagamento", lancamentoId: "cp-104", data: "2026-05-12", valor: 1725,
    forma: "pix", contaBancariaId: "cb1", usuarioId: "u-admin", criadoEm: "2026-05-12T11:30:00", conciliada: false },
];

// Movimentos bancários para conciliação (mock OFX)
export interface MovimentoBancario {
  id: string; contaBancariaId: string; data: string; valor: number;
  descricao: string; tipo: "credito" | "debito"; conciliadoBaixaId?: string;
}
export const movimentosBancarios: MovimentoBancario[] = [
  { id: "mv-1", contaBancariaId: "cb1", data: "2026-05-12", valor: -1725, descricao: "PIX Unimed", tipo: "debito" },
  { id: "mv-2", contaBancariaId: "cb1", data: "2026-06-06", valor: 12500, descricao: "Recebimento fatura F-2026-0021", tipo: "credito" },
  { id: "mv-3", contaBancariaId: "cb2", data: "2026-06-05", valor: -980, descricao: "Cartão Visa", tipo: "debito" },
];

export const cicloAtual = { inicio: cicloIni, fim: cicloFim };
