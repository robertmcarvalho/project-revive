import { useState } from "react";
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
  X,
  ChevronsRight,
  ChevronsLeft,
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
    { label: "Urgência", value: "SLA 4min", tone: "danger" as const },
    { label: "Intenção", value: "Status pedido", tone: "primary" as const },
    { label: "Churn", value: "Moderado", tone: "warning" as const },
  ],
  contexto: [
    "Pedido #4821 — R$ 2.480,00 — em transporte, previsão amanhã 9h–13h",
    "Última compra: 8 dias atrás (acima da média de 22 dias)",
    "2 tickets sobre atraso nos últimos 30 dias",
    "NPS último ciclo: 7 (Passivo)",
  ],
};

const proximosPassos = [
  { titulo: "Confirmar status do pedido", descricao: "Buscar tracking no ERP antes de responder.", tag: "Ação imediata", tone: "danger" as const, tempo: "1 min" },
  { titulo: "Oferecer cupom de compensação", descricao: "Cliente teve atraso recorrente. Cupom de 8% ajuda a reter.", tag: "Retenção", tone: "primary" as const, tempo: "2 min" },
  { titulo: "Agendar follow-up pós-entrega", descricao: "Disparar mensagem amanhã às 14h confirmando recebimento.", tag: "Automação", tone: "default" as const, tempo: "30s" },
  { titulo: "Encaminhar para Sucesso do Cliente", descricao: "Marina entra no perfil estratégico — vale handoff para CSM.", tag: "Escalação", tone: "warning" as const, tempo: "1 min" },
];

const respostas = [
  { tom: "Empática", texto: "Oi Marina, tudo bem? 💙 Já localizei o seu pedido #4821 aqui. Ele está em rota de entrega e a previsão é chegar amanhã, dia 29/04, entre 9h e 13h. Sei que faz uns dias e peço desculpa pela espera — qualquer coisa, é só me chamar que acompanho junto com você. 🙌" },
  { tom: "Direta", texto: "Oi Marina! Seu pedido #4821 está em transporte. Previsão: amanhã (29/04), entre 9h e 13h. Te aviso aqui se houver atualização." },
  { tom: "Formal", texto: "Prezada Marina, informamos que o pedido #4821 encontra-se em rota de entrega, com previsão para 29/04 entre 9h e 13h. Permanecemos à disposição." },
];

const chatInicial: ChatMsg[] = [
  { from: "ai", text: "Estou com o contexto da Marina. Posso resumir, sugerir resposta, redigir e-mail ou puxar dados do pedido. Por onde começamos?", time: "14:26" },
];

const toneClass = (tone: "default" | "primary" | "warning" | "danger") => {
  switch (tone) {
    case "primary": return "border-primary/30 bg-primary/10 text-primary";
    case "warning": return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "danger": return "border-destructive/30 bg-destructive/10 text-destructive";
    default: return "border-border bg-muted/40 text-muted-foreground";
  }
};

type Props = {
  onClose?: () => void;
  onCollapse?: () => void;
  collapsed?: boolean;
  onExpand?: () => void;
  embedded?: boolean;
};

