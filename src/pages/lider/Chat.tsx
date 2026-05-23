import { useMemo, useState } from "react";
import {
  Send, Paperclip, Smile, Phone, Search, Headphones, MessageCircle,
  Plus, X, Check, ChevronRight, Building2, Bike, Layers, ListTodo, SkipForward,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { setores as setoresCatalog, demandasPorPerfil } from "@/data/atendimentoCatalog";

// ---------- Mock data ----------
const farmaciasMock = [
  { id: "f1", nome: "Farmácia São Bento", endereco: "Rua das Flores, 123 — Zona Sul" },
  { id: "f2", nome: "Drogaria Vida+", endereco: "Av. Paulista, 900 — Zona Sul" },
];

const entregadoresPorFarmacia: Record<string, { id: string; nome: string; veiculo: string }[]> = {
  f1: [
    { id: "e1", nome: "João Pereira", veiculo: "Moto Honda CG" },
    { id: "e2", nome: "Lucas Tavares", veiculo: "Bike elétrica" },
  ],
  f2: [
    { id: "e3", nome: "Pedro Martins", veiculo: "Moto Yamaha" },
    { id: "e4", nome: "Rafael Kowalski", veiculo: "Moto Honda Biz" },
  ],
};

type Conversa = {
  id: string;
  setor: string;
  titulo: string;
  hora: string;
  status: "Ativo" | "Encerrado";
  origem: string;
  mensagens: { de: "lider" | "agente"; nome?: string; texto: string; hora: string }[];
};

const conversasIniciais: Conversa[] = [
  {
    id: "ac15cec3",
    setor: "operacional",
    titulo: "Operacional",
    hora: "22/05, 19:16",
    status: "Ativo",
    origem: "Portal do líder",
    mensagens: [
      { de: "lider", texto: "quero atualizar o telefone dele", hora: "17:25" },
      {
        de: "agente",
        nome: "Atendimento",
        texto:
          "Robert Platform:\nOlá, Robert! Recebemos sua solicitação para atualizar o telefone do entregador TESTE. Para prosseguir, por favor, informe o novo número de telefone completo com DDD.",
        hora: "17:26",
      },
      { de: "lider", texto: "34996710044", hora: "17:26" },
      { de: "lider", texto: "deu certo?", hora: "19:16" },
    ],
  },
  {
    id: "639183ba",
    setor: "atendimento",
    titulo: "Atendimento Geral",
    hora: "22/05, 16:26",
    status: "Ativo",
    origem: "Portal do líder",
    mensagens: [
      { de: "lider", texto: "Boa tarde, preciso de uma ajuda", hora: "16:20" },
      { de: "agente", nome: "Renata", texto: "Olá! Pode me dizer o que precisa?", hora: "16:26" },
    ],
  },
];

// ---------- Wizard ----------
type Step = "farmacia" | "entregador" | "setor" | "demanda";
const stepsOrder: Step[] = ["farmacia", "entregador", "setor", "demanda"];

function NovaConversaModal({
  open, onClose, onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { farmacia: any; entregador: any | null; setor: any; demanda: string }) => void;
}) {
  const [step, setStep] = useState<Step>("farmacia");
  const [farmacia, setFarmacia] = useState<any>(null);
  const [entregador, setEntregador] = useState<any>(null);
  const [setor, setSetor] = useState<any>(null);
  const [demanda, setDemanda] = useState<string>("");
  const [q, setQ] = useState("");

  // demandas por perfil — quando há entregador, usa demandas do entregador; sem entregador, usa de farmácia.
  const demandasDisponiveis = useMemo(() => {
    const perfil = entregador ? "entregador" : "farmacia";
    return demandasPorPerfil[perfil];
  }, [entregador]);

  if (!open) return null;

  const reset = () => {
    setStep("farmacia"); setFarmacia(null); setEntregador(null);
    setSetor(null); setDemanda(""); setQ("");
  };
  const close = () => { reset(); onClose(); };

  const stepIndex = stepsOrder.indexOf(step);
  const stepLabels: Record<Step, string> = {
    farmacia: "Farmácia",
    entregador: "Entregador (opcional)",
    setor: "Setor",
    demanda: "Demanda",
  };
  const stepIcons: Record<Step, any> = {
    farmacia: Building2, entregador: Bike, setor: Layers, demanda: ListTodo,
  };

  const entregadoresFiltrados = farmacia ? entregadoresPorFarmacia[farmacia.id] ?? [] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-modal-in">
      <div className="relative w-[min(720px,92vw)] max-h-[88vh] flex flex-col rounded-2xl border border-border bg-card top-highlight shadow-glow overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Novo atendimento</div>
            <h2 className="text-base font-semibold">Iniciar nova conversa</h2>
          </div>
          <button onClick={close} className="rounded-md p-2 text-muted-foreground hover:bg-surface-hover">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 border-b border-border bg-background/30 px-5 py-3">
          {stepsOrder.map((s, i) => {
            const Icon = stepIcons[s];
            const isActive = s === step;
            const isDone = i < stepIndex;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] transition-colors ${
                  isActive ? "border-primary/60 bg-primary/10 text-primary" :
                  isDone ? "border-success/40 bg-success/10 text-success" :
                  "border-border text-muted-foreground"
                }`}>
                  {isDone ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                  <span>{stepLabels[s]}</span>
                </div>
                {i < stepsOrder.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-5">
          {step === "farmacia" && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  value={q} onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar farmácia..."
                  className="w-full rounded-md border border-border bg-background/40 pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-primary/50"
                />
              </div>
              <ul className="space-y-2">
                {farmaciasMock
                  .filter(f => f.nome.toLowerCase().includes(q.toLowerCase()))
                  .map((f) => (
                    <li key={f.id}>
                      <button
                        onClick={() => { setFarmacia(f); setStep("entregador"); setQ(""); }}
                        className="w-full flex items-center gap-3 rounded-lg border border-border bg-background/30 p-3 text-left hover:border-primary/40 hover:bg-surface-hover transition-colors"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{f.nome}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{f.endereco}</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </li>
                ))}
              </ul>
            </div>
          )}

          {step === "entregador" && (
            <div className="space-y-3">
              <div className="rounded-md border border-border bg-background/30 px-3 py-2 text-[11px] text-muted-foreground">
                Farmácia: <span className="text-foreground font-medium">{farmacia?.nome}</span>
              </div>
              {entregadoresFiltrados.length === 0 ? (
                <div className="rounded-lg border border-border bg-background/30 p-4 text-center text-xs text-muted-foreground">
                  Nenhum entregador vinculado a essa farmácia.
                </div>
              ) : (
                <ul className="space-y-2">
                  {entregadoresFiltrados.map((e) => (
                    <li key={e.id}>
                      <button
                        onClick={() => { setEntregador(e); setStep("setor"); }}
                        className="w-full flex items-center gap-3 rounded-lg border border-border bg-background/30 p-3 text-left hover:border-primary/40 hover:bg-surface-hover transition-colors"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-channel-whatsapp/10 text-channel-whatsapp">
                          <Bike className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{e.nome}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{e.veiculo}</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                onClick={() => { setEntregador(null); setStep("setor"); }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-dashed border-border bg-background/20 px-3 py-2 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary"
              >
                <SkipForward className="h-3.5 w-3.5" />
                Pular — atendimento sem entregador específico
              </button>
            </div>
          )}

          {step === "setor" && (
            <div className="space-y-3">
              <div className="rounded-md border border-border bg-background/30 px-3 py-2 text-[11px] text-muted-foreground">
                {farmacia?.nome}{entregador && <> · <span className="text-foreground">{entregador.nome}</span></>}
              </div>
              <ul className="grid sm:grid-cols-2 gap-2">
                {setoresCatalog.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => { setSetor(s); setStep("demanda"); }}
                      className="w-full flex items-center gap-3 rounded-lg border border-border bg-background/30 p-3 text-left hover:border-primary/40 hover:bg-surface-hover transition-colors"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Layers className="h-4 w-4" />
                      </div>
                      <div className="text-sm font-medium">{s.nome}</div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === "demanda" && (
            <div className="space-y-3">
              <div className="rounded-md border border-border bg-background/30 px-3 py-2 text-[11px] text-muted-foreground">
                {farmacia?.nome}{entregador && <> · {entregador.nome}</>} · <span className="text-foreground">{setor?.nome}</span>
              </div>
              <ul className="space-y-2">
                {demandasDisponiveis.map((d) => (
                  <li key={d}>
                    <button
                      onClick={() => {
                        setDemanda(d);
                        onCreate({ farmacia, entregador, setor, demanda: d });
                        close();
                      }}
                      className="w-full flex items-center gap-3 rounded-lg border border-border bg-background/30 p-3 text-left hover:border-primary/40 hover:bg-surface-hover transition-colors"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ListTodo className="h-4 w-4" />
                      </div>
                      <div className="text-sm font-medium">{d}</div>
                      <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <button
            onClick={() => {
              const i = stepsOrder.indexOf(step);
              if (i > 0) setStep(stepsOrder[i - 1]);
              else close();
            }}
            className="rounded-md border border-border bg-background/30 px-3 py-1.5 text-xs hover:bg-surface-hover"
          >
            {step === "farmacia" ? "Cancelar" : "Voltar"}
          </button>
          <div className="text-[10px] text-muted-foreground">
            Etapa {stepIndex + 1} de {stepsOrder.length}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Página ----------
export default function LiderChat() {
  const [conversas, setConversas] = useState<Conversa[]>(conversasIniciais);
  const [conv, setConv] = useState<Conversa>(conversasIniciais[0]);
  const [msg, setMsg] = useState("");
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const list = conversas.filter(c =>
    c.titulo.toLowerCase().includes(q.toLowerCase()) || c.id.includes(q),
  );

  const handleCreate = (data: { farmacia: any; entregador: any | null; setor: any; demanda: string }) => {
    const id = Math.random().toString(16).slice(2, 10);
    const nova: Conversa = {
      id,
      setor: data.setor.id,
      titulo: data.setor.nome,
      hora: new Date().toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).replace(",", ""),
      status: "Ativo",
      origem: "Portal do líder",
      mensagens: [
        { de: "lider", texto: `Nova solicitação — ${data.demanda}`, hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) },
        {
          de: "agente", nome: "Atendimento",
          texto: `Olá! Recebemos sua solicitação (${data.demanda}) referente à farmácia ${data.farmacia.nome}${data.entregador ? ` e ao entregador ${data.entregador.nome}` : ""}. Já estamos analisando.`,
          hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    };
    setConversas([nova, ...conversas]);
    setConv(nova);
  };

  return (
    <div className="p-8 max-w-7xl">
      <PageHeader
        eyebrow="Suporte"
        title="Chat com atendimento"
        description="Conectado via WhatsApp · triagem guiada com farmácia, entregador e demanda."
        actions={
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-2.5 py-1 text-[10px] text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              WhatsApp conectado · (34) 9671-0044
            </span>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow shadow-glow"
            >
              <Plus className="h-3.5 w-3.5" />
              Nova conversa
            </button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-[260px_320px_1fr] gap-0 rounded-xl border border-border bg-card overflow-hidden h-[calc(100vh-260px)] min-h-[520px]">
        {/* Painel de novo atendimento */}
        <aside className="border-r border-border bg-background/30 p-4 space-y-4">
          <div>
            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Novo atendimento</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Farmácia → entregador (opcional) → setor → demanda configurada no canal.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow shadow-glow"
          >
            <Plus className="h-3.5 w-3.5" />
            Nova conversa
          </button>
          <div className="space-y-2 pt-2 border-t border-border text-[11px]">
            <div className="flex justify-between text-muted-foreground">
              <span>Farmácias na rede:</span><span className="text-foreground">{farmaciasMock.length}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Entregadores:</span>
              <span className="text-foreground">
                {Object.values(entregadoresPorFarmacia).reduce((a, b) => a + b.length, 0)}
              </span>
            </div>
          </div>
        </aside>

        {/* Conversas */}
        <aside className="border-r border-border flex flex-col">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar conversa..."
                className="w-full rounded-md border border-border bg-background/40 pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
          <ul className="flex-1 overflow-auto p-2 space-y-1.5">
            {list.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setConv(c)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    conv.id === c.id
                      ? "border-primary/50 bg-primary/5"
                      : "border-border bg-background/30 hover:border-primary/30 hover:bg-surface-hover"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                      <Headphones className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold truncate">{c.titulo}</span>
                        <MessageCircle className="h-3.5 w-3.5 text-channel-whatsapp shrink-0" />
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[10px] text-muted-foreground font-mono">#{c.id}</span>
                        <span className="text-[10px] text-muted-foreground">{c.hora}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                        <span className="text-[10px] text-muted-foreground">{c.origem}</span>
                        <span className={`text-[10px] ${c.status === "Ativo" ? "text-success" : "text-muted-foreground"}`}>
                          {c.status}
                        </span>
                      </div>
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
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Headphones className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">{conv.titulo}</div>
                <div className="text-[10px] text-success flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" /> WhatsApp
                </div>
              </div>
            </div>
            <button className="rounded-md border border-border p-2 hover:bg-surface-hover"><Phone className="h-4 w-4" /></button>
          </header>

          <div className="flex-1 overflow-auto p-4 space-y-3">
            {conv.mensagens.map((m, i) => (
              <div key={i} className={`flex ${m.de === "lider" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-2xl px-3.5 py-2.5 text-sm border ${
                  m.de === "lider"
                    ? "bg-success/10 border-success/30 text-foreground rounded-br-sm"
                    : "bg-surface border-border text-foreground rounded-bl-sm"
                }`}>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    {m.de === "lider" ? "Você" : (m.nome ?? "Atendimento")}
                  </div>
                  <div className="whitespace-pre-line">{m.texto}</div>
                  <div className="mt-1 text-[10px] text-muted-foreground text-right">{m.hora}</div>
                </div>
              </div>
            ))}
          </div>

          <footer className="border-t border-border p-3">
            <div className="flex items-end gap-2">
              <button className="rounded-md p-2 text-muted-foreground hover:bg-surface-hover"><Smile className="h-4 w-4" /></button>
              <button className="rounded-md p-2 text-muted-foreground hover:bg-surface-hover"><Paperclip className="h-4 w-4" /></button>
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                rows={1}
                placeholder="Mensagem..."
                className="flex-1 resize-none rounded-lg border border-border bg-background/40 px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
              />
              <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary-glow shadow-glow">
                <Send className="h-3.5 w-3.5" />
                Enviar
              </button>
            </div>
          </footer>
        </section>
      </div>

      <NovaConversaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
