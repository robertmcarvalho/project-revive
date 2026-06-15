// Mock data for the Financeiro module (Billing) — alinhado ao documento mestre
// (Aethera Flux Farma / CoopMob). Substituir por API real depois.

export type Empresa = "coop" | "flux";
export type StatusAcerto = "aberto" | "em_revisao" | "aprovado" | "pago";
export type StatusFatura = "aberta" | "enviada" | "paga" | "vencida";
export type StatusConta = "aberta" | "parcial" | "paga" | "vencida" | "agendada";
export type TipoConta = "entregador" | "operacional";
export type Classificacao = "fixa" | "variavel";
export type FormaPagamento = "pix" | "ted" | "boleto" | "dinheiro" | "cartao" | "compensacao";
export type AplicarEm = "a_pagar" | "a_faturar" | "ambos";
export type ContractScope = "flux_only" | "coop_only" | "both";
export type PixKeyType = "cpf" | "cnpj" | "email" | "telefone" | "aleatoria";
export type DeliverySource = "flux_api" | "flux_db" | "manual" | "csv" | "external_app";

export interface CentroCusto { id: string; nome: string; farmaciaId: string; cnpj?: string }

export interface Farmacia {
  id: string; nome: string; centrosCusto: string[]; cicloDia: "segunda";
  contractScope: ContractScope; splitCoopPct: number; splitFluxPct: number;
  mgEnabled: boolean;
  /** Mínimo garantido — número de entregas/semana */
  minimumDeliveriesCount?: number;
  /** Taxa de entrega default cobrada da farmácia (sobrescreve a do vínculo se ausente) */
  taxaEntregaDefault?: number;
  /** Taxa repassada ao entregador default */
  taxaRepasseDefault?: number;
  billingEmail?: string; fluxCodpes?: number; fluxCodloc?: number;
}

export interface RegraVinculo {
  id: string; entregadorId: string; farmaciaId: string; centroCustoId: string;
  taxaEntrega: number; minimoGarantidoSemanal?: number; pctRepasse: number;
}

export interface SplitFaturamento { centroCustoId: string; pctCooperativa: number; pctFlux: number }

export interface Entrega {
  id: string; entregadorId: string; farmaciaId: string; centroCustoId: string;
  dataHora: string; valor: number; origem: "app" | "manual"; lancadoPor?: string; obs?: string;
}

export interface DeliveryRecord {
  id: string; source: DeliverySource; externalId: string;
  fluxCodpes?: number; fluxCodloc?: number;
  farmaciaId: string; entregadorId: string;
  deliveredAt: string; documentNumber?: string; routeId?: string;
  cancelled: boolean; verified: boolean; cicloId?: string;
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
  origem?: "manual" | "acerto" | "cota" | "inss";
}

export interface ContaReceber {
  id: string; faturaId: string; farmaciaId: string; centroCustoId: string; empresa: Empresa;
  valor: number; valorRecebido: number; saldo: number;
  vencimento: string; status: StatusConta;
}

export interface Fatura {
  id: string; numero: string; farmaciaId: string; centroCustoId: string; empresa: Empresa;
  cicloInicio: string; cicloFim: string; valor: number; status: StatusFatura;
  vencimento: string; origemAcertoId: string; publicToken?: string;
}

export interface AcertoLinha {
  entregadorId: string; qtdEntregas: number; somaPorTaxa: number; minimoAplicado: boolean;
  baseRepasse: number; diarias: number; adicionais: number; descontos: number;
  adiantamentos: number; ajustesRateio: number;
  descontoFaltaSemDiarista?: number; diasFaltaSemDiarista?: number;
  origemEntregas?: Partial<Record<DeliverySource, number>>;
  valorEntregador: number; valorFaturadoFarmacia: number;
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
  estornadaEm?: string; estornoMotivo?: string; conciliada?: boolean;
}

export interface CategoriaDespesa { id: string; nome: string; classificacao: Classificacao; grupo: string }
export interface Fornecedor { id: string; nome: string; cnpjCpf: string; categoria: string }
export interface ContaBancaria { id: string; banco: string; agencia: string; conta: string; empresa: Empresa; saldo: number }
export interface Cartao { id: string; bandeira: string; final: string; limite: number; fechamento: number; vencimento: number; empresa: Empresa }

export interface Entregador {
  id: string; nome: string; pix?: string;
  pixKey?: string; pixKeyType?: PixKeyType;
  cpf?: string; dataNascimento?: string; telefone?: string;
  liderId?: string; vinculoDesde?: string;
  inactiveAt?: string; terminationReason?: string;
}

