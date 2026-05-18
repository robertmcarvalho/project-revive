import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { OperationContextBar } from "@/components/OperationContextBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  User,
  Phone,
  Mail,
  Tag,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Send,
  Bot,
  Wand2,
  FileText,
  ListChecks,
  MessageSquare,
  MessagesSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ChatMsg = { from: "ai" | "me"; text: string; time: string };

const briefing = {
  contato: {
    nome: "Marina Costa",
    perfil: "Farmácia",
    cnpj: "12.345.678/0001-90",
    cidade: "São Paulo / SP",
    telefone: "+55 11 98765-4321",
    email: "marina@farmaciacosta.com.br",
    desde: "Cliente há 1 ano e 4 meses",
  },
  resumo:
    "Marina abriu conversa pelo WhatsApp B2B Farmácias perguntando o status do pedido #4821, feito há 8 dias. Já houve 2 contatos anteriores sobre prazos de entrega no último mês — risco de churn moderado. Tom amigável, mas com sinais de impaciência na 2ª mensagem.",
  sinais: [
    { label: "Sentimento", value: "Neutro › Negativo", tone: "warning" as const },
    { label: "Urgência", value: "Alta — SLA em 4min", tone: "danger" as const },
    { label: "Intenção", value: "Status de pedido", tone: "primary" as const },
    { label: "Risco churn", value: "Moderado", tone: "warning" as const },
  ],
  contexto: [
    "Pedido #4821 — R$ 2.480,00 — em transporte, previsão amanhã 9h–13h",
    "Última compra: 8 dias atrás (acima da média de 22 dias)",
    "2 tickets sobre atraso nos últimos 30 dias",
    "NPS último ciclo: 7 (Passivo)",
  ],
};

const proximosPassos = [
  {
    titulo: "Confirmar status atualizado do pedido",
    descricao: "Buscar tracking no ERP antes de responder. Não prometer prazo sem checar.",
    tag: "Ação imediata",
    tone: "danger" as const,
    tempo: "1 min",
  },
  {
    titulo: "Oferecer cupom de compensação",
    descricao: "Cliente teve atraso recorrente. Cupom de 8% na próxima compra ajuda a reter.",
    tag: "Retenção",
    tone: "primary" as const,
    tempo: "2 min",
  },
  {
    titulo: "Agendar follow-up pós-entrega",
    descricao: "Disparar mensagem amanhã às 14h confirmando recebimento e satisfação.",
    tag: "Automação",
    tone: "default" as const,
    tempo: "30s",
  },
  {
    titulo: "Encaminhar para Sucesso do Cliente",
    descricao: "Marina entra no perfil de cliente estratégico — vale handoff para CSM.",
    tag: "Escalação",
    tone: "warning" as const,
    tempo: "1 min",
  },
];

const respostas = [
  {
    tom: "Empática",
    texto:
      "Oi Marina, tudo bem? 💙 Já localizei o seu pedido #4821 aqui. Ele está em rota de entrega e a previsão é chegar amanhã, dia 29/04, entre 9h e 13h. Sei que faz uns dias e peço desculpa pela espera — qualquer coisa, é só me chamar que acompanho junto com você até chegar. 🙌",
  },
  {
    tom: "Direta",
    texto:
      "Oi Marina! Seu pedido #4821 está em transporte. Previsão de entrega: amanhã (29/04), entre 9h e 13h. Te aviso aqui se houver qualquer atualização.",
  },
  {
    tom: "Formal",
    texto:
      "Prezada Marina, boa tarde. Informamos que o pedido #4821 encontra-se em rota de entrega, com previsão para 29/04 entre 9h e 13h. Permanecemos à disposição para qualquer esclarecimento.",
  },
];

const chatInicial: ChatMsg[] = [
  {
    from: "ai",
    text: "Estou com o contexto completo da conversa da Marina. Posso resumir, sugerir uma resposta, redigir um e-mail de follow-up ou puxar dados do pedido. Por onde quer começar?",
    time: "14:26",
  },
];

const toneClass = (tone: "default" | "primary" | "warning" | "danger") => {
  switch (tone) {
    case "primary":
      return "border-primary/30 bg-primary/10 text-primary";
    case "warning":
      return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "danger":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    default:
      return "border-border bg-muted/40 text-muted-foreground";
  }
};

