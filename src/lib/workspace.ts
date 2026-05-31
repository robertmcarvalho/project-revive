// Mock do workspace atual. Quando Cloud entrar, vira fetch de uma tabela `workspaces`.
export type WorkspacePlano = "Free" | "Trial" | "Pro" | "Business" | "Enterprise";

export interface Workspace {
  id: string;
  nome: string;
  inicial: string;
  plano: WorkspacePlano;
  agentesUsados: number;
  agentesLimite: number;
  fuso: string;
  idioma: string;
  features?: { commercial_crm_enabled?: boolean };
}

export const isFeatureEnabled = (key: "commercial_crm_enabled") => {
  return currentWorkspace.features?.[key] ?? true;
};

export const currentWorkspace: Workspace = {
  id: "ws_acme",
  nome: "Acme Saúde",
  inicial: "A",
  plano: "Pro",
  agentesUsados: 12,
  agentesLimite: 15,
  fuso: "America/Sao_Paulo",
  idioma: "pt-BR",
  features: { commercial_crm_enabled: true },
};

export const useWorkspace = () => currentWorkspace;

export interface CurrentUser {
  id: string;
  nome: string;
  iniciais: string;
  email: string;
  papel: "Admin" | "Líder" | "Operador";
  status: "online" | "idle" | "busy" | "offline";
  chatsAtivos: number;
}

export const currentUser: CurrentUser = {
  id: "u_robert",
  nome: "Robert Carvalho",
  iniciais: "RC",
  email: "robert@acmesaude.com.br",
  papel: "Admin",
  status: "online",
  chatsAtivos: 4,
};

export const useCurrentUser = () => currentUser;
