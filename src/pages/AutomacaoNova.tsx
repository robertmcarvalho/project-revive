import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Bot, Zap, Clock, MessageSquare, GitBranch, Star,
  Play, Plus, Trash2, ChevronRight, Webhook, Mail, Database,
  Filter, Bell, Sparkles, Check, AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type Step = 1 | 2 | 3 | 4;

const templates = [
  { id: "blank", name: "Em branco", desc: "Comece do zero", icon: Sparkles, color: "text-muted-foreground bg-muted" },
  { id: "triagem", name: "Triagem com bot", desc: "Classifica e roteia conversas via IA", icon: Bot, color: "text-primary bg-primary/15" },
  { id: "rota", name: "Roteamento por palavra-chave", desc: "Distribui para filas com base no texto", icon: GitBranch, color: "text-channel-instagram bg-channel-instagram/15" },
  { id: "fora", name: "Fora do horário", desc: "Auto-resposta noturna e finais de semana", icon: Clock, color: "text-warning bg-warning/15" },
  { id: "csat", name: "Pesquisa CSAT", desc: "Envio automático após resolução", icon: Star, color: "text-channel-whatsapp bg-channel-whatsapp/15" },
  { id: "sla", name: "Escalação por SLA", desc: "Aciona supervisor quando o SLA estoura", icon: Zap, color: "text-destructive bg-destructive/15" },
];

const triggers = [
  { id: "new-conv", label: "Nova conversa", desc: "Disparado ao abrir um novo atendimento", icon: MessageSquare },
  { id: "msg-in", label: "Mensagem recebida", desc: "Cada nova mensagem do cliente", icon: MessageSquare },
  { id: "schedule", label: "Agendamento", desc: "Recorrência por horário/cron", icon: Clock },
  { id: "webhook", label: "Webhook", desc: "POST externo dispara o fluxo", icon: Webhook },
  { id: "sla", label: "SLA crítico", desc: "Quando tempo de resposta < limite", icon: AlertCircle },
  { id: "resolved", label: "Conversa resolvida", desc: "Quando o atendente finaliza", icon: Check },
];

const actionLib = [
  { id: "ai-reply", label: "Resposta com IA", icon: Bot, color: "text-primary" },
  { id: "route", label: "Rotear para fila", icon: GitBranch, color: "text-channel-instagram" },
  { id: "send-msg", label: "Enviar mensagem", icon: MessageSquare, color: "text-channel-whatsapp" },
  { id: "tag", label: "Aplicar etiqueta", icon: Filter, color: "text-warning" },
  { id: "notify", label: "Notificar equipe", icon: Bell, color: "text-destructive" },
  { id: "email", label: "Enviar e-mail", icon: Mail, color: "text-muted-foreground" },
  { id: "db", label: "Atualizar registro", icon: Database, color: "text-success" },
  { id: "wait", label: "Aguardar tempo", icon: Clock, color: "text-warning" },
];

const channels = ["WhatsApp", "Instagram", "Messenger", "Webchat", "E-mail"];

interface ActionItem { id: string; libId: string; label: string; }

const stepsMeta = [
  { n: 1, title: "Modelo" },
  { n: 2, title: "Gatilho" },
  { n: 3, title: "Ações" },
  { n: 4, title: "Detalhes" },
];

