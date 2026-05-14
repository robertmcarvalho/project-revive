## Objetivo
Criar uma nova seção **Relatórios** com a primeira sub-página **Atendimento**, entregando um relatório completo de desempenho de atendentes e supervisores, com filtros, KPIs, comparação de períodos, drill-down e exportação.

---

## 1. Navegação e estrutura

- Adicionar item **"Relatórios"** no `Sidebar` (ícone `BarChart3`), posicionado entre Campanhas e Financeiro.
- Sub-rotas (preparadas para crescer):
  - `/relatorios` → redireciona para `/relatorios/atendimento`
  - `/relatorios/atendimento` → MVP desta entrega
  - placeholders desativados visíveis (Campanhas, Operação, Financeiro) com badge "em breve"

## 2. Permissões por perfil

Mesma tela, comportamento condicionado pelo perfil do usuário logado:

| Perfil | Escopo de dados | Filtro Atendente | Ranking equipe | Drill-down |
|---|---|---|---|---|
| Administrador | Todos | Livre | Sim | Sim |
| Gestor | Filas/setores que gerencia | Livre dentro do escopo | Sim | Sim |
| Supervisor | Sua fila/setor | Livre dentro da fila | Sim (da fila) | Sim |
| Atendente | Apenas a si mesmo | Travado (próprio usuário) | Não | Sim (próprios tickets) |

Mock no frontend lê o perfil atual de uma constante simulada (a integrar com auth real depois).

## 3. Filtros (barra superior fixa)

- **Período**: date range picker + atalhos (Hoje, 7d, 30d, Mês atual, Mês anterior, Customizado)
- **Comparar com**: período anterior equivalente (toggle on/off → habilita Δ%)
- **Atendente** (multi-select, com busca)
- **Supervisor/Gestor** (multi-select)
- **Fila** (multi-select)
- **Setor** (multi-select, dependente da fila)
- **Canal** (WhatsApp, Instagram, Email)
- **Status do ticket** (aberto, em andamento, resolvido, reaberto)
- **Tag/motivo de encerramento** (multi-select)
- **Granularidade** dos gráficos (dia/semana/mês)
- Botões: **Limpar filtros**, **Salvar visão**, **Exportar ▾** (CSV / PDF)

## 4. Layout do relatório

```text
┌─ Header: título + filtros + Exportar ─────────────────────┐
├─ Linha 1: Cards de KPI (8 cards, grid responsivo) ────────┤
│  [Tickets] [TMR] [TMA] [TME] [SLA%] [CSAT] [FCR] [Reab.]  │
│  cada card: valor + Δ% vs período anterior + cor da meta  │
├─ Linha 2: Gráficos ───────────────────────────────────────┤
│  • Volume ao longo do tempo (linha, por canal)            │
│  • Heatmap dia × hora                                     │
│  • Distribuição por canal (donut) + por fila (barras)     │
├─ Linha 3: Ranking de atendentes (tabela) ─────────────────┤
│  Atendente | Tickets | TMR | TMA | SLA% | CSAT | Δ% | ⋯   │
│  ordenável, paginada, linha clicável → drill-down         │
├─ Linha 4: Motivos de encerramento (top tags + barras) ────┤
└───────────────────────────────────────────────────────────┘
```

## 5. KPIs implementados (MVP)

**Volume & Produtividade** — Tickets atendidos, abertos, encerrados, reabertos, mensagens enviadas/recebidas, tickets simultâneos médio, ocupação %.

**Tempo & SLA** — TMR (1ª resposta), TMA (duração total), TME (espera na fila), TMT (entre mensagens), % SLA cumprido.

**Qualidade** — CSAT, NPS, FCR (resolução no 1º contato), taxa de reabertura, taxa de transferência.

**Distribuição & Comparativo** — Volume por canal/fila/setor/horário, ranking de atendentes, Δ% vs período anterior em todos os KPIs.

## 6. Metas/SLA configuráveis

- Botão **"Configurar metas"** no header abre Sheet lateral.
- Para cada KPI: definir meta (ex: TMR ≤ 2min, SLA ≥ 95%, CSAT ≥ 4.5).
- Cards e células da tabela ganham cor: verde (meta atingida), amarelo (atenção, ±10%), vermelho (abaixo).
- Persistência em `localStorage` no MVP.

## 7. Drill-down ticket a ticket

- Clicar em linha do ranking abre Sheet/Drawer lateral com:
  - Resumo do atendente (avatar, fila/setor, métricas resumidas)
  - Tabela de tickets do período: ID, contato, canal, abertura, fechamento, TMR, TMA, status, CSAT
  - Linha do ticket clicável (placeholder para futura integração com Inbox)

## 8. Exportação

- **CSV**: gera arquivo com KPIs agregados + tabela de ranking, baseado nos filtros ativos. Implementação client-side (Blob + download).
- **PDF**: snapshot da página (cards + gráficos + ranking) usando `html2canvas` + `jsPDF` (já comum em projetos Vite). Caso prefira, podemos adiar PDF para uma segunda iteração.

## 9. Dados (mock)

Como ainda não há backend conectado, criar `src/data/relatoriosMock.ts` gerando dados sintéticos determinísticos por seed, baseados nos atendentes/filas existentes em `Usuarios.tsx` e `Configuracoes.tsx`. Isso garante que filtros, gráficos e drill-down funcionem de forma realista. Quando o backend for plugado, basta substituir o mock por uma camada de fetch.

## 10. Detalhes técnicos

- **Arquivos novos**:
  - `src/pages/relatorios/Atendimento.tsx` (página principal)
  - `src/pages/relatorios/components/FiltrosBar.tsx`
  - `src/pages/relatorios/components/KpiCard.tsx`
  - `src/pages/relatorios/components/RankingTable.tsx`
  - `src/pages/relatorios/components/DrillDownSheet.tsx`
  - `src/pages/relatorios/components/MetasSheet.tsx`
  - `src/data/relatoriosMock.ts`
  - `src/lib/relatorios.ts` (cálculos agregados, Δ%, exportCSV)
- **Arquivos editados**:
  - `src/App.tsx` (rotas)
  - `src/components/Sidebar.tsx` (novo item)
- **Bibliotecas**: usar `recharts` (já no projeto via shadcn/ui chart) para gráficos; `date-fns` para períodos; `lucide-react` para ícones. Sem novas dependências para o MVP (PDF via print/`window.print()` estilizado, opcionalmente `jspdf` se desejar arquivo).
- **Design system**: usar tokens semânticos do `index.css` (sem cores hardcoded). Cards de meta usam `bg-success/10`, `bg-warning/10`, `bg-destructive/10` (criar tokens se ainda não existirem).

## 11. Fora do escopo (próximas iterações)

- Agendamento de envio por email do relatório
- Relatórios de Campanhas/Operação/Financeiro
- Persistência de metas/visões salvas no backend
- Integração real com dados de tickets/CSAT
