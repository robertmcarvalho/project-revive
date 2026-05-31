## Módulo CRM Comercial — Plano de implementação

Vou implementar o módulo CRM Comercial seguindo a especificação, adaptado ao stack atual (React + Vite + React Router, sem Next.js — então rotas em `src/pages/comercial/*`, não `apps/web/app/`). Backend ainda não existe → todos os dados começam **mockados** em `src/data/comercialMock.ts`, com `commercialApi.ts` pronto para trocar por fetch real depois.

### Escopo desta entrega (P1)

Telas, navegação e fluxo completos com mocks. Sem backend, sem DnD library nova (uso HTML5 drag nativo), sem geração de PDF.

### 1. Navegação e guard

- Adicionar grupo **Comercial** na `Sidebar.tsx` (ícone `Briefcase`) com itens: Dashboard, Pipeline, Leads, Configurações.
- Feature flag local `commercial_crm_enabled` em `src/lib/workspace.ts` (default `true` para desenvolvimento). Se off → grupo oculto.
- Rotas registradas em `App.tsx` sob `/comercial/*` dentro de `<AppShell>`.

### 2. Estrutura de arquivos

```text
src/pages/comercial/
├── Dashboard.tsx        # /comercial
├── Pipeline.tsx         # /comercial/pipeline
├── Leads.tsx            # /comercial/leads (master-detail)
├── LeadNovo.tsx         # /comercial/leads/novo
├── LeadFicha.tsx        # /comercial/leads/:id
└── Configuracoes.tsx    # /comercial/configuracoes

src/components/comercial/
├── PipelineBoard.tsx
├── LeadCard.tsx
├── LeadForm.tsx
├── LeadTimeline.tsx
├── LeadChatPanel.tsx
├── ConvertWizard.tsx
└── LossModal.tsx

src/data/comercialMock.ts     # estágios, leads, motivos perda, campos custom
src/lib/comercialApi.ts       # wrapper async sobre o mock (fácil trocar)
```

### 3. Telas

**Dashboard** — KPIs (leads novos, qualificação, propostas, ganhos, perdidos, taxa conversão) + funil (recharts) + série temporal. Filtros período/owner/origem.

**Pipeline Kanban** — colunas vindas de `pipelineStages`, scroll horizontal, drag-and-drop HTML5 nativo entre estágios, card com nome, cidade, owner, dias no estágio, badge origem. Filtros: busca, owner, origem. Clique → navega para ficha.

**Lista de leads** — padrão master-detail (igual `Farmacias`), busca + filtros estágio/owner/origem, painel direito com resumo + atalhos (WhatsApp, mover estágio, ganho/perdido).

**Novo lead** — form com seções: Identificação, Contato, Operação (estimativas), Comercial, Campos custom dinâmicos. Sem campos operacionais (líder, taxa delivery etc). Submit → ficha.

**Ficha do lead** — `PageHeader` com badges (estágio/origem/owner) e actions (Abrir WhatsApp, Gerar proposta, Marcar ganho, Marcar perdido, Editar). Tabs: Resumo, Conversa (painel embutido), Atividades (timeline), Proposta (placeholder P2), Viabilidade (cards read-only mock), Arquivos (placeholder P3).

- **Ganho** → `ConvertWizard` 2 passos, no fim mostra toast "farmácia X criada" + link mock para `/farmacias/:id`.
- **Perdido** → `LossModal` com select de motivo + notas.

**Configurações comerciais** — layout estilo `Configuracoes.tsx` (menu lateral + cards `bg-surface`):
- Pipeline: CRUD estágios (nome, cor, probabilidade, flags), reordenar.
- Campos customizados: tabela CRUD (slug, label, tipo, obrigatório, ordem).
- Motivos de perda: lista editável.
- Catálogo de preços: placeholder P2.
- Integrações: cards read-only (Instagram, Flux).

### 4. Design system

Tudo em tokens semânticos Aethera: `bg-surface`, `border-border`, `text-foreground`, `text-muted-foreground`, `bg-primary` com glow, badges com `bg-success/15 text-success` etc. Border radius máx `rounded-xl`. Sem cores hardcoded. Densidade compacta. Scrollbar 4px nos containers com overflow.

### 5. Estados obrigatórios

Skeleton em lista/kanban/ficha; empty states com CTA; erro API com mensagem amigável; 403 (placeholder, não plugado em auth real ainda); flag off → grupo oculto + redirect de `/comercial` para `/`.

### 6. Fora deste plano (P2/P3)

- Geração real de PDF de proposta
- Editor de fluxo SDR (já existe `/flows`, só documentado)
- Upload de arquivos
- Integração real com backend (todos os endpoints estão mockados via `comercialApi.ts`)
- Inbox comercial separada — uso painel embutido na ficha

Após aprovação eu implemento tudo de uma vez.