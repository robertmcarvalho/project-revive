# Monitoramento de Atendentes — nova aba no Dashboard

Adicionar uma aba **"Equipe"** dentro do Dashboard com visão de presença em tempo real, histórico de sessões e produtividade por sessão. Acesso restrito a admin/gestor.

## Estrutura da página

```
Dashboard
├── Visão geral   (atual)
└── Equipe        (nova) ── visível só para admin/gestor
    ├── [KPIs] Online · Ausentes · Ocupados · Offline · Tempo médio logado
    ├── [Tabela] Status atual dos atendentes
    ├── [Tabela] Histórico de login/logout
    └── [Painel] Resumo de produtividade por sessão
```

## Conteúdo de cada bloco

**1. KPIs de presença** — 5 cards no padrão `IconTile` já usado no Dashboard (Users/UserCheck/UserMinus/UserX/Clock), com contagem e variação vs. ontem.

**2. Status atual dos atendentes**
Colunas: Avatar+nome · Papel · Status (StatusDot + label) · Tempo no status atual · Chats ativos · Último heartbeat · Ação (ver perfil / forçar logout).
Filtros: status, papel, busca por nome. Ordenação por tempo logado / chats.

**3. Histórico de login/logout**
Colunas: Atendente · Evento (login / logout / timeout / forçado) · Data‑hora · Duração da sessão · Dispositivo (ícone Monitor/Smartphone) · Navegador · IP · Localização aproximada.
Filtros: período (hoje / 7d / 30d / custom), atendente, tipo de evento. Botão **Exportar CSV**.

**4. Produtividade por sessão**
Por sessão encerrada: tempo total logado, tempo em pausa, tempo em atendimento, conversas atendidas, CSAT médio, primeira resposta média. Visual: tabela compacta + mini sparkline de atendimentos/hora reaproveitando `Spark`/`Sparkline`.

## Controle de acesso

- Tab "Equipe" só aparece se `useCurrentUser().papel` for admin/gestor.
- Rota direta (`/dashboard?tab=equipe`) também checa e faz fallback para "Visão geral" se não autorizado.

## Detalhes técnicos

- **UI**: nova página/seção em `src/pages/Dashboard.tsx` envolvida em `<Tabs>` (`tabs.tsx` já existe). Componentes novos em `src/components/dashboard/`:
  - `PresencaKpis.tsx`
  - `AtendentesStatusTable.tsx`
  - `LoginHistoryTable.tsx`
  - `SessionProductivityTable.tsx`
- **Dados (mock nesta fase)**: novo `src/data/equipeMock.ts` com `atendentes`, `sessoes`, `eventosLogin` — segue o padrão de `operacaoMock.ts` / `relatoriosMock.ts`. API helpers em `src/lib/equipeApi.ts` (filtros, agregações, export CSV) para que a troca por backend real seja só substituir o módulo.
- **Sem alterações de backend** nesta etapa. Quando o usuário quiser dados reais, plugamos via Lovable Cloud (tabela `auth_events` + presence via realtime) num passo seguinte.
- **Reuso**: `PageHeader`, `IconTile`, `StatusDot`, `ChannelBadge`, `Tabs`, `Table`, `Select`, `Input`, `Button` — sem novas dependências.
- **Tokens**: usar `bg-surface`, `border-border`, `text-muted-foreground`, `success/warning/destructive` — nada hardcoded.

## Fora de escopo

- Auditoria de segurança (tentativas falhas, novos dispositivos suspeitos) — fica para um passo futuro.
- Integração real de presence/heartbeat — entra junto com a ativação do backend.
