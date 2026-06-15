// API mock async para o módulo Financeiro / Billing.
import {
  farmacias, centrosCusto, entregadores, regrasVinculo, splitFaturamento,
  entregas, categoriasDespesa, fornecedores, contasBancarias, cartoes,
  despesasIniciais, baixasIniciais, movimentosBancarios, cicloAtual,
  deliveryRecords, expenseTypes, quotasIniciais, quotaTemplates, legalEntities,
  paymentBatchExportsIniciais, monthlyReportRunsIniciais,
  type ContaPagar, type ContaReceber, type Baixa, type Acerto, type Fatura,
  type RateioItem, type Empresa, type DeliveryRecord, type ExpenseType,
  type QuotaSchedule, type QuotaTemplate, type LegalEntity, type PaymentBatchExport, type MonthlyReportRun,
  type Farmacia, type CentroCusto, type SplitFaturamento, type RegraVinculo,
} from "@/data/financeiroMock";
import { calcularAcerto } from "./acerto";
import { aplicarBaixa, estornarBaixa } from "./baixas";

const wait = <T,>(v: T, ms = 60) => new Promise<T>((r) => setTimeout(() => r(v), ms));

// estado em memória
let _farmacias: Farmacia[] = [...farmacias];
let _ccs: CentroCusto[] = [...centrosCusto];
let _splits: SplitFaturamento[] = [...splitFaturamento];
let _regras: RegraVinculo[] = [...regrasVinculo];
let _contasPagar: ContaPagar[] = [...despesasIniciais];
let _baixas: Baixa[] = [...baixasIniciais];
let _contasReceber: ContaReceber[] = [];
let _faturas: Fatura[] = [];
let _acertos: Acerto[] = [];
let _delivery: DeliveryRecord[] = [...deliveryRecords];
let _expenseTypes: ExpenseType[] = [...expenseTypes];
let _quotas: QuotaSchedule[] = [...quotasIniciais];
let _quotaTemplates: QuotaTemplate[] = [...quotaTemplates];
let _entities: LegalEntity[] = [...legalEntities];
let _pixBatches: PaymentBatchExport[] = [...paymentBatchExportsIniciais];
let _monthlyRuns: MonthlyReportRun[] = [...monthlyReportRunsIniciais];

function bootstrapAcertos() {
  const grupos = new Map<string, { farmaciaId: string; centroCustoId: string }>();
  regrasVinculo.forEach((r) => grupos.set(`${r.farmaciaId}/${r.centroCustoId}`, { farmaciaId: r.farmaciaId, centroCustoId: r.centroCustoId }));
  let i = 1;
  for (const g of grupos.values()) {
    const regrasGrp = regrasVinculo.filter((r) => r.farmaciaId === g.farmaciaId && r.centroCustoId === g.centroCustoId);
    const { linhas, totalRepasse, totalFaturado } = calcularAcerto(regrasGrp, entregas);
    if (!linhas.some((l) => l.qtdEntregas > 0)) continue;
    _acertos.push({
      id: `ac-${i++}`, farmaciaId: g.farmaciaId, centroCustoId: g.centroCustoId,
      cicloInicio: cicloAtual.inicio, cicloFim: cicloAtual.fim,
      status: "aberto", totalRepasse, totalFaturado, linhas,
    });
  }
}
bootstrapAcertos();

function recalcAcerto(a: Acerto): Acerto {
  const regrasGrp = _regras.filter((r) => r.farmaciaId === a.farmaciaId && r.centroCustoId === a.centroCustoId);
  const r = calcularAcerto(regrasGrp, entregas);
  return { ...a, linhas: r.linhas, totalRepasse: r.totalRepasse, totalFaturado: r.totalFaturado };
}

function randomToken() { return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10); }

