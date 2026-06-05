# Plano — Operação multi-perfil, fluxo de notificações e ícones premium

Trabalho 100% no frontend (mocks + UI). Backend será integrado depois.

## 1. Modelo de dados (src/data/operacaoMock.ts)

Estender com:

- `PerfilOperacao = "analista_operacional" | "atendente_geral" | "atendente_financeiro" | "gestor_financeiro" | "lider"`
- `TarefaTipo` expandido: `finalizar_cadastro`, `gerar_matricula`, `gerar_termo_desligamento`, `acerto_desligamento`, `lancamento_cotas`, `autorizar_adiantamento`
- `TarefaAtendimento` ganha: `setor` ("atendimento_geral"|"financeiro"), `comentarios: Comentario[]`, `anotacoes: string`, `escaladaPara?`, `concluidaEm?`, `prioridade`
- `Comentario`: `{ id, autor, iniciais, texto, mencoes: string[], timestamp }`
- `EventoCiclo`: `{ id, tipo: "entrada"|"desligamento", entregador, farmacia, lider, atendente, data, status }`
- `NotificacaoOperacional` (já existe pendência; expandir): vincula `tarefaId` para deep-link da Inbox
- `RegraOperacional`: `{ id, titulo, descricao, prazo, categoria }`
- `OrganogramaItem`: árvore simples (Gestor → Líder → Entregadores)

Seeds para cada perfil: tarefas, eventos do ciclo, regras, organograma.

## 2. API mock (src/lib/operacaoApi.ts)

Adicionar:
- `listTarefasPorPerfil(perfil)` (filtra por setor/tipo)
- `listEventosCiclo({from,to})`
- `listRegrasOperacionais()`
- `getOrganograma()`
- `updateTarefa(id, patch)` (checklist, anotações, comentários, status)
- `transferirTarefa(id, atendenteId)`
- `escalarTarefa(id)`
- `finalizarTarefa(id)`

## 3. Tela Operação (src/pages/Operacao.tsx) — multi-perfil

Switcher de perfil no topo (mock — em produção virá do contexto do usuário). Cada perfil renderiza um layout diferente:

### 3.1 Analista Operacional (atual, ajustado)
- Remover KPIs "Entregas", "Login", "Roteiro" (e similares de roteirização)
- Manter: diárias, faltas, entregadores em rota, SLA, pedidos atraso, tarefas
- Manter compliance + notificações + tarefas + gráficos
- Adicionar lista de **Entradas/Desligamentos do ciclo** com filtro de período

### 3.2 Atendente Geral
- KPIs do setor (tarefas abertas, atrasadas, SLA médio do setor, finalizadas hoje)
- Grid de **TaskCards** (checklist, barra de progresso, SLA, prazo, prioridade)
- Tipos: finalizar_cadastro, gerar_matricula, gerar_termo_desligamento
- Filtros: Em execução / Finalizadas (finalizadas só com filtro ativo)
- Painel lateral: alertas + pendências + notificações
- Click no card → `TaskExecutionDialog`

### 3.3 Atendente Financeiro
- KPIs financeiros (acertos pendentes, cotas a lançar, adiantamentos)
- Grid de TaskCards: acerto_desligamento, lancamento_cotas
- Lista de **Entradas/Desligamentos do ciclo** (nome, data, farmácia, líder, atendente)
- Filtros Em execução/Finalizadas + filtro de período

### 3.4 Gestor Financeiro
- Indicadores amplos do setor (tarefas por status, SLA, volume financeiro)
- Alertas + pendências consolidados
- Suas próprias tarefas (autorizar_adiantamento + escaladas)
- Tabela de desempenho dos atendentes financeiros

## 4. Componentes novos (src/components/operacao/)

- `IconTile.tsx` (extrair do Operacao.tsx) — usado em todo o app
- `TaskCard.tsx` — checklist visível, barra SLA, badge de prazo, ações
- `TaskExecutionDialog.tsx` — modal completo:
  - Checklist editável
  - Anotações (textarea)
  - Comentários com `@menções` (input simples, parse de @nome)
  - Botões: Transferir, Escalar para gestor, Finalizar
