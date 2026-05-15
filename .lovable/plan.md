# Plano — Wizard linear com configuração progressiva

Mantemos o wizard atual de `/automacoes/nova` (Modelo → Gatilho → Ações → Detalhes), **sem canvas visual**. A diferença é que cada item escolhido **expande inline** as próprias opções de configuração (acordeão/cards aninhados). Assim, ao marcar "Identificar contato" o bloco abre os ramos por perfil; ao marcar "Selecionar setor" abre a lista de setores; e por aí adiante — tudo no mesmo passo, scrollando para baixo.

## 1. Estrutura do wizard (mesmos 4 passos)

- **Passo 1 · Modelo** — adiciona um novo template **"Triagem por perfil"** já marcado com os blocos do fluxo descrito (pode editar/remover qualquer bloco depois).
- **Passo 2 · Gatilho** — igual ao atual (canal de entrada, filtros).
- **Passo 3 · Fluxo de atendimento** (substitui o "Ações" atual) — lista vertical de **blocos**, cada um expansível com sua configuração. É aqui que mora a maior parte da mudança.
- **Passo 4 · Detalhes** — nome, descrição, canais, prioridade, ativar (igual ao atual).

## 2. Passo 3 — Blocos disponíveis (paleta inline)

Botões "+ Adicionar bloco" agrupados por categoria; cada bloco entra como card expandido na sequência:

- **Identidade**
  - Identificar contato na base → ao expandir, mostra **3 ramos automáticos** (Encontrado-Entregador, Encontrado-Farmácia, Encontrado-Líder, Não encontrado). Cada ramo é um sub-acordeão com seus próprios sub-blocos.
- **Menu / Coleta**
  - Selecionar Setor (multiselect dos setores cadastrados; sub-blocos por setor escolhido se quiser ramificar)
  - Selecionar Demanda (depende do perfil — lista pré-preenchida com as demandas que você listou para entregador/farmácia/líder; editável)
  - Pergunta ao cliente (nome, cidade, razão social, email…) — campo + variável de saída
  - Menu de farmácias por cidade (usa a variável `cidade` coletada antes)
- **Bot / Mensagem**
  - Enviar mensagem (texto/template + delay)
  - Script do bot (sequência de mensagens)
  - IA · classificar/responder
- **Atendimento**
  - Criar pré-cadastro (Entregador / Farmácia, mapa de variáveis → ficha)
  - Aplicar tag (`cadastro pendente`, etc.)
  - Notificar atendente (canal + tag)
  - Atribuir à fila (estática ou dinâmica `{{setor.fila}}`)
- **SLA / Escalação**
  - SLA da etapa (tempo + ação ao estourar)
  - SLA da fila
  - Escalar para gestor (lookup de gestores cadastrados, canal de aviso)
- **Pesquisa**
  - CSAT / NPS pós-atendimento

Ações por bloco: arrastar para reordenar, duplicar, excluir, expandir/recolher.

## 3. Como funciona a "expansão progressiva"

Cada bloco tem um **formulário inline** que aparece ao adicionar/expandir. Exemplo do bloco "Identificar contato":

```text
▼ Identificar contato                                    [⋮] [×]
   Origem: telefone do contato            (select)
   ─ Se Encontrado · Entregador ───────────────────────  [+]
       (vazio — adicione blocos para este ramo)
   ─ Se Encontrado · Farmácia ─────────────────────────  [+]
       (vazio)
   ─ Se Encontrado · Líder ────────────────────────────  [+]
       (vazio)
   ─ Se Não encontrado ────────────────────────────────  [+]
       (vazio)
```

Clicar `[+]` em um ramo abre o seletor da paleta filtrado por categoria, e o bloco escolhido aparece **dentro** daquele ramo. Mesma lógica vale para o bloco "Selecionar Setor" (cria sub-ramos por setor) e para "Pergunta ao cliente" quando a resposta é usada como condição.

Resultado: o usuário consegue montar o fluxo inteiro descrito (busca → perfil → setor → demanda → fila / pré-cadastro) **scrollando** o passo 3, sem canvas e sem sair do wizard.

## 4. Template "Triagem por perfil" (passo 1)

Selecionando esse template, o passo 3 já vem populado com os blocos aninhados representando o fluxo:

