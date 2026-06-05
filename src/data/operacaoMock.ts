// Mock de dados para a tela Operação (multi-perfil)
export type EntregadorStatus = "rota" | "disponivel" | "pausa" | "offline";
export type AlertaNivel = "destructive" | "warning" | "success" | "info";

export type PerfilOperacao =
  | "analista_operacional"
  | "atendente_geral"
  | "atendente_financeiro"
  | "gestor_financeiro";

export interface FarmaciaOperacional {
  id: string;
  nome: string;
  cidade: string;
  liderId: string;
  liderNome: string;
  liderIniciais: string;
  liderStatus: "online" | "idle" | "busy" | "offline";
  entregadoresAtivos: number;
  entregadoresTotal: number;
  filaChats: number;
  pedidosPendentes: number;
  sla: number;
}

export interface LiderResumo {
  id: string;
  nome: string;
  iniciais: string;
  farmacia: string;
  status: "online" | "idle" | "busy" | "offline";
  equipe: number;
  sla: number;
  csat: number;
  ultimaAtividade: string;
}

export interface EntregadorOperacional {
  id: string;
  nome: string;
  iniciais: string;
  farmacia: string;
  status: EntregadorStatus;
  ultimoPing: string;
  pedidosHoje: number;
}

export interface AlertaOperacional {
  id: string;
  tipo: string;
  descricao: string;
  farmacia: string;
  timestamp: string;
  nivel: AlertaNivel;
  setor?: "atendimento_geral" | "financeiro" | "operacao" | "lider";
}

export interface KpiOperacional {
  label: string;
  valor: string;
  delta?: string;
  deltaTipo?: "up" | "down" | "neutral";
  spark: number[];
  alerta?: boolean;
}

export interface ComplianceEntregador {
  id: string;
  nome: string;
  iniciais: string;
  farmacia: string;
  certificadoDigital: boolean;
  mei: boolean;
  matricula: boolean;
}

export type TarefaTipo =
  | "finalizar_cadastro"
  | "gerar_matricula"
  | "gerar_termo_desligamento"
  | "acerto_desligamento"
  | "lancamento_cotas"
  | "autorizar_adiantamento";

export type TarefaStatus = "em_andamento" | "atrasada" | "concluida" | "aguardando";
export type TarefaSetor = "atendimento_geral" | "financeiro";
export type TarefaPrioridade = "baixa" | "media" | "alta";

export interface ChecklistItem { label: string; done: boolean }

export interface Comentario {
  id: string;
  autor: string;
  iniciais: string;
  texto: string;
  mencoes: string[];
  timestamp: string;
}

export interface TarefaAtendimento {
  id: string;
  tipo: TarefaTipo;
  setor: TarefaSetor;
  entregadorNome: string;
  entregadorIniciais: string;
  farmacia: string;
  atendenteNome: string;
  atendenteIniciais: string;
  checklist: ChecklistItem[];
  slaMinutos: number;
  decorridoMinutos: number;
  prazo: string;
  status: TarefaStatus;
  prioridade: TarefaPrioridade;
  anotacoes?: string;
  comentarios?: Comentario[];
  escaladaPara?: string;
  concluidaEm?: string;
}

export interface NotificacaoPendencia {
  id: string;
  tipo: "termo_desligamento" | "matricula";
  entregadorNome: string;
  entregadorIniciais: string;
  farmacia: string;
  diasPendente: number;
  prazoDias: number;
  tarefaId?: string;
}

export type EventoCicloTipo = "entrada" | "desligamento";
export interface EventoCiclo {
  id: string;
  tipo: EventoCicloTipo;
  entregadorNome: string;
  entregadorIniciais: string;
  data: string;
  farmacia: string;
  liderNome: string;
  atendenteNome: string;
  status: "concluido" | "em_andamento" | "pendente";
}

export interface RegraOperacional {
  id: string;
  titulo: string;
  descricao: string;
  prazo: string;
  categoria: "diarias" | "cadastro" | "escalas" | "desligamento" | "compliance";
}