export interface ExpenseType {
  id: string; name: string; kind: Classificacao;
  defaultCentroCustoId?: string; defaultEntity: "coop" | "flux" | "ambos";
  allocationMode: "none" | "per_pharmacy" | "per_driver" | "per_delivery";
  recurrence?: "mensal" | "semanal" | "anual"; active: boolean;
}

export interface QuotaTemplate {
  id: string; nome: string;
  regra: "monthly_weekday";
  diaSemana: number; ocorrenciaNoMes: number;
}

export interface QuotaSchedule {
  id: string; entregadorId: string;
  /** valor por parcela */
  valor: number;
  /** modelo de agenda (regra/dia da semana/ocorrência) */
  templateId: string;
  /** quantidade total de parcelas (undefined = recorrente sem fim) */
  parcelas?: number;
  /** quantas já foram lançadas/pagas */
  parcelasPagas?: number;
  ativa: boolean; inicioEm: string; fimEm?: string;
}

export interface PaymentBatchExport {
  id: string; cicloId: string; geradoEm: string; geradoPor: string;
  totalEntregadores: number; totalValor: number; contaOrigemId?: string;
  formato: "csv_generico" | "banco_x"; status: "gerado" | "enviado_banco" | "conciliado";
}

export interface MonthlyReportRun {
  id: string; tipo: "inss" | "seguradora_ativos" | "seguradora_desligados";
  competencia: string; geradoEm: string; geradoPor: string;
  enviadoEm?: string; totais: { linhas: number; valor?: number };
}

export interface LegalEntity {
  id: string; entityType: Empresa;
  legalName: string; tradeName: string; cnpj: string;
  stateReg?: string; municipalReg?: string; taxRegime?: string;
  address: { cep: string; logradouro: string; numero: string; bairro: string; cidade: string; uf: string };
  financialEmail: string; commercialEmail: string; phone: string;
  bank: { code: string; name: string; branch: string; account: string; digit: string; type: "checking" | "savings" };
  pixKey?: string; pixKeyType?: PixKeyType;
  defaultSplitCoopPct: number; defaultSplitFluxPct: number;
  fluxServiceMarginPct?: number;
  invoiceHeaderNotes?: string; invoiceFooterNotes?: string; logoUrl?: string;
}

// ─── seeds ──────────────────────────────────────────────────────────────

export const farmacias: Farmacia[] = [
  { id: "f1", nome: "Farmácia Central", centrosCusto: ["cc1", "cc2"], cicloDia: "segunda",
    contractScope: "both", splitCoopPct: 70, splitFluxPct: 30, mgEnabled: true,
    billingEmail: "financeiro@central.com.br", fluxCodpes: 7, fluxCodloc: 11 },
  { id: "f2", nome: "Drogaria São Paulo", centrosCusto: ["cc3"], cicloDia: "segunda",
    contractScope: "both", splitCoopPct: 65, splitFluxPct: 35, mgEnabled: false,
    billingEmail: "ap@drogariasp.com.br", fluxCodpes: 7, fluxCodloc: 24 },
  { id: "f3", nome: "Farmácia Popular", centrosCusto: ["cc4"], cicloDia: "segunda",
    contractScope: "coop_only", splitCoopPct: 100, splitFluxPct: 0, mgEnabled: true,
    billingEmail: "contas@popular.com.br", fluxCodpes: 7, fluxCodloc: 88 },
];

export const centrosCusto: CentroCusto[] = [
  { id: "cc1", nome: "Central — Matriz", farmaciaId: "f1", cnpj: "11.111.111/0001-11" },
  { id: "cc2", nome: "Central — Filial Sul", farmaciaId: "f1", cnpj: "11.111.111/0002-92" },
  { id: "cc3", nome: "São Paulo — Pinheiros", farmaciaId: "f2" },
  { id: "cc4", nome: "Popular — Centro", farmaciaId: "f3" },
];

