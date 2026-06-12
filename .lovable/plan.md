## Visão geral

Financeiro completo com submenu, cobrindo: Acerto semanal (Cooperativa), faturamento dividido Coop + Flux Farma, contas a pagar (entregadores + operacional Coop/Flux), contas a receber, despesas fixas/variáveis com **rateio multi-vínculo**, **baixas de pagamento/recebimento** com conciliação, centros de custo e DRE.

Frontend + camada `financeiroApi.ts` (mock async) para troca futura por backend real.

## Submenu do Financeiro

`/financeiro` vira layout com subnav + `<Outlet/>`:

- **Visão geral** — KPIs + alertas (a vencer hoje, em atraso, baixas pendentes).
- **Acertos** + `/acertos/:id`
- **Faturamento** — faturas Coop + Flux por farmácia/CC.
- **Contas a receber** — com fluxo de **baixa** (total/parcial).
- **Contas a pagar** com abas: **Entregadores**, **Operacional — Coop**, **Operacional — Flux** — todas com fluxo de **baixa**.
- **Despesas** — lançamento com **rateio** opcional.
- **Baixas / Conciliação** — extrato consolidado de baixas, importação OFX/CSV (mock) e match com lançamentos.
- **DRE**
- **Configurações** — Centros de custo · Regras de vínculo · **Split Coop × Flux por CC** · Categorias · Fornecedores · Contas bancárias/cartões.

## Modelo de dados (mock, `src/data/financeiroMock.ts`)

```text
# (modelos anteriores mantidos: Empresa, CentroCusto, Farmacia,
#  RegraVinculo, SplitFaturamento, Entrega, Adiantamento, Diaria,
#  Acerto, AcertoLinha, Fatura, Fornecedor, CategoriaDespesa,
#  ContaBancaria, Cartao)

# ── Rateio (NOVO) ──
RateioItem        { centroCustoId, farmaciaId?, percentual, valor }
                  # Σ percentual = 100, Σ valor = total do lançamento

ContaPagar        { ...campos anteriores...,
                    rateio?: RateioItem[],         # opcional
                    valorPago: number,             # soma das baixas
                    saldo: number }                # valor − valorPago

ContaReceber      { ...campos anteriores...,
                    valorRecebido, saldo,
                    rateio?: RateioItem[] }        # raro mas suportado

# ── Baixas (NOVO) ──
Baixa             { id, tipo:'pagamento'|'recebimento',
                    lancamentoId,                   # ContaPagar | ContaReceber
                    data, valor, forma:'pix'|'ted'|'boleto'|'dinheiro'|'cartao'|'compensacao',
                    contaBancariaId? | cartaoId?,
                    juros?, desconto?, taxa?,       # ajustes do dia da baixa
                    comprovanteUrl?, obs?,
                    usuarioId, criadoEm,
                    estornadaEm?, estornoMotivo? }

# Despesas de entregador rateadas viram 1 ContaPagar mãe + N AcertoAjuste
AcertoAjusteRateio { acertoId, entregadorId, contaPagarId,
                     valor,                         # parte rateada nesse vínculo
                     descricao, aplicarEm:'a_pagar'|'a_faturar'|'ambos' }
```

## Regras-chave (novas + revisadas)

**1. Rateio de despesas**
Ao lançar uma despesa (ex.: diária de R$ 100 do entregador X com vínculo em 3 farmácias):

- Operador escolhe modo: **% igual** (33,3 / 33,3 / 33,4), **% manual**, **valor manual**, ou **proporcional às entregas no ciclo** (calculado a partir das `Entrega` de cada vínculo).
- Sistema valida `Σ = 100%` / `Σ valor = total` (tolerância 1 centavo, ajuste no último item).
- Se a despesa é vinculada a entregador, cada item do rateio gera um `AcertoAjusteRateio` que entra no acerto da farmácia/CC correspondente:
  - `aplicarEm = 'a_pagar'` → desconta do `valorEntregador`.
  - `aplicarEm = 'a_faturar'` → soma no `valorFaturadoFarmacia` (repasse para a farmácia pagar).
  - `aplicarEm = 'ambos'` → soma na farmácia e não desconta do entregador (caso de auxílio bancado pela farmácia).
