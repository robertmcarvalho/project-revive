## Objetivo

Refatorar o módulo `Financeiro` existente para refletir o **documento mestre de Billing** (Aethera Flux Farma / CoopMob). Mantemos o que já foi construído (acertos, faturamento, A pagar/receber, despesas, conciliação, DRE, configurações) e **adicionamos** o que falta para virar o módulo definitivo.

> Mantemos rota de UI em `/financeiro` (mais natural em PT) mas alinhamos toda a nomenclatura interna, modelos e telas ao mestre.

## 1. Ajustes em telas existentes

| Tela atual | Ajuste |
|---|---|
| **Visão geral** | KPIs em **regime de caixa** (A vencer hoje · A pagar hoje · Baixas pendentes · Saldo previsto por conta). Toggle global **Competência / Caixa**. Alertas de ciclos abertos + entregadores sem PIX. |
| **Acertos** | Granularidade reforçada `entregador × farmácia × ciclo` (já temos). Adicionar coluna **Origem entregas** (Flux API / Manual / CSV). Recalcular puxa contagem de `delivery_records`. |
| **Acerto detalhe** | Lógica de **falta sem diarista** = desconto `MG ÷ 6` (semana operacional 6 dias) — implementar em `lib/acerto.ts`. Tooltip de origem nos ajustes rateados (já temos). |
| **Faturamento** | Confirmado: 2 faturas por farmácia/ciclo (Coop + Flux) — já implementado. Adicionar **link público HTML** (`/public/billing/:token`) gerado na aprovação. Botão **Reenviar e-mail** (mock). |
| **A receber / A pagar** | Sem mudança estrutural; já temos baixas + saldo. A Pagar ganha aba "INSS (despesa Coop)" dentro de Operacional Coop. |
| **Despesas** | Tipos de despesa virarem **cadastráveis** (fixo/variável) em Configurações; modal de despesa passa a usar select de `expenseTypes`. Rateio permanece. |
| **Conciliação** | Mantém. |
| **DRE** | Toggle **Competência / Caixa** já planejado. INSS aparece como linha de despesa Coop. |
| **Configurações** | Reorganizar em sub-abas: Entidades · Centros de custo · Split Coop×Flux · Regras de vínculo · Tipos de despesa · Fornecedores · Contas bancárias/cartões · Cotas. |

## 2. Telas novas

| Rota | Função |
|---|---|
| `/financeiro/entregas` | Lista de `delivery_records` por ciclo · filtros farmácia/entregador/origem · ações Importar CSV, Lançar manual, Sync Flux (mock). Mostra `verified`, `cancelled`, `document_number`. |
| `/financeiro/cotas` | CRUD de cotas cooperativas (regra `monthly_weekday`, valor, entregador). Calendário de vencimentos. Integra como desconto no AP do entregador (separado de INSS). |
| `/financeiro/relatorios` | Hub com 3 cards: INSS Contabilidade · Seguradora · Pagamento PIX em lote. |
| `/financeiro/relatorios/inss-contabilidade` | Seleciona mês competência → lista Nome · CPF · Valor faturado no mês (soma remuneração bruta Coop). Export CSV/HTML. Marca "enviado". |
| `/financeiro/relatorios/seguradora` | Abas **Ativos** (na data corte) e **Desligados no mês** (usa `inactive_at`). Campos: nome, CPF, nascimento, telefone, data vínculo, líder, farmácias (+ data desligamento/motivo na aba Desligados). Export CSV/HTML. |
| `/financeiro/relatorios/pagamento-pix` | Seleciona ciclo aprovado → prévia 1 linha por entregador (nome, CPF, tipo chave, chave PIX, valor líquido). Bloqueia/avisa entregadores sem PIX. Export CSV genérico. Registra em `paymentBatchExports`. |
| `/financeiro/configuracoes/entidades` | CRUD `legalEntities` (CoopMob e Flux Farma): identificação, endereço, contato, dados bancários, parâmetros comerciais (split default, margem Flux, header/footer fatura, logo). |
| `/financeiro/configuracoes/despesas` | CRUD `expenseTypes` (kind fixo/variável, CC padrão, entidade padrão, allocation_mode, recorrência). |
| `/public/billing/:token` | Página pública (sem auth) com HTML da fatura: cabeçalho da entidade + linhas + detalhe de entregas. |