export interface OrganogramaItem {
  papel: string;
  nome: string;
  filhos?: OrganogramaItem[];
}

// =========================
// SEEDS
// =========================
export const farmaciasMock: FarmaciaOperacional[] = [
  { id: "f1", nome: "Farmácia Central", cidade: "São Paulo · SP", liderId: "1", liderNome: "Marina Souza", liderIniciais: "MS", liderStatus: "online", entregadoresAtivos: 6, entregadoresTotal: 8, filaChats: 3, pedidosPendentes: 12, sla: 96.4 },
  { id: "f2", nome: "Drogasil Moema", cidade: "São Paulo · SP", liderId: "1", liderNome: "Marina Souza", liderIniciais: "MS", liderStatus: "online", entregadoresAtivos: 4, entregadoresTotal: 5, filaChats: 1, pedidosPendentes: 5, sla: 92.1 },
  { id: "f3", nome: "Farmácia Popular Centro", cidade: "Rio de Janeiro · RJ", liderId: "3", liderNome: "Carla Mendes", liderIniciais: "CM", liderStatus: "busy", entregadoresAtivos: 5, entregadoresTotal: 7, filaChats: 8, pedidosPendentes: 22, sla: 84.2 },
  { id: "f4", nome: "Drogasil Pinheiros", cidade: "São Paulo · SP", liderId: "4", liderNome: "Rafael Pinto", liderIniciais: "RP", liderStatus: "idle", entregadoresAtivos: 2, entregadoresTotal: 4, filaChats: 2, pedidosPendentes: 7, sla: 88.9 },
];

export const lideresMock: LiderResumo[] = [
  { id: "1", nome: "Marina Souza", iniciais: "MS", farmacia: "Farmácia Central", status: "online", equipe: 18, sla: 98.2, csat: 4.9, ultimaAtividade: "agora" },
  { id: "1b", nome: "Marina Souza", iniciais: "MS", farmacia: "Drogasil Moema", status: "online", equipe: 5, sla: 92.1, csat: 4.7, ultimaAtividade: "2 min" },
  { id: "3", nome: "Carla Mendes", iniciais: "CM", farmacia: "Farmácia Popular Centro", status: "busy", equipe: 23, sla: 84.2, csat: 4.4, ultimaAtividade: "8 min" },
  { id: "4", nome: "Rafael Pinto", iniciais: "RP", farmacia: "Drogasil Pinheiros", status: "idle", equipe: 6, sla: 88.9, csat: 4.6, ultimaAtividade: "17 min" },
];

export const entregadoresMock: EntregadorOperacional[] = [
  { id: "e1", nome: "João Pereira", iniciais: "JP", farmacia: "Farmácia Central", status: "rota", ultimoPing: "1 min", pedidosHoje: 8 },
  { id: "e2", nome: "Ana Lima", iniciais: "AL", farmacia: "Farmácia Central", status: "rota", ultimoPing: "2 min", pedidosHoje: 6 },
  { id: "e3", nome: "Bruno Dias", iniciais: "BD", farmacia: "Drogasil Moema", status: "disponivel", ultimoPing: "agora", pedidosHoje: 4 },
  { id: "e4", nome: "Clara Souza", iniciais: "CS", farmacia: "Farmácia Popular Centro", status: "pausa", ultimoPing: "12 min", pedidosHoje: 3 },
  { id: "e5", nome: "Diego Alves", iniciais: "DA", farmacia: "Farmácia Popular Centro", status: "rota", ultimoPing: "4 min", pedidosHoje: 9 },
  { id: "e6", nome: "Elisa Rocha", iniciais: "ER", farmacia: "Drogasil Pinheiros", status: "offline", ultimoPing: "1h", pedidosHoje: 0 },
  { id: "e7", nome: "Fábio Neto", iniciais: "FN", farmacia: "Drogasil Pinheiros", status: "disponivel", ultimoPing: "agora", pedidosHoje: 2 },
  { id: "e8", nome: "Gisele Mota", iniciais: "GM", farmacia: "Farmácia Central", status: "rota", ultimoPing: "3 min", pedidosHoje: 7 },
];