const Copiloto = () => {
  const [tab, setTab] = useState("briefing");
  const [respostaIdx, setRespostaIdx] = useState(0);
  const [respostaEdit, setRespostaEdit] = useState(respostas[0].texto);
  const [chat, setChat] = useState<ChatMsg[]>(chatInicial);
  const [input, setInput] = useState("");

  const selecionarTom = (i: number) => {
    setRespostaIdx(i);
    setRespostaEdit(respostas[i].texto);
  };

  const enviar = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    setChat((c) => [
      ...c,
      { from: "me", text: input.trim(), time: now },
      {
        from: "ai",
        text: "Boa pergunta. Com base no histórico da Marina, recomendo manter o tom empático e oferecer o cupom de 8% — ela já teve 2 atrasos no mês. Quer que eu prepare a mensagem completa?",
        time: now,
      },
    ]);
    setInput("");
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <OperationContextBar breadcrumb={["Webhook B2B Farmácias", "Conversa › Marina Costa"]} />

      <PageHeader
        eyebrow="IA — Sugestões"
        title="Copiloto Atendimento"
        description="Assistente que entende a conversa, propõe próximos passos e redige respostas em tempo real."
        actions={
          <>
            <Badge variant="outline" className="gap-1.5 border-primary/30 bg-primary/5 text-primary">
              <Sparkles className="h-3 w-3" />
              IA ativa
            </Badge>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Reanalisar
            </Button>
          </>
        }
      />

      {/* Contato + sinais rápidos */}
      <Card className="mb-6 p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">{briefing.contato.nome}</h2>
                <Badge variant="outline" className="text-[10px]">
                  {briefing.contato.perfil}
                </Badge>
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {briefing.contato.cidade} • {briefing.contato.desde}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {briefing.sinais.map((s) => (
              <div
                key={s.label}
                className={cn("rounded-md border px-2.5 py-1 text-[11px]", toneClass(s.tone))}
              >
                <span className="font-mono uppercase tracking-wider opacity-70">{s.label}</span>
                <span className="ml-1.5 font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="briefing" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Briefing
          </TabsTrigger>
          <TabsTrigger value="passos" className="gap-1.5">
            <ListChecks className="h-3.5 w-3.5" />
            Próximos passos
          </TabsTrigger>
          <TabsTrigger value="resposta" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Resposta
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-1.5">
            <MessagesSquare className="h-3.5 w-3.5" />
            Chat
          </TabsTrigger>
        </TabsList>

        {/* BRIEFING */}
        <TabsContent value="briefing" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-4 lg:col-span-2">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-subtle-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Resumo da conversa
              </div>
              <p className="text-sm leading-relaxed text-foreground">{briefing.resumo}</p>

              <Separator className="my-4" />

              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-subtle-foreground">
                <Tag className="h-3.5 w-3.5" />
                Contexto operacional
              </div>
              <ul className="space-y-2 text-sm">
                {briefing.contexto.map((c) => (
                  <li key={c} className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-4">
              <div className="mb-3 text-xs font-medium uppercase tracking-wider text-subtle-foreground">
                Ficha do contato
              </div>
              <dl className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span className="text-foreground">{briefing.contato.telefone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="text-foreground">{briefing.contato.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="font-mono text-xs text-foreground">{briefing.contato.cnpj}</span>
                </div>
              </dl>
              <Separator className="my-4" />
              <Button variant="outline" size="sm" className="w-full">
                Abrir ficha completa
              </Button>
            </Card>
          </div>
        </TabsContent>

        {/* PRÓXIMOS PASSOS */}
        <TabsContent value="passos" className="space-y-3">
          {proximosPassos.map((p, i) => (
            <Card key={p.titulo} className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-medium text-primary">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold">{p.titulo}</h3>
                    <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-medium", toneClass(p.tone))}>
                      {p.tag}
                    </span>
                    <span className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {p.tempo}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{p.descricao}</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="default">
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      Aplicar
                    </Button>
                    <Button size="sm" variant="ghost">
                      Adiar
                    </Button>
                    <Button size="sm" variant="ghost" className="text-muted-foreground">
                      Ignorar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          <Card className="border-dashed bg-muted/30 p-3 text-center text-xs text-muted-foreground">
            <AlertTriangle className="mr-1.5 inline h-3 w-3" />
            Sugestões geradas com base no histórico, SLA da fila e perfil B2B Farmácia.
          </Card>
        </TabsContent>

        {/* RESPOSTA */}
        <TabsContent value="resposta">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-4 lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-subtle-foreground">
                  <Wand2 className="h-3.5 w-3.5 text-primary" />
                  Resposta sugerida
                </div>
                <div className="flex gap-1">
                  {respostas.map((r, i) => (
                    <button
                      key={r.tom}
                      onClick={() => selecionarTom(i)}
                      className={cn(
                        "rounded-md border px-2 py-1 text-[11px] transition-colors",
                        respostaIdx === i
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {r.tom}
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                value={respostaEdit}
                onChange={(e) => setRespostaEdit(e.target.value)}
                rows={8}
                className="resize-none text-sm leading-relaxed"
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button size="sm">
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Enviar ao cliente
                </Button>
                <Button size="sm" variant="outline">
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copiar
                </Button>
                <Button size="sm" variant="outline">
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Regenerar
                </Button>
                <div className="ml-auto flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7">
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7">
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="mb-3 text-xs font-medium uppercase tracking-wider text-subtle-foreground">
                Por que essa resposta?
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                  Confirma o pedido #4821 com data e janela.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                  Reconhece o atraso percebido (sinal negativo na conversa).
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                  Mantém tom da conversa (cliente usou emoji de gratidão antes).
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                  Respeita guideline da operação B2B Farmácias.
                </li>
              </ul>
            </Card>
          </div>
        </TabsContent>

        {/* CHAT */}
        <TabsContent value="chat">
          <Card className="flex h-[520px] flex-col">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium">Copiloto</div>
                <div className="text-[10px] text-muted-foreground">
                  Conversa privada — o cliente não vê estas mensagens
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 px-4 py-4">
              <div className="space-y-4">
                {chat.map((m, i) => (
                  <div key={i} className={cn("flex gap-3", m.from === "me" && "flex-row-reverse")}>
                    {m.from === "ai" && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                        m.from === "ai"
                          ? "bg-muted text-foreground"
                          : "bg-primary text-primary-foreground"
                      )}
                    >
                      <p className="leading-relaxed">{m.text}</p>
                      <div
                        className={cn(
                          "mt-1 text-[10px]",
                          m.from === "ai" ? "text-muted-foreground" : "text-primary-foreground/70"
                        )}
                      >
                        {m.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t border-border p-3">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {["Resumir conversa", "Sugerir resposta", "Buscar pedido", "Redigir e-mail"].map(
                  (q) => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-muted"
                    >
                      {q}
                    </button>
                  )
                )}
              </div>
              <div className="flex items-end gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      enviar();
                    }
                  }}
                  placeholder="Pergunte algo ao Copiloto..."
                  rows={1}
                  className="min-h-[40px] resize-none text-sm"
                />
                <Button size="icon" onClick={enviar} disabled={!input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Copiloto;
