import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Check, ChevronRight, FileText, Send, Users, Calendar as CalIcon,
  Filter, Sparkles, MessageSquare, Image as ImageIcon, Paperclip, Eye, Save, Rocket,
  Clock, ShieldCheck, Trash2, Plus, X, Search, Upload, Variable, AlertCircle, Zap,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type StepKey = "template" | "audience" | "message" | "schedule" | "review";

const steps: { key: StepKey; label: string; icon: typeof FileText }[] = [
  { key: "template", label: "Template", icon: FileText },
  { key: "audience", label: "Audiência", icon: Users },
  { key: "message", label: "Mensagem", icon: MessageSquare },
  { key: "schedule", label: "Envio", icon: CalIcon },
  { key: "review", label: "Revisão", icon: Eye },
];

const templates = [
  { id: "promo", name: "Promocional", desc: "Ofertas, descontos e cupons", category: "MARKETING", samples: ["promo_maes_2026", "blackfriday_v2", "cashback_abril"] },
  { id: "reativacao", name: "Reativação", desc: "Recuperar clientes inativos", category: "MARKETING", samples: ["reativacao_v3", "voltapracasa_60d"] },
  { id: "transacional", name: "Transacional", desc: "Confirmações, status e lembretes", category: "UTILITY", samples: ["pedido_confirmado", "entrega_a_caminho"] },
  { id: "csat", name: "Pesquisa CSAT", desc: "Avaliação de atendimento", category: "UTILITY", samples: ["csat_semanal", "nps_pos_compra"] },
  { id: "lancamento", name: "Lançamento", desc: "Anúncio de novidades", category: "MARKETING", samples: ["lancamento_vitd3"] },
  { id: "blank", name: "Em branco", desc: "Começar do zero, sem template", category: "—", samples: [] },
];

const audienceLists = [
  { id: "all", name: "Todos os contatos opt-in", count: 48230 },
  { id: "vip", name: "Clientes VIP", count: 1840 },
  { id: "inativos90", name: "Inativos há 90+ dias", count: 4521 },
  { id: "diabetes", name: "Programa Diabetes", count: 2104 },
  { id: "lead-frio", name: "Leads frios", count: 8945 },
];

const channels = [
  { id: "whatsapp", label: "WhatsApp", color: "bg-channel-whatsapp" },
  { id: "sms", label: "SMS", color: "bg-channel-sms" },
  { id: "email", label: "E-mail", color: "bg-channel-email" },
];

const variables = ["{{nome}}", "{{primeiro_nome}}", "{{cidade}}", "{{cupom}}", "{{link}}", "{{farmacia}}"];

type Filter = { id: string; field: string; op: string; value: string };