## 3. Modelo de dados (delta no `financeiroMock.ts`)

```text
# Novos
LegalEntity        { id, entityType:'coop'|'flux', legalName, tradeName, cnpj,
                     stateReg?, municipalReg?, taxRegime?,
                     address:{cep,logradouro,numero,bairro,cidade,uf},
                     financialEmail, commercialEmail, phone,
                     bank:{code,name,branch,account,digit,type},
                     pixKey?, pixKeyType?,
                     defaultSplitCoopPct, defaultSplitFluxPct,
                     fluxServiceMarginPct?,
                     invoiceHeaderNotes?, invoiceFooterNotes?, logoUrl? }

DeliveryRecord     { id, source:'flux_api'|'flux_db'|'manual'|'csv'|'external_app',
                     externalId, fluxCodpes?, fluxCodloc?,
                     farmaciaId, entregadorId, deliveredAt,
                     documentNumber?, routeId?, cancelled, verified,
                     cicloId? }

ExpenseType        { id, name, kind:'fixa'|'variavel',
                     defaultCentroCustoId?, defaultEntity:'coop'|'flux'|'ambos',
                     allocationMode:'none'|'per_pharmacy'|'per_driver'|'per_delivery',
                     recurrence?:'mensal'|'semanal'|'anual', active }

QuotaSchedule      { id, entregadorId, valor, regra:'monthly_weekday',
                     diaSemana, ocorrenciaNoMes, ativa, inicioEm, fimEm? }

PaymentBatchExport { id, cicloId, geradoEm, geradoPor,
                     totalEntregadores, totalValor, contaOrigemId,
                     formato:'csv_generico'|'banco_x',
                     status:'gerado'|'enviado_banco'|'conciliado' }

MonthlyReportRun   { id, tipo:'inss'|'seguradora_ativos'|'seguradora_desligados',
                     competencia, geradoEm, geradoPor, enviadoEm?, totais }

# Alterações
Farmacia (extensão): centroCustoId, contractScope:'flux_only'|'coop_only'|'both',
                     splitCoopPct, splitFluxPct, mgEnabled,
                     minimumDeliveriesCount?, billingEmail,
                     fluxCodpes?, fluxCodloc?

Entregador (extensão): pixKey?, pixKeyType?, cpf, dataNascimento?,
                       inactiveAt?, terminationReason?

Acerto/AcertoLinha: adicionar campo `descontoFaltaSemDiarista` (= MG/6 × dias)
                    e `origemEntregas` (contagem por source).
```

## 4. Regras de negócio (lib)

- `lib/acerto.ts` — adicionar `descontoFaltaSemDiarista(mg, dias) = (mg/6)*dias` aplicado tanto em `valorEntregador` quanto em `valorFaturadoFarmacia` (lados independentes, conforme item 4.3 do mestre).
- `lib/billing/entregas.ts` (novo) — `agruparPorCiclo`, `dedupe(source+externalId)`, `marcarVerificada`, `importarCSV(mock)`.
- `lib/billing/inssReport.ts` (novo) — soma remuneração bruta Coop por entregador no mês civil; **não desconta** do entregador.
- `lib/billing/seguradora.ts` (novo) — `listarAtivos(dataCorte)`, `listarDesligadosNoMes(mes)`.
- `lib/billing/pixBatch.ts` (novo) — `gerarPrevia(cicloId)`, valida `pixKey`, exporta CSV (Blob download).
- `lib/billing/cotas.ts` (novo) — `proximosVencimentos`, `aplicarNoAP(entregadorId, cicloId)`.
- `lib/financeiroApi.ts` — endpoints mock novos: `listEntregas`, `importarEntregasCSV`, `listCotas/criarCota`, `listLegalEntities/saveLegalEntity`, `listExpenseTypes/saveExpenseType`, `relatorioInss`, `relatorioSeguradora`, `gerarPixBatch`, `registrarExportPixBatch`.

