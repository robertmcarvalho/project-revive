// Mock determinístico para relatórios de atendimento.
// Substituir por fetch real quando o backend estiver plugado.

export type Canal = "whatsapp" | "instagram" | "email";
export type StatusTicket = "aberto" | "em_andamento" | "resolvido" | "reaberto";
export type PerfilAtual = "administrador" | "gestor" | "supervisor" | "atendente";

export const CANAIS: Canal[] = ["whatsapp", "instagram", "email"];
export const STATUS: StatusTicket[] = ["aberto", "em_andamento", "resolvido", "reaberto"];

export const FILAS = [
  { name: "Atendimento Principal", setores: ["Atendimento Geral", "Suporte Técnico"] },
  { name: "Vendas SP", setores: ["Comercial", "Financeiro"] },
  { name: "Suporte Técnico", setores: ["Suporte Técnico", "Operacional"] },
  { name: "Plantão 24h", setores: ["Atendimento Geral", "Operacional"] },
];

export const ATENDENTES = [
  { id: "u4", nome: "Pedro Alves", filas: ["Atendimento Principal"], setor: "Atendimento Geral", supervisor: "Carlos Lima" },
  { id: "u5", nome: "Júlia Mendes", filas: ["Suporte Técnico"], setor: "Suporte Técnico", supervisor: "Carlos Lima" },
  { id: "u8", nome: "Lucas Ferreira", filas: ["Vendas SP"], setor: "Comercial", supervisor: "Mariana Reis" },
  { id: "u9", nome: "Beatriz Lima", filas: ["Atendimento Principal", "Plantão 24h"], setor: "Atendimento Geral", supervisor: "Carlos Lima" },
  { id: "u10", nome: "Rafael Souza", filas: ["Suporte Técnico"], setor: "Operacional", supervisor: "Carlos Lima" },
  { id: "u11", nome: "Camila Rocha", filas: ["Vendas SP"], setor: "Financeiro", supervisor: "Mariana Reis" },
  { id: "u12", nome: "Tiago Almeida", filas: ["Plantão 24h"], setor: "Operacional", supervisor: "Carlos Lima" },
  { id: "u13", nome: "Isabela Castro", filas: ["Atendimento Principal"], setor: "Atendimento Geral", supervisor: "Carlos Lima" },
];

export const SUPERVISORES = [
  { id: "u2", nome: "Carlos Lima" },
  { id: "u3", nome: "Mariana Reis" },
];

export const TAGS = ["Dúvida", "Reclamação", "Cancelamento", "Elogio", "Suporte técnico", "Cobrança", "Pedido novo"];

// PRNG determinístico (mulberry32)
function seeded(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Ticket = {
  id: string;
  atendenteId: string;
  contato: string;
  canal: Canal;
  fila: string;
  setor: string;
  status: StatusTicket;
  abertoEm: Date;
  fechadoEm: Date | null;
  tmrSeg: number;     // tempo de 1ª resposta (s)
  tmaSeg: number;     // tempo total (s)
  tmeSeg: number;     // espera na fila (s)
  mensagensRecebidas: number;
  mensagensEnviadas: number;
  csat: number | null; // 1..5
  fcr: boolean;        // resolvido no 1º contato
  transferido: boolean;
  reaberto: boolean;
  tag: string;
  slaCumprido: boolean;
};

const NOMES_CONTATO = ["Drogaria Silva", "Farmácia Bem-Estar", "João Souza", "Maria Costa", "Drogasil Vila", "Pague Menos", "Carlos Pereira", "Ana Beatriz", "Farma Plus", "Drogarias SP"];

export function gerarTickets(start: Date, end: Date, seedBase = 42): Ticket[] {
  const rand = seeded(seedBase + start.getTime() / 1e9);
  const tickets: Ticket[] = [];
  const dias = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
  const total = Math.min(2500, dias * 60); // ~60 tickets/dia

  for (let i = 0; i < total; i++) {
    const at = ATENDENTES[Math.floor(rand() * ATENDENTES.length)];
    const fila = at.filas[Math.floor(rand() * at.filas.length)];
    const setor = at.setor;
    const canal = CANAIS[Math.floor(rand() * CANAIS.length)];
    const status = STATUS[Math.floor(rand() * (rand() > 0.7 ? STATUS.length : 3))];
    const abertoEm = new Date(start.getTime() + rand() * (end.getTime() - start.getTime()));
    const tmaSeg = Math.round(60 + rand() * 60 * 45); // 1..45min
    const fechadoEm = status === "resolvido" || status === "reaberto" ? new Date(abertoEm.getTime() + tmaSeg * 1000) : null;
    const tmrSeg = Math.round(15 + rand() * 240); // 15s..4min
    const tmeSeg = Math.round(rand() * 180);
    const csat = status === "resolvido" ? Math.max(1, Math.min(5, Math.round(3.5 + (rand() - 0.4) * 3))) : null;

    tickets.push({
      id: `T-${10000 + i}`,
      atendenteId: at.id,
      contato: NOMES_CONTATO[Math.floor(rand() * NOMES_CONTATO.length)],
      canal,
      fila,
      setor,
      status,
      abertoEm,
      fechadoEm,
      tmrSeg,
      tmaSeg,
      tmeSeg,
      mensagensRecebidas: Math.round(2 + rand() * 18),
      mensagensEnviadas: Math.round(2 + rand() * 22),
      csat,
      fcr: rand() > 0.35 && status === "resolvido",
      transferido: rand() > 0.85,
      reaberto: status === "reaberto",
      tag: TAGS[Math.floor(rand() * TAGS.length)],
      slaCumprido: tmrSeg <= 120,
    });
  }
  return tickets;
}
