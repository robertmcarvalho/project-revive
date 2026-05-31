// Mocks do módulo CRM Comercial — substituir por backend quando disponível.

export type DealOrigin = "manual" | "instagram" | "indicacao" | "site" | "campanha";

export interface PipelineStage {
  id: string;
  name: string;
  color: string; // hsl token string e.g. "var(--primary)"
  probability: number; // 0..100
  sort_order: number;
  is_entry?: boolean;
  is_won?: boolean;
  is_lost?: boolean;
}

export interface CustomFieldDef {
  id: string;
  slug: string;
  label: string;
  type: "text" | "number" | "select" | "date" | "boolean";
  required: boolean;
  options?: string[];
  sort_order: number;
}

export interface LossReason {
  id: string;
  name: string;
  active: boolean;
}

export interface CommercialUser {
  id: string;
  name: string;
  initials: string;
}

export interface Lead {
  id: string;
  fantasyName: string;
  companyName?: string;
  cnpj?: string;
  city: string;
  uf: string;
  whatsapp: string;
  decisorName: string;
  decisorEmail?: string;
  decisorRole?: string;
  ownerId: string;
  stageId: string;
  origin: DealOrigin;
  campaign?: string;
  estDeliveries?: number;
  estDrivers?: number;
  erp?: string;
  peakHours?: string;
  notes?: string;
  customFields: Record<string, string | number | boolean>;
  score?: number; // 0..100
  createdAt: string;
  updatedAt: string;
  stageEnteredAt: string;
  lossReasonId?: string;
  lossNotes?: string;
}

export interface Activity {
  id: string;
  leadId: string;
  type: "stage_change" | "message" | "note" | "proposal" | "meeting" | "created";
  text: string;
  at: string;
  actor?: string;
}

export interface ChatMessage {
  id: string;
  leadId: string;
  from: "lead" | "agent";
  text: string;
  at: string;
}

export const users: CommercialUser[] = [
  { id: "u1", name: "Robert Carvalho", initials: "RC" },
  { id: "u2", name: "Ana Lima", initials: "AL" },
  { id: "u3", name: "Diego Faria", initials: "DF" },
];

export const pipelineStages: PipelineStage[] = [
  { id: "s1", name: "Novo lead", color: "var(--primary)", probability: 10, sort_order: 1, is_entry: true },
  { id: "s2", name: "Qualificação", color: "var(--info)", probability: 25, sort_order: 2 },
  { id: "s3", name: "Reunião agendada", color: "var(--violet)", probability: 45, sort_order: 3 },
  { id: "s4", name: "Proposta enviada", color: "var(--warning)", probability: 65, sort_order: 4 },
  { id: "s5", name: "Negociação", color: "var(--warning)", probability: 80, sort_order: 5 },
  { id: "s6", name: "Ganho", color: "var(--success)", probability: 100, sort_order: 6, is_won: true },
  { id: "s7", name: "Perdido", color: "var(--destructive)", probability: 0, sort_order: 7, is_lost: true },
];

export const lossReasons: LossReason[] = [
  { id: "l1", name: "Preço acima do esperado", active: true },
  { id: "l2", name: "Sem fit operacional", active: true },
  { id: "l3", name: "Escolheu concorrente", active: true },
  { id: "l4", name: "Sem retorno do decisor", active: true },
  { id: "l5", name: "Fora da praça atendida", active: true },
];

export const customFieldDefs: CustomFieldDef[] = [
  { id: "f1", slug: "horario_pico", label: "Horário de pico", type: "text", required: false, sort_order: 1 },
  { id: "f2", slug: "tem_motoboy_proprio", label: "Tem motoboy próprio", type: "boolean", required: false, sort_order: 2 },
  { id: "f3", slug: "ticket_medio", label: "Ticket médio (R$)", type: "number", required: false, sort_order: 3 },
];

const today = new Date();
const iso = (d: Date) => d.toISOString();
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return iso(d);
};