export const alertasMock: AlertaOperacional[] = [
  { id: "a1", tipo: "SLA estourado", descricao: "Pedido #4821 ultrapassou 45min sem saída", farmacia: "Farmácia Popular Centro", timestamp: "09:12", nivel: "destructive", setor: "operacao" },
  { id: "a2", tipo: "Líder ausente", descricao: "Líder Rafael Pinto sem atividade há 17 minutos", farmacia: "Drogasil Pinheiros", timestamp: "08:55", nivel: "warning", setor: "operacao" },
  { id: "a3", tipo: "Assinatura atrasada", descricao: "Termo de desligamento de Roberto Lemos com 6 dias sem assinatura", farmacia: "F. Popular Centro", timestamp: "08:30", nivel: "destructive", setor: "atendimento_geral" },
  { id: "a4", tipo: "Acerto vencendo", descricao: "Acerto de Elisa Rocha vence em 2 dias úteis", farmacia: "Drogasil Pinheiros", timestamp: "08:48", nivel: "warning", setor: "financeiro" },
  { id: "a5", tipo: "Cotas pendentes", descricao: "3 entregadores aguardando lançamento de cotas", farmacia: "—", timestamp: "08:10", nivel: "warning", setor: "financeiro" },
  { id: "a6", tipo: "Diária confirmada", descricao: "Todas as diárias do turno foram aceitas", farmacia: "Farmácia Central", timestamp: "07:40", nivel: "success", setor: "operacao" },
];

// Removidos KPIs de entregas/login/roteiro (não mapeáveis hoje)
export const kpisAnalista: KpiOperacional[] = [
  { label: "Diárias confirmadas", valor: "32/36", delta: "89%", deltaTipo: "up", spark: [28, 30, 31, 31, 32, 32, 32] },
  { label: "Faltas no turno", valor: "2", delta: "-1 vs ontem", deltaTipo: "up", spark: [4, 5, 3, 3, 2, 2, 2] },
  { label: "Entregadores ativos", valor: "17", delta: "+3 vs ontem", deltaTipo: "up", spark: [12, 14, 13, 15, 16, 16, 17] },
  { label: "SLA médio", valor: "90.4%", delta: "-1.2 pp", deltaTipo: "down", spark: [93, 92, 91, 92, 91, 90, 90] },
  { label: "Pedidos em atraso", valor: "11", delta: "+4", deltaTipo: "down", spark: [4, 5, 6, 8, 9, 10, 11], alerta: true },
  { label: "Tarefas abertas", valor: "9", delta: "3 atrasadas", deltaTipo: "down", spark: [5, 6, 7, 8, 8, 9, 9], alerta: true },
];

export const kpisAtendenteGeral: KpiOperacional[] = [
  { label: "Tarefas em execução", valor: "7", delta: "+2 hoje", deltaTipo: "neutral", spark: [3, 4, 5, 6, 6, 7, 7] },
  { label: "Atrasadas", valor: "2", delta: "+1", deltaTipo: "down", spark: [0, 1, 1, 1, 2, 2, 2], alerta: true },
  { label: "Finalizadas (hoje)", valor: "12", delta: "+4 vs ontem", deltaTipo: "up", spark: [6, 7, 8, 9, 10, 11, 12] },
  { label: "SLA médio", valor: "87%", delta: "-2 pp", deltaTipo: "down", spark: [92, 91, 90, 89, 88, 87, 87] },
  { label: "Assinaturas pendentes", valor: "4", delta: "1 vencendo", deltaTipo: "down", spark: [2, 2, 3, 3, 4, 4, 4] },
  { label: "Cadastros incompletos", valor: "3", delta: "—", deltaTipo: "neutral", spark: [3, 3, 3, 3, 3, 3, 3] },
];