export const financeiroApi = {
  catalogos: () => wait({
    farmacias: _farmacias, centrosCusto: _ccs, entregadores,
    regrasVinculo: _regras, splitFaturamento: _splits,
    categoriasDespesa, fornecedores, contasBancarias, cartoes, cicloAtual,
    expenseTypes: _expenseTypes, legalEntities: _entities,
    quotaTemplates: _quotaTemplates,
  }),

  // Farmácia + vínculos (centralizados no cadastro da farmácia)
  saveFarmacia: (f: Farmacia) => {
    const idx = _farmacias.findIndex((x) => x.id === f.id);
    if (idx >= 0) _farmacias[idx] = f; else _farmacias.push({ ...f, id: f.id || `f-n${_farmacias.length + 1}` });
    return wait(f);
  },
  saveCentroCusto: (c: CentroCusto) => {
    const idx = _ccs.findIndex((x) => x.id === c.id);
    if (idx >= 0) _ccs[idx] = c; else {
      const novo = { ...c, id: c.id || `cc-n${_ccs.length + 1}` };
      _ccs.push(novo);
      _farmacias = _farmacias.map((f) => f.id === novo.farmaciaId && !f.centrosCusto.includes(novo.id)
        ? { ...f, centrosCusto: [...f.centrosCusto, novo.id] } : f);
      return wait(novo);
    }
    return wait(c);
  },
  removeCentroCusto: (id: string) => {
    _ccs = _ccs.filter((c) => c.id !== id);
    _splits = _splits.filter((s) => s.centroCustoId !== id);
    _regras = _regras.filter((r) => r.centroCustoId !== id);
    _farmacias = _farmacias.map((f) => ({ ...f, centrosCusto: f.centrosCusto.filter((x) => x !== id) }));
    return wait(true);
  },
  saveSplitFaturamento: (s: SplitFaturamento) => {
    const idx = _splits.findIndex((x) => x.centroCustoId === s.centroCustoId);
    if (idx >= 0) _splits[idx] = s; else _splits.push(s);
    return wait(s);
  },
  saveRegraVinculo: (r: RegraVinculo) => {
    const idx = _regras.findIndex((x) => x.id === r.id);
    if (idx >= 0) _regras[idx] = r; else _regras.push({ ...r, id: r.id || `r-n${_regras.length + 1}` });
    return wait(r);
  },
  removeRegraVinculo: (id: string) => {
    _regras = _regras.filter((r) => r.id !== id);
    return wait(true);
  },

  // Quota templates (agenda de cotas)
  listQuotaTemplates: () => wait(_quotaTemplates),
  saveQuotaTemplate: (t: QuotaTemplate) => {
    const idx = _quotaTemplates.findIndex((x) => x.id === t.id);
    if (idx >= 0) _quotaTemplates[idx] = t; else _quotaTemplates.push({ ...t, id: t.id || `qt-n${_quotaTemplates.length + 1}` });
    return wait(t);
  },

  // acertos
  listAcertos: () => wait(_acertos),
  getAcerto: (id: string) => wait(_acertos.find((a) => a.id === id) || null),
  recalcularAcerto: (id: string) => {
    _acertos = _acertos.map((a) => (a.id === id ? recalcAcerto(a) : a));
    return wait(_acertos.find((a) => a.id === id)!);
  },
  enviarParaRevisao: (id: string) => {
    _acertos = _acertos.map((a) => (a.id === id ? { ...a, status: "em_revisao" } : a));
    return wait(_acertos.find((a) => a.id === id)!);
  },
  aprovarAcerto: (id: string, aprovadoPor = "Gestor financeiro") => {
    const a = _acertos.find((x) => x.id === id);
    if (!a) throw new Error("Acerto não encontrado");
    a.status = "aprovado";
    a.aprovadoPor = aprovadoPor;
    a.aprovadoEm = new Date().toISOString();
    const split = splitFaturamento.find((s) => s.centroCustoId === a.centroCustoId)
      ?? { centroCustoId: a.centroCustoId, pctCooperativa: 70, pctFlux: 30 };
    const venc = new Date(a.cicloFim);
    venc.setDate(venc.getDate() + 7);
    const vencStr = venc.toISOString().slice(0, 10);
    const baseNum = String(_faturas.length + 1).padStart(4, "0");
    const candidatos: Fatura[] = [
      { id: `ft-${baseNum}-c`, numero: `F-COOP-${baseNum}`, farmaciaId: a.farmaciaId, centroCustoId: a.centroCustoId,
        empresa: "coop", cicloInicio: a.cicloInicio, cicloFim: a.cicloFim,
        valor: +(a.totalFaturado * split.pctCooperativa / 100).toFixed(2),
        status: "aberta", vencimento: vencStr, origemAcertoId: a.id, publicToken: randomToken() },
      { id: `ft-${baseNum}-f`, numero: `F-FLUX-${baseNum}`, farmaciaId: a.farmaciaId, centroCustoId: a.centroCustoId,
        empresa: "flux", cicloInicio: a.cicloInicio, cicloFim: a.cicloFim,
        valor: +(a.totalFaturado * split.pctFlux / 100).toFixed(2),
        status: "aberta", vencimento: vencStr, origemAcertoId: a.id, publicToken: randomToken() },
    ];
    const novas: Fatura[] = candidatos.filter((f) => f.valor > 0);
    _faturas.push(...novas);
    novas.forEach((f) => {
      _contasReceber.push({
        id: `cr-${f.id}`, faturaId: f.id, farmaciaId: f.farmaciaId, centroCustoId: f.centroCustoId,
        empresa: f.empresa, valor: f.valor, valorRecebido: 0, saldo: f.valor,
        vencimento: f.vencimento, status: "aberta",
      });
    });
    a.linhas.forEach((l, idx) => {
      if (l.valorEntregador <= 0) return;
      const ent = entregadores.find((e) => e.id === l.entregadorId)!;
      _contasPagar.push({
        id: `cp-${a.id}-${idx}`, tipo: "entregador", empresa: "coop",
        categoria: "Repasse entregador", entregadorId: l.entregadorId,
        centroCustoId: a.centroCustoId,
        descricao: `Repasse ${ent.nome} — ciclo ${a.cicloInicio}/${a.cicloFim}`,
        valor: l.valorEntregador, valorPago: 0, saldo: l.valorEntregador,
        vencimento: vencStr, recorrencia: "unica", classificacao: "variavel",
        formaPagamento: "pix", status: "aberta", origem: "acerto",
      });
    });
    return wait(a);
  },

  // faturas / a receber
  listFaturas: () => wait(_faturas),
  getFaturaByToken: (token: string) => wait(_faturas.find((f) => f.publicToken === token) || null),
  marcarFaturaEnviada: (id: string) => {
    _faturas = _faturas.map((f) => (f.id === id && f.status === "aberta" ? { ...f, status: "enviada" } : f));
    return wait(_faturas.find((f) => f.id === id)!);
  },
  listContasReceber: () => wait(_contasReceber),

  // a pagar / despesas
  listContasPagar: () => wait(_contasPagar),
  listContasPagarFiltro: (filtro: { tipo?: "entregador" | "operacional"; empresa?: Empresa }) =>
    wait(_contasPagar.filter((c) =>
      (!filtro.tipo || c.tipo === filtro.tipo) && (!filtro.empresa || c.empresa === filtro.empresa))),

  criarDespesa: (d: Omit<ContaPagar, "id" | "valorPago" | "saldo" | "status">) => {
    const nova: ContaPagar = { ...d, id: `cp-n${_contasPagar.length + 1}`, valorPago: 0, saldo: d.valor, status: "aberta" };
    _contasPagar.unshift(nova);
    return wait(nova);
  },

  // baixas
  listBaixas: () => wait(_baixas),
  baixar: (input: Omit<Baixa, "id" | "criadoEm">) => {
    const b: Baixa = { ...input, id: `bx-${_baixas.length + 1}`, criadoEm: new Date().toISOString() };
    _baixas.push(b);
    if (b.tipo === "pagamento") {
      _contasPagar = _contasPagar.map((c) => (c.id === b.lancamentoId ? aplicarBaixa(c, b) : c));
    } else {
      _contasReceber = _contasReceber.map((c) => (c.id === b.lancamentoId ? aplicarBaixa(c, b) : c));
      const cr = _contasReceber.find((c) => c.id === b.lancamentoId);
      if (cr && cr.status === "paga") _faturas = _faturas.map((f) => (f.id === cr.faturaId ? { ...f, status: "paga" } : f));
    }
    return wait(b);
  },
  estornar: (id: string, motivo: string) => {
    const b = _baixas.find((x) => x.id === id);
    if (!b || b.estornadaEm) return wait(b ?? null);
    b.estornadaEm = new Date().toISOString();
    b.estornoMotivo = motivo;
    if (b.tipo === "pagamento") {
      _contasPagar = _contasPagar.map((c) => (c.id === b.lancamentoId ? estornarBaixa(c, b) : c));
    } else {
      _contasReceber = _contasReceber.map((c) => (c.id === b.lancamentoId ? estornarBaixa(c, b) : c));
    }
    return wait(b);
  },

  // conciliação
  listMovimentos: () => wait(movimentosBancarios),
  marcarConciliada: (baixaId: string) => {
    _baixas = _baixas.map((b) => (b.id === baixaId ? { ...b, conciliada: true } : b));
    return wait(_baixas.find((b) => b.id === baixaId)!);
  },

  // DRE
  dre: (mesISO?: string) => {
    const mes = (mesISO ?? new Date().toISOString().slice(0, 7));
    const inMes = (d: string) => d.startsWith(mes);
    const receitas = _baixas
      .filter((b) => b.tipo === "recebimento" && !b.estornadaEm && inMes(b.data))
      .reduce((s, b) => s + b.valor, 0);
    const pagos = _baixas.filter((b) => b.tipo === "pagamento" && !b.estornadaEm && inMes(b.data));
    const repasseEntregadores = pagos.reduce((s, b) => {
      const c = _contasPagar.find((c) => c.id === b.lancamentoId);
      return c?.tipo === "entregador" ? s + b.valor : s;
    }, 0);
    const fixas = pagos.reduce((s, b) => {
      const c = _contasPagar.find((c) => c.id === b.lancamentoId);
      return c?.tipo === "operacional" && c.classificacao === "fixa" ? s + b.valor : s;
    }, 0);
    const variaveis = pagos.reduce((s, b) => {
      const c = _contasPagar.find((c) => c.id === b.lancamentoId);
      return c?.tipo === "operacional" && c.classificacao === "variavel" ? s + b.valor : s;
    }, 0);
    const resultado = receitas - repasseEntregadores - fixas - variaveis;
    return wait({ mes, receitas, repasseEntregadores, fixas, variaveis, resultado });
  },

  aplicarRateioNaDespesa: (despesaId: string, rateio: RateioItem[]) => {
    _contasPagar = _contasPagar.map((c) => (c.id === despesaId ? { ...c, rateio } : c));
    return wait(_contasPagar.find((c) => c.id === despesaId)!);
  },

  // ── billing extensions ──
  listDeliveryRecords: (filtro?: { cicloId?: string; farmaciaId?: string; entregadorId?: string }) =>
    wait(_delivery.filter((d) =>
      (!filtro?.cicloId || d.cicloId === filtro.cicloId) &&
      (!filtro?.farmaciaId || d.farmaciaId === filtro.farmaciaId) &&
      (!filtro?.entregadorId || d.entregadorId === filtro.entregadorId))),

  importarEntregasCSV: (records: Omit<DeliveryRecord, "id" | "source" | "cancelled" | "verified">[]) => {
    const novos = records.map((r, i) => ({
      ...r, id: `dr-csv-${_delivery.length + i + 1}`, source: "csv" as const,
      cancelled: false, verified: true,
    }));
    _delivery = [..._delivery, ...novos];
    return wait(novos);
  },

  lancarEntregaManual: (d: Omit<DeliveryRecord, "id" | "source" | "cancelled" | "verified" | "externalId">) => {
    const novo: DeliveryRecord = {
      ...d, id: `dr-m-${_delivery.length + 1}`, source: "manual",
      externalId: `manual-${Date.now()}`, cancelled: false, verified: false,
    };
    _delivery = [..._delivery, novo];
    return wait(novo);
  },

  verificarEntrega: (id: string) => {
    _delivery = _delivery.map((d) => (d.id === id ? { ...d, verified: true } : d));
    return wait(_delivery.find((d) => d.id === id)!);
  },

  // ExpenseType
  listExpenseTypes: () => wait(_expenseTypes),
  saveExpenseType: (e: ExpenseType) => {
    const idx = _expenseTypes.findIndex((x) => x.id === e.id);
    if (idx >= 0) _expenseTypes[idx] = e; else _expenseTypes.push({ ...e, id: e.id || `et-n${_expenseTypes.length + 1}` });
    return wait(e);
  },

  // Cotas
  listCotas: () => wait(_quotas),
  saveCota: (q: QuotaSchedule) => {
    const idx = _quotas.findIndex((x) => x.id === q.id);
    if (idx >= 0) _quotas[idx] = q; else _quotas.push({ ...q, id: q.id || `q-n${_quotas.length + 1}` });
    return wait(q);
  },
  toggleCota: (id: string, ativa: boolean) => {
    _quotas = _quotas.map((q) => (q.id === id ? { ...q, ativa } : q));
    return wait(_quotas.find((q) => q.id === id)!);
  },

  // LegalEntities
  listLegalEntities: () => wait(_entities),
  saveLegalEntity: (e: LegalEntity) => {
    const idx = _entities.findIndex((x) => x.id === e.id);
    if (idx >= 0) _entities[idx] = e; else _entities.push({ ...e, id: e.id || `le-n${_entities.length + 1}` });
    return wait(e);
  },

  // Payment batches
  listPaymentBatches: () => wait(_pixBatches),
  registrarPixBatch: (b: Omit<PaymentBatchExport, "id" | "geradoEm">) => {
    const novo: PaymentBatchExport = { ...b, id: `pbx-${_pixBatches.length + 1}`, geradoEm: new Date().toISOString() };
    _pixBatches.unshift(novo);
    return wait(novo);
  },

  // Monthly report runs
  listMonthlyReports: () => wait(_monthlyRuns),
  registrarMonthlyReport: (r: Omit<MonthlyReportRun, "id" | "geradoEm">) => {
    const novo: MonthlyReportRun = { ...r, id: `mr-${_monthlyRuns.length + 1}`, geradoEm: new Date().toISOString() };
    _monthlyRuns.unshift(novo);
    return wait(novo);
  },
};
