import { useState } from "react";
import { Send, Paperclip, Smile, Phone, Search, Headphones, DollarSign, Wrench, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const setores = [
  { id: "atendimento", nome: "Atendimento geral", icon: Headphones, online: 4 },
  { id: "financeiro", nome: "Financeiro", icon: DollarSign, online: 2 },
  { id: "operacional", nome: "Operacional / RH", icon: ShieldCheck, online: 3 },
  { id: "suporte", nome: "Suporte técnico", icon: Wrench, online: 1 },
];

const conversas = [
  { id: 1, setor: "atendimento", titulo: "Atendimento geral", ultima: "Tudo certo, líder! 👍", hora: "10:24", unread: 0 },
  { id: 2, setor: "financeiro", titulo: "Financeiro", ultima: "Vamos verificar o pagamento...", hora: "09:50", unread: 2 },
  { id: 3, setor: "operacional", titulo: "Operacional / RH", ultima: "Cadastro da Maria foi aprovado", hora: "Ontem", unread: 0 },
];

const mensagens = [
  { de: "lider", texto: "Bom dia! Preciso saber se o entregador João pode receber adiantamento.", hora: "09:42" },
  { de: "agente", nome: "Renata · Financeiro", texto: "Bom dia, Marcos! Vou verificar agora mesmo.", hora: "09:45" },
  { de: "agente", nome: "Renata · Financeiro", texto: "Ele tem R$ 320 disponíveis para adiantamento. Posso liberar?", hora: "09:48" },
  { de: "lider", texto: "Pode liberar sim, obrigado!", hora: "09:50" },
  { de: "agente", nome: "Renata · Financeiro", texto: "Vamos verificar o pagamento e te confirmo em instantes.", hora: "09:50" },
];

export default function LiderChat() {
  const [conv, setConv] = useState(conversas[1]);
  const [msg, setMsg] = useState("");

  return (
    <div className="p-8 max-w-7xl">
      <PageHeader
        eyebrow="Suporte"
        title="Chat com atendimento"
        description="Conectado via WhatsApp · escolha o setor para abrir uma nova conversa."
        actions={
          <span className="flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-2.5 py-1 text-[10px] text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            WhatsApp conectado · +55 11 99000-0000
          </span>
        }
      />

      <div className="grid lg:grid-cols-[260px_320px_1fr] gap-0 rounded-xl border border-border bg-card overflow-hidden h-[calc(100vh-260px)] min-h-[520px]">
        {/* Setores */}
        <aside className="border-r border-border bg-background/30">
          <div className="border-b border-border p-3">
            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground">Abrir nova conversa</h4>
          </div>
          <ul className="p-2 space-y-1">
            {setores.map(s => (
              <li key={s.id}>
                <button className="w-full flex items-center gap-2.5 rounded-md p-2 text-left hover:bg-surface-hover">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{s.nome}</div>
                    <div className="text-[10px] text-success">{s.online} online</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Conversas */}
        <aside className="border-r border-border">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input placeholder="Buscar conversa..."
                className="w-full rounded-md border border-border bg-background/40 pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-primary/50" />
            </div>
          </div>
          <ul className="divide-y divide-border">
            {conversas.map(c => (
              <li key={c.id}>
                <button onClick={() => setConv(c)}
                  className={`w-full flex items-start gap-3 p-3 text-left hover:bg-surface-hover ${conv.id === c.id ? "bg-surface-hover" : ""}`}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-channel-whatsapp/15 text-channel-whatsapp">
                    <Headphones className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium truncate">{c.titulo}</span>
                      <span className="text-[10px] text-muted-foreground">{c.hora}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[11px] text-muted-foreground truncate">{c.ultima}</span>
                      {c.unread > 0 && (
                        <span className="ml-2 rounded-full bg-channel-whatsapp px-1.5 text-[10px] font-medium text-white">{c.unread}</span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Conversa */}
        <section className="flex flex-col bg-background/20">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-channel-whatsapp/15 text-channel-whatsapp">
                <Headphones className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium">{conv.titulo}</div>
                <div className="text-[10px] text-success flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" /> Renata respondendo · WhatsApp
                </div>
              </div>
            </div>
            <button className="rounded-md border border-border p-2 hover:bg-surface-hover"><Phone className="h-4 w-4" /></button>
          </header>

          <div className="flex-1 overflow-auto p-4 space-y-3">
            {mensagens.map((m, i) => (
              <div key={i} className={`flex ${m.de === "lider" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-sm ${
                  m.de === "lider"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-surface text-foreground border border-border rounded-bl-sm"
                }`}>
                  {m.de === "agente" && <div className="text-[10px] text-muted-foreground mb-0.5">{m.nome}</div>}
                  <div>{m.texto}</div>
                  <div className={`mt-1 text-[10px] ${m.de === "lider" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{m.hora}</div>
                </div>
              </div>
            ))}
          </div>

          <footer className="border-t border-border p-3">
            <div className="flex items-end gap-2">
              <button className="rounded-md p-2 text-muted-foreground hover:bg-surface-hover"><Paperclip className="h-4 w-4" /></button>
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                rows={1}
                placeholder="Mensagem..."
                className="flex-1 resize-none rounded-lg border border-border bg-background/40 px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
              />
              <button className="rounded-md p-2 text-muted-foreground hover:bg-surface-hover"><Smile className="h-4 w-4" /></button>
              <button className="rounded-md bg-primary p-2 text-primary-foreground hover:bg-primary-glow">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
