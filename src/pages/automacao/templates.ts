import { type Bloco, novoBloco, addBlocoToBranch } from "@/lib/fluxo";

// Configures defaults for a freshly created block, used by the template builder.
const make = (
  tipo: Parameters<typeof novoBloco>[0],
  configOverrides: Record<string, any> = {}
): Bloco => {
  const b = novoBloco(tipo);
  b.config = { ...b.config, ...configOverrides };
  b.collapsed = true;
  return b;
};

// Builds the "Triagem por perfil" template described by the operator:
//  - Identify contact -> branch by profile
//  - Found Entregador / Farmácia / Líder: select setor + demanda + queue
//  - Not found: greet, ask profile, collect data, pre-register, tag,
//    notify agent, select setor + demanda, assign queue
export const buildTriagemPorPerfilTemplate = (): Bloco[] => {
  let identify = make("identificar", { origem: "telefone" });
  identify.collapsed = false;

  // Helper to push a sequence of blocks into a branch
  const seq = (parentId: string, ramo: string, blocos: Bloco[]) => {
    for (const b of blocos) {
      identify = addBlocoToBranch([identify], parentId, ramo, b)[0];
    }
  };

  // ---- Encontrado · Entregador ----
  seq(identify.id, "Encontrado · Entregador", [
    make("selecionar-setor", { modo: "menu", setoresIds: ["operacao", "financeiro", "suporte"] }),
    make("selecionar-demanda", { perfil: "entregador", demandas: ["Pagamento / Repasse", "Problema na rota", "Suporte ao app"] }),
    make("atribuir-fila", { dinamica: true }),
  ]);

  // ---- Encontrado · Farmácia ----
  seq(identify.id, "Encontrado · Farmácia", [
    make("selecionar-setor", { modo: "menu", setoresIds: ["comercial", "operacao", "financeiro", "suporte"] }),
    make("selecionar-demanda", { perfil: "farmacia", demandas: ["Novo pedido", "Status de entrega", "Faturamento / NF"] }),
    make("atribuir-fila", { dinamica: true }),
  ]);

  // ---- Encontrado · Líder ----
  seq(identify.id, "Encontrado · Líder", [
    make("selecionar-setor", { modo: "menu", setoresIds: ["operacao", "rh"] }),
    make("atribuir-fila", { dinamica: true }),
  ]);

  // ---- Não encontrado ----
  // Greet, then a "menu de perfil" (modeled as Pergunta with options as label)
  seq(identify.id, "Não encontrado", [
    make("enviar-mensagem", {
      texto: "Olá! Não encontrei seu cadastro. Vou te ajudar a abrir um pré-cadastro rapidinho.",
      delaySeg: 0,
    }),
    make("pergunta", { rotulo: "Você é Entregador, Farmácia ou Líder?", variavel: "perfil_inicial", obrigatorio: true }),
    // Entregador / Líder fluxo
    make("pergunta", { rotulo: "Qual seu nome completo?", variavel: "nome", obrigatorio: true }),
    make("pergunta", { rotulo: "Em qual cidade você atua?", variavel: "cidade", obrigatorio: true }),
    make("menu-farmacias", { variavelCidade: "cidade" }),
    make("criar-precadastro", { tipo: "entregador", camposExtras: "cnh, placa" }),
    make("aplicar-tag", { tag: "cadastro pendente" }),
    make("notificar-atendente", { canal: "painel", mensagem: "Novo pré-cadastro de entregador aguardando validação" }),
    make("selecionar-setor", { modo: "menu", setoresIds: ["operacao", "suporte"] }),
    make("selecionar-demanda", { perfil: "entregador", demandas: demandasOf("entregador") }),
    make("atribuir-fila", { dinamica: true }),
    // Farmácia fluxo (continua na mesma sequência — operador pode separar depois)
    make("pergunta", { rotulo: "(Farmácia) Qual a razão social?", variavel: "razao_social", obrigatorio: true }),
    make("pergunta", { rotulo: "(Farmácia) Qual seu perfil? Gestor / Expedição / Financeiro", variavel: "perfil_farmacia", obrigatorio: true }),
    make("pergunta", { rotulo: "(Farmácia) Qual seu nome?", variavel: "nome", obrigatorio: true }),
    make("pergunta", { rotulo: "(Farmácia) Qual seu e-mail?", variavel: "email", obrigatorio: true }),
    make("criar-precadastro", { tipo: "farmacia", camposExtras: "cnpj, telefone" }),
    make("aplicar-tag", { tag: "cadastro pendente" }),
    make("notificar-atendente", { canal: "painel", mensagem: "Novo pré-cadastro de farmácia aguardando validação" }),
    make("selecionar-setor", { modo: "menu", setoresIds: ["comercial", "operacao", "financeiro"] }),
    make("selecionar-demanda", { perfil: "farmacia", demandas: demandasOf("farmacia") }),
    make("atribuir-fila", { dinamica: true }),
  ]);

  return [identify];
};