## 5. Componentes novos

`src/components/financeiro/`
- `EntregasTable.tsx`, `ImportCsvDialog.tsx`, `EntregaManualDialog.tsx`
- `CotaForm.tsx`, `CotasCalendar.tsx`
- `LegalEntityForm.tsx` (abas Identificação · Endereço · Bancário · Comercial)
- `ExpenseTypeForm.tsx`
- `RelatorioInssTable.tsx`, `RelatorioSeguradoraTable.tsx`
- `PixBatchPreview.tsx` (com warnings de PIX faltando) + `PixBatchExportButton.tsx`
- `CompetenciaCaixaToggle.tsx` (compartilhado entre Visão geral / DRE / Relatórios)
- `FaturaPublicaView.tsx` (renderiza a página pública)

## 6. Roteamento (`src/App.tsx`)

Adicionar sob `/financeiro`:
```
entregas, cotas, relatorios (+ inss-contabilidade, seguradora, pagamento-pix),
configuracoes/entidades, configuracoes/despesas
```
Adicionar rota top-level pública: `/public/billing/:token` (sem AppShell).

## 7. SubNav

Reordenar para refletir o mestre: **Visão geral · Acertos · Entregas · Faturamento · A receber · A pagar · Despesas · Cotas · Conciliação · Relatórios · DRE · Configurações**. (12 itens — usar wrap, já é flex-wrap.)

## 8. Mocks

Em `financeiroMock.ts`:
- 2 `LegalEntity` (CoopMob + Flux Farma) com dados realistas fictícios.
- ~30 `DeliveryRecord` distribuídos entre farmácias do ciclo atual, mix de sources.
- ~8 `ExpenseType` (Aluguel, Software gestão, Salários, Convênio médico, Auxílio combustível, Despesas bancárias, Comissões, Eventos).
- 3 `QuotaSchedule`.
- 1 `PaymentBatchExport` histórico + 2 `MonthlyReportRun`.
- Estender `Entregador` com `pixKey`, `pixKeyType`, `cpf`, `inactiveAt` (alguns desligados no mês).
- Estender `Farmacia` com `contractScope`, `billingEmail`, `fluxCodpes/Loc`.

## 9. Permissões (UI mock)

- **Operador financeiro**: pode criar entregas/despesas/cotas, gerar rascunhos de relatórios e prévia PIX.
- **Gestor financeiro**: aprova faturas, baixa, exporta PIX batch, edita splits/CC/entidades.
- Renderizar botões protegidos com prop `role` lida de `localStorage` (mock simples) — não é segurança real.

## 10. Fora deste escopo

- Backend real (Lovable Cloud) — toda a camada continua mock em `financeiroApi.ts`.
- Sync real Flux API/MySQL, OFX real, e-mail real, geração de NF-e/boleto.
- Templates de PIX batch por banco específico (só CSV genérico na v1).
- Conciliação automática de retorno bancário.

## Sequência de implementação

1. Extensões de modelo + mocks (`financeiroMock.ts`).
2. `LegalEntity` + tela `configuracoes/entidades` (usado no header das faturas).
3. `ExpenseType` + tela `configuracoes/despesas`; refator do modal de despesa.
4. Tela `entregas` + lógica `lib/billing/entregas.ts`.
5. Regra falta-sem-diarista em `lib/acerto.ts`.
6. Tela `cotas` + integração no AP entregador.
7. Hub `relatorios` + 3 sub-relatórios (INSS, Seguradora, PIX batch).
8. Página pública `/public/billing/:token`.
9. SubNav reordenado + Toggle Competência/Caixa global.
10. Ajustes finais Visão geral (KPIs + alertas).