export const leadsSeed: Lead[] = [
  {
    id: "ld_001", fantasyName: "Drogaria Vida Plena", city: "Campinas", uf: "SP",
    whatsapp: "+55 19 98800-1100", decisorName: "Marcos Vieira", decisorEmail: "marcos@vidaplena.com",
    ownerId: "u1", stageId: "s1", origin: "instagram", estDeliveries: 380, estDrivers: 4,
    customFields: { ticket_medio: 78 }, score: 72,
    createdAt: daysAgo(2), updatedAt: daysAgo(0), stageEnteredAt: daysAgo(2),
    notes: "Veio de campanha Instagram. Tem 2 unidades.",
  },
  {
    id: "ld_002", fantasyName: "Farmácia Bem Estar", city: "Ribeirão Preto", uf: "SP",
    whatsapp: "+55 16 99100-2200", decisorName: "Júlia Prado", decisorEmail: "julia@bemestar.com",
    ownerId: "u2", stageId: "s2", origin: "indicacao", estDeliveries: 620, estDrivers: 7,
    customFields: { horario_pico: "18h–21h", tem_motoboy_proprio: true }, score: 84,
    createdAt: daysAgo(7), updatedAt: daysAgo(1), stageEnteredAt: daysAgo(4),
  },
  {
    id: "ld_003", fantasyName: "Drogaria São Lucas", city: "Curitiba", uf: "PR",
    whatsapp: "+55 41 99500-3300", decisorName: "Eduardo Nunes",
    ownerId: "u1", stageId: "s3", origin: "manual", estDeliveries: 220,
    customFields: {}, score: 58,
    createdAt: daysAgo(12), updatedAt: daysAgo(3), stageEnteredAt: daysAgo(2),
  },
  {
    id: "ld_004", fantasyName: "Farma Express 24h", city: "Belo Horizonte", uf: "MG",
    whatsapp: "+55 31 98700-4400", decisorName: "Patrícia Soares", decisorEmail: "patricia@famaexpress.com",
    ownerId: "u3", stageId: "s4", origin: "site", estDeliveries: 1200, estDrivers: 14, erp: "Trier",
    customFields: { ticket_medio: 95 }, score: 91,
    createdAt: daysAgo(20), updatedAt: daysAgo(2), stageEnteredAt: daysAgo(5),
  },
  {
    id: "ld_005", fantasyName: "Pharma House", city: "Goiânia", uf: "GO",
    whatsapp: "+55 62 99900-5500", decisorName: "Renan Costa",
    ownerId: "u2", stageId: "s5", origin: "campanha", campaign: "Black November",
    estDeliveries: 450, customFields: {}, score: 76,
    createdAt: daysAgo(28), updatedAt: daysAgo(1), stageEnteredAt: daysAgo(3),
  },
  {
    id: "ld_006", fantasyName: "Drogaria Central Sul", city: "Porto Alegre", uf: "RS",
    whatsapp: "+55 51 99300-6600", decisorName: "Carla Mendes",
    ownerId: "u1", stageId: "s6", origin: "indicacao", estDeliveries: 800,
    customFields: {}, score: 95,
    createdAt: daysAgo(45), updatedAt: daysAgo(10), stageEnteredAt: daysAgo(10),
  },
  {
    id: "ld_007", fantasyName: "Farmácia Popular Z", city: "Recife", uf: "PE",
    whatsapp: "+55 81 99700-7700", decisorName: "Tiago Albuquerque",
    ownerId: "u3", stageId: "s7", origin: "manual", customFields: {},
    createdAt: daysAgo(35), updatedAt: daysAgo(8), stageEnteredAt: daysAgo(8),
    lossReasonId: "l1", lossNotes: "Comparou com proposta de outro fornecedor.",
  },
];

export const activitiesSeed: Activity[] = [
  { id: "a1", leadId: "ld_001", type: "created", text: "Lead criado via Instagram Lead Ads", at: daysAgo(2) },
  { id: "a2", leadId: "ld_001", type: "message", text: "Mensagem inicial enviada via WhatsApp", at: daysAgo(2), actor: "RC" },
  { id: "a3", leadId: "ld_001", type: "note", text: "Decisor pediu retorno na quinta", at: daysAgo(1), actor: "RC" },
  { id: "a4", leadId: "ld_002", type: "stage_change", text: "Movido para Qualificação", at: daysAgo(4), actor: "AL" },
  { id: "a5", leadId: "ld_004", type: "proposal", text: "Proposta v1 enviada por WhatsApp", at: daysAgo(5), actor: "DF" },
];

export const messagesSeed: ChatMessage[] = [
  { id: "m1", leadId: "ld_001", from: "agent", text: "Olá Marcos, tudo bem? Aqui é a Aethera 👋", at: daysAgo(2) },
  { id: "m2", leadId: "ld_001", from: "lead", text: "Oi, tudo. Pode me explicar como funciona?", at: daysAgo(2) },
  { id: "m3", leadId: "ld_001", from: "agent", text: "Claro! Somos a plataforma de gestão de entregas para farmácias.", at: daysAgo(2) },
  { id: "m4", leadId: "ld_001", from: "lead", text: "Manda os valores por favor.", at: daysAgo(1) },
];
