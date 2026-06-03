
# Tela "Operação" — Painel do Analista Operacional

Hub diário do Analista Operacional (atendente vinculado a farmácias) para acompanhar líderes, entregadores e saúde operacional das farmácias sob sua responsabilidade. Inspirado em `lider/Dashboard.tsx`, `Lideres.tsx` e `Aethera.tsx`, reaproveitando `PageHeader`, `StatusDot`, `OperationContextBar`, badges e cards do design system Aethera.

## Rota e navegação

- Rota nova: `/operacao` em `src/App.tsx` dentro de `<AppShell>`.
- Item no `Sidebar.tsx` (logo após "Líderes"): label **Operação**, ícone `Radar` ou `Activity`, badge dinâmico com nº de alertas abertos.
- Acessível ao papel "Operador"/"Analista Operacional" (gate visual; backend valida depois).

## Layout (3 zonas, single page com scroll)

```text
┌──────────────────────────────────────────────────────────────┐
│ PageHeader · Operação                       [Período ▾] [⟳] │
│ OperationContextBar · Acme Saúde › 4 farmácias · turno tarde │
├──────────────────────────────────────────────────────────────┤
│ Faixa de KPIs (6 cards compactos)                            │
├──────────────────────────────────────────────────────────────┤
│ [ Coluna A: Farmácias sob responsabilidade ]  [ Coluna B ]  │
│  - cards de farmácia c/ líder, fila, SLA       Alertas/Hoje │
│                                                Ações rápidas │
├──────────────────────────────────────────────────────────────┤
│ Linha 2: Líderes (tabela compacta)  |  Entregadores (mapa de │
│ status + lista filtrável)                                    │
├──────────────────────────────────────────────────────────────┤
│ Linha 3: Gráficos — Volume por hora · SLA por farmácia ·     │
│ Faltas/Diárias da semana (recharts)                          │
└──────────────────────────────────────────────────────────────┘
```

## Conteúdo por bloco

### 1. Filtros de topo
- Seletor de período: Hoje / 7d / 30d / Custom.
- Seletor multi de farmácias (default: todas as do analista).
- Botão "Atualizar" + timestamp da última sincronização.

### 2. Faixa de KPIs (6 cards)
Cada card: valor grande mono + label + delta vs período anterior + sparkline mini.
- Farmácias ativas (X/Y)
- Líderes online (com pulse verde)
- Entregadores em rota / disponíveis / offline
- SLA médio operacional (%)
- Pedidos em atraso (alerta se > limiar)
- Faltas no turno

### 3. Coluna A — Farmácias sob responsabilidade
Lista de cards (reaproveitar visual de `Lideres.tsx`):
- Nome da farmácia + cidade
- Líder responsável (avatar + StatusDot)
- Entregadores ativos / total
- Fila atual (chats abertos, pedidos pendentes)
- SLA da farmácia (badge success/warning/danger)
- CTA: "Abrir painel do líder" → `/lideres/:id`

### 4. Coluna B — Alertas e ações rápidas
- Stack de alertas: SLA estourado, líder offline > 15min, entregador sem check-in, fila > N.
- Cada alerta: ícone, descrição, farmácia, timestamp, botão "Resolver" / "Abrir chat".
- Bloco "Ações rápidas": Abrir chat operacional, Criar diária, Registrar falta, Pré-cadastro entregador (links para rotas `/lider/*` existentes adaptadas).

### 5. Líderes (tabela compacta)
Colunas: Líder · Farmácia · Status · Equipe · SLA · CSAT · Última atividade · Ação.
Filtros: status, farmácia. Linha clicável → ficha do líder.

### 6. Entregadores (split view)
- Esquerda: contadores por status (Em rota, Disponível, Pausa, Offline) com chips filtráveis.
- Direita: lista virtualizada com avatar, nome, farmácia, status, último ping, pedidos hoje.
- Sem mapa real nesta versão (placeholder card "Mapa em breve").

### 7. Gráficos (recharts)
- Volume de pedidos por hora (linha).
- SLA por farmácia (barras horizontais).
- Faltas vs Diárias na semana (barras agrupadas).

## Dados (mock primeiro)

Criar `src/data/operacaoMock.ts` derivando de mocks existentes (`Lideres.tsx`, lider/* pages) com tipos:
- `FarmaciaOperacional`, `LiderResumo`, `EntregadorStatus`, `AlertaOperacional`, `KpiOperacional`.

Criar `src/lib/operacaoApi.ts` (async wrapper) pronto para troca por backend depois — mesmo padrão usado em `comercialApi.ts`.

## Estados de UI obrigatórios
- Loading: skeletons em KPIs, listas e gráficos.
- Empty: "Nenhuma farmácia vinculada ao seu usuário" com CTA contato admin.
- Erro: card de erro reusável com retry.
- Sem permissão: bloco 403 placeholder.

## Design system
Tokens Aethera: `bg-surface`, `border-border`, `text-foreground`, `bg-primary/15 text-primary`, `bg-success/15 text-success`, `bg-warning/15 text-warning`, `bg-destructive/15 text-destructive`. Cards `rounded-xl border border-border bg-surface p-5`. Scrollbars 4px. Sem cores hardcoded.

## Arquivos a criar / editar
- criar `src/pages/Operacao.tsx`
- criar `src/components/operacao/KpiStrip.tsx`
- criar `src/components/operacao/FarmaciaCard.tsx`
- criar `src/components/operacao/AlertaList.tsx`
- criar `src/components/operacao/LideresTable.tsx`
- criar `src/components/operacao/EntregadoresPanel.tsx`
- criar `src/components/operacao/OperacaoCharts.tsx`
- criar `src/data/operacaoMock.ts`
- criar `src/lib/operacaoApi.ts`
- editar `src/App.tsx` (rota `/operacao`)
- editar `src/components/Sidebar.tsx` (item de menu)

## Fora de escopo (próximas iterações)
- Mapa real de entregadores (Mapbox).
- Edição inline de escala/diária.
- Notificações push de alertas.
- Permissionamento real backend.

## Pergunta antes de implementar
Quer que o painel use **mocks novos dedicados** (recomendado, isolado) ou tente **reaproveitar os mocks de `lider/*`** já existentes para refletir os mesmos dados?
