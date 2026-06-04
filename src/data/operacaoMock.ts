// Mock de dados para a tela Operação (Analista Operacional)
export type EntregadorStatus = "rota" | "disponivel" | "pausa" | "offline";
export type AlertaNivel = "destructive" | "warning" | "success" | "info";

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
}

export interface KpiOperacional {
  label: string;
  valor: string;
  delta?: string;
  deltaTipo?: "up" | "down" | "neutral";
  spark: number[];
  alerta?: boolean;
}

// === Compliance documental ===
export interface ComplianceEntregador {
  id: string;
  nome: string;
  iniciais: string;
  farmacia: string;
  certificadoDigital: boolean;
  mei: boolean;
  matricula: boolean;
}

// === Tarefas geradas para a fila "Atendimento Geral" ===
export type TarefaTipo = "finalizar_cadastro" | "gerar_matricula" | "gerar_termo_desligamento";
export type TarefaStatus = "em_andamento" | "atrasada" | "concluida" | "aguardando";

export interface ChecklistItem { label: string; done: boolean }

export interface TarefaAtendimento {
  id: string;
  tipo: TarefaTipo;
  entregadorNome: string;
  entregadorIniciais: string;
  farmacia: string;
  atendenteNome: string;
  atendenteIniciais: string;
  checklist: ChecklistItem[];
  slaMinutos: number;          // SLA alvo
  decorridoMinutos: number;    // tempo decorrido
  prazo: string;               // ex: "Hoje 17:00"
  status: TarefaStatus;
}

// === Notificações de pendências de assinatura ===
export interface NotificacaoPendencia {
  id: string;
  tipo: "termo_desligamento" | "matricula";
  entregadorNome: string;
  entregadorIniciais: string;
  farmacia: string;
  diasPendente: number;
  prazoDias: number;
}

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
  { id: "a1", tipo: "SLA estourado", descricao: "Pedido #4821 ultrapassou 45min sem saída", farmacia: "Farmácia Popular Centro", timestamp: "09:12", nivel: "destructive" },
  { id: "a2", tipo: "Líder ausente", descricao: "Líder Rafael Pinto sem atividade há 17 minutos", farmacia: "Drogasil Pinheiros", timestamp: "08:55", nivel: "warning" },
  { id: "a3", tipo: "Entregador sem check-in", descricao: "Elisa Rocha não fez check-in no turno", farmacia: "Drogasil Pinheiros", timestamp: "08:30", nivel: "warning" },
  { id: "a4", tipo: "Fila acima do limite", descricao: "8 chats aguardando atendimento", farmacia: "Farmácia Popular Centro", timestamp: "08:48", nivel: "destructive" },
  { id: "a5", tipo: "Diária confirmada", descricao: "Todas as diárias do turno foram aceitas", farmacia: "Farmácia Central", timestamp: "07:40", nivel: "success" },
];

export const kpisMock: KpiOperacional[] = [
  { label: "Diárias confirmadas", valor: "32/36", delta: "89%", deltaTipo: "up", spark: [28, 30, 31, 31, 32, 32, 32] },
  { label: "Faltas no turno", valor: "2", delta: "-1 vs ontem", deltaTipo: "up", spark: [4, 5, 3, 3, 2, 2, 2] },
  { label: "Entregadores em rota", valor: "17", delta: "+3 vs ontem", deltaTipo: "up", spark: [12, 14, 13, 15, 16, 16, 17] },
  { label: "SLA médio", valor: "90.4%", delta: "-1.2 pp", deltaTipo: "down", spark: [93, 92, 91, 92, 91, 90, 90] },
  { label: "Pedidos em atraso", valor: "11", delta: "+4", deltaTipo: "down", spark: [4, 5, 6, 8, 9, 10, 11], alerta: true },
  { label: "Tarefas abertas", valor: "9", delta: "3 atrasadas", deltaTipo: "down", spark: [5, 6, 7, 8, 8, 9, 9], alerta: true },
];

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

