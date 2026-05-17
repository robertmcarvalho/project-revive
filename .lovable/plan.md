# Identificação do workspace no painel

Cenário escolhido: **cliente único** (1 empresa = 1 workspace), sem white-label, com **duas rotas distintas** para configurações do workspace × conta pessoal.

A solução é enxuta de propósito: como não há troca de workspace nem múltiplas marcas, não vamos construir switcher, dropdown de workspaces, nem cor customizada. O foco é deixar **claro em qual empresa o usuário está operando** e **separar o que é da empresa do que é pessoal**.

## 1. Topo da Sidebar — cartão da empresa (read-only)

Substitui o cabeçalho atual da `Sidebar` por um cartão compacto com identidade da empresa-cliente:

```text
┌──────────────────────────────┐
│ [A] Acme Saúde               │
│     Plano Pro                │
├──────────────────────────────┤
│ 📊 Dashboard                 │
│ 💬 Inbox                     │
│ ...                          │
```

- **Avatar quadrado** com inicial da empresa (fallback) ou logo enviado pelo admin nas configurações.
- **Nome da empresa** em destaque (sem chevron, sem dropdown — não há o que trocar).
- **Linha secundária** com plano atual (`Plano Pro`, `Trial · 7 dias`, `Plano Free`). Quando faltar pouco para o limite, vira link `Plano Pro · 14/15 agentes →` apontando para billing.
- Marca Aethera continua presente como rodapé discreto (`Powered by Aethera`) na sidebar, garantindo identidade do produto sem competir com a empresa-cliente.

## 2. Rodapé da Sidebar — usuário (com menu)

Mantém o usuário separado da empresa, deixando claro "quem está logado":

```text
├──────────────────────────────┤
│ [JS] João Silva       ▾      │
│      Admin                   │
└──────────────────────────────┘
```

Clicar abre menu com:
- Minha conta
- Notificações
- Trocar de tema
- Sair

## 3. Faixa de contexto operacional (telas sensíveis)

Em telas onde existe risco de configurar a operação errada (Configurações de webhook, Automações, edição de SLA, Mensagens), adicionar uma faixa fina logo abaixo do `PageHeader`:

```text
🟢 Operando em: Acme Saúde › Webhook B2B Farmácias
```

Não aparece em telas neutras (Dashboard, Inbox geral, Relatórios) para não poluir. Renderizada por uma helper `OperationContextBar` que recebe `workspaceName` + `breadcrumb` opcional.

## 4. Separação de rotas — workspace × conta

Duas áreas distintas no app:

### `/configuracoes` — Configurações da empresa (workspace)
Já existe. Conteúdo passa a ser tudo que é da operação:
- Dados da empresa (nome exibido, logo, fuso horário, idioma)
- Webhooks (Meta, setores, filas, SLAs, demandas, mensagens — já implementado)
- Equipe (atendentes, líderes, papéis)
- Plano e billing
- Tags da operação
- Integrações futuras

### `/conta` — Minha conta (pessoal, nova rota)
Conteúdo pessoal do usuário logado, isolado da empresa:
- Perfil (nome, avatar, e-mail, senha)
- Preferências (idioma da interface, tema, fuso pessoal)
- Notificações (canais, frequência, mute por horário)
- Sessões ativas / dispositivos
- Sair de todos os dispositivos

Acesso: menu do avatar no rodapé da sidebar → "Minha conta".

## 5. Dados da empresa — onde virá

Mock no MVP via constante em `src/lib/workspace.ts`:

```ts
export const currentWorkspace = {
  id: "ws_acme",
  nome: "Acme Saúde",
  inicial: "A",
  plano: "Pro",
  agentesUsados: 12,
  agentesLimite: 15,
};
```

Hook `useWorkspace()` para consumir nas telas. Quando Cloud entrar, vira fetch de uma tabela `workspaces`.

---

## Resumo técnico

**Arquivos a criar**
- `src/lib/workspace.ts` — mock + hook `useWorkspace`
- `src/components/WorkspaceCard.tsx` — cartão do topo da sidebar
- `src/components/UserMenu.tsx` — rodapé da sidebar com dropdown
- `src/components/OperationContextBar.tsx` — faixa de contexto
- `src/pages/MinhaConta.tsx` — nova rota `/conta` com abas (Perfil, Preferências, Notificações, Sessões)

**Arquivos a editar**
- `src/components/Sidebar.tsx` — adicionar `WorkspaceCard` no topo e `UserMenu` no rodapé
- `src/App.tsx` — registrar rota `/conta`
- `src/pages/configuracoes/WebhookEditor.tsx` e `src/pages/AutomacaoNova.tsx` — usar `OperationContextBar` no topo
- `src/pages/Configuracoes.tsx` — adicionar aba "Dados da empresa" como primeira aba

**Tokens / design system**
- Tudo via semantic tokens já existentes (`bg-surface`, `border-border`, `text-muted-foreground`).
- Inicial da empresa em `bg-primary/10 text-primary` para o quadradinho do avatar.
- Faixa de contexto: `bg-primary/5 border-primary/20 text-primary` com bolinha animada (`bg-emerald-500`).

**Não escopado agora** (decisões futuras)
- Switcher multi-workspace (não há cenário)
- Logo/cor por workspace (sem white-label)
- Convite de membros externos ao workspace (vai junto com "Equipe")
- Auth real (segue mock do Login)