const CampanhaNova = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<StepKey>("template");

  // Form state
  const [template, setTemplate] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState<string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["whatsapp"]);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [excludeOptOut, setExcludeOptOut] = useState(true);
  const [excludeRecent, setExcludeRecent] = useState(true);

  const [headerType, setHeaderType] = useState<"none" | "image" | "video">("none");
  const [body, setBody] = useState("Olá {{primeiro_nome}}! Aproveite nosso desconto exclusivo: use o cupom {{cupom}} e ganhe 15% OFF. Válido até amanhã.");
  const [footer, setFooter] = useState("Para parar de receber, responda SAIR.");
  const [buttons, setButtons] = useState<{ id: string; label: string; type: "url" | "quick"; value?: string }[]>([
    { id: "b1", label: "Ver oferta", type: "url", value: "https://" },
  ]);

  const [sendMode, setSendMode] = useState<"now" | "schedule">("schedule");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [throttle, setThrottle] = useState(120); // msgs/min
  const [windowStart, setWindowStart] = useState("08:00");
  const [windowEnd, setWindowEnd] = useState("20:00");
  const [respectQuietHours, setRespectQuietHours] = useState(true);
  const [abTest, setAbTest] = useState(false);

  // Derived
  const audienceCount = useMemo(() => {
    const base = audienceLists.filter(l => selectedLists.includes(l.id)).reduce((s, l) => s + l.count, 0);
    let n = base;
    filters.forEach(() => { n = Math.floor(n * 0.7); });
    if (excludeOptOut) n = Math.floor(n * 0.96);
    if (excludeRecent) n = Math.floor(n * 0.88);
    return n;
  }, [selectedLists, filters, excludeOptOut, excludeRecent]);

  const estCost = (audienceCount * 0.045).toFixed(2);
  const estDuration = throttle > 0 ? Math.ceil(audienceCount / throttle) : 0;

  const stepIdx = steps.findIndex(s => s.key === step);
  const canNext = (() => {
    if (step === "template") return !!template;
    if (step === "audience") return selectedLists.length > 0 && selectedChannels.length > 0;
    if (step === "message") return body.trim().length > 0;
    if (step === "schedule") return sendMode === "now" || (scheduleDate && scheduleTime);
    return true;
  })();

  const goNext = () => {
    if (stepIdx < steps.length - 1) setStep(steps[stepIdx + 1].key);
  };
  const goPrev = () => {
    if (stepIdx > 0) setStep(steps[stepIdx - 1].key);
  };

  const handleSaveDraft = () => {
    toast.success("Rascunho salvo", { description: name || "Campanha sem título" });
    navigate("/campanhas");
  };
  const handleLaunch = () => {
    if (!name) { toast.error("Dê um nome à campanha"); return; }
    toast.success(sendMode === "now" ? "Campanha enviada para fila" : `Campanha agendada para ${scheduleDate} ${scheduleTime}`);
    navigate("/campanhas");
  };

  const toggle = <T,>(arr: T[], v: T) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/campanhas" className="hover:text-foreground inline-flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> Campanhas</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Nova campanha</span>
        </div>

        <PageHeader
          eyebrow="Engajamento"
          title="Nova campanha"
          description="Configure template, audiência, agendamento e regras anti-ban."
          actions={
            <div className="flex items-center gap-2">
              <button onClick={handleSaveDraft} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-surface-elevated">
                <Save className="h-3.5 w-3.5" /> Salvar rascunho
              </button>
              <button onClick={handleLaunch} disabled={!canNext || step !== "review"} className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                step === "review" ? "bg-primary text-primary-foreground hover:bg-primary-glow" : "bg-muted text-muted-foreground cursor-not-allowed"
              )}>
                <Rocket className="h-3.5 w-3.5" /> {sendMode === "now" ? "Enviar agora" : "Agendar"}
              </button>
            </div>
          }
        />

        {/* Stepper */}
        <div className="mb-6 rounded-xl border border-border bg-surface p-2">
          <div className="grid grid-cols-5 gap-1">
            {steps.map((s, i) => {
              const active = s.key === step;
              const done = i < stepIdx;
              return (
                <button key={s.key} onClick={() => setStep(s.key)} className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors",
                  active ? "bg-primary/10" : done ? "hover:bg-surface-elevated" : "hover:bg-surface-elevated"
                )}>
                  <div className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-mono",
                    active ? "bg-primary text-primary-foreground" : done ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                  )}>
                    {done ? <Check className="h-3 w-3" /> : i + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-subtle-foreground">Passo {i + 1}</div>
                    <div className={cn("text-xs font-medium truncate", active ? "text-foreground" : "text-muted-foreground")}>{s.label}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Main panel */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {step === "template" && (
              <Section title="Escolha um template" desc="Templates pré-aprovados aceleram a publicação no WhatsApp Business.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {templates.map(t => {
                    const active = template === t.id;
                    return (
                      <button key={t.id} onClick={() => setTemplate(t.id)} className={cn(
                        "rounded-lg border p-4 text-left transition-all",
                        active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-background hover:bg-surface-elevated"
                      )}>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold tracking-tight">{t.name}</div>
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-mono uppercase text-muted-foreground">{t.category}</span>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">{t.desc}</div>
                        {t.samples.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {t.samples.map(s => (
                              <span key={s} className="rounded bg-background/60 border border-border px-1.5 py-0.5 text-[10px] font-mono text-subtle-foreground">{s}</span>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {template && template !== "blank" && (
                  <div className="mt-4">
                    <Label>Template aprovado</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input value={templateName} onChange={e => setTemplateName(e.target.value)}
                        placeholder="Buscar template aprovado pela Meta..."
                        className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                  </div>
                )}
              </Section>
            )}

            {step === "audience" && (
              <>
                <Section title="Canais de envio" desc="Selecione um ou mais canais. Mensagens diferentes podem ser configuradas por canal.">
                  <div className="flex flex-wrap gap-2">
                    {channels.map(c => {
                      const active = selectedChannels.includes(c.id);
                      return (
                        <button key={c.id} onClick={() => setSelectedChannels(toggle(selectedChannels, c.id))} className={cn(
                          "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                          active ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-surface-elevated"
                        )}>
                          <span className={cn("h-2 w-2 rounded-full", c.color)} />
                          {c.label}
                          {active && <Check className="h-3 w-3 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </Section>

                <Section title="Listas e segmentos" desc="Selecione listas de contatos. A audiência total é calculada em tempo real.">
                  <div className="space-y-1.5">
                    {audienceLists.map(l => {
                      const active = selectedLists.includes(l.id);
                      return (
                        <label key={l.id} className={cn(
                          "flex cursor-pointer items-center justify-between rounded-md border px-3 py-2.5 transition-colors",
                          active ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-surface-elevated"
                        )}>
                          <div className="flex items-center gap-3">
                            <input type="checkbox" checked={active} onChange={() => setSelectedLists(toggle(selectedLists, l.id))}
                              className="h-4 w-4 rounded border-input" />
                            <div>
                              <div className="text-sm font-medium">{l.name}</div>
                              <div className="text-[11px] text-muted-foreground font-mono">{l.count.toLocaleString("pt-BR")} contatos</div>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </Section>

                <Section title="Filtros adicionais" desc="Refine a audiência por atributos de contato." actions={
                  <button onClick={() => setFilters([...filters, { id: crypto.randomUUID(), field: "cidade", op: "igual a", value: "" }])}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] hover:bg-surface-elevated">
                    <Plus className="h-3 w-3" /> Adicionar filtro
                  </button>
                }>
                  {filters.length === 0 ? (
                    <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                      Nenhum filtro aplicado.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filters.map(f => (
                        <div key={f.id} className="flex items-center gap-2">
                          <select value={f.field} onChange={e => setFilters(filters.map(x => x.id === f.id ? { ...x, field: e.target.value } : x))}
                            className="rounded-md border border-input bg-background px-2 py-1.5 text-xs">
                            <option value="cidade">Cidade</option>
                            <option value="estado">Estado</option>
                            <option value="tag">Tag</option>
                            <option value="ultima_compra">Última compra</option>
                            <option value="ticket_medio">Ticket médio</option>
                          </select>
                          <select value={f.op} onChange={e => setFilters(filters.map(x => x.id === f.id ? { ...x, op: e.target.value } : x))}
                            className="rounded-md border border-input bg-background px-2 py-1.5 text-xs">
                            <option>igual a</option>
                            <option>diferente de</option>
                            <option>contém</option>
                            <option>maior que</option>
                          </select>
                          <input value={f.value} onChange={e => setFilters(filters.map(x => x.id === f.id ? { ...x, value: e.target.value } : x))}
                            placeholder="valor" className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs" />
                          <button onClick={() => setFilters(filters.filter(x => x.id !== f.id))} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                <Section title="Exclusões e compliance">
                  <div className="space-y-2">
                    <Toggle on={excludeOptOut} setOn={setExcludeOptOut} label="Excluir contatos com opt-out" desc="Obrigatório por LGPD/política Meta" required />
                    <Toggle on={excludeRecent} setOn={setExcludeRecent} label="Excluir quem recebeu campanha nas últimas 24h" desc="Reduz risco de bloqueio (anti-ban)" />
                  </div>
                </Section>
              </>
            )}

            {step === "message" && (
              <>
                <Section title="Cabeçalho">
                  <div className="flex gap-2">
                    {(["none", "image", "video"] as const).map(t => (
                      <button key={t} onClick={() => setHeaderType(t)} className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs",
                        headerType === t ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-surface-elevated"
                      )}>
                        {t === "none" ? "Sem mídia" : t === "image" ? <><ImageIcon className="h-3 w-3" /> Imagem</> : <><Paperclip className="h-3 w-3" /> Vídeo</>}
                      </button>
                    ))}
                  </div>
                  {headerType !== "none" && (
                    <div className="mt-3 rounded-md border-2 border-dashed border-border p-6 text-center">
                      <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                      <div className="mt-2 text-xs text-muted-foreground">Arraste ou clique para enviar {headerType === "image" ? "imagem (JPG, PNG até 5MB)" : "vídeo (MP4 até 16MB)"}</div>
                    </div>
                  )}
                </Section>

                <Section title="Corpo da mensagem" desc={`${body.length}/1024 caracteres`}>
                  <textarea value={body} onChange={e => setBody(e.target.value.slice(0, 1024))} rows={6}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  <div className="mt-2 flex flex-wrap gap-1">
                    {variables.map(v => (
                      <button key={v} onClick={() => setBody(body + " " + v)} className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-[10px] font-mono hover:bg-surface-elevated">
                        <Variable className="h-3 w-3" /> {v}
                      </button>
                    ))}
                  </div>
                </Section>

                <Section title="Rodapé (opcional)">
                  <input value={footer} onChange={e => setFooter(e.target.value.slice(0, 60))} placeholder="Texto pequeno abaixo da mensagem"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </Section>

                <Section title="Botões" desc="Até 3 botões. Use URL para links ou Quick Reply para respostas rápidas." actions={
                  buttons.length < 3 && (
                    <button onClick={() => setButtons([...buttons, { id: crypto.randomUUID(), label: "", type: "url", value: "" }])}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] hover:bg-surface-elevated">
                      <Plus className="h-3 w-3" /> Adicionar botão
                    </button>
                  )
                }>
                  {buttons.length === 0 ? (
                    <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">Sem botões.</div>
                  ) : (
                    <div className="space-y-2">
                      {buttons.map(b => (
                        <div key={b.id} className="flex items-center gap-2">
                          <select value={b.type} onChange={e => setButtons(buttons.map(x => x.id === b.id ? { ...x, type: e.target.value as "url" | "quick" } : x))}
                            className="rounded-md border border-input bg-background px-2 py-1.5 text-xs">
                            <option value="url">URL</option>
                            <option value="quick">Quick Reply</option>
                          </select>
                          <input value={b.label} onChange={e => setButtons(buttons.map(x => x.id === b.id ? { ...x, label: e.target.value } : x))}
                            placeholder="Texto do botão" className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs" />
                          {b.type === "url" && (
                            <input value={b.value || ""} onChange={e => setButtons(buttons.map(x => x.id === b.id ? { ...x, value: e.target.value } : x))}
                              placeholder="https://" className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs font-mono" />
                          )}
                          <button onClick={() => setButtons(buttons.filter(x => x.id !== b.id))} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              </>
            )}

            {step === "schedule" && (
              <>
                <Section title="Quando enviar?">
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { id: "now", label: "Enviar agora", desc: "Inicia imediatamente após confirmação", icon: Send },
                      { id: "schedule", label: "Agendar", desc: "Defina data e hora específicas", icon: CalIcon },
                    ] as const).map(o => {
                      const active = sendMode === o.id;
                      return (
                        <button key={o.id} onClick={() => setSendMode(o.id)} className={cn(
                          "flex items-start gap-3 rounded-lg border p-4 text-left",
                          active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-background hover:bg-surface-elevated"
                        )}>
                          <o.icon className="h-4 w-4 mt-0.5" />
                          <div>
                            <div className="text-sm font-semibold">{o.label}</div>
                            <div className="mt-0.5 text-xs text-muted-foreground">{o.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {sendMode === "schedule" && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div>
                        <Label>Data</Label>
                        <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <Label>Hora</Label>
                        <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                      </div>
                    </div>
                  )}
                </Section>

                <Section title="Cadência (anti-ban)" desc="Limite a velocidade de disparo para proteger seu número.">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <Label>Velocidade de envio</Label>
                        <span className="font-mono text-xs">{throttle} msg/min</span>
                      </div>
                      <input type="range" min={20} max={500} step={10} value={throttle} onChange={e => setThrottle(+e.target.value)}
                        className="mt-1 w-full accent-primary" />
                      <div className="mt-1 flex justify-between text-[10px] font-mono text-subtle-foreground">
                        <span>20 (seguro)</span><span>500 (agressivo)</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Janela início</Label>
                        <input type="time" value={windowStart} onChange={e => setWindowStart(e.target.value)}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <Label>Janela fim</Label>
                        <input type="time" value={windowEnd} onChange={e => setWindowEnd(e.target.value)}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                      </div>
                    </div>
                    <Toggle on={respectQuietHours} setOn={setRespectQuietHours}
                      label="Respeitar horário de silêncio (22h - 8h)"
                      desc="Pausa automaticamente envios fora da janela permitida" />
                  </div>
                </Section>

                <Section title="Teste A/B (opcional)">
                  <Toggle on={abTest} setOn={setAbTest} label="Ativar teste A/B"
                    desc="Divide a audiência em variantes e envia a vencedora ao restante." />
                  {abTest && (
                    <div className="mt-3 rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
                      Configure as variantes B, C... após salvar a campanha.
                    </div>
                  )}
                </Section>
              </>
            )}

            {step === "review" && (
              <>
                <Section title="Identificação">
                  <div className="space-y-3">
                    <div>
                      <Label>Nome da campanha</Label>
                      <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Promoção Dia das Mães"
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <Label>Descrição interna</Label>
                      <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                        placeholder="Notas para o time"
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                    </div>
                  </div>
                </Section>

                <Section title="Resumo da configuração">
                  <dl className="divide-y divide-border text-xs">
                    <Row k="Template" v={templates.find(t => t.id === template)?.name || "—"} />
                    <Row k="Canais" v={selectedChannels.map(c => channels.find(x => x.id === c)?.label).join(", ")} />
                    <Row k="Listas" v={selectedLists.map(l => audienceLists.find(x => x.id === l)?.name).join(", ") || "—"} />
                    <Row k="Filtros" v={filters.length ? `${filters.length} regra(s)` : "Nenhum"} />
                    <Row k="Audiência estimada" v={`${audienceCount.toLocaleString("pt-BR")} contatos`} highlight />
                    <Row k="Envio" v={sendMode === "now" ? "Imediato" : `${scheduleDate || "—"} ${scheduleTime}`} />
                    <Row k="Cadência" v={`${throttle} msg/min · janela ${windowStart}–${windowEnd}`} />
                    <Row k="Duração estimada" v={`~${estDuration} min`} />
                    <Row k="Custo estimado" v={`R$ ${estCost}`} highlight />
                  </dl>
                </Section>

                <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-medium">Antes de disparar</div>
                      <ul className="mt-1 list-disc pl-4 text-muted-foreground space-y-0.5">
                        <li>Confirme variáveis preenchidas no preview</li>
                        <li>Valide se template está aprovado pela Meta</li>
                        <li>Revise janela de envio para evitar bloqueios</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Nav */}
            <div className="flex items-center justify-between pt-2">
              <button onClick={goPrev} disabled={stepIdx === 0}
                className={cn("inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium",
                  stepIdx === 0 ? "opacity-40 cursor-not-allowed" : "hover:bg-surface-elevated")}>
                <ArrowLeft className="h-3.5 w-3.5" /> Voltar
              </button>
              {step !== "review" ? (
                <button onClick={goNext} disabled={!canNext}
                  className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium",
                    canNext ? "bg-primary text-primary-foreground hover:bg-primary-glow" : "bg-muted text-muted-foreground cursor-not-allowed")}>
                  Próximo <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button onClick={handleLaunch}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow">
                  <Rocket className="h-3.5 w-3.5" /> {sendMode === "now" ? "Enviar agora" : "Agendar campanha"}
                </button>
              )}
            </div>
          </div>

          {/* Sidebar — preview + summary */}
          <aside className="col-span-12 lg:col-span-4 space-y-4 lg:sticky lg:top-4 self-start">
            {/* WhatsApp preview */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold tracking-tight">Preview</span>
                </div>
                <span className="rounded bg-channel-whatsapp/15 px-1.5 py-0.5 text-[9px] font-mono uppercase text-channel-whatsapp">WhatsApp</span>
              </div>
              <div className="rounded-lg bg-[#0b1f1a] p-3">
                <div className="ml-auto max-w-[90%] rounded-lg bg-[#005c4b] p-2.5 text-[12px] text-white shadow">
                  {headerType !== "none" && (
                    <div className="mb-2 flex h-24 items-center justify-center rounded bg-black/30 text-white/40">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                  <div className="whitespace-pre-wrap leading-snug">
                    {body.replace(/\{\{primeiro_nome\}\}/g, "Maria").replace(/\{\{cupom\}\}/g, "MAES15")}
                  </div>
                  {footer && <div className="mt-2 text-[10px] text-white/60">{footer}</div>}
                  <div className="mt-1 text-right text-[9px] text-white/50">14:32 ✓✓</div>
                </div>
                {buttons.length > 0 && (
                  <div className="mt-1 ml-auto max-w-[90%] space-y-0.5">
                    {buttons.map(b => (
                      <div key={b.id} className="rounded bg-[#1f2c33] px-2 py-1.5 text-center text-[12px] text-[#53bdeb]">
                        {b.label || "Botão"}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Live summary */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-3 flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold tracking-tight">Estimativas em tempo real</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Stat label="Audiência" value={audienceCount.toLocaleString("pt-BR")} icon={Users} />
                <Stat label="Custo" value={`R$ ${estCost}`} icon={Send} accent="text-primary" />
                <Stat label="Duração" value={`~${estDuration} min`} icon={Clock} />
                <Stat label="Cadência" value={`${throttle}/min`} icon={ShieldCheck} accent="text-success" />
              </div>
              {audienceCount === 0 && (
                <div className="mt-3 flex items-start gap-2 rounded-md bg-warning/10 p-2 text-[11px] text-warning">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  Selecione ao menos uma lista para calcular a audiência.
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold tracking-tight">Dicas anti-ban</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                <li className="flex gap-1.5"><Check className="h-3 w-3 text-success shrink-0 mt-0.5" /> Personalize com {`{{primeiro_nome}}`}</li>
                <li className="flex gap-1.5"><Check className="h-3 w-3 text-success shrink-0 mt-0.5" /> Mantenha cadência abaixo de 200/min nos primeiros envios</li>
                <li className="flex gap-1.5"><Check className="h-3 w-3 text-success shrink-0 mt-0.5" /> Inclua opção de opt-out no rodapé</li>
                <li className="flex gap-1.5"><Check className="h-3 w-3 text-success shrink-0 mt-0.5" /> Evite links encurtados (bit.ly)</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, desc, actions, children }: { title: string; desc?: string; actions?: React.ReactNode; children: React.ReactNode }) => (
  <div className="rounded-xl border border-border bg-surface p-5">
    <div className="mb-4 flex items-start justify-between gap-2">
      <div>
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {desc && <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>}
      </div>
      {actions}
    </div>
    {children}
  </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[11px] font-medium uppercase tracking-wider text-subtle-foreground font-mono">{children}</label>
);

const Toggle = ({ on, setOn, label, desc, required }: { on: boolean; setOn: (v: boolean) => void; label: string; desc?: string; required?: boolean }) => (
  <label className="flex cursor-pointer items-start justify-between gap-3 rounded-md border border-border bg-background px-3 py-2.5">
    <div>
      <div className="text-sm font-medium flex items-center gap-1.5">
        {label}
        {required && <span className="rounded bg-warning/15 px-1 py-0.5 text-[9px] font-mono uppercase text-warning">obrigatório</span>}
      </div>
      {desc && <div className="mt-0.5 text-[11px] text-muted-foreground">{desc}</div>}
    </div>
    <button type="button" onClick={() => !required && setOn(!on)} disabled={required}
      className={cn("relative h-5 w-9 rounded-full transition-colors shrink-0", on ? "bg-primary" : "bg-muted", required && "opacity-60")}>
      <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform", on ? "translate-x-4" : "translate-x-0.5")} />
    </button>
  </label>
);

const Row = ({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) => (
  <div className="flex items-center justify-between py-2">
    <dt className="text-muted-foreground">{k}</dt>
    <dd className={cn("font-medium", highlight && "text-primary font-mono")}>{v}</dd>
  </div>
);

const Stat = ({ label, value, icon: Icon, accent }: { label: string; value: string; icon: typeof Users; accent?: string }) => (
  <div className="rounded-md bg-background/40 p-2.5">
    <Icon className="h-3 w-3 text-muted-foreground" />
    <div className={cn("mt-1 font-mono text-sm font-semibold", accent)}>{value}</div>
    <div className="text-[10px] text-subtle-foreground">{label}</div>
  </div>
);

export default CampanhaNova;