export const tarefasAtendimentoMock: TarefaAtendimento[] = [
  {
    id: "t1", tipo: "gerar_matricula",
    entregadorNome: "Ana Lima", entregadorIniciais: "AL", farmacia: "Farmácia Central",
    atendenteNome: "Paula Reis", atendenteIniciais: "PR",
    checklist: [
      { label: "Documentos recebidos", done: true },
      { label: "Validar CNH e ASO", done: true },
      { label: "Gerar nº de matrícula", done: false },
      { label: "Enviar para assinatura", done: false },
    ],
    slaMinutos: 240, decorridoMinutos: 90, prazo: "Hoje 17:00", status: "em_andamento",
  },
  {
    id: "t2", tipo: "finalizar_cadastro",
    entregadorNome: "Diego Alves", entregadorIniciais: "DA", farmacia: "Farmácia Popular Centro",
    atendenteNome: "Lucas Vieira", atendenteIniciais: "LV",
    checklist: [
      { label: "Foto de perfil", done: true },
      { label: "Dados bancários", done: true },
      { label: "Comprovante de residência", done: false },
      { label: "Conferência final", done: false },
    ],
    slaMinutos: 180, decorridoMinutos: 200, prazo: "Hoje 12:30", status: "atrasada",
  },
  {
    id: "t3", tipo: "gerar_termo_desligamento",
    entregadorNome: "Elisa Rocha", entregadorIniciais: "ER", farmacia: "Drogasil Pinheiros",
    atendenteNome: "Paula Reis", atendenteIniciais: "PR",
    checklist: [
      { label: "Motivo registrado", done: true },
      { label: "Calcular pendências", done: false },
      { label: "Gerar termo PDF", done: false },
      { label: "Encaminhar p/ assinatura", done: false },
    ],
    slaMinutos: 360, decorridoMinutos: 120, prazo: "Amanhã 09:00", status: "em_andamento",
  },
  {
    id: "t4", tipo: "gerar_matricula",
    entregadorNome: "Fábio Neto", entregadorIniciais: "FN", farmacia: "Drogasil Pinheiros",
    atendenteNome: "Lucas Vieira", atendenteIniciais: "LV",
    checklist: [
      { label: "Documentos recebidos", done: true },
      { label: "Validar CNH e ASO", done: true },
      { label: "Gerar nº de matrícula", done: true },
      { label: "Enviar para assinatura", done: true },
    ],
    slaMinutos: 240, decorridoMinutos: 150, prazo: "Concluída", status: "concluida",
  },
  {
    id: "t5", tipo: "finalizar_cadastro",
    entregadorNome: "Bruno Dias", entregadorIniciais: "BD", farmacia: "Drogasil Moema",
    atendenteNome: "—", atendenteIniciais: "??",
    checklist: [
      { label: "Foto de perfil", done: false },
      { label: "Dados bancários", done: false },
      { label: "Comprovante de residência", done: false },
      { label: "Conferência final", done: false },
    ],
    slaMinutos: 180, decorridoMinutos: 30, prazo: "Hoje 15:00", status: "aguardando",
  },
];

export const notificacoesPendenciaMock: NotificacaoPendencia[] = [
  { id: "n1", tipo: "matricula", entregadorNome: "Ana Lima", entregadorIniciais: "AL", farmacia: "Farmácia Central", diasPendente: 1, prazoDias: 3 },
  { id: "n2", tipo: "matricula", entregadorNome: "Fábio Neto", entregadorIniciais: "FN", farmacia: "Drogasil Pinheiros", diasPendente: 2, prazoDias: 3 },
  { id: "n3", tipo: "termo_desligamento", entregadorNome: "Elisa Rocha", entregadorIniciais: "ER", farmacia: "Drogasil Pinheiros", diasPendente: 4, prazoDias: 5 },
  { id: "n4", tipo: "termo_desligamento", entregadorNome: "Roberto Lemos", entregadorIniciais: "RL", farmacia: "Farmácia Popular Centro", diasPendente: 6, prazoDias: 5 },
];

export const volumePorHora = Array.from({ length: 12 }).map((_, i) => ({
  hora: `${String(8 + i).padStart(2, "0")}h`,
  pedidos: Math.round(20 + Math.sin(i / 2) * 12 + Math.random() * 8),
}));

export const slaPorFarmacia = farmaciasMock.map((f) => ({ farmacia: f.nome.replace("Farmácia ", "F. ").replace("Drogasil ", "D. "), sla: f.sla }));

export const faltasVsDiarias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((dia, i) => ({
  dia,
  diarias: 14 + Math.round(Math.random() * 6),
  faltas: i === 6 ? 0 : Math.round(Math.random() * 4),
}));
