# Demonstrativo do cooperado (holerite CoopMob)

Nova página pública, enviada ao cooperado por link, substituindo o modelo atual (que mistura marcas, dados da farmácia e jargão interno).

## O que muda em relação ao modelo atual

Sai:
- Marca "FLUX FARMA" no topo — fica **apenas CoopMob**
- Bloco de cobrança da farmácia (boleto, apuração, datas de faturamento, valor da farmácia)
- Nota explicativa sobre diárias/boleto/quarta-quinta
- Texto técnico `MG (0 entregas "d 140) (7/7 dias) · 0 entregas`

Entra (linguagem do cooperado):
- "Você fez **0 entregas** nesta semana. Como o combinado garante um valor mínimo, seu pagamento foi calculado pelo **valor mínimo garantido**."
- Rótulos simples: "Total da semana", "Já recebido em diárias", "Você vai receber", "Data do pagamento", "Chave PIX"
- Aviso curto e humano: "Este link é pessoal e vale por 7 dias."

## Layout novo

```text
┌───────────────────────────────────────────┐
│  [logo CoopMob]        Semana 10–16/08    │
│  Seu pagamento                            │
│  R$ 700,00      chip: PIX em 20/08        │
└───────────────────────────────────────────┘
  Card "Como chegamos nesse valor"
   • Entregas realizadas .............. 0
   • Valor mínimo garantido ... R$ 700,00   (badge "aplicado")
   • Diárias já recebidas ..... – R$ 0,00
   • Descontos ................ – R$ 0,00
   ─────────────────────────────────────
   Você vai receber ........... R$ 700,00
  Card "Onde você trabalhou"  → farmácia(s) + nº de entregas por local
  Card "Seu histórico"        → barras das 3 semanas anteriores + atual
  Card "Dados do pagamento"   → nome, CPF mascarado, chave PIX (copiar), data
  Rodapé: dúvidas → contato da cooperativa
```

Estilo alinhado ao projeto: fundo dark com tokens semânticos, cabeçalho com gradiente da marca, cards `rounded-xl border bg-surface`, ícones premium via `IconTile`, tipografia grande no valor principal, versão imprimível/responsiva (mobile-first, já que o cooperado abre no celular).

## Detalhes técnicos

- Nova rota pública `/public/holerite/:token` → `src/pages/HoleritePublico.tsx` (não usa o layout com sidebar), registrada em `src/App.tsx` ao lado de `/public/billing/:token`.
- Dados: token por linha de acerto do entregador. Adicionar em `financeiroMock`/`financeiroApi` um `getHoleriteByToken(token)` que devolve `{ acerto, linha, entregador, farmacia, entidade coop }`, com `holeriteToken` gerado por linha na aprovação do acerto (mesmo padrão de `randomToken()` usado nas faturas).
- Cálculo reaproveita `AcertoLinha` já existente (`qtdEntregas`, `minimoAplicado`, `baseRepasse`, `diarias`, `descontos`, `valorEntregador`) — nenhuma regra financeira nova.
- Entidade exibida fixa em `entityType === "coop"` (CoopMob); Flux nunca aparece.
- Histórico de 3 semanas: mesmo gerador determinístico usado em `FaturaPublica` (mock), pronto para trocar por dados reais.
- Em `AcertoDetalhe`, botão "Ver demonstrativo" por linha para abrir/validar o holerite.
- CPF mascarado e chave PIX com botão copiar (`toast` de confirmação).