export const CopilotoPanel = ({ onClose, onCollapse, collapsed, onExpand, embedded = true }: Props) => {
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
      { from: "ai", text: "Com base no histórico, recomendo manter tom empático e oferecer cupom de 8%. Quer que eu prepare a mensagem?", time: now },
    ]);
    setInput("");
  };

  if (collapsed) {
    return (
      <div className="flex h-full w-12 shrink-0 flex-col items-center border-l border-border bg-surface py-2 gap-1">
        <button
          onClick={onExpand}
          title="Expandir Copiloto"
          className="rounded-md p-2 text-primary hover:bg-surface-hover"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        {[
          { icon: FileText, k: "briefing" },
          { icon: ListChecks, k: "passos" },
          { icon: MessageSquare, k: "resposta" },
          { icon: MessagesSquare, k: "chat" },
        ].map(({ icon: Icon, k }) => (
          <button
            key={k}
            onClick={() => { setTab(k); onExpand?.(); }}
            title={k}
            className="rounded-md p-2 text-muted-foreground hover:bg-surface-hover hover:text-foreground"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
        {onClose && (
          <button
            onClick={onClose}
            title="Fechar"
            className="mt-auto rounded-md p-2 text-muted-foreground hover:bg-surface-hover hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex h-full flex-col border-l border-border bg-background", embedded ? "w-[440px] shrink-0" : "w-full")}>
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold tracking-tight">Copiloto</h3>
              <Badge variant="outline" className="h-4 gap-1 border-primary/30 bg-primary/5 px-1 text-[9px] text-primary">
                IA
              </Badge>
            </div>
            <div className="truncate text-[10px] text-muted-foreground">{briefing.contato.nome} · {briefing.contato.perfil}</div>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={onCollapse} title="Recolher" className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground">
            <ChevronsRight className="h-4 w-4" />
          </button>
          {onClose && (
            <button onClick={onClose} title="Fechar" className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sinais */}
      <div className="flex flex-wrap gap-1.5 border-b border-border px-3 py-2">
        {briefing.sinais.map((s) => (
          <div key={s.label} className={cn("rounded border px-1.5 py-0.5 text-[10px]", toneClass(s.tone))}>
            <span className="font-mono uppercase opacity-70">{s.label}</span>
            <span className="ml-1 font-medium">{s.value}</span>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab} className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="mx-3 mt-2 grid grid-cols-4">
          <TabsTrigger value="briefing" className="text-[11px]"><FileText className="h-3 w-3 mr-1" />Briefing</TabsTrigger>
          <TabsTrigger value="passos" className="text-[11px]"><ListChecks className="h-3 w-3 mr-1" />Passos</TabsTrigger>
          <TabsTrigger value="resposta" className="text-[11px]"><MessageSquare className="h-3 w-3 mr-1" />Resposta</TabsTrigger>
          <TabsTrigger value="chat" className="text-[11px]"><MessagesSquare className="h-3 w-3 mr-1" />Chat</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="briefing" className="m-0 h-full">
            <ScrollArea className="h-full">
              <div className="space-y-3 p-3">
                <Card className="p-3">
                  <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">
                    <Sparkles className="h-3 w-3 text-primary" /> Resumo
                  </div>
                  <p className="text-xs leading-relaxed">{briefing.resumo}</p>
                </Card>
                <Card className="p-3">
                  <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">
                    <Tag className="h-3 w-3" /> Contexto operacional
                  </div>
                  <ul className="space-y-1.5 text-xs">
                    {briefing.contexto.map((c) => (
                      <li key={c} className="flex items-start gap-1.5">
                        <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card className="p-3">
                  <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">Ficha</div>
                  <dl className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-muted-foreground" />{briefing.contato.telefone}</div>
                    <div className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-muted-foreground" />{briefing.contato.email}</div>
                    <div className="flex items-center gap-1.5"><User className="h-3 w-3 text-muted-foreground" /><span className="font-mono">{briefing.contato.cnpj}</span></div>
                  </dl>
                  <Separator className="my-3" />
                  <Button variant="outline" size="sm" className="w-full text-xs">Abrir ficha completa</Button>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="passos" className="m-0 h-full">
            <ScrollArea className="h-full">
              <div className="space-y-2 p-3">
                {proximosPassos.map((p, i) => (
                  <Card key={p.titulo} className="p-3">
                    <div className="flex items-start gap-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-[10px] font-medium text-primary">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="text-xs font-semibold">{p.titulo}</h3>
                          <span className={cn("rounded border px-1 py-0 text-[9px]", toneClass(p.tone))}>{p.tag}</span>
                          <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="h-2.5 w-2.5" />{p.tempo}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">{p.descricao}</p>
                        <div className="mt-2 flex gap-1.5">
                          <Button size="sm" className="h-6 text-[10px]"><CheckCircle2 className="mr-1 h-3 w-3" />Aplicar</Button>
                          <Button size="sm" variant="ghost" className="h-6 text-[10px]">Adiar</Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                <Card className="border-dashed bg-muted/30 p-2 text-center text-[10px] text-muted-foreground">
                  <AlertTriangle className="mr-1 inline h-2.5 w-2.5" />
                  Sugestões com base no histórico e SLA da fila.
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="resposta" className="m-0 h-full">
            <ScrollArea className="h-full">
              <div className="space-y-3 p-3">
                <Card className="p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">
                      <Wand2 className="h-3 w-3 text-primary" /> Sugestão
                    </div>
                    <div className="flex gap-1">
                      {respostas.map((r, i) => (
                        <button
                          key={r.tom}
                          onClick={() => selecionarTom(i)}
                          className={cn(
                            "rounded border px-1.5 py-0.5 text-[10px] transition-colors",
                            respostaIdx === i ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {r.tom}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Textarea value={respostaEdit} onChange={(e) => setRespostaEdit(e.target.value)} rows={8} className="resize-none text-xs leading-relaxed" />
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Button size="sm" className="h-7 text-[11px]"><Send className="mr-1 h-3 w-3" />Enviar</Button>
                    <Button size="sm" variant="outline" className="h-7 text-[11px]"><Copy className="mr-1 h-3 w-3" />Copiar</Button>
                    <Button size="sm" variant="outline" className="h-7 text-[11px]"><RefreshCw className="mr-1 h-3 w-3" />Regenerar</Button>
                    <div className="ml-auto flex gap-0.5">
                      <Button size="icon" variant="ghost" className="h-6 w-6"><ThumbsUp className="h-3 w-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6"><ThumbsDown className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">Por que essa resposta?</div>
                  <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                    <li className="flex gap-1.5"><CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-primary" />Confirma o pedido #4821 com data e janela.</li>
                    <li className="flex gap-1.5"><CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-primary" />Reconhece o atraso percebido.</li>
                    <li className="flex gap-1.5"><CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-primary" />Mantém o tom da conversa.</li>
                    <li className="flex gap-1.5"><CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-primary" />Respeita guideline da operação B2B.</li>
                  </ul>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="chat" className="m-0 flex h-full flex-col">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary"><Bot className="h-3 w-3" /></div>
              <div className="text-[10px] text-muted-foreground">Conversa privada — o cliente não vê</div>
            </div>
            <ScrollArea className="flex-1 px-3 py-3">
              <div className="space-y-3">
                {chat.map((m, i) => (
                  <div key={i} className={cn("flex gap-2", m.from === "me" && "flex-row-reverse")}>
                    {m.from === "ai" && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Bot className="h-3 w-3" /></div>
                    )}
                    <div className={cn("max-w-[80%] rounded-lg px-2.5 py-1.5 text-xs", m.from === "ai" ? "bg-muted text-foreground" : "bg-primary text-primary-foreground")}>
                      <p className="leading-relaxed">{m.text}</p>
                      <div className={cn("mt-1 text-[9px]", m.from === "ai" ? "text-muted-foreground" : "text-primary-foreground/70")}>{m.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="border-t border-border p-2">
              <div className="mb-1.5 flex flex-wrap gap-1">
                {["Resumir", "Sugerir resposta", "Buscar pedido", "Redigir e-mail"].map((q) => (
                  <button key={q} onClick={() => setInput(q)} className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-muted">{q}</button>
                ))}
              </div>
              <div className="flex items-end gap-1.5">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } }}
                  placeholder="Pergunte ao Copiloto..."
                  rows={1}
                  className="min-h-[36px] resize-none text-xs"
                />
                <Button size="icon" onClick={enviar} disabled={!input.trim()} className="h-9 w-9 shrink-0"><Send className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
