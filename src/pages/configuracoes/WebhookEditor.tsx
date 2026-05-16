import { useState } from "react";
import {
  Copy, Eye, EyeOff, Plus, Trash2, X, Send, CheckCircle2,
  Key, Layers, ListChecks, Timer, Route, MessageSquare, Tag, ShieldCheck, Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============== Types ==============

export type Fila = {
  name: string;
  setores: string[];
  notifyEmail?: string;
  capacidade?: number;          // max conversas simultâneas na fila
  prioridade?: "baixa" | "media" | "alta" | "urgente";
  atendentes?: string[];        // ids/nomes dos atendentes vinculados
  transbordoPara?: string;      // nome da fila destino quando esta lotar
  slaPrimeiraResposta?: number; // minutos
  slaResolucao?: number;        // minutos
};

export type SetorCfg = {
  name: string;
  gestorEscalacao?: string;     // gestor responsável pela escalação
  demandas: string[];           // catálogo de demandas oferecidas
};

export type DemandaSlaOverride = {
  setor: string;
  demanda: string;
  slaPrimeiraResposta?: number;
  slaResolucao?: number;
};

export type HorarioComercial = {
  dom: { ativo: boolean; inicio: string; fim: string };
  seg: { ativo: boolean; inicio: string; fim: string };
  ter: { ativo: boolean; inicio: string; fim: string };
  qua: { ativo: boolean; inicio: string; fim: string };
  qui: { ativo: boolean; inicio: string; fim: string };
  sex: { ativo: boolean; inicio: string; fim: string };
  sab: { ativo: boolean; inicio: string; fim: string };
};

export type MensagensPadrao = {
  saudacao: string;
  foraHorario: string;
  filaCheia: string;
  encerramento: string;
  csat: string;
};

export type PerfilId = "entregador" | "farmacia" | "lider";

export type SocialWebhook = {
  id: string;
  name: string;
  number: string;
  phoneId: string;
  wabaId: string;
  token: string;
  verifyToken: string;
  callbackUrl: string;
  status: "ativo" | "pausado" | "erro";
  lastMessageAt: string;
  msgs24h: number;
  queues: Fila[];

  // Operação embarcada no webhook
  setoresCfg?: SetorCfg[];
  slaOverrides?: DemandaSlaOverride[];
  horario?: HorarioComercial;
  feriados?: string[];           // YYYY-MM-DD
  filaDefault?: string;          // roteamento padrão quando bot não classifica
  mensagens?: MensagensPadrao;
  tags?: string[];               // catálogo controlado
  perfisAceitos?: PerfilId[];
  camposPreCadastro?: Record<PerfilId, string[]>;
  csatAtivo?: boolean;
  limites?: { maxSimultaneasPorAtendente: number; timeoutInatividadeMin: number };
};

// ============== Defaults ==============

const horarioDefault = (): HorarioComercial => ({
  dom: { ativo: false, inicio: "08:00", fim: "18:00" },
  seg: { ativo: true, inicio: "08:00", fim: "18:00" },
  ter: { ativo: true, inicio: "08:00", fim: "18:00" },
  qua: { ativo: true, inicio: "08:00", fim: "18:00" },
  qui: { ativo: true, inicio: "08:00", fim: "18:00" },
  sex: { ativo: true, inicio: "08:00", fim: "18:00" },
  sab: { ativo: false, inicio: "08:00", fim: "12:00" },
});

const mensagensDefault = (): MensagensPadrao => ({
  saudacao: "Olá! Bem-vindo à Acme. Como podemos ajudar hoje?",
  foraHorario: "Estamos fora do horário de atendimento. Retornaremos no próximo turno.",
  filaCheia: "Nossa fila está com alto volume. Você está na lista, retornaremos em instantes.",
  encerramento: "Atendimento encerrado. Obrigado pelo contato!",
  csat: "De 1 a 5, como você avalia nosso atendimento?",
});

const ATENDENTES_DISPONIVEIS = [
  "Ana Souza", "Bruno Lima", "Carla Mendes", "Diego Alves", "Eduarda Pires", "Felipe Rocha",
];
const GESTORES_DISPONIVEIS = [
  "Ana Souza (Operação)", "Bruno Lima (Comercial)", "Carla Mendes (Financeiro)", "Diego Alves (Suporte)",
];
const PERFIS: { id: PerfilId; label: string }[] = [
  { id: "entregador", label: "Entregador" },
  { id: "farmacia", label: "Farmácia" },
  { id: "lider", label: "Líder" },
];
const CAMPOS_DISPONIVEIS = ["Nome", "CPF/CNPJ", "Telefone", "E-mail", "Razão Social", "Cidade", "Cargo"];

// ============== Editor ==============

type TabId = "credenciais" | "setores" | "demandas" | "sla" | "rota" | "mensagens" | "perfis" | "operacao";

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: "credenciais", label: "Credenciais", icon: Key },
  { id: "setores", label: "Setores & Filas", icon: Layers },
  { id: "demandas", label: "Demandas", icon: ListChecks },
  { id: "sla", label: "SLA & Horário", icon: Timer },
  { id: "rota", label: "Roteamento", icon: Route },
  { id: "mensagens", label: "Mensagens", icon: MessageSquare },
  { id: "perfis", label: "Perfis & Tags", icon: Tag },
  { id: "operacao", label: "Operação", icon: Settings2 },
];

