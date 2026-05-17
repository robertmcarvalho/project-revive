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
}

export const currentWorkspace: Workspace = {
  id: "ws_acme",
  nome: "Acme Saúde",
  inicial: "A",
  plano: "Pro",
  agentesUsados: 12,
  agentesLimite: 15,
  fuso: "America/Sao_Paulo",
  idioma: "pt-BR",
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