export const entregadores: Entregador[] = [
  { id: "e1", nome: "João Silva", pix: "joao@pix.com", pixKey: "joao@pix.com", pixKeyType: "email",
    cpf: "123.456.789-01", dataNascimento: "1990-04-12", telefone: "(11) 99999-1111",
    liderId: "l1", vinculoDesde: "2024-03-10" },
  { id: "e2", nome: "Marcos Lima", pix: "marcos@pix.com", pixKey: "marcos@pix.com", pixKeyType: "email",
    cpf: "234.567.890-12", dataNascimento: "1988-08-22", telefone: "(11) 98888-2222",
    liderId: "l1", vinculoDesde: "2024-07-01" },
  { id: "e3", nome: "Carla Souza", pix: "11999990000", pixKey: "11999990000", pixKeyType: "telefone",
    cpf: "345.678.901-23", dataNascimento: "1992-11-05", telefone: "(11) 99999-0000",
    liderId: "l2", vinculoDesde: "2025-01-15" },
  { id: "e4", nome: "Patrícia Mendes", pixKey: undefined,
    cpf: "456.789.012-34", dataNascimento: "1994-02-18", telefone: "(11) 97777-3333",
    liderId: "l2", vinculoDesde: "2025-09-01" },
  { id: "e5", nome: "Diego Rocha", pixKey: "diego.rocha@pix.com", pixKeyType: "email",
    cpf: "567.890.123-45", dataNascimento: "1985-06-30", telefone: "(11) 96666-4444",
    liderId: "l1", vinculoDesde: "2023-11-20",
    inactiveAt: "2026-06-04", terminationReason: "Saída voluntária" },
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
  { centroCustoId: "cc4", pctCooperativa: 100, pctFlux: 0 },
];

const cicloIni = "2026-06-02";
const cicloFim = "2026-06-08";

function geraEntregas(): Entrega[] {
  const out: Entrega[] = [];
  const add = (n: number, eId: string, fId: string, ccId: string, valor: number) => {
    for (let i = 0; i < n; i++)
      out.push({ id: `en-${out.length + 1}`, entregadorId: eId, farmaciaId: fId, centroCustoId: ccId,
        dataHora: `${cicloIni} 0${(i % 9) + 1}:30`, valor, origem: "app" });
  };
  add(62, "e1", "f1", "cc1", 7);
  add(18, "e1", "f2", "cc3", 8);
  add(40, "e2", "f1", "cc2", 6);
  add(55, "e3", "f3", "cc4", 7.5);
  return out;
}
export const entregas: Entrega[] = geraEntregas();

// Delivery records — alinhado ao mestre (multi-source)
function geraDeliveryRecords(): DeliveryRecord[] {
  const out: DeliveryRecord[] = [];
  const sources: DeliverySource[] = ["flux_api", "flux_api", "flux_api", "manual", "csv"];
  entregas.forEach((e, i) => {
    const src = sources[i % sources.length];
    const farm = farmacias.find((f) => f.id === e.farmaciaId);
    out.push({
      id: `dr-${i + 1}`, source: src, externalId: `${farm?.fluxCodpes ?? 7}:${farm?.fluxCodloc ?? 0}:${24000 + i}:1`,
      fluxCodpes: farm?.fluxCodpes, fluxCodloc: farm?.fluxCodloc,
      farmaciaId: e.farmaciaId, entregadorId: e.entregadorId,
      deliveredAt: `${cicloIni}T${String((i % 10) + 8).padStart(2, "0")}:30:00`,
      documentNumber: `NF-${100000 + i}`, routeId: `R-${1000 + (i % 30)}`,
      cancelled: false, verified: src !== "manual" || i % 5 !== 0,
      cicloId: "cycle-current",
    });
  });
  return out;
}
export const deliveryRecords: DeliveryRecord[] = geraDeliveryRecords();

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
  { id: "cat-inss", nome: "INSS (custo Coop)", classificacao: "variavel", grupo: "Tributos" },
];