const AutomacaoNova = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [template, setTemplate] = useState<string>("blank");
  const [trigger, setTrigger] = useState<string>("");
  const [conditions, setConditions] = useState<{ field: string; op: string; value: string }[]>([
    { field: "canal", op: "é", value: "WhatsApp" },
  ]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["WhatsApp"]);
  const [enabled, setEnabled] = useState(true);
  const [priority, setPriority] = useState<"baixa" | "media" | "alta">("media");

  const addAction = (libId: string) => {
    const lib = actionLib.find(a => a.id === libId)!;
    setActions(prev => [...prev, { id: `${libId}-${Date.now()}`, libId, label: lib.label }]);
  };
  const removeAction = (id: string) => setActions(prev => prev.filter(a => a.id !== id));
  const toggleChannel = (c: string) =>
    setSelectedChannels(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const canNext =
    (step === 1 && !!template) ||
    (step === 2 && !!trigger) ||
    (step === 3 && actions.length > 0) ||
    (step === 4 && name.trim().length >= 3);

  const handleSave = () => {
    toast({ title: "Automação criada", description: `${name} foi ${enabled ? "ativada" : "salva como rascunho"}.` });
    navigate("/automacoes");
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-8 py-8">
        <Link to="/automacoes" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Automações
        </Link>

        <PageHeader
          eyebrow="Inteligência · Nova"
          title="Criar automação"
          description="Defina o gatilho, as ações e os detalhes do fluxo."
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/automacoes")}
                className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-surface-hover transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={!name || actions.length === 0 || !trigger}
                onClick={handleSave}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow transition-colors disabled:opacity-50"
              >
                Salvar automação
              </button>
            </div>
          }
        />

        {/* Stepper */}
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-border bg-surface p-3">
          {stepsMeta.map((s, i) => {
            const active = step === s.n;
            const done = step > s.n;
            return (
              <div key={s.n} className="flex items-center gap-2 flex-1">
                <button
                  onClick={() => setStep(s.n as Step)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors w-full",
                    active && "bg-primary/15 text-primary",
                    done && "text-success",
                    !active && !done && "text-muted-foreground hover:bg-surface-hover"
                  )}
                >
                  <span className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-mono",
                    active ? "bg-primary text-primary-foreground" : done ? "bg-success text-success-foreground" : "bg-muted"
                  )}>
                    {done ? <Check className="h-3 w-3" /> : s.n}
                  </span>
                  {s.title}
                </button>
                {i < stepsMeta.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-subtle-foreground" />}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main content */}
          <div className="rounded-xl border border-border bg-surface p-6">
            {step === 1 && (
              <>
                <div className="mb-4">
                  <h2 className="text-sm font-semibold">Escolha um ponto de partida</h2>
                  <p className="text-xs text-muted-foreground">Modelos pré-configurados aceleram a criação. Você pode ajustar tudo depois.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {templates.map(t => {
                    const Icon = t.icon;
                    const sel = template === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTemplate(t.id)}
                        className={cn(
                          "flex items-start gap-3 rounded-lg border p-4 text-left transition-all",
                          sel ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border bg-background/40 hover:border-border-strong"
                        )}
                      >
                        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", t.color)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{t.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{t.desc}</div>
                        </div>
                        {sel && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="mb-4">
                  <h2 className="text-sm font-semibold">Quando esta automação deve disparar?</h2>
                  <p className="text-xs text-muted-foreground">Selecione o evento que iniciará o fluxo.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {triggers.map(t => {
                    const Icon = t.icon;
                    const sel = trigger === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTrigger(t.id)}
                        className={cn(
                          "flex items-start gap-3 rounded-lg border p-3 text-left transition-all",
                          sel ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border bg-background/40 hover:border-border-strong"
                        )}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{t.label}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">{t.desc}</div>
                        </div>
                        {sel && <Check className="h-4 w-4 text-primary mt-1" />}
                      </button>
                    );
                  })}
                </div>

                {trigger && (
                  <div className="rounded-lg border border-border bg-background/40 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">Filtros (opcional)</div>
                      <button
                        onClick={() => setConditions([...conditions, { field: "canal", op: "é", value: "" }])}
                        className="flex items-center gap-1 text-xs text-primary hover:text-primary-glow"
                      >
                        <Plus className="h-3 w-3" /> Adicionar condição
                      </button>
                    </div>
                    <div className="space-y-2">
                      {conditions.map((c, i) => (
                        <div key={i} className="grid grid-cols-[1fr_100px_1fr_32px] gap-2">
                          <select
                            value={c.field}
                            onChange={e => {
                              const next = [...conditions]; next[i].field = e.target.value; setConditions(next);
                            }}
                            className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs"
                          >
                            <option value="canal">Canal</option>
                            <option value="texto">Texto da mensagem</option>
                            <option value="tag">Etiqueta</option>
                            <option value="hora">Horário</option>
                          </select>
                          <select
                            value={c.op}
                            onChange={e => {
                              const next = [...conditions]; next[i].op = e.target.value; setConditions(next);
                            }}
                            className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs"
                          >
                            <option>é</option>
                            <option>não é</option>
                            <option>contém</option>
                            <option>começa com</option>
                          </select>
                          <input
                            value={c.value}
                            onChange={e => {
                              const next = [...conditions]; next[i].value = e.target.value; setConditions(next);
                            }}
                            placeholder="Valor"
                            className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs"
                          />
                          <button
                            onClick={() => setConditions(conditions.filter((_, j) => j !== i))}
                            className="flex items-center justify-center rounded-md border border-border bg-surface text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <div className="mb-4">
                  <h2 className="text-sm font-semibold">Quais ações executar?</h2>
                  <p className="text-xs text-muted-foreground">Combine ações em sequência. Elas rodarão na ordem listada.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                  {actionLib.map(a => {
                    const Icon = a.icon;
                    return (
                      <button
                        key={a.id}
                        onClick={() => addAction(a.id)}
                        className="flex flex-col items-start gap-2 rounded-lg border border-border bg-background/40 p-3 text-left hover:border-primary/50 hover:bg-primary/5 transition-colors"
                      >
                        <Icon className={cn("h-4 w-4", a.color)} />
                        <span className="text-xs font-medium">{a.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-lg border border-dashed border-border bg-background/40 p-4 min-h-[140px]">
                  <div className="mb-3 text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">
                    Sequência de execução · {actions.length} {actions.length === 1 ? "ação" : "ações"}
                  </div>
                  {actions.length === 0 ? (
                    <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
                      Clique em uma ação acima para adicionar ao fluxo
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {actions.map((a, i) => {
                        const lib = actionLib.find(l => l.id === a.libId)!;
                        const Icon = lib.icon;
                        return (
                          <div key={a.id} className="flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-2">
                            <span className="font-mono text-[10px] text-subtle-foreground w-5">{i + 1}</span>
                            <Icon className={cn("h-4 w-4", lib.color)} />
                            <span className="flex-1 text-sm">{a.label}</span>
                            <button className="text-xs text-muted-foreground hover:text-foreground">Configurar</button>
                            <button onClick={() => removeAction(a.id)} className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="mb-4">
                  <h2 className="text-sm font-semibold">Detalhes finais</h2>
                  <p className="text-xs text-muted-foreground">Identifique sua automação e defina onde ela atua.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Nome *</label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ex.: Triagem inicial - WhatsApp"
                      className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Descrição</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={3}
                      placeholder="O que esta automação faz, para que time, em qual contexto…"
                      className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Canais</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {channels.map(c => {
                        const sel = selectedChannels.includes(c);
                        return (
                          <button
                            key={c}
                            onClick={() => toggleChannel(c)}
                            className={cn(
                              "rounded-full border px-3 py-1 text-xs transition-colors",
                              sel ? "border-primary bg-primary/15 text-primary" : "border-border bg-background/40 text-muted-foreground hover:border-border-strong"
                            )}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Prioridade</label>
                      <div className="mt-2 flex gap-2">
                        {(["baixa", "media", "alta"] as const).map(p => (
                          <button
                            key={p}
                            onClick={() => setPriority(p)}
                            className={cn(
                              "flex-1 rounded-md border px-2 py-1.5 text-xs capitalize",
                              priority === p ? "border-primary bg-primary/10 text-primary" : "border-border bg-background/40 text-muted-foreground"
                            )}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Estado inicial</label>
                      <button
                        onClick={() => setEnabled(!enabled)}
                        className="mt-2 flex w-full items-center justify-between rounded-md border border-border bg-background/40 px-3 py-1.5"
                      >
                        <span className="text-xs">{enabled ? "Ativa ao salvar" : "Salvar como rascunho"}</span>
                        <span className={cn(
                          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                          enabled ? "bg-primary" : "bg-muted"
                        )}>
                          <span className={cn(
                            "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                            enabled ? "translate-x-5" : "translate-x-1"
                          )} />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <button
                onClick={() => setStep(Math.max(1, step - 1) as Step)}
                disabled={step === 1}
                className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium disabled:opacity-40"
              >
                Voltar
              </button>
              {step < 4 ? (
                <button
                  onClick={() => setStep(Math.min(4, step + 1) as Step)}
                  disabled={!canNext}
                  className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow transition-colors disabled:opacity-50"
                >
                  Próximo <ChevronRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={!canNext || actions.length === 0 || !trigger}
                  className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow transition-colors disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" /> Criar automação
                </button>
              )}
            </div>
          </div>

          {/* Resumo */}
          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground mb-3">Resumo</div>
              <dl className="space-y-3 text-xs">
                <div>
                  <dt className="text-muted-foreground">Modelo</dt>
                  <dd className="mt-0.5 font-medium">{templates.find(t => t.id === template)?.name || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Gatilho</dt>
                  <dd className="mt-0.5 font-medium">{triggers.find(t => t.id === trigger)?.label || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Ações</dt>
                  <dd className="mt-0.5 font-medium">{actions.length}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Canais</dt>
                  <dd className="mt-0.5 flex flex-wrap gap-1">
                    {selectedChannels.length === 0
                      ? <span className="text-muted-foreground">—</span>
                      : selectedChannels.map(c => (
                        <span key={c} className="rounded bg-background/60 px-1.5 py-0.5 text-[10px] font-mono">{c}</span>
                      ))}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Nome</dt>
                  <dd className="mt-0.5 font-medium truncate">{name || "Sem título"}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-subtle-foreground mb-2">
                <Play className="h-3 w-3" /> Pré-visualização
              </div>
              <div className="space-y-1.5 font-mono text-[11px] text-muted-foreground">
                <div>quando <span className="text-primary">{triggers.find(t => t.id === trigger)?.label || "…"}</span></div>
                {conditions.filter(c => c.value).map((c, i) => (
                  <div key={i} className="pl-3">e <span className="text-warning">{c.field} {c.op} "{c.value}"</span></div>
                ))}
                <div>então:</div>
                {actions.length === 0
                  ? <div className="pl-3 italic">sem ações</div>
                  : actions.map((a, i) => (
                    <div key={a.id} className="pl-3">{i + 1}. <span className="text-success">{a.label}</span></div>
                  ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AutomacaoNova;
