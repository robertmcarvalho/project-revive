// API mock async para o módulo Financeiro. Trocar por fetch quando subir backend.
import {
  farmacias, centrosCusto, entregadores, regrasVinculo, splitFaturamento,
  entregas, categoriasDespesa, fornecedores, contasBancarias, cartoes,
  despesasIniciais, baixasIniciais, movimentosBancarios, cicloAtual,
  type ContaPagar, type ContaReceber, type Baixa, type Acerto, type Fatura,
  type RateioItem, type Empresa,
} from "@/data/financeiroMock";
import { calcularAcerto } from "./acerto";
import { aplicarBaixa, estornarBaixa } from "./baixas";

const wait = <T,>(v: T, ms = 80) => new Promise<T>((r) => setTimeout(() => r(v), ms));

// estado em memória
let _contasPagar: ContaPagar[] = [...despesasIniciais];
let _baixas: Baixa[] = [...baixasIniciais];
let _contasReceber: ContaReceber[] = [];
let _faturas: Fatura[] = [];
let _acertos: Acerto[] = [];

// Gera acertos iniciais (1 por farmácia/CC com entregas no ciclo)
function bootstrapAcertos() {
  const grupos = new Map<string, { farmaciaId: string; centroCustoId: string }>();
  regrasVinculo.forEach((r) => grupos.set(`${r.farmaciaId}/${r.centroCustoId}`, { farmaciaId: r.farmaciaId, centroCustoId: r.centroCustoId }));
  let i = 1;
  for (const g of grupos.values()) {
    const regrasGrp = regrasVinculo.filter((r) => r.farmaciaId === g.farmaciaId && r.centroCustoId === g.centroCustoId);
    const { linhas, totalRepasse, totalFaturado } = calcularAcerto(regrasGrp, entregas);
    if (!linhas.some((l) => l.qtdEntregas > 0)) continue;
    _acertos.push({
      id: `ac-${i++}`,
      farmaciaId: g.farmaciaId, centroCustoId: g.centroCustoId,
      cicloInicio: cicloAtual.inicio, cicloFim: cicloAtual.fim,
      status: "aberto", totalRepasse, totalFaturado, linhas,
    });
  }
}
bootstrapAcertos();

// Recalcula um acerto a partir das entregas atuais (não persistidas por enquanto)
function recalcAcerto(a: Acerto): Acerto {
  const regrasGrp = regrasVinculo.filter((r) => r.farmaciaId === a.farmaciaId && r.centroCustoId === a.centroCustoId);
  const r = calcularAcerto(regrasGrp, entregas);
  return { ...a, linhas: r.linhas, totalRepasse: r.totalRepasse, totalFaturado: r.totalFaturado };
}

export const financeiroApi = {
  // catálogos
  catalogos: () => wait({
    farmacias, centrosCusto, entregadores, regrasVinculo, splitFaturamento,
    categoriasDespesa, fornecedores, contasBancarias, cartoes, cicloAtual,
  }),

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
    // Gera 2 faturas (Coop/Flux) por CC
    const split = splitFaturamento.find((s) => s.centroCustoId === a.centroCustoId)
      ?? { centroCustoId: a.centroCustoId, pctCooperativa: 70, pctFlux: 30 };
    const venc = new Date(a.cicloFim);
    venc.setDate(venc.getDate() + 7);
    const vencStr = venc.toISOString().slice(0, 10);
    const baseNum = String(_faturas.length + 1).padStart(4, "0");
    const novas: Fatura[] = [
      { id: `ft-${baseNum}-c`, numero: `F-COOP-${baseNum}`, farmaciaId: a.farmaciaId, centroCustoId: a.centroCustoId,
        empresa: "coop", cicloInicio: a.cicloInicio, cicloFim: a.cicloFim,
        valor: +(a.totalFaturado * split.pctCooperativa / 100).toFixed(2),
        status: "aberta", vencimento: vencStr, origemAcertoId: a.id },
      { id: `ft-${baseNum}-f`, numero: `F-FLUX-${baseNum}`, farmaciaId: a.farmaciaId, centroCustoId: a.centroCustoId,
        empresa: "flux", cicloInicio: a.cicloInicio, cicloFim: a.cicloFim,
        valor: +(a.totalFaturado * split.pctFlux / 100).toFixed(2),
        status: "aberta", vencimento: vencStr, origemAcertoId: a.id },
    ];
    _faturas.push(...novas);
    // Contas a receber espelham as faturas
    novas.forEach((f) => {
      _contasReceber.push({
        id: `cr-${f.id}`, faturaId: f.id, farmaciaId: f.farmaciaId, centroCustoId: f.centroCustoId,
        empresa: f.empresa, valor: f.valor, valorRecebido: 0, saldo: f.valor,
        vencimento: f.vencimento, status: "aberta",
      });
    });
    // Contas a pagar dos entregadores (1 por linha, empresa coop)
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
        formaPagamento: "pix", status: "aberta",
      });
    });
    return wait(a);
  },

  // faturas / a receber
  listFaturas: () => wait(_faturas),
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
      // se receber bate fatura, marca paga
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

  // rateio aplicado a despesas (apenas calcula projeção; persiste em criarDespesa)
  aplicarRateioNaDespesa: (despesaId: string, rateio: RateioItem[]) => {
    _contasPagar = _contasPagar.map((c) => (c.id === despesaId ? { ...c, rateio } : c));
    return wait(_contasPagar.find((c) => c.id === despesaId)!);
  },
};