- `CycleEventsTable.tsx` — entradas/desligamentos
- `TaskFilters.tsx` — toggle Em execução/Finalizadas + busca
- `ProfileSwitcher.tsx` — alternar perfil (mock)
- `Spark.tsx` — extrair sparkline

## 5. Painel do Líder

Nova rota/seção em `src/pages/lider/Dashboard.tsx` (ajustar) **+ nova página `src/pages/lider/Obrigacoes.tsx`** (Obrigações & Regras):

- **Status de tarefas dos entregadores vinculados**: lista das tarefas em aberto (matrícula, termo, cadastro, acerto) com status/SLA — só leitura
- **Notificações do líder**: assinaturas pendentes, SLAs estourando, novas entradas/desligamentos
- **Obrigações operacionais** (página dedicada):
  - Cards com regras: lançar faltas/diárias no dia, não operar sem cadastro+matrícula, atualizar escalas semanalmente, prazo 7 dias úteis para acerto pós-assinatura
  - Fluxo operacional (diagrama em ASCII/blocos visuais)
  - Organograma (Gestor → Líder → Entregadores)
- Sidebar do líder ganha link "Obrigações"

## 6. Notificações Inbox → Operação (deep-link)

- Em `src/data/operacaoMock.ts` criar notificações com `tarefaId`
- Na Inbox (se existir lista de notificações operacionais), clicar leva a `/operacao?tarefa={id}&perfil={p}`
- `Operacao.tsx` lê query params e abre `TaskExecutionDialog` automaticamente

(Como a Inbox real é de chats, vou criar um **NotificacoesPanel** dentro da Operação como ponto de entrada — manter escopo)

## 7. Ícones premium em todo projeto

- Mover `IconTile` para `src/components/IconTile.tsx`
- Aplicar em headers das páginas principais: Dashboard, Inbox, Contatos, Farmácias, Entregadores, Lideres, Operação, Comercial/*, Financeiro, Automações, Campanhas, Configurações, Copiloto, Relatórios
- Padrão: chip arredondado `bg-{cor}/12`, `text-{cor}`, stroke 1.75
- Substituir ícones soltos nos cards de KPI/seção pelo `IconTile`

## 8. Out of scope

- Backend real / persistência
- Inbox conversacional alterada (notificações vivem na Operação)
- Mentions com autocomplete real (parse simples @nome)
- Permissionamento real (switcher de perfil é mock visível)

## 9. Arquivos

**Criar:** `src/components/IconTile.tsx`, `src/components/operacao/TaskCard.tsx`, `src/components/operacao/TaskExecutionDialog.tsx`, `src/components/operacao/CycleEventsTable.tsx`, `src/components/operacao/TaskFilters.tsx`, `src/components/operacao/ProfileSwitcher.tsx`, `src/components/operacao/Spark.tsx`, `src/components/operacao/NotificacoesPanel.tsx`, `src/pages/lider/Obrigacoes.tsx`

**Editar:** `src/data/operacaoMock.ts`, `src/lib/operacaoApi.ts`, `src/pages/Operacao.tsx`, `src/pages/lider/Dashboard.tsx`, `src/components/LiderShell.tsx` (link Obrigações), `src/App.tsx` (rota), `src/components/PageHeader.tsx` (suporte a IconTile opcional), e ~10 páginas para aplicar IconTile nos headers/KPIs.

## 10. Diagrama de fluxo (resumo)

```text
Líder cria/aprova entregador
        |
Atendente Geral: finalizar_cadastro -> gerar_matricula
        | (assinatura matrícula)
        v
Atendente Financeiro: lancamento_cotas
        |
... operação ...
        |
Líder solicita desligamento
        v
Atendente Geral: gerar_termo_desligamento
        | (assinatura termo)
        v
Atendente Financeiro: acerto_desligamento (prazo 7 dias úteis)
        |
Notificações: Líder acompanha, Gestor Financeiro supervisiona
```