export const kpisAtendenteFinanceiro: KpiOperacional[] = [
  { label: "Acertos pendentes", valor: "5", delta: "2 vencendo", deltaTipo: "down", spark: [2, 3, 3, 4, 4, 5, 5], alerta: true },
  { label: "Cotas a lançar", valor: "3", delta: "+1", deltaTipo: "neutral", spark: [1, 2, 2, 2, 3, 3, 3] },
  { label: "Adiantamentos solicitados", valor: "6", delta: "+2 hoje", deltaTipo: "neutral", spark: [3, 4, 4, 5, 5, 6, 6] },
  { label: "SLA acertos", valor: "92%", delta: "+1 pp", deltaTipo: "up", spark: [89, 90, 90, 91, 91, 92, 92] },
  { label: "Finalizadas (hoje)", valor: "8", delta: "+3", deltaTipo: "up", spark: [3, 4, 5, 6, 7, 8, 8] },
  { label: "Volume R$", valor: "R$ 42,8k", delta: "+12%", deltaTipo: "up", spark: [30, 32, 35, 38, 40, 42, 42] },
];

export const kpisGestorFinanceiro: KpiOperacional[] = [
  { label: "Tarefas do setor", valor: "23", delta: "+5", deltaTipo: "neutral", spark: [15, 17, 18, 20, 22, 23, 23] },
  { label: "Atrasadas", valor: "4", delta: "+1", deltaTipo: "down", spark: [1, 2, 2, 3, 3, 4, 4], alerta: true },
  { label: "Adiantamentos autorizar", valor: "6", delta: "—", deltaTipo: "neutral", spark: [3, 4, 4, 5, 5, 6, 6] },
  { label: "Volume autorizado", valor: "R$ 128k", delta: "+8%", deltaTipo: "up", spark: [100, 110, 115, 120, 124, 127, 128] },
  { label: "SLA do setor", valor: "91%", delta: "+2 pp", deltaTipo: "up", spark: [86, 87, 88, 89, 90, 91, 91] },
  { label: "Atendentes ativos", valor: "4/5", delta: "—", deltaTipo: "neutral", spark: [4, 4, 4, 4, 4, 4, 4] },
];

// Compat — usado pela tela existente
export const kpisMock: KpiOperacional[] = kpisAnalista;

export const complianceMock: ComplianceEntregador[] = [
  { id: "e1", nome: "João Pereira", iniciais: "JP", farmacia: "Farmácia Central", certificadoDigital: true, mei: true, matricula: true },
  { id: "e2", nome: "Ana Lima", iniciais: "AL", farmacia: "Farmácia Central", certificadoDigital: true, mei: true, matricula: false },
  { id: "e3", nome: "Bruno Dias", iniciais: "BD", farmacia: "Drogasil Moema", certificadoDigital: false, mei: true, matricula: true },
  { id: "e4", nome: "Clara Souza", iniciais: "CS", farmacia: "Farmácia Popular Centro", certificadoDigital: true, mei: false, matricula: true },
  { id: "e5", nome: "Diego Alves", iniciais: "DA", farmacia: "Farmácia Popular Centro", certificadoDigital: false, mei: false, matricula: false },
  { id: "e6", nome: "Elisa Rocha", iniciais: "ER", farmacia: "Drogasil Pinheiros", certificadoDigital: true, mei: true, matricula: true },
  { id: "e7", nome: "Fábio Neto", iniciais: "FN", farmacia: "Drogasil Pinheiros", certificadoDigital: false, mei: true, matricula: false },
  { id: "e8", nome: "Gisele Mota", iniciais: "GM", farmacia: "Farmácia Central", certificadoDigital: true, mei: true, matricula: true },
];

const sampleComentarios = (n: number): Comentario[] =>
  Array.from({ length: n }).map((_, i) => ({
    id: `c${i}`,
    autor: ["Paula Reis", "Lucas Vieira", "Helena Costa"][i % 3],
    iniciais: ["PR", "LV", "HC"][i % 3],
    texto: ["Aguardando retorno do líder @Marina Souza", "Documento enviado, conferindo cadastro", "Escalando para gestor"][i % 3],
    mencoes: i === 0 ? ["Marina Souza"] : [],
    timestamp: `${10 + i}:${(15 + i * 4) % 60}`,
  }));

