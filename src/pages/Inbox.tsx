import { useState } from "react";
import { Link } from "react-router-dom";
import { ChannelBadge, type Channel } from "@/components/ChannelBadge";
import { StatusDot } from "@/components/StatusDot";
import { Filter, Star, Paperclip, Smile, Send, Phone, Video, MoreHorizontal, CheckCheck, Tag, ChevronRight, Sparkles, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Conv = {
  id: string;
  name: string;
  channel: Channel;
  preview: string;
  time: string;
  unread?: number;
  status: "online" | "idle" | "offline" | "busy";
  tag?: { label: string; tone: "warning" | "success" | "primary" };
};

const folders = [
  { label: "Atribuídas a mim", count: 8, active: true },
  { label: "Não atribuídas", count: 23 },
  { label: "Aguardando cliente", count: 5 },
  { label: "Resolvidas hoje", count: 47 },
  { label: "Menções", count: 2 },
];

const channels: { ch: Channel; count: number }[] = [
  { ch: "whatsapp", count: 14 },
  { ch: "instagram", count: 6 },
  { ch: "email", count: 9 },
  { ch: "webchat", count: 3 },
  { ch: "telegram", count: 1 },
];

const conversations: Conv[] = [
  { id: "1", name: "Marina Costa", channel: "whatsapp", preview: "Boa tarde! Gostaria de saber sobre o status do meu pedido #4821", time: "agora", unread: 2, status: "online", tag: { label: "SLA 4min", tone: "warning" } },
  { id: "2", name: "Pedro Henrique", channel: "instagram", preview: "Vocês têm essa peça em outras cores?", time: "2m", unread: 1, status: "online" },
  { id: "3", name: "Juliana Alves", channel: "email", preview: "Re: Solicitação de orçamento — segue em anexo o briefing completo", time: "12m", status: "idle", tag: { label: "Vendas", tone: "primary" } },
  { id: "4", name: "Carlos Mendes", channel: "webchat", preview: "Obrigado, deu certo! 🎉", time: "28m", status: "offline", tag: { label: "Resolvido", tone: "success" } },
  { id: "5", name: "Fernanda Lima", channel: "whatsapp", preview: "Vou verificar e te respondo ainda hoje", time: "1h", status: "offline" },
  { id: "6", name: "André Souza", channel: "telegram", preview: "Tem desconto pra pagamento à vista?", time: "1h", status: "idle" },
  { id: "7", name: "Beatriz Ramos", channel: "instagram", preview: "Quando vocês reabrem?", time: "2h", status: "offline" },
  { id: "8", name: "Lucas Ferreira", channel: "email", preview: "Re: Proposta comercial — aprovada!", time: "3h", status: "offline", tag: { label: "Vendas", tone: "primary" } },
];

const messages = [
  { from: "them", text: "Boa tarde! Gostaria de saber sobre o status do meu pedido #4821", time: "14:22" },
  { from: "them", text: "Já tem mais de uma semana que comprei", time: "14:22" },
  { from: "me", text: "Olá Marina, tudo bem? 👋\n\nVou verificar agora mesmo o status do seu pedido. Um momento, por favor.", time: "14:23" },
  { from: "me", text: "Localizei aqui! Seu pedido está em transporte e a previsão de entrega é amanhã, dia 29/04, entre 9h e 13h.", time: "14:24" },
  { from: "them", text: "Ah que ótimo! Muito obrigada pela rapidez 🙏", time: "14:25" },
];

const toneClass = {
  warning: "bg-warning/15 text-warning border-warning/20",
  success: "bg-success/15 text-success border-success/20",
  primary: "bg-primary/15 text-primary border-primary/20",
};

const Inbox = () => {
  const [activeId, setActiveId] = useState("1");
  const active = conversations.find((c) => c.id === activeId)!;

  return (
    <div className="flex h-full">
      {/* Coluna 1 — filtros */}
      <div className="flex w-56 shrink-0 flex-col border-r border-border bg-surface">
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <h2 className="text-sm font-semibold tracking-tight">Caixa de entrada</h2>
          <button className="rounded p-1 text-muted-foreground hover:bg-surface-hover hover:text-foreground">
            <Filter className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-0.5 p-2">
          {folders.map((f) => (
            <button
              key={f.label}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                f.active ? "bg-surface-hover text-foreground" : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              )}
            >
              <span>{f.label}</span>
              <span className="font-mono text-[10px] text-subtle-foreground">{f.count}</span>
            </button>
          ))}
        </div>

        <div className="px-3 pt-4 pb-2">
          <h3 className="px-1 text-[10px] font-semibold uppercase tracking-wider text-subtle-foreground">Canais</h3>
        </div>
        <div className="space-y-0.5 px-2">
          {channels.map(({ ch, count }) => (
            <button key={ch} className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors">
              <ChannelBadge channel={ch} showLabel />
              <span className="font-mono text-[10px] text-subtle-foreground">{count}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto p-3">
          <div className="rounded-lg border border-border bg-background/40 p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              IA Sugestões
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">3 conversas podem ser resolvidas com respostas prontas.</p>
            <button className="mt-2 text-[11px] font-medium text-primary hover:underline">Ver sugestões →</button>
          </div>
        </div>
      </div>

      {/* Coluna 2 — lista de conversas */}
      <div className="flex w-[340px] shrink-0 flex-col border-r border-border bg-surface/50">
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <div>
            <div className="text-sm font-semibold tracking-tight">Atribuídas a mim</div>
            <div className="font-mono text-[10px] text-muted-foreground">8 conversas · 3 não lidas</div>
          </div>
          <button className="rounded-md border border-border bg-background/60 px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors">
            Mais recentes
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={cn(
                "group relative flex w-full gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors",
                activeId === c.id ? "bg-surface-hover" : "hover:bg-surface-hover/60"
              )}
            >
              {activeId === c.id && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-primary" />}

              <div className="relative shrink-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-muted to-surface-elevated text-xs font-semibold text-foreground">
                  {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <StatusDot status={c.status} className="absolute -bottom-0.5 -right-0.5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className={cn("truncate text-sm font-medium", c.unread ? "text-foreground" : "text-foreground/90")}>{c.name}</span>
                  <span className={cn("shrink-0 font-mono text-[10px]", c.unread ? "text-primary" : "text-subtle-foreground")}>{c.time}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <ChannelBadge channel={c.channel} />
                  <p className={cn("truncate text-xs", c.unread ? "text-foreground/80" : "text-muted-foreground")}>{c.preview}</p>
                </div>
                {(c.tag || c.unread) && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    {c.tag && (
                      <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-medium", toneClass[c.tag.tone])}>
                        {c.tag.label}
                      </span>
                    )}
                    {c.unread && (
                      <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary-foreground">
                        {c.unread}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Coluna 3 — chat */}
      <div className="flex flex-1 flex-col bg-background">
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-channel-whatsapp to-success text-xs font-semibold text-foreground">
                MC
              </div>
              <StatusDot status={active.status} pulse className="absolute -bottom-0.5 -right-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold tracking-tight">{active.name}</h3>
                <ChannelBadge channel={active.channel} />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span>+55 11 98765-4321</span>
                <span className="text-subtle-foreground">·</span>
                <span>Cliente desde Mar/2024</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground"><Phone className="h-4 w-4" /></button>
            <button className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground"><Video className="h-4 w-4" /></button>
            <button className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground"><Star className="h-4 w-4" /></button>
            <div className="mx-1 h-5 w-px bg-border" />
            <Link
              to="/copiloto"
              title="Abrir Copiloto de Atendimento"
              className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/15 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Copiloto
            </Link>
            <button className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium hover:bg-surface-hover transition-colors">
              Resolver
            </button>
            <button className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="flex items-center gap-3 text-[10px] font-mono text-subtle-foreground">
              <div className="h-px flex-1 bg-border" />
              <span>HOJE · 28 ABR</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {messages.map((m, i) => (
              <div key={i} className={cn("flex animate-fade-in", m.from === "me" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line",
                  m.from === "me"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-surface-elevated border border-border rounded-bl-sm"
                )}>
                  <p>{m.text}</p>
                  <div className={cn(
                    "mt-1 flex items-center gap-1 text-[10px]",
                    m.from === "me" ? "text-primary-foreground/70 justify-end" : "text-muted-foreground"
                  )}>
                    <span>{m.time}</span>
                    {m.from === "me" && <CheckCheck className="h-3 w-3" />}
                  </div>
                </div>
              </div>
            ))}

            <div className="flex items-center gap-2 text-xs text-muted-foreground animate-fade-in">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "200ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "400ms" }} />
              </div>
              <span>Marina está digitando...</span>
            </div>
          </div>
        </div>

        {/* Composer */}
        <div className="border-t border-border bg-surface/40 p-4">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-1.5 mb-2">
              <button className="flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                <Sparkles className="h-3 w-3 text-primary" />
                Sugerir resposta
              </button>
              <button className="rounded-md border border-border bg-surface px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                Respostas prontas
              </button>
            </div>
            <div className="rounded-xl border border-border bg-surface-elevated focus-within:border-primary/50 focus-within:ring-glow transition-all">
              <textarea
                rows={2}
                placeholder="Escreva uma mensagem..."
                className="block w-full resize-none bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <div className="flex items-center justify-between border-t border-border px-3 py-2">
                <div className="flex items-center gap-0.5">
                  <button className="rounded p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground"><Paperclip className="h-3.5 w-3.5" /></button>
                  <button className="rounded p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground"><Smile className="h-3.5 w-3.5" /></button>
                  <button className="rounded p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground"><Tag className="h-3.5 w-3.5" /></button>
                </div>
                <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary-glow transition-colors shadow-glow">
                  Enviar
                  <Send className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coluna 4 — painel cliente */}
      <div className="hidden xl:flex w-72 shrink-0 flex-col border-l border-border bg-surface overflow-y-auto">
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <h3 className="text-sm font-semibold tracking-tight">Detalhes</h3>
          <button className="text-muted-foreground hover:text-foreground"><ChevronRight className="h-4 w-4" /></button>
        </div>

        <div className="flex flex-col items-center border-b border-border px-4 py-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-channel-whatsapp to-success text-base font-semibold">
            MC
          </div>
          <div className="mt-3 text-sm font-semibold">{active.name}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">marina.costa@gmail.com</div>
          <div className="mt-3 flex gap-2">
            <button className="rounded-md border border-border bg-background/60 px-2.5 py-1 text-[10px] font-medium hover:bg-surface-hover transition-colors">Perfil</button>
            <button className="rounded-md border border-border bg-background/60 px-2.5 py-1 text-[10px] font-medium hover:bg-surface-hover transition-colors">Histórico</button>
          </div>
        </div>

        <div className="border-b border-border px-4 py-4">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-subtle-foreground mb-3">Atribuição</h4>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Agente</span>
              <span className="font-medium">Robert C.</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Equipe</span>
              <span className="font-medium">Suporte N1</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Prioridade</span>
              <span className="rounded bg-warning/15 px-1.5 py-0.5 text-[10px] font-medium text-warning">Alta</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />SLA</span>
              <span className="font-mono text-warning">04:12</span>
            </div>
          </div>
        </div>

        <div className="border-b border-border px-4 py-4">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-subtle-foreground mb-3">Tags</h4>
          <div className="flex flex-wrap gap-1.5">
            {["pedido", "logística", "urgente", "vip"].map((t) => (
              <span key={t} className="rounded border border-border bg-background/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                #{t}
              </span>
            ))}
            <button className="rounded border border-dashed border-border px-2 py-0.5 text-[10px] text-subtle-foreground hover:text-foreground transition-colors">+ adicionar</button>
          </div>
        </div>

        <div className="px-4 py-4">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-subtle-foreground mb-3">Conversas anteriores</h4>
          <div className="space-y-2">
            {[
              { date: "12 Abr", topic: "Troca de produto", status: "resolved" },
              { date: "28 Mar", topic: "Dúvida pagamento", status: "resolved" },
              { date: "15 Mar", topic: "Primeira compra", status: "resolved" },
            ].map((h, i) => (
              <div key={i} className="rounded-md border border-border bg-background/40 px-2.5 py-2 hover:bg-surface-hover transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{h.topic}</span>
                  <span className="font-mono text-[10px] text-subtle-foreground">{h.date}</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-success">
                  <CheckCheck className="h-2.5 w-2.5" />
                  Resolvido
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
