// Wrapper assíncrono para a tela Operação. Trocar por fetch quando o backend subir.
import {
  farmaciasMock, lideresMock, entregadoresMock, alertasMock,
  kpisAnalista, kpisAtendenteGeral, kpisAtendenteFinanceiro, kpisGestorFinanceiro, kpisMock,
  volumePorHora, slaPorFarmacia, faltasVsDiarias,
  complianceMock, tarefasAtendimentoMock, notificacoesPendenciaMock,
  eventosCicloMock, regrasMock, organogramaMock,
  type PerfilOperacao, type TarefaAtendimento,
} from "@/data/operacaoMock";

const wait = <T,>(value: T, ms = 100): Promise<T> => new Promise((r) => setTimeout(() => r(value), ms));

const kpisPorPerfil: Record<PerfilOperacao, typeof kpisAnalista> = {
  analista_operacional: kpisAnalista,
  atendente_geral: kpisAtendenteGeral,
  atendente_financeiro: kpisAtendenteFinanceiro,
  gestor_financeiro: kpisGestorFinanceiro,
};

// Estado em memória das tarefas (mock simples de mutação)
let _tarefas: TarefaAtendimento[] = [...tarefasAtendimentoMock];

export const operacaoApi = {
  listKpis: () => wait(kpisMock),
  listKpisPorPerfil: (p: PerfilOperacao) => wait(kpisPorPerfil[p]),
  listFarmacias: () => wait(farmaciasMock),
  listLideres: () => wait(lideresMock),
  listEntregadores: () => wait(entregadoresMock),
  listAlertas: () => wait(alertasMock),
  listAlertasPorSetor: (setor: "atendimento_geral" | "financeiro" | "operacao" | "lider") =>
    wait(alertasMock.filter((a) => !a.setor || a.setor === setor || setor === "operacao")),
  charts: () => wait({ volumePorHora, slaPorFarmacia, faltasVsDiarias }),
  listCompliance: () => wait(complianceMock),
  listTarefas: () => wait(_tarefas),
  listTarefasPorPerfil: (p: PerfilOperacao) => {
    if (p === "atendente_geral") return wait(_tarefas.filter((t) => t.setor === "atendimento_geral"));
    if (p === "atendente_financeiro")
      return wait(_tarefas.filter((t) => t.setor === "financeiro" && t.tipo !== "autorizar_adiantamento"));
    if (p === "gestor_financeiro") return wait(_tarefas.filter((t) => t.setor === "financeiro"));
    return wait(_tarefas);
  },
  listNotificacoes: () => wait(notificacoesPendenciaMock),
  listEventosCiclo: () => wait(eventosCicloMock),
  listRegras: () => wait(regrasMock),
  getOrganograma: () => wait(organogramaMock),
  updateTarefa: (id: string, patch: Partial<TarefaAtendimento>) => {
    _tarefas = _tarefas.map((t) => (t.id === id ? { ...t, ...patch } : t));
    return wait(_tarefas.find((t) => t.id === id)!);
  },
  finalizarTarefa: (id: string) =>
    operacaoApi.updateTarefa(id, {
      status: "concluida",
      concluidaEm: new Date().toLocaleString("pt-BR"),
      checklist: _tarefas.find((t) => t.id === id)!.checklist.map((c) => ({ ...c, done: true })),
    }),
};