export const WebhookEditor = ({
  kind, labels, webhook, setoresGlobais, setSetoresGlobais, emailsNotificacao, onClose, onSave,
}: {
  kind: "whatsapp" | "instagram";
  labels: { id: string; waba: string; token: string; number: string };
  webhook: SocialWebhook | null;
  setoresGlobais: string[];
  setSetoresGlobais: (s: string[]) => void;
  emailsNotificacao: string[];
  onClose: () => void;
  onSave: (w: SocialWebhook) => void;
}) => {
  const initial: SocialWebhook = webhook ?? {
    id: "", name: "", number: "", phoneId: "", wabaId: "",
    token: "", verifyToken: "",
    callbackUrl: `https://api.acme.com/${kind === "whatsapp" ? "wa" : "ig"}/webhooks/new`,
    status: "ativo", lastMessageAt: "—", msgs24h: 0, queues: [],
  };

  const [tab, setTab] = useState<TabId>("credenciais");
  const [showToken, setShowToken] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const flash = (m: string) => { setFeedback(m); setTimeout(() => setFeedback(null), 1600); };

  // Cabeçalho/credenciais
  const [name, setName] = useState(initial.name);
  const [number, setNumber] = useState(initial.number);
  const [phoneId, setPhoneId] = useState(initial.phoneId);
  const [wabaId, setWabaId] = useState(initial.wabaId);
  const [token, setToken] = useState(initial.token);
  const [verifyToken, setVerifyToken] = useState(initial.verifyToken);
  const [testing, setTesting] = useState<"idle" | "loading" | "ok" | "err">("idle");

  // Setores & filas
  const [filas, setFilas] = useState<Fila[]>(
    initial.queues.map(f => ({ capacidade: 50, prioridade: "media" as const, atendentes: [], ...f }))
  );
  const [setoresCfg, setSetoresCfg] = useState<SetorCfg[]>(
    initial.setoresCfg ?? setoresGlobais.map(s => ({ name: s, demandas: [] }))
  );
  const [novaFila, setNovaFila] = useState("");
  const [novoSetor, setNovoSetor] = useState("");

  // SLA overrides por demanda
  const [overrides, setOverrides] = useState<DemandaSlaOverride[]>(initial.slaOverrides ?? []);

  // Horário & feriados
  const [horario, setHorario] = useState<HorarioComercial>(initial.horario ?? horarioDefault());
  const [feriados, setFeriados] = useState<string[]>(initial.feriados ?? []);
  const [novoFeriado, setNovoFeriado] = useState("");

  // Roteamento padrão
  const [filaDefault, setFilaDefault] = useState<string>(initial.filaDefault ?? "");

  // Mensagens padrão
  const [mensagens, setMensagens] = useState<MensagensPadrao>(initial.mensagens ?? mensagensDefault());

  // Perfis, tags, campos
  const [perfisAceitos, setPerfisAceitos] = useState<PerfilId[]>(initial.perfisAceitos ?? ["entregador", "farmacia", "lider"]);
  const [tags, setTags] = useState<string[]>(initial.tags ?? ["cadastro pendente", "vip", "urgente"]);
  const [novaTag, setNovaTag] = useState("");
  const [camposPre, setCamposPre] = useState<Record<PerfilId, string[]>>(
    initial.camposPreCadastro ?? { entregador: ["Nome", "CPF/CNPJ", "Telefone"], farmacia: ["Razão Social", "Cidade", "E-mail"], lider: ["Nome", "Cargo", "E-mail"] }
  );

  // Operação
  const [csatAtivo, setCsatAtivo] = useState<boolean>(initial.csatAtivo ?? true);
  const [limites, setLimites] = useState(initial.limites ?? { maxSimultaneasPorAtendente: 5, timeoutInatividadeMin: 10 });

  // ===== handlers =====
  const addFila = () => {
    const n = novaFila.trim();
    if (!n) return flash("Informe o nome da fila");
    if (filas.some(f => f.name.toLowerCase() === n.toLowerCase())) return flash("Fila já existe");
    setFilas([...filas, { name: n, setores: [], notifyEmail: "", capacidade: 50, prioridade: "media", atendentes: [] }]);
    setNovaFila("");
  };
  const updateFila = (name: string, patch: Partial<Fila>) =>
    setFilas(filas.map(f => f.name === name ? { ...f, ...patch } : f));
  const removeFila = (name: string) => {
    setFilas(filas.filter(f => f.name !== name));
    if (filaDefault === name) setFilaDefault("");
  };

  const addSetor = () => {
    const s = novoSetor.trim();
    if (!s) return flash("Informe o nome do setor");
    if (setoresCfg.some(x => x.name.toLowerCase() === s.toLowerCase())) return flash("Setor já existe");
    setSetoresCfg([...setoresCfg, { name: s, demandas: [] }]);
    if (!setoresGlobais.includes(s)) setSetoresGlobais([...setoresGlobais, s]);
    setNovoSetor("");
  };
  const updateSetor = (name: string, patch: Partial<SetorCfg>) =>
    setSetoresCfg(setoresCfg.map(s => s.name === name ? { ...s, ...patch } : s));
  const removeSetor = (name: string) => {
    setSetoresCfg(setoresCfg.filter(s => s.name !== name));
    setFilas(filas.map(f => ({ ...f, setores: f.setores.filter(x => x !== name) })));
  };

  const handleSave = () => {
    onSave({
      ...initial,
      name, number, phoneId, wabaId, token, verifyToken,
      queues: filas,
      setoresCfg, slaOverrides: overrides, horario, feriados,
      filaDefault, mensagens, perfisAceitos, tags, camposPreCadastro: camposPre,
      csatAtivo, limites,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="flex w-full max-w-5xl flex-col rounded-xl border border-border bg-surface shadow-xl max-h-[92vh] overflow-hidden">
        {/* header */}
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="text-sm font-semibold">{webhook ? `Editar ${name || "webhook"}` : `Novo webhook ${kind === "whatsapp" ? "WhatsApp" : "Instagram"}`}</h3>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Tudo da operação deste canal fica vinculado ao webhook: setores, filas, demandas, SLA, mensagens e regras.</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>

        {/* body com sidebar de abas */}
        <div className="flex min-h-0 flex-1">
          <nav className="w-48 shrink-0 border-r border-border bg-background/30 p-2 space-y-0.5 overflow-y-auto">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors",
                  tab === t.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-surface-hover"
                )}
              >
                <t.icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            ))}
          </nav>

          <div className="flex-1 overflow-y-auto p-6">
            {tab === "credenciais" && (
              <div className="space-y-4">
                <SectionTitle title="Credenciais Meta Cloud" desc="A plataforma usa estas credenciais automaticamente." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Nome de exibição" value={name} onChange={setName} />
                  <Field label={labels.number} value={number} onChange={setNumber} mono />
                  <Field label={labels.id} value={phoneId} onChange={setPhoneId} mono />
                  <Field label={labels.waba} value={wabaId} onChange={setWabaId} mono />
                </div>
                <div>
                  <Lbl>{labels.token}</Lbl>
                  <div className="mt-1 flex gap-2">
                    <input type={showToken ? "text" : "password"} value={token} onChange={e => setToken(e.target.value)} className="flex-1 rounded-md border border-border bg-background/40 px-3 py-2 font-mono text-xs" />
                    <button type="button" onClick={() => setShowToken(s => !s)} className="rounded-md border border-border px-3 hover:bg-surface-hover">
                      {showToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <Field label="Verify Token" value={verifyToken} onChange={setVerifyToken} mono />
                <div>
                  <Lbl>Callback URL (configure na Meta)</Lbl>
                  <div className="mt-1 flex gap-2">
                    <input readOnly value={initial.callbackUrl} className="flex-1 rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs" />
                    <button type="button" onClick={() => navigator.clipboard.writeText(initial.callbackUrl)} className="rounded-md border border-border px-3 hover:bg-surface-hover"><Copy className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button type="button" onClick={() => { setTesting("loading"); setTimeout(() => setTesting(Math.random() > 0.1 ? "ok" : "err"), 800); }} className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-[11px] hover:bg-surface-hover">
                    <Send className="h-3 w-3" /> Testar conexão
                  </button>
                  {testing === "loading" && <span className="text-[11px] text-muted-foreground">Testando…</span>}
                  {testing === "ok" && <span className="flex items-center gap-1 text-[11px] text-success"><CheckCircle2 className="h-3 w-3" /> OK</span>}
                  {testing === "err" && <span className="text-[11px] text-destructive">Falha — verifique credenciais</span>}
                </div>
              </div>
            )}

            {tab === "setores" && (
              <div className="space-y-5">
                <SectionTitle title="Setores da operação" desc="Lista local desta operação. Cada setor pode ter gestor de escalação e catálogo de demandas (na aba Demandas)." />
                <div className="flex gap-2">
                  <input value={novoSetor} onChange={e => setNovoSetor(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSetor())} placeholder="Novo setor (ex.: Comercial)" className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-xs" />
                  <button onClick={addSetor} className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow"><Plus className="h-3 w-3" /> Setor</button>
                </div>
                <div className="space-y-2">
                  {setoresCfg.map(s => (
                    <div key={s.name} className="rounded-md border border-border bg-background/40 p-3">
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">{s.name}</span>
                        <button onClick={() => removeSetor(s.name)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-3 w-3" /></button>
                      </div>
                      <div className="mt-2">
                        <Lbl>Gestor de escalação</Lbl>
                        <select value={s.gestorEscalacao ?? ""} onChange={e => updateSetor(s.name, { gestorEscalacao: e.target.value })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs">
                          <option value="">— Sem gestor —</option>
                          {GESTORES_DISPONIVEIS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <SectionTitle title="Filas" desc="Cada fila pode conter setores, atendentes, capacidade, prioridade e regra de transbordo." />
                <div className="flex gap-2">
                  <input value={novaFila} onChange={e => setNovaFila(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addFila())} placeholder="Nome da fila (ex.: Geral, Vendas)" className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-xs" />
                  <button onClick={addFila} className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow"><Plus className="h-3 w-3" /> Fila</button>
                </div>
                <div className="space-y-2">
                  {filas.map(f => (
                    <div key={f.name} className="rounded-md border border-border bg-background/40 p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">{f.name}</span>
                        <button onClick={() => removeFila(f.name)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-3 w-3" /></button>
                      </div>
                      <div>
                        <Lbl>Setores vinculados</Lbl>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {setoresCfg.map(s => {
                            const on = f.setores.includes(s.name);
                            return (
                              <button key={s.name} onClick={() => updateFila(f.name, { setores: on ? f.setores.filter(x => x !== s.name) : [...f.setores, s.name] })} className={cn("rounded-md border px-2 py-1 text-[10px]", on ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-surface-hover")}>
                                {on && "✓ "}{s.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <Lbl>Atendentes vinculados</Lbl>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {ATENDENTES_DISPONIVEIS.map(a => {
                            const on = (f.atendentes ?? []).includes(a);
                            return (
                              <button key={a} onClick={() => updateFila(f.name, { atendentes: on ? f.atendentes!.filter(x => x !== a) : [...(f.atendentes ?? []), a] })} className={cn("rounded-md border px-2 py-1 text-[10px]", on ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-surface-hover")}>
                                {on && "✓ "}{a}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div>
                          <Lbl>Capacidade</Lbl>
                          <input type="number" value={f.capacidade ?? 50} onChange={e => updateFila(f.name, { capacidade: Number(e.target.value) })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs" />
                        </div>
                        <div>
                          <Lbl>Prioridade</Lbl>
                          <select value={f.prioridade ?? "media"} onChange={e => updateFila(f.name, { prioridade: e.target.value as any })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs">
                            <option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option><option value="urgente">Urgente</option>
                          </select>
                        </div>
                        <div>
                          <Lbl>Transbordo para</Lbl>
                          <select value={f.transbordoPara ?? ""} onChange={e => updateFila(f.name, { transbordoPara: e.target.value })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs">
                            <option value="">— Nenhum —</option>
                            {filas.filter(x => x.name !== f.name).map(x => <option key={x.name} value={x.name}>{x.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <Lbl>E-mail de notificação</Lbl>
                        <select value={f.notifyEmail ?? ""} onChange={e => updateFila(f.name, { notifyEmail: e.target.value })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs">
                          <option value="">— Nenhum —</option>
                          {emailsNotificacao.map(em => <option key={em} value={em}>{em}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                  {filas.length === 0 && <Empty>Nenhuma fila. Adicione uma fila acima.</Empty>}
                </div>
              </div>
            )}

            {tab === "demandas" && (
              <div className="space-y-4">
                <SectionTitle title="Demandas por setor" desc="Catálogo oferecido pelo bot quando o contato cai em cada setor. Editável apenas aqui — não fica livre no fluxo." />
                {setoresCfg.length === 0 && <Empty>Crie setores na aba "Setores & Filas" primeiro.</Empty>}
                {setoresCfg.map(s => (
                  <DemandasSetor key={s.name} setor={s} onChange={d => updateSetor(s.name, { demandas: d })} />
                ))}
              </div>
            )}

            {tab === "sla" && (
              <div className="space-y-5">
                <SectionTitle title="SLA por fila" desc="Tempo de 1ª resposta e resolução. Vale dentro do horário comercial definido abaixo." />
                {filas.length === 0 && <Empty>Crie filas primeiro.</Empty>}
                {filas.map(f => (
                  <div key={f.name} className="rounded-md border border-border bg-background/40 p-3">
                    <div className="text-xs font-medium">{f.name}</div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <Lbl>1ª resposta (min)</Lbl>
                        <input type="number" value={f.slaPrimeiraResposta ?? 15} onChange={e => updateFila(f.name, { slaPrimeiraResposta: Number(e.target.value) })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs" />
                      </div>
                      <div>
                        <Lbl>Resolução (min)</Lbl>
                        <input type="number" value={f.slaResolucao ?? 240} onChange={e => updateFila(f.name, { slaResolucao: Number(e.target.value) })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs" />
                      </div>
                    </div>
                  </div>
                ))}

                <SectionTitle title="SLA por demanda (override)" desc="Use quando uma demanda for mais crítica que o SLA da fila." />
                <OverridesEditor setoresCfg={setoresCfg} overrides={overrides} setOverrides={setOverrides} />

                <SectionTitle title="Horário de atendimento" desc="Fora deste horário o canal usa a mensagem de fora de horário." />
                <div className="rounded-md border border-border bg-background/40 p-3 space-y-1">
                  {(Object.keys(horario) as (keyof HorarioComercial)[]).map(dia => {
                    const d = horario[dia];
                    return (
                      <div key={dia} className="flex items-center gap-2 text-xs">
                        <button onClick={() => setHorario({ ...horario, [dia]: { ...d, ativo: !d.ativo } })} className={cn("w-12 rounded px-2 py-1 text-[10px] font-medium uppercase", d.ativo ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>{dia}</button>
                        <input type="time" value={d.inicio} onChange={e => setHorario({ ...horario, [dia]: { ...d, inicio: e.target.value } })} disabled={!d.ativo} className="rounded-md border border-border bg-background px-2 py-1 text-xs disabled:opacity-50" />
                        <span className="text-muted-foreground">até</span>
                        <input type="time" value={d.fim} onChange={e => setHorario({ ...horario, [dia]: { ...d, fim: e.target.value } })} disabled={!d.ativo} className="rounded-md border border-border bg-background px-2 py-1 text-xs disabled:opacity-50" />
                      </div>
                    );
                  })}
                </div>

                <SectionTitle title="Feriados" desc="Datas em que o canal segue regra de fora de horário, mesmo em dia útil." />
                <div className="flex gap-2">
                  <input type="date" value={novoFeriado} onChange={e => setNovoFeriado(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2 text-xs" />
                  <button onClick={() => { if (novoFeriado && !feriados.includes(novoFeriado)) { setFeriados([...feriados, novoFeriado].sort()); setNovoFeriado(""); } }} className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow"><Plus className="h-3 w-3" /> Adicionar</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {feriados.map(f => (
                    <span key={f} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px]">
                      {f}
                      <button onClick={() => setFeriados(feriados.filter(x => x !== f))} className="text-muted-foreground hover:text-destructive"><X className="h-2.5 w-2.5" /></button>
                    </span>
                  ))}
                  {feriados.length === 0 && <span className="text-[11px] text-muted-foreground">Nenhum feriado cadastrado.</span>}
                </div>
              </div>
            )}

            {tab === "rota" && (
              <div className="space-y-4">
                <SectionTitle title="Roteamento padrão" desc="Fila para onde o contato vai quando o bot não consegue classificar." />
                <select value={filaDefault} onChange={e => setFilaDefault(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs">
                  <option value="">— Selecione uma fila —</option>
                  {filas.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                </select>
                <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-[11px] text-muted-foreground">
                  Política de transbordo entre filas é definida individualmente na aba <strong>Setores & Filas</strong> (campo "Transbordo para").
                </div>
                <SectionTitle title="Gestores de escalação" desc='Visão consolidada — edite por setor na aba "Setores & Filas".' />
                <div className="space-y-1.5">
                  {setoresCfg.map(s => (
                    <div key={s.name} className="flex items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2 text-xs">
                      <span>{s.name}</span>
                      <span className="text-muted-foreground">{s.gestorEscalacao || "— sem gestor —"}</span>
                    </div>
                  ))}
                  {setoresCfg.length === 0 && <Empty>Nenhum setor configurado.</Empty>}
                </div>
              </div>
            )}

            {tab === "mensagens" && (
              <div className="space-y-4">
                <SectionTitle title="Mensagens padrão do canal" desc="Aplicadas em todos os fluxos deste canal. Centralizam a comunicação na operação, não no fluxo." />
                {(Object.keys(mensagens) as (keyof MensagensPadrao)[]).map(k => (
                  <div key={k}>
                    <Lbl>{k === "foraHorario" ? "Fora de horário" : k === "filaCheia" ? "Fila cheia" : k === "csat" ? "Pesquisa CSAT" : k.charAt(0).toUpperCase() + k.slice(1)}</Lbl>
                    <textarea value={mensagens[k]} onChange={e => setMensagens({ ...mensagens, [k]: e.target.value })} rows={2} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs" />
                  </div>
                ))}
              </div>
            )}

            {tab === "perfis" && (
              <div className="space-y-5">
                <SectionTitle title="Perfis aceitos neste canal" desc="Ex.: webhook B2B só atende Farmácia/Líder; webhook do consumidor só Entregador." />
                <div className="flex gap-1.5">
                  {PERFIS.map(p => {
                    const on = perfisAceitos.includes(p.id);
                    return (
                      <button key={p.id} onClick={() => setPerfisAceitos(on ? perfisAceitos.filter(x => x !== p.id) : [...perfisAceitos, p.id])} className={cn("rounded-md border px-3 py-1.5 text-xs", on ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-surface-hover")}>
                        {on && "✓ "}{p.label}
                      </button>
                    );
                  })}
                </div>

                <SectionTitle title="Campos obrigatórios de pré-cadastro" desc="Por perfil aceito." />
                {perfisAceitos.map(pid => {
                  const p = PERFIS.find(x => x.id === pid)!;
                  return (
                    <div key={pid} className="rounded-md border border-border bg-background/40 p-3">
                      <div className="text-xs font-medium">{p.label}</div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {CAMPOS_DISPONIVEIS.map(c => {
                          const on = (camposPre[pid] ?? []).includes(c);
                          return (
                            <button key={c} onClick={() => setCamposPre({ ...camposPre, [pid]: on ? camposPre[pid].filter(x => x !== c) : [...(camposPre[pid] ?? []), c] })} className={cn("rounded-md border px-2 py-1 text-[10px]", on ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-surface-hover")}>
                              {on && "✓ "}{c}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <SectionTitle title="Tags da operação" desc="Catálogo controlado. Atendentes só podem aplicar tags desta lista." />
                <div className="flex gap-2">
                  <input value={novaTag} onChange={e => setNovaTag(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), novaTag.trim() && !tags.includes(novaTag.trim()) && (setTags([...tags, novaTag.trim()]), setNovaTag("")))} placeholder="Nova tag" className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-xs" />
                  <button onClick={() => { if (novaTag.trim() && !tags.includes(novaTag.trim())) { setTags([...tags, novaTag.trim()]); setNovaTag(""); } }} className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow"><Plus className="h-3 w-3" /> Tag</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(t => (
                    <span key={t} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px]">
                      {t}
                      <button onClick={() => setTags(tags.filter(x => x !== t))} className="text-muted-foreground hover:text-destructive"><X className="h-2.5 w-2.5" /></button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {tab === "operacao" && (
              <div className="space-y-5">
                <SectionTitle title="Pesquisa de satisfação (CSAT)" desc="Disparada automaticamente ao finalizar o atendimento. Metodologia CSAT (1–5)." />
                <div className="flex items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2">
                  <div className="text-xs">CSAT ativo ao encerrar atendimento</div>
                  <button onClick={() => setCsatAtivo(!csatAtivo)} className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors", csatAtivo ? "bg-primary" : "bg-muted")}>
                    <span className={cn("inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform", csatAtivo ? "translate-x-5" : "translate-x-1")} />
                  </button>
                </div>

                <SectionTitle title="Limites operacionais" desc="Controle de capacidade por atendente e inatividade." />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Lbl>Máx. conversas simultâneas por atendente</Lbl>
                    <input type="number" value={limites.maxSimultaneasPorAtendente} onChange={e => setLimites({ ...limites, maxSimultaneasPorAtendente: Number(e.target.value) })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs" />
                  </div>
                  <div>
                    <Lbl>Timeout de inatividade (min)</Lbl>
                    <input type="number" value={limites.timeoutInatividadeMin} onChange={e => setLimites({ ...limites, timeoutInatividadeMin: Number(e.target.value) })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs" />
                  </div>
                </div>

                <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-[11px] text-muted-foreground flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Todas as configurações acima ficam atreladas a este webhook. Automações deste canal herdam estes valores e só sobrescrevem em casos específicos.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <div className="text-[11px] text-muted-foreground">
            {filas.length} fila{filas.length !== 1 ? "s" : ""} · {setoresCfg.length} setor{setoresCfg.length !== 1 ? "es" : ""} · {overrides.length} override{overrides.length !== 1 ? "s" : ""} de SLA
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="rounded-md border border-border px-3 py-1.5 text-xs">Cancelar</button>
            <button onClick={handleSave} className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow">Salvar webhook</button>
          </div>
        </div>
      </div>
      {feedback && (
        <div className="pointer-events-none fixed left-1/2 top-6 z-[60] -translate-x-1/2 rounded-md bg-foreground px-3 py-1.5 text-[11px] font-medium text-background shadow-lg">
          {feedback}
        </div>
      )}
    </div>
  );
};

// ============== sub-components ==============

const Lbl = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">{children}</label>
);

const SectionTitle = ({ title, desc }: { title: string; desc?: string }) => (
  <div>
    <h4 className="text-xs font-semibold">{title}</h4>
    {desc && <p className="mt-0.5 text-[11px] text-muted-foreground">{desc}</p>}
  </div>
);

const Empty = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-md border border-dashed border-border px-3 py-4 text-center text-[11px] text-muted-foreground">{children}</div>
);

const Field = ({ label, value, onChange, mono }: { label: string; value: string; onChange?: (v: string) => void; mono?: boolean }) => (
  <div>
    <Lbl>{label}</Lbl>
    <input
      value={value}
      onChange={e => onChange?.(e.target.value)}
      className={cn("mt-1 w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20", mono && "font-mono text-xs")}
    />
  </div>
);

const DemandasSetor = ({ setor, onChange }: { setor: SetorCfg; onChange: (d: string[]) => void }) => {
  const [nova, setNova] = useState("");
  const add = () => {
    const n = nova.trim();
    if (!n || setor.demandas.includes(n)) return;
    onChange([...setor.demandas, n]);
    setNova("");
  };
  return (
    <div className="rounded-md border border-border bg-background/40 p-3">
      <div className="flex items-center justify-between">
        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">{setor.name}</span>
        <span className="text-[10px] text-muted-foreground">{setor.demandas.length} demanda{setor.demandas.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="mt-2 flex gap-2">
        <input value={nova} onChange={e => setNova(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())} placeholder="Nova demanda (ex.: Cancelamento, Faturamento)" className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-xs" />
        <button onClick={add} className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow"><Plus className="h-3 w-3" /></button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {setor.demandas.map(d => (
          <span key={d} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px]">
            {d}
            <button onClick={() => onChange(setor.demandas.filter(x => x !== d))} className="text-muted-foreground hover:text-destructive"><X className="h-2.5 w-2.5" /></button>
          </span>
        ))}
      </div>
    </div>
  );
};

const OverridesEditor = ({ setoresCfg, overrides, setOverrides }: { setoresCfg: SetorCfg[]; overrides: DemandaSlaOverride[]; setOverrides: (o: DemandaSlaOverride[]) => void }) => {
  const [setor, setSetor] = useState("");
  const [demanda, setDemanda] = useState("");
  const [primeira, setPrimeira] = useState<number>(5);
  const [resolucao, setResolucao] = useState<number>(60);
  const demandasDoSetor = setoresCfg.find(s => s.name === setor)?.demandas ?? [];
  const add = () => {
    if (!setor || !demanda) return;
    if (overrides.some(o => o.setor === setor && o.demanda === demanda)) return;
    setOverrides([...overrides, { setor, demanda, slaPrimeiraResposta: primeira, slaResolucao: resolucao }]);
    setDemanda("");
  };
  return (
    <div className="rounded-md border border-border bg-background/40 p-3 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <select value={setor} onChange={e => { setSetor(e.target.value); setDemanda(""); }} className="rounded-md border border-border bg-background px-2 py-2 text-xs">
          <option value="">Setor…</option>
          {setoresCfg.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
        </select>
        <select value={demanda} onChange={e => setDemanda(e.target.value)} disabled={!setor} className="rounded-md border border-border bg-background px-2 py-2 text-xs disabled:opacity-50">
          <option value="">Demanda…</option>
          {demandasDoSetor.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <input type="number" value={primeira} onChange={e => setPrimeira(Number(e.target.value))} placeholder="1ª resp (min)" className="rounded-md border border-border bg-background px-2 py-2 text-xs" />
        <input type="number" value={resolucao} onChange={e => setResolucao(Number(e.target.value))} placeholder="Resolução (min)" className="rounded-md border border-border bg-background px-2 py-2 text-xs" />
      </div>
      <button onClick={add} disabled={!setor || !demanda} className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow disabled:opacity-50"><Plus className="h-3 w-3" /> Adicionar override</button>
      <div className="space-y-1">
        {overrides.map((o, i) => (
          <div key={i} className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-xs">
            <span><strong>{o.setor}</strong> · {o.demanda} <span className="text-muted-foreground">— 1ª resp {o.slaPrimeiraResposta}min · resolução {o.slaResolucao}min</span></span>
            <button onClick={() => setOverrides(overrides.filter((_, idx) => idx !== i))} className="text-destructive hover:text-destructive/80"><Trash2 className="h-3 w-3" /></button>
          </div>
        ))}
        {overrides.length === 0 && <Empty>Nenhum override. SLA da fila será usado.</Empty>}
      </div>
    </div>
  );
};