export const expenseTypes: ExpenseType[] = [
  { id: "et-alug", name: "Aluguel sede", kind: "fixa", defaultEntity: "flux", allocationMode: "none", recurrence: "mensal", active: true },
  { id: "et-sw-g", name: "Software de gestão", kind: "fixa", defaultEntity: "ambos", allocationMode: "none", recurrence: "mensal", active: true },
  { id: "et-sal", name: "Folha de pagamento", kind: "fixa", defaultEntity: "ambos", allocationMode: "none", recurrence: "mensal", active: true },
  { id: "et-conv", name: "Convênio médico", kind: "fixa", defaultEntity: "coop", allocationMode: "per_driver", recurrence: "mensal", active: true },
  { id: "et-comb", name: "Auxílio combustível", kind: "fixa", defaultEntity: "coop", allocationMode: "per_driver", recurrence: "mensal", active: true },
  { id: "et-banc", name: "Tarifas bancárias", kind: "variavel", defaultEntity: "flux", allocationMode: "none", active: true },
  { id: "et-com", name: "Comissões comerciais", kind: "variavel", defaultEntity: "flux", allocationMode: "per_pharmacy", active: true },
  { id: "et-ev", name: "Eventos e confraternizações", kind: "variavel", defaultEntity: "ambos", allocationMode: "none", active: true },
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

export const legalEntities: LegalEntity[] = [
  { id: "le-coop", entityType: "coop",
    legalName: "CoopMob Cooperativa de Entregadores Ltda.", tradeName: "CoopMob",
    cnpj: "44.555.666/0001-77", stateReg: "ISENTO", municipalReg: "1.234.567-8", taxRegime: "Cooperativa",
    address: { cep: "01310-100", logradouro: "Av. Paulista", numero: "1000", bairro: "Bela Vista", cidade: "São Paulo", uf: "SP" },
    financialEmail: "financeiro@coopmob.coop.br", commercialEmail: "comercial@coopmob.coop.br", phone: "(11) 3000-1010",
    bank: { code: "341", name: "Itaú", branch: "0001", account: "12345", digit: "6", type: "checking" },
    pixKey: "44.555.666/0001-77", pixKeyType: "cnpj",
    defaultSplitCoopPct: 70, defaultSplitFluxPct: 30,
    invoiceHeaderNotes: "Repasse de cooperados — entregas conforme ciclo.",
    invoiceFooterNotes: "Documento de controle interno. Não substitui nota fiscal." },
  { id: "le-flux", entityType: "flux",
    legalName: "Flux Farma Tecnologia Ltda.", tradeName: "Flux Farma",
    cnpj: "33.444.555/0001-66", stateReg: "ISENTO", municipalReg: "8.765.432-1", taxRegime: "Simples Nacional",
    address: { cep: "04543-907", logradouro: "Rua Funchal", numero: "500", bairro: "Vila Olímpia", cidade: "São Paulo", uf: "SP" },
    financialEmail: "financeiro@fluxfarma.com.br", commercialEmail: "comercial@fluxfarma.com.br", phone: "(11) 4000-2020",
    bank: { code: "237", name: "Bradesco", branch: "0123", account: "98765", digit: "4", type: "checking" },
    pixKey: "financeiro@fluxfarma.com.br", pixKeyType: "email",
    defaultSplitCoopPct: 70, defaultSplitFluxPct: 30, fluxServiceMarginPct: 30,
    invoiceHeaderNotes: "Tecnologia de gestão de entregas — Flux Farma.",
    invoiceFooterNotes: "Pagamento via PIX/TED na conta indicada." },
];

export const quotaTemplates: QuotaTemplate[] = [
  { id: "qt-2qui", nome: "2ª quinta do mês", regra: "monthly_weekday", diaSemana: 4, ocorrenciaNoMes: 2 },
  { id: "qt-1seg", nome: "1ª segunda do mês", regra: "monthly_weekday", diaSemana: 1, ocorrenciaNoMes: 1 },
];

export const quotasIniciais: QuotaSchedule[] = [
  { id: "q1", entregadorId: "e1", valor: 80, templateId: "qt-2qui", parcelas: 12, parcelasPagas: 5, ativa: true, inicioEm: "2025-01-01" },
  { id: "q2", entregadorId: "e2", valor: 80, templateId: "qt-2qui", parcelas: 6, parcelasPagas: 2, ativa: true, inicioEm: "2025-01-01" },
  { id: "q3", entregadorId: "e3", valor: 80, templateId: "qt-2qui", ativa: true, inicioEm: "2025-04-01" },
];

export const paymentBatchExportsIniciais: PaymentBatchExport[] = [
  { id: "pbx-1", cicloId: "cycle-2026-05-26", geradoEm: "2026-06-01T10:30:00", geradoPor: "Gestor financeiro",
    totalEntregadores: 4, totalValor: 5840.50, contaOrigemId: "cb1", formato: "csv_generico", status: "enviado_banco" },
];

export const monthlyReportRunsIniciais: MonthlyReportRun[] = [
  { id: "mr-1", tipo: "inss", competencia: "2026-05", geradoEm: "2026-06-02T09:00:00",
    geradoPor: "Operador financeiro", enviadoEm: "2026-06-03T11:00:00", totais: { linhas: 5, valor: 22300 } },
  { id: "mr-2", tipo: "seguradora_ativos", competencia: "2026-05", geradoEm: "2026-06-02T09:30:00",
    geradoPor: "Operador financeiro", totais: { linhas: 4 } },
];

// ─── lançamentos iniciais ────────────────────────────────────────────────

export const despesasIniciais: ContaPagar[] = [
  { id: "cp-100", tipo: "operacional", empresa: "flux", categoria: "cat-alug", fornecedorId: "fr1",
    descricao: "Aluguel sala — Junho/2026", valor: 6800, valorPago: 0, saldo: 6800,
    vencimento: "2026-06-10", recorrencia: "mensal", classificacao: "fixa",
    formaPagamento: "pix", contaBancariaId: "cb2", status: "aberta", origem: "manual" },
  { id: "cp-101", tipo: "operacional", empresa: "flux", categoria: "cat-sw-g", fornecedorId: "fr2",
    descricao: "Microsoft 365 — assinatura", valor: 980, valorPago: 980, saldo: 0,
    vencimento: "2026-06-05", recorrencia: "mensal", classificacao: "fixa",
    formaPagamento: "cartao", cartaoId: "cr1", status: "paga", origem: "manual" },
  { id: "cp-102", tipo: "operacional", empresa: "coop", categoria: "cat-sal",
    descricao: "Folha — Operação (Coop)", valor: 28400, valorPago: 0, saldo: 28400,
    vencimento: "2026-06-05", recorrencia: "mensal", classificacao: "fixa", status: "aberta", origem: "manual" },
  { id: "cp-103", tipo: "operacional", empresa: "flux", categoria: "cat-sal",
    descricao: "Folha — Tecnologia (Flux)", valor: 41200, valorPago: 0, saldo: 41200,
    vencimento: "2026-06-05", recorrencia: "mensal", classificacao: "fixa", status: "aberta", origem: "manual" },
  { id: "cp-104", tipo: "operacional", empresa: "coop", categoria: "cat-conv", fornecedorId: "fr3",
    descricao: "Convênio médico — equipe coop", valor: 3450, valorPago: 1725, saldo: 1725,
    vencimento: "2026-06-12", recorrencia: "mensal", classificacao: "fixa", status: "parcial", origem: "manual" },
  { id: "cp-105", tipo: "operacional", empresa: "flux", categoria: "cat-banc", fornecedorId: "fr4",
    descricao: "Tarifas bancárias maio", valor: 240, valorPago: 0, saldo: 240,
    vencimento: "2026-05-30", recorrencia: "unica", classificacao: "variavel", status: "vencida", origem: "manual" },
  { id: "cp-106", tipo: "operacional", empresa: "coop", categoria: "cat-inss",
    descricao: "INSS sobre remuneração cooperados — Maio/2026", valor: 4900, valorPago: 0, saldo: 4900,
    vencimento: "2026-06-20", recorrencia: "mensal", classificacao: "variavel", status: "aberta", origem: "inss" },
];

export const baixasIniciais: Baixa[] = [
  { id: "bx-1", tipo: "pagamento", lancamentoId: "cp-101", data: "2026-06-05", valor: 980,
    forma: "cartao", cartaoId: "cr1", usuarioId: "u-admin", criadoEm: "2026-06-05T10:00:00", conciliada: true },
  { id: "bx-2", tipo: "pagamento", lancamentoId: "cp-104", data: "2026-05-12", valor: 1725,
    forma: "pix", contaBancariaId: "cb1", usuarioId: "u-admin", criadoEm: "2026-05-12T11:30:00", conciliada: false },
];

export interface MovimentoBancario {
  id: string; contaBancariaId: string; data: string; valor: number;
  descricao: string; tipo: "credito" | "debito"; conciliadoBaixaId?: string;
}
export const movimentosBancarios: MovimentoBancario[] = [
  { id: "mv-1", contaBancariaId: "cb1", data: "2026-05-12", valor: -1725, descricao: "PIX Unimed", tipo: "debito" },
  { id: "mv-2", contaBancariaId: "cb1", data: "2026-06-06", valor: 12500, descricao: "Recebimento fatura F-2026-0021", tipo: "credito" },
  { id: "mv-3", contaBancariaId: "cb2", data: "2026-06-05", valor: -980, descricao: "Cartão Visa", tipo: "debito" },
];

export const cicloAtual = { id: "cycle-current", inicio: cicloIni, fim: cicloFim };