// helper to import demandas without circular dep at module top
import { demandasPorPerfil, type Perfil } from "@/data/atendimentoCatalog";
function demandasOf(p: Perfil) {
  return demandasPorPerfil[p];
}

// Builds the "Escalação por SLA" template:
//  - SLA da etapa dispara em N minutos
//  - Notifica atendente; se estourar, escala para gestor
//  - Aplica tag de prioridade e reatribui à fila de supervisão
export const buildEscalacaoPorSlaTemplate = (): Bloco[] => {
  const slaEtapa = make("sla-etapa", { tempoMin: 5, acaoEstouro: "notificar" });
  slaEtapa.collapsed = false;

  const notificar = make("notificar-atendente", {
    canal: "painel",
    mensagem: "Atendimento próximo do SLA — verifique imediatamente",
  });

  const slaFila = make("sla-fila", { tempoMin: 15, acaoEstouro: "escalar" });

  const tag = make("aplicar-tag", { tag: "sla estourado" });

  const escalar = make("escalar-gestor", { gestorId: "", canal: "email" });

  const reatribuir = make("atribuir-fila", { filaId: "supervisao", dinamica: false });

  const mensagemCliente = make("enviar-mensagem", {
    texto: "Pedimos desculpas pela demora. Sua solicitação foi priorizada e um supervisor já está acompanhando.",
    delaySeg: 0,
  });

  return [slaEtapa, notificar, slaFila, tag, escalar, reatribuir, mensagemCliente];
};

// Builds the "Fora do horário" template:
//  - Mensagem automática informando indisponibilidade
//  - Pergunta se é urgente
//  - Coleta dados de retorno (nome, telefone, descrição)
//  - Aplica tag, cria pré-cadastro/registro e atribui à fila do próximo turno
export const buildForaHorarioTemplate = (): Bloco[] => {
  const aviso = make("enviar-mensagem", {
    texto:
      "Olá! Nosso atendimento está fora do horário (seg–sex 08h–18h). Deixe sua mensagem que retornaremos no próximo turno.",
    delaySeg: 0,
  });
  aviso.collapsed = false;

  const urgente = make("pergunta", {
    rotulo: "É uma urgência? (sim/não)",
    variavel: "urgente",
    obrigatorio: true,
  });

  const nome = make("pergunta", { rotulo: "Qual seu nome?", variavel: "nome", obrigatorio: true });
  const telefone = make("pergunta", {
    rotulo: "Qual o melhor telefone para retorno?",
    variavel: "telefone",
    obrigatorio: true,
  });
  const descricao = make("pergunta", {
    rotulo: "Descreva brevemente sua solicitação",
    variavel: "descricao",
    obrigatorio: true,
  });

  const tag = make("aplicar-tag", { tag: "fora do horário" });

  const notificarPlantao = make("notificar-atendente", {
    canal: "email",
    mensagem: "Mensagem recebida fora do horário — verificar urgência",
  });

  const escalar = make("escalar-gestor", { gestorId: "", canal: "whatsapp" });

  const fila = make("atribuir-fila", { filaId: "retorno-proximo-turno", dinamica: false });

  const confirmacao = make("enviar-mensagem", {
    texto: "Obrigado! Registramos seu contato e retornaremos assim que possível.",
    delaySeg: 0,
  });

  return [aviso, urgente, nome, telefone, descricao, tag, notificarPlantao, escalar, fila, confirmacao];
};