export const tarefasAtendimentoMock: TarefaAtendimento[] = [
  {
    id: "t1", tipo: "gerar_matricula", setor: "atendimento_geral",
    entregadorNome: "Ana Lima", entregadorIniciais: "AL", farmacia: "Farmácia Central",
    atendenteNome: "Paula Reis", atendenteIniciais: "PR",
    checklist: [
      { label: "Documentos recebidos", done: true },
      { label: "Validar CNH e ASO", done: true },
      { label: "Gerar nº de matrícula", done: false },
      { label: "Enviar para assinatura", done: false },
    ],
    slaMinutos: 240, decorridoMinutos: 90, prazo: "Hoje 17:00", status: "em_andamento", prioridade: "media",
    anotacoes: "Documentação ok, aguardando assinatura digital.", comentarios: sampleComentarios(2),
  },
  {
    id: "t2", tipo: "finalizar_cadastro", setor: "atendimento_geral",
    entregadorNome: "Diego Alves", entregadorIniciais: "DA", farmacia: "Farmácia Popular Centro",
    atendenteNome: "Lucas Vieira", atendenteIniciais: "LV",
    checklist: [
      { label: "Foto de perfil", done: true },
      { label: "Dados bancários", done: true },
      { label: "Comprovante de residência", done: false },
      { label: "Conferência final", done: false },
    ],
    slaMinutos: 180, decorridoMinutos: 200, prazo: "Hoje 12:30", status: "atrasada", prioridade: "alta",
    comentarios: sampleComentarios(1),
  },
  {
    id: "t3", tipo: "gerar_termo_desligamento", setor: "atendimento_geral",
    entregadorNome: "Elisa Rocha", entregadorIniciais: "ER", farmacia: "Drogasil Pinheiros",
    atendenteNome: "Paula Reis", atendenteIniciais: "PR",
    checklist: [
      { label: "Motivo registrado", done: true },
      { label: "Calcular pendências", done: false },
      { label: "Gerar termo PDF", done: false },
      { label: "Encaminhar p/ assinatura", done: false },
    ],
    slaMinutos: 360, decorridoMinutos: 120, prazo: "Amanhã 09:00", status: "em_andamento", prioridade: "media",
  },
  {
    id: "t4", tipo: "gerar_matricula", setor: "atendimento_geral",
    entregadorNome: "Fábio Neto", entregadorIniciais: "FN", farmacia: "Drogasil Pinheiros",
    atendenteNome: "Lucas Vieira", atendenteIniciais: "LV",
    checklist: [
      { label: "Documentos recebidos", done: true },
      { label: "Validar CNH e ASO", done: true },
      { label: "Gerar nº de matrícula", done: true },
      { label: "Enviar para assinatura", done: true },
    ],
    slaMinutos: 240, decorridoMinutos: 150, prazo: "Concluída", status: "concluida", prioridade: "baixa",
    concluidaEm: "Ontem 16:42",
  },
  {
    id: "t5", tipo: "finalizar_cadastro", setor: "atendimento_geral",
    entregadorNome: "Bruno Dias", entregadorIniciais: "BD", farmacia: "Drogasil Moema",
    atendenteNome: "—", atendenteIniciais: "??",
    checklist: [
      { label: "Foto de perfil", done: false },
      { label: "Dados bancários", done: false },
      { label: "Comprovante de residência", done: false },
      { label: "Conferência final", done: false },
    ],
    slaMinutos: 180, decorridoMinutos: 30, prazo: "Hoje 15:00", status: "aguardando", prioridade: "media",
  },
  // Financeiro — atendentes
  {
    id: "t6", tipo: "acerto_desligamento", setor: "financeiro",
    entregadorNome: "Elisa Rocha", entregadorIniciais: "ER", farmacia: "Drogasil Pinheiros",
    atendenteNome: "Helena Costa", atendenteIniciais: "HC",
    checklist: [
      { label: "Levantamento de pendências", done: true },
      { label: "Validar diárias e faltas", done: true },
      { label: "Calcular acerto final", done: false },
      { label: "Emitir comprovante", done: false },
      { label: "Liberar pagamento", done: false },
    ],
    slaMinutos: 60 * 24 * 5, decorridoMinutos: 60 * 24 * 4, prazo: "+2 dias úteis", status: "em_andamento", prioridade: "alta",
    anotacoes: "Termo assinado em 02/06. Prazo 7 dias úteis.", comentarios: sampleComentarios(1),
  },
  {
    id: "t7", tipo: "lancamento_cotas", setor: "financeiro",
    entregadorNome: "Ana Lima", entregadorIniciais: "AL", farmacia: "Farmácia Central",
    atendenteNome: "Helena Costa", atendenteIniciais: "HC",
    checklist: [
      { label: "Confirmar matrícula", done: true },
      { label: "Lançar cota inicial", done: false },
      { label: "Confirmar com líder", done: false },
    ],
    slaMinutos: 60 * 24 * 2, decorridoMinutos: 60 * 6, prazo: "Amanhã 18:00", status: "em_andamento", prioridade: "media",
  },
  {
    id: "t8", tipo: "lancamento_cotas", setor: "financeiro",
    entregadorNome: "Fábio Neto", entregadorIniciais: "FN", farmacia: "Drogasil Pinheiros",
    atendenteNome: "—", atendenteIniciais: "??",
    checklist: [
      { label: "Confirmar matrícula", done: true },
      { label: "Lançar cota inicial", done: false },
      { label: "Confirmar com líder", done: false },
    ],
    slaMinutos: 60 * 24 * 2, decorridoMinutos: 60 * 4, prazo: "Amanhã 12:00", status: "aguardando", prioridade: "media",
  },
  // Gestor financeiro
  {
    id: "t9", tipo: "autorizar_adiantamento", setor: "financeiro",
    entregadorNome: "João Pereira", entregadorIniciais: "JP", farmacia: "Farmácia Central",
    atendenteNome: "Daniel Marques (Gestor)", atendenteIniciais: "DM",
    checklist: [
      { label: "Conferir histórico", done: true },
      { label: "Validar limite", done: true },
      { label: "Aprovar liberação", done: false },
    ],
    slaMinutos: 60 * 4, decorridoMinutos: 60, prazo: "Hoje 17:00", status: "em_andamento", prioridade: "alta",
  },
  {
    id: "t10", tipo: "autorizar_adiantamento", setor: "financeiro",
    entregadorNome: "Gisele Mota", entregadorIniciais: "GM", farmacia: "Farmácia Central",
    atendenteNome: "Daniel Marques (Gestor)", atendenteIniciais: "DM",
    checklist: [
      { label: "Conferir histórico", done: true },
      { label: "Validar limite", done: false },
      { label: "Aprovar liberação", done: false },
    ],
    slaMinutos: 60 * 4, decorridoMinutos: 60 * 5, prazo: "Atrasada", status: "atrasada", prioridade: "alta",
  },
];