- Para despesas operacionais (ex.: software rateado entre Coop e Flux, ou entre CCs), o rateio só afeta a **DRE** — cada parcela do rateio aparece no CC correspondente.

**2. Baixas de pagamento/recebimento**
- Drawer **Baixar lançamento** com: data, valor (default = saldo), forma, conta bancária/cartão, juros/desconto/taxa, comprovante.
- Permite **baixa parcial** (gera várias `Baixa` até zerar `saldo`); status do lançamento: `aberta → parcial → paga/recebida → vencida`.
- Permite **baixa em lote** (selecionar várias contas → uma baixa por linha, mesma conta bancária/data).
- **Estorno** de baixa (gera contra-lançamento e devolve ao saldo, com motivo obrigatório e auditoria).
- Cada baixa cria automaticamente o movimento na `ContaBancaria`/`Cartao` para alimentar a tela de Conciliação.

**3. Conciliação (Baixas)**
Tela única que lista baixas e movimentos importados (OFX/CSV mock) lado a lado, com sugestão de match por valor + data ± 2 dias. Ação **Conciliar** marca a baixa como `conciliada`.

**4. Faturamento dividido Coop + Flux** — mantido, com `SplitFaturamento` por CC.

**5. Acerto** — mantido, com adição: agora consome também `AcertoAjusteRateio` da despesa rateada.

## Impacto nas telas existentes / a criar

| Tela | Impacto |
|---|---|
| **Despesa (novo modal)** | Bloco **Rateio** com modo + tabela editável (CC/Farmácia · % · valor) e validação de soma. |
| **AcertoDetalhe** | Coluna nova **Ajustes rateados** (link para despesa de origem). Tooltip mostra origem do desconto/acréscimo. |
| **Contas a pagar / a receber** | Coluna **Saldo**, **% pago/recebido** (barra), botão **Baixar** por linha + ação em lote. Drawer de **histórico de baixas** por lançamento. |
| **Visão geral** | KPIs: A receber hoje · A pagar hoje · Baixas pendentes de conciliação · Saldo previsto por conta bancária. |
| **DRE** | Considera apenas valores efetivamente baixados (regime de caixa) **e** competência (regime de competência) — toggle. Rateios entram no CC correto. |
| **Configurações › Rateio padrão** | Por entregador, permite salvar um rateio default usado nas despesas recorrentes (auxílio combustível, EPI, etc.). |
| **Auditoria** | Toda baixa, estorno e rateio gravados em `historico[]`. |

## Componentes a criar (delta)

`src/components/financeiro/`:
- `RateioEditor.tsx` — tabela editável com modos % igual / % manual / valor / proporcional.
- `BaixaDialog.tsx` — formulário de baixa individual.
- `BaixaLoteDrawer.tsx` — baixa em lote.
- `BaixasHistorico.tsx` — drawer com timeline das baixas + estorno.
- `SaldoCell.tsx` — barra + % usada em A Pagar/A Receber.
- `ConciliacaoMatch.tsx` — par baixa × movimento bancário.

`src/lib/`:
- `rateio.ts` — funções `dividirIgual`, `dividirProporcionalEntregas`, `validarSoma`, `aplicarAoAcerto`.
- `baixas.ts` — `criarBaixa`, `estornar`, `recomputarSaldo`, `statusAtual`.
- `conciliacao.ts` — `sugerirMatches`, `marcarConciliada`.

## Permissões

- **Lançar despesa / rateio**: gestor financeiro e analista.
- **Baixar / estornar**: só gestor financeiro.
- **Conciliar**: gestor financeiro.
- **Aprovar acerto**: gestor financeiro (já no plano).

## Fora deste escopo (próximas etapas)

- Backend real (Lovable Cloud), RLS por empresa/CC, edge functions de geração de boleto/PIX, importação OFX real, NFS-e e Open Finance.
- Notificações WhatsApp ao baixar fatura / aprovar acerto.
