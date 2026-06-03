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
  sla: number; // 0-100
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
  { label: "Farmácias ativas", valor: "4/4", delta: "100%", deltaTipo: "neutral", spark: [4, 4, 4, 3, 4, 4, 4] },
  { label: "Líderes online", valor: "3", delta: "1 ocupado", deltaTipo: "neutral", spark: [2, 3, 3, 3, 4, 3, 3] },
  { label: "Entregadores em rota", valor: "17", delta: "+3 vs ontem", deltaTipo: "up", spark: [12, 14, 13, 15, 16, 16, 17] },
  { label: "SLA médio", valor: "90.4%", delta: "-1.2 pp", deltaTipo: "down", spark: [93, 92, 91, 92, 91, 90, 90] },
  { label: "Pedidos em atraso", valor: "11", delta: "+4", deltaTipo: "down", spark: [4, 5, 6, 8, 9, 10, 11], alerta: true },
  { label: "Faltas no turno", valor: "2", delta: "-1 vs ontem", deltaTipo: "up", spark: [4, 5, 3, 3, 2, 2, 2] },
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