```text
▼ Identificar contato
   Encontrado · Entregador
      ▸ Selecionar Setor
         (por setor) ▸ Selecionar Demanda (entregador) ▸ Atribuir à fila
   Encontrado · Farmácia
      ▸ Selecionar Setor
         (por setor) ▸ Selecionar Demanda (farmácia) ▸ Atribuir à fila
   Encontrado · Líder
      ▸ Selecionar Setor ▸ Atribuir à fila
   Não encontrado
      ▸ Enviar mensagem ("Olá, não encontrei seu cadastro…")
      ▸ Menu (Entregador / Farmácia / Líder)
         Entregador / Líder
            ▸ Pergunta: nome ▸ Pergunta: cidade
            ▸ Menu farmácias da cidade
            ▸ Criar pré-cadastro Entregador
            ▸ Aplicar tag "cadastro pendente" ▸ Notificar atendente
            ▸ Selecionar Setor ▸ Selecionar Demanda ▸ Atribuir à fila
         Farmácia
            ▸ Pergunta: razão social
            ▸ Menu perfil (Gestor / Expedição / Financeiro)
            ▸ Pergunta: nome ▸ Pergunta: email
            ▸ Criar pré-cadastro Farmácia
            ▸ Aplicar tag "cadastro pendente" ▸ Notificar atendente
            ▸ Selecionar Setor ▸ Selecionar Demanda ▸ Atribuir à fila
```

Tudo editável: pode remover blocos, mudar mensagens, ajustar SLA, trocar fila etc.

## 5. SLA e Escalação

Dois jeitos, ambos suportados:

- **SLA por etapa**: bloco específico inserido no fluxo logo após a etapa que deve ser medida (ex.: depois de "Atribuir à fila"). Configura tempo + ação se estourar (escalar / mensagem / mover de fila).
- **SLA da fila** e **Escalar para gestor**: blocos próprios, geralmente colocados perto do "Atribuir à fila".

## 6. Origem dos dados (mock)

`src/data/atendimentoCatalog.ts` com:
- `setores[]`, `filas[]`
- `demandasPorPerfil = { entregador: [...], farmacia: [...], lider: [...] }` (já com a lista exata que você passou)
- `perfisFarmacia = ["Gestor", "Expedição", "Financeiro"]`
- `farmaciasPorCidade` (mock)
- `gestores[]` (lookup para escalação) — lê dos mocks já existentes em Configurações/Usuários

Os selects dentro dos blocos consomem esse arquivo. Quando houver backend, troca a fonte sem mudar a UI.

## 7. Persistência e teste

- Estado do fluxo (`blocos[]` com aninhamento por ramo) em memória + `localStorage` por id.
- Botão "Testar" do header continua funcionando: a simulação percorre os blocos em ordem (já existe esqueleto em `AutomacaoNova`), mostrando logs por bloco e por ramo escolhido.

## 8. Arquivos

Criar
- `src/pages/automacao/blocos/` — um arquivo por tipo de bloco (formulário inline):
  `IdentificarContato.tsx`, `SelecionarSetor.tsx`, `SelecionarDemanda.tsx`, `Pergunta.tsx`, `MenuFarmacias.tsx`, `EnviarMensagem.tsx`, `ScriptBot.tsx`, `IAResposta.tsx`, `CriarPreCadastro.tsx`, `AplicarTag.tsx`, `NotificarAtendente.tsx`, `AtribuirFila.tsx`, `SlaEtapa.tsx`, `SlaFila.tsx`, `EscalarGestor.tsx`, `Csat.tsx`.
- `src/pages/automacao/PaletaBlocos.tsx` — botão "+ Adicionar bloco" com seletor agrupado.
- `src/pages/automacao/templates.ts` — template "Triagem por perfil" pronto.
- `src/data/atendimentoCatalog.ts` — setores, filas, demandas, farmácias mock.
- `src/lib/fluxo.ts` — tipos `Bloco`, `BlocoConfig`, helper de aninhamento por ramo, util de simulação.

Editar
- `src/pages/AutomacaoNova.tsx` — substitui o passo "Ações" pelo novo passo "Fluxo de atendimento" usando os blocos. Demais passos (Modelo, Gatilho, Detalhes) continuam como estão; só adiciona o novo template no passo 1.

## 9. Fora do escopo

- Backend real e integração com canais.
- Editor visual em canvas (descartado por sua decisão).
- CRUD de Setores/Filas/Demandas pelo wizard — esses cadastros continuam em **Configurações** (o wizard apenas seleciona).
- Editor rico de templates de mensagem (textarea + variáveis simples).

Confirma essa abordagem? Se sim, implemento já com o template "Triagem por perfil" carregado e os principais blocos funcionando.