export const notificacoesPendenciaMock: NotificacaoPendencia[] = [
  { id: "n1", tipo: "matricula", entregadorNome: "Ana Lima", entregadorIniciais: "AL", farmacia: "Farmácia Central", diasPendente: 1, prazoDias: 3, tarefaId: "t1" },
  { id: "n2", tipo: "matricula", entregadorNome: "Fábio Neto", entregadorIniciais: "FN", farmacia: "Drogasil Pinheiros", diasPendente: 2, prazoDias: 3, tarefaId: "t4" },
  { id: "n3", tipo: "termo_desligamento", entregadorNome: "Elisa Rocha", entregadorIniciais: "ER", farmacia: "Drogasil Pinheiros", diasPendente: 4, prazoDias: 5, tarefaId: "t3" },
  { id: "n4", tipo: "termo_desligamento", entregadorNome: "Roberto Lemos", entregadorIniciais: "RL", farmacia: "Farmácia Popular Centro", diasPendente: 6, prazoDias: 5 },
];

export const eventosCicloMock: EventoCiclo[] = [
  { id: "ev1", tipo: "entrada", entregadorNome: "Ana Lima", entregadorIniciais: "AL", data: "03/06", farmacia: "Farmácia Central", liderNome: "Marina Souza", atendenteNome: "Paula Reis", status: "em_andamento" },
  { id: "ev2", tipo: "entrada", entregadorNome: "Bruno Dias", entregadorIniciais: "BD", data: "02/06", farmacia: "Drogasil Moema", liderNome: "Marina Souza", atendenteNome: "Lucas Vieira", status: "pendente" },
  { id: "ev3", tipo: "desligamento", entregadorNome: "Elisa Rocha", entregadorIniciais: "ER", data: "02/06", farmacia: "Drogasil Pinheiros", liderNome: "Rafael Pinto", atendenteNome: "Paula Reis", status: "em_andamento" },
  { id: "ev4", tipo: "desligamento", entregadorNome: "Roberto Lemos", entregadorIniciais: "RL", data: "30/05", farmacia: "Farmácia Popular Centro", liderNome: "Carla Mendes", atendenteNome: "Helena Costa", status: "pendente" },
  { id: "ev5", tipo: "entrada", entregadorNome: "Fábio Neto", entregadorIniciais: "FN", data: "30/05", farmacia: "Drogasil Pinheiros", liderNome: "Rafael Pinto", atendenteNome: "Lucas Vieira", status: "concluido" },
];

