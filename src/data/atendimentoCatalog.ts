// Mock catalog used by the inline block forms in AutomacaoNova.
// When a backend exists, swap these constants for fetched data.

export const setores = [
  { id: "comercial", nome: "Comercial" },
  { id: "operacao", nome: "Operação" },
  { id: "financeiro", nome: "Financeiro" },
  { id: "suporte", nome: "Suporte" },
  { id: "rh", nome: "RH / Pessoas" },
];

export const filas = [
  { id: "fila-comercial", nome: "Comercial · Geral", setorId: "comercial" },
  { id: "fila-operacao", nome: "Operação · Entregas", setorId: "operacao" },
  { id: "fila-financeiro", nome: "Financeiro · Cobrança", setorId: "financeiro" },
  { id: "fila-suporte", nome: "Suporte · Plataforma", setorId: "suporte" },
  { id: "fila-rh", nome: "RH · Atendimento", setorId: "rh" },
];

export type Perfil = "entregador" | "farmacia" | "lider";

export const perfis: { id: Perfil; nome: string }[] = [
  { id: "entregador", nome: "Entregador" },
  { id: "farmacia", nome: "Farmácia" },
  { id: "lider", nome: "Líder" },
];

export const demandasPorPerfil: Record<Perfil, string[]> = {
  entregador: [
    "Pagamento / Repasse",
    "Problema na rota",
    "Cancelamento de entrega",
    "Atualização cadastral",
    "Documentação",
    "Suporte ao app",
  ],
  farmacia: [
    "Novo pedido",
    "Status de entrega",
    "Faturamento / NF",
    "Cobrança",
    "Cadastro de produto",
    "Suporte técnico",
  ],
  lider: [
    "Acompanhamento de equipe",
    "Solicitação de relatório",
    "Aprovação de cadastro",
    "Escalonamento crítico",
  ],
};

export const perfisFarmacia = ["Gestor", "Expedição", "Financeiro"];

export const farmaciasPorCidade: Record<string, string[]> = {
  "São Paulo": ["Farmácia Central SP", "Drogaria Paulista", "FarmaPlus Vila Mariana"],
  "Rio de Janeiro": ["Farmácia Copacabana", "Drogaria Tijuca"],
  "Belo Horizonte": ["Farmácia Savassi", "Drogaria Mineira"],
  Curitiba: ["Farmácia Batel", "Drogaria Curitibana"],
};

export const cidadesDisponiveis = Object.keys(farmaciasPorCidade);

export const gestores = [
  { id: "g-ana", nome: "Ana Souza", area: "Operação" },
  { id: "g-bruno", nome: "Bruno Lima", area: "Comercial" },
  { id: "g-carla", nome: "Carla Mendes", area: "Financeiro" },
  { id: "g-diego", nome: "Diego Alves", area: "Suporte" },
];

export const tagsSugeridas = [
  "cadastro pendente",
  "vip",
  "primeiro contato",
  "reincidente",
  "urgente",
];
