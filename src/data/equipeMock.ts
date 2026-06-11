// Mock de equipe: atendentes, sessões e eventos de login.
// Trocar por backend Lovable Cloud futuramente (presence + tabela auth_events).

export type PresenceStatus = "online" | "idle" | "busy" | "offline";
export type LoginEventType = "login" | "logout" | "timeout" | "forced";
export type DeviceKind = "desktop" | "mobile";

export interface Atendente {
  id: string;
  nome: string;
  iniciais: string;
  papel: "Admin" | "Líder" | "Operador";
  status: PresenceStatus;
  /** ISO desde quando está no status atual */
  desde: string;
  chatsAtivos: number;
  /** Último heartbeat em ISO */
  ultimoHeartbeat: string;
}

export interface LoginEvento {
  id: string;
  atendenteId: string;
  tipo: LoginEventType;
  quando: string;
  /** Duração da sessão em segundos (apenas para logout/timeout/forced) */
  duracaoSeg?: number;
  device: DeviceKind;
  navegador: string;
  ip: string;
  local: string;
}

export interface SessaoProdutividade {
  id: string;
  atendenteId: string;
  inicio: string;
  fim: string;
  logadoSeg: number;
  pausaSeg: number;
  atendimentoSeg: number;
  conversas: number;
  csat: number;
  primeiraRespostaSeg: number;
  /** Atendimentos por hora ao longo da sessão (para sparkline) */
  atendimentosPorHora: number[];
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
const minsAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

export const atendentes: Atendente[] = [
  { id: "u_robert", nome: "Robert Carvalho",  iniciais: "RC", papel: "Admin",    status: "online",  desde: hoursAgo(3.2), chatsAtivos: 4, ultimoHeartbeat: minsAgo(0) },
  { id: "u_marina", nome: "Marina Souza",     iniciais: "MS", papel: "Operador", status: "online",  desde: hoursAgo(5.1), chatsAtivos: 7, ultimoHeartbeat: minsAgo(0) },
  { id: "u_lucas",  nome: "Lucas Andrade",    iniciais: "LA", papel: "Operador", status: "online",  desde: hoursAgo(4.6), chatsAtivos: 6, ultimoHeartbeat: minsAgo(1) },
  { id: "u_carla",  nome: "Carla Mendes",     iniciais: "CM", papel: "Líder",    status: "busy",    desde: minsAgo(42),   chatsAtivos: 9, ultimoHeartbeat: minsAgo(0) },
  { id: "u_rafa",   nome: "Rafael Pinto",     iniciais: "RP", papel: "Operador", status: "online",  desde: hoursAgo(2.3), chatsAtivos: 3, ultimoHeartbeat: minsAgo(0) },
  { id: "u_bea",    nome: "Beatriz Lima",     iniciais: "BL", papel: "Operador", status: "idle",    desde: minsAgo(18),   chatsAtivos: 1, ultimoHeartbeat: minsAgo(3) },
  { id: "u_diego",  nome: "Diego Ferreira",   iniciais: "DF", papel: "Operador", status: "idle",    desde: minsAgo(27),   chatsAtivos: 2, ultimoHeartbeat: minsAgo(5) },
  { id: "u_paula",  nome: "Paula Ribeiro",    iniciais: "PR", papel: "Operador", status: "offline", desde: hoursAgo(11),  chatsAtivos: 0, ultimoHeartbeat: hoursAgo(11) },
  { id: "u_tiago",  nome: "Tiago Nogueira",   iniciais: "TN", papel: "Operador", status: "offline", desde: hoursAgo(20),  chatsAtivos: 0, ultimoHeartbeat: hoursAgo(20) },
  { id: "u_helo",   nome: "Heloísa Martins",  iniciais: "HM", papel: "Líder",    status: "online",  desde: hoursAgo(6.4), chatsAtivos: 5, ultimoHeartbeat: minsAgo(0) },
];

export const eventosLogin: LoginEvento[] = [
  { id: "e1",  atendenteId: "u_marina", tipo: "login",   quando: hoursAgo(5.1),  device: "desktop", navegador: "Chrome 124",  ip: "189.45.12.88",  local: "São Paulo, BR" },
  { id: "e2",  atendenteId: "u_lucas",  tipo: "login",   quando: hoursAgo(4.6),  device: "desktop", navegador: "Edge 124",    ip: "201.23.55.10",  local: "Rio de Janeiro, BR" },
  { id: "e3",  atendenteId: "u_carla",  tipo: "login",   quando: hoursAgo(8.0),  device: "mobile",  navegador: "Safari iOS",  ip: "177.92.4.221",  local: "Curitiba, BR" },
  { id: "e4",  atendenteId: "u_paula",  tipo: "logout",  quando: hoursAgo(11),   duracaoSeg: 6 * 3600 + 12 * 60, device: "desktop", navegador: "Chrome 124", ip: "186.10.7.4",  local: "Belo Horizonte, BR" },
  { id: "e5",  atendenteId: "u_tiago",  tipo: "timeout", quando: hoursAgo(20),   duracaoSeg: 4 * 3600 + 5 * 60,  device: "desktop", navegador: "Firefox 126", ip: "200.181.66.9", local: "Porto Alegre, BR" },
  { id: "e6",  atendenteId: "u_bea",    tipo: "login",   quando: hoursAgo(2.0),  device: "desktop", navegador: "Chrome 124",  ip: "187.4.18.55",   local: "São Paulo, BR" },
  { id: "e7",  atendenteId: "u_diego",  tipo: "login",   quando: hoursAgo(7.0),  device: "desktop", navegador: "Chrome 124",  ip: "189.45.99.2",   local: "Campinas, BR" },
  { id: "e8",  atendenteId: "u_rafa",   tipo: "login",   quando: hoursAgo(2.3),  device: "mobile",  navegador: "Chrome Android", ip: "177.5.4.31", local: "São Paulo, BR" },
  { id: "e9",  atendenteId: "u_helo",   tipo: "login",   quando: hoursAgo(6.4),  device: "desktop", navegador: "Safari 17",   ip: "201.45.18.7",   local: "Florianópolis, BR" },
  { id: "e10", atendenteId: "u_marina", tipo: "logout",  quando: hoursAgo(14),   duracaoSeg: 7 * 3600 + 40 * 60, device: "desktop", navegador: "Chrome 124", ip: "189.45.12.88", local: "São Paulo, BR" },
  { id: "e11", atendenteId: "u_carla",  tipo: "forced",  quando: hoursAgo(30),   duracaoSeg: 8 * 3600, device: "desktop", navegador: "Chrome 124", ip: "200.10.4.1", local: "Curitiba, BR" },
  { id: "e12", atendenteId: "u_lucas",  tipo: "logout",  quando: hoursAgo(20),   duracaoSeg: 8 * 3600 + 15 * 60, device: "desktop", navegador: "Edge 124", ip: "201.23.55.10", local: "Rio de Janeiro, BR" },
];

export const sessoes: SessaoProdutividade[] = [
  { id: "s1", atendenteId: "u_marina", inicio: hoursAgo(14),  fim: hoursAgo(6.5),  logadoSeg: 27000, pausaSeg: 2400, atendimentoSeg: 22800, conversas: 48, csat: 4.9, primeiraRespostaSeg: 62, atendimentosPorHora: [3, 5, 7, 8, 6, 7, 6, 6] },
  { id: "s2", atendenteId: "u_lucas",  inicio: hoursAgo(20),  fim: hoursAgo(12),   logadoSeg: 28800, pausaSeg: 3000, atendimentoSeg: 24000, conversas: 41, csat: 4.8, primeiraRespostaSeg: 75, atendimentosPorHora: [2, 4, 6, 7, 7, 5, 5, 5] },
  { id: "s3", atendenteId: "u_carla",  inicio: hoursAgo(30),  fim: hoursAgo(22),   logadoSeg: 28800, pausaSeg: 1800, atendimentoSeg: 25500, conversas: 53, csat: 4.9, primeiraRespostaSeg: 58, atendimentosPorHora: [4, 6, 8, 9, 7, 7, 6, 6] },
  { id: "s4", atendenteId: "u_rafa",   inicio: hoursAgo(28),  fim: hoursAgo(20.5), logadoSeg: 27000, pausaSeg: 3300, atendimentoSeg: 22200, conversas: 33, csat: 4.7, primeiraRespostaSeg: 95, atendimentosPorHora: [2, 3, 5, 6, 5, 4, 4, 4] },
  { id: "s5", atendenteId: "u_paula",  inicio: hoursAgo(17),  fim: hoursAgo(11),   logadoSeg: 21600, pausaSeg: 2100, atendimentoSeg: 18000, conversas: 28, csat: 4.6, primeiraRespostaSeg: 102, atendimentosPorHora: [2, 3, 4, 5, 4, 5, 5] },
  { id: "s6", atendenteId: "u_bea",    inicio: hoursAgo(25),  fim: hoursAgo(18),   logadoSeg: 25200, pausaSeg: 2700, atendimentoSeg: 20700, conversas: 28, csat: 4.6, primeiraRespostaSeg: 110, atendimentosPorHora: [2, 4, 5, 5, 4, 4, 4] },
];