export const regrasMock: RegraOperacional[] = [
  { id: "r1", categoria: "diarias", titulo: "Lançar diárias e faltas no dia da ocorrência", descricao: "Toda diária ou falta deve ser registrada no mesmo dia para garantir o fechamento correto da operação.", prazo: "Mesmo dia" },
  { id: "r2", categoria: "cadastro", titulo: "Entregador só opera após cadastro e matrícula assinada", descricao: "Nenhum entregador pode iniciar operação sem cadastro completo na plataforma e matrícula assinada digitalmente.", prazo: "Pré-operação" },
  { id: "r3", categoria: "escalas", titulo: "Atualizar escalas semanalmente", descricao: "Escalas devem ser revisadas e publicadas toda semana ou imediatamente após qualquer alteração de entregadores.", prazo: "Semanal" },
  { id: "r4", categoria: "desligamento", titulo: "Prazo de acerto pós-desligamento", descricao: "Após a assinatura do termo de desligamento da cooperativa, o acerto deve ser realizado em até 7 dias úteis.", prazo: "7 dias úteis" },
  { id: "r5", categoria: "compliance", titulo: "Compliance documental", descricao: "Acompanhar status de Certificado Digital, MEI e Matrícula. Pendências devem ser tratadas em até 48h.", prazo: "48h" },
];

export const organogramaMock: OrganogramaItem = {
  papel: "Gestor Operacional",
  nome: "Daniel Marques",
  filhos: [
    {
      papel: "Analista Operacional", nome: "Roberta Lima",
      filhos: [
        {
          papel: "Líder", nome: "Marina Souza · Zona Sul",
          filhos: [
            { papel: "Entregador", nome: "João Pereira" },
            { papel: "Entregador", nome: "Ana Lima" },
            { papel: "Entregador", nome: "Gisele Mota" },
          ],
        },
        {
          papel: "Líder", nome: "Rafael Pinto · Pinheiros",
          filhos: [
            { papel: "Entregador", nome: "Fábio Neto" },
            { papel: "Entregador", nome: "Elisa Rocha" },
          ],
        },
      ],
    },
  ],
};

export const volumePorHora = Array.from({ length: 12 }).map((_, i) => ({
  hora: `${String(8 + i).padStart(2, "0")}h`,
  pedidos: Math.round(20 + Math.sin(i / 2) * 12 + Math.random() * 8),
}));

export const slaPorFarmacia = farmaciasMock.map((f) => ({
  farmacia: f.nome.replace("Farmácia ", "F. ").replace("Drogasil ", "D. "),
  sla: f.sla,
}));

export const faltasVsDiarias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((dia, i) => ({
  dia,
  diarias: 14 + Math.round(Math.random() * 6),
  faltas: i === 6 ? 0 : Math.round(Math.random() * 4),
}));
