import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, User, Bell, Shield, Webhook, MessageSquare, Palette, Key, ChevronRight, Users, Plus, Copy, Trash2, Eye, EyeOff, Edit3, CheckCircle2, Instagram, Mail, Send, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { WebhookEditor, type SocialWebhook, type Fila } from "./configuracoes/WebhookEditor";

const sections = [
  { id: "workspace", label: "Workspace", icon: Building2, desc: "Nome, logo e identidade da empresa" },
  { id: "users", label: "Usuários e Perfis", icon: Users, desc: "Cadastro, perfis e permissões" },
  { id: "profile", label: "Perfil", icon: User, desc: "Seus dados pessoais e preferências" },
  { id: "channels", label: "Canais", icon: MessageSquare, desc: "WhatsApp, Instagram, e-mail e webchat" },
  { id: "notifications", label: "Notificações", icon: Bell, desc: "Alertas e e-mails do sistema" },
  { id: "security", label: "Segurança", icon: Shield, desc: "2FA, sessões e logs de acesso" },
  { id: "api", label: "API & Webhooks", icon: Webhook, desc: "Tokens e integrações externas" },
  { id: "appearance", label: "Aparência", icon: Palette, desc: "Tema e personalização visual" },
  { id: "permissions", label: "Permissões", icon: Key, desc: "Papéis, líderes e controle de acesso" },
];

const Configuracoes = () => {
  const [active, setActive] = useState("workspace");

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <PageHeader eyebrow="Sistema" title="Configurações" description="Gerencie workspace, canais, segurança e integrações." />

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <nav className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-0.5">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors",
                  active === s.id ? "bg-surface-elevated" : "hover:bg-surface"
                )}
              >
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                  active === s.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  <s.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{s.label}</div>
                  <div className="truncate text-[10px] text-subtle-foreground">{s.desc}</div>
                </div>
                <ChevronRight className={cn("h-3.5 w-3.5 transition-colors", active === s.id ? "text-primary" : "text-subtle-foreground")} />
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-4">
            {active === "workspace" && (
              <div className="rounded-xl border border-border bg-surface p-6">
                <h3 className="text-sm font-semibold tracking-tight">Identidade do workspace</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Como sua organização aparece para a equipe.</p>

                <div className="mt-6 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-primary text-2xl font-bold text-primary-foreground shadow-glow">A</div>
                    <div>
                      <button className="rounded-md border border-border bg-background/40 px-3 py-1.5 text-xs font-medium hover:bg-surface-hover">Trocar logo</button>
                      <div className="mt-1 text-[10px] text-subtle-foreground">PNG ou SVG · até 2MB</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Nome do workspace" value="Acme Farmácias" />
                    <Field label="Slug (URL)" value="acme" mono />
                    <Field label="CNPJ" value="12.345.678/0001-90" mono />
                    <Field label="Fuso horário" value="América/São_Paulo" />
                  </div>
                </div>
              </div>
            )}

            {active === "users" && (
              <div className="rounded-xl border border-border bg-surface p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold">Usuários e Perfis</h3>
                <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">Cadastre administradores, gestores, atendentes e líderes. Configure permissões granulares e filas de WhatsApp por usuário.</p>
                <Link to="/configuracoes/usuarios" className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow">
                  Abrir gestão de usuários <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            {active === "channels" && <ChannelsPanel />}

            {active === "notifications" && (
              <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
                <h3 className="text-sm font-semibold tracking-tight">Preferências de notificação</h3>
                {[
                  { label: "Nova conversa atribuída", desc: "Notificar quando uma conversa for atribuída a você", on: true },
                  { label: "Menção em nota interna", desc: "Quando alguém te marcar com @", on: true },
                  { label: "SLA prestes a vencer", desc: "Alerta 5 minutos antes", on: true },
                  { label: "Campanha concluída", desc: "Resumo ao finalizar disparo", on: false },
                  { label: "Parcela em atraso", desc: "Resumo diário às 9h", on: true },
                ].map(n => (
                  <div key={n.label} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <div>
                      <div className="text-sm font-medium">{n.label}</div>
                      <div className="text-[11px] text-muted-foreground">{n.desc}</div>
                    </div>
                    <Toggle on={n.on} />
                  </div>
                ))}
              </div>
            )}

            {active === "security" && (
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-surface p-6">
                  <h3 className="text-sm font-semibold tracking-tight">Autenticação em dois fatores</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Camada extra de segurança via app autenticador.</p>
                  <button className="mt-4 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow">Ativar 2FA</button>
                </div>
                <div className="rounded-xl border border-border bg-surface p-6">
                  <h3 className="text-sm font-semibold tracking-tight">Sessões ativas</h3>
                  <div className="mt-4 space-y-2">
                    {[
                      { device: "Chrome · macOS", ip: "189.45.122.10", loc: "São Paulo, BR", current: true },
                      { device: "Safari · iPhone", ip: "189.45.122.11", loc: "São Paulo, BR", current: false },
                    ].map(s => (
                      <div key={s.ip} className="flex items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2">
                        <div>
                          <div className="text-xs font-medium">{s.device} {s.current && <span className="ml-1 rounded bg-success/15 px-1 py-0.5 text-[9px] text-success">atual</span>}</div>
                          <div className="font-mono text-[10px] text-subtle-foreground">{s.ip} · {s.loc}</div>
                        </div>
                        {!s.current && <button className="text-[11px] text-destructive hover:underline">Encerrar</button>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {active === "api" && (
              <div className="rounded-xl border border-border bg-surface p-6">
                <h3 className="text-sm font-semibold tracking-tight">Tokens de API</h3>
                <p className="mt-1 text-xs text-muted-foreground">Use para integrar sistemas externos.</p>
                <div className="mt-4 space-y-2">
                  {[
                    { name: "ERP Produção", token: "sk_live_•••••••••••••••42a9", created: "12/03/2026", lastUsed: "há 2h" },
                    { name: "BI Dashboard", token: "sk_live_•••••••••••••••91bf", created: "01/02/2026", lastUsed: "há 1d" },
                  ].map(t => (
                    <div key={t.token} className="rounded-md border border-border bg-background/40 p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-medium">{t.name}</div>
                        <button className="text-[11px] text-destructive hover:underline">Revogar</button>
                      </div>
                      <div className="mt-1 font-mono text-[10px] text-subtle-foreground">{t.token}</div>
                      <div className="mt-1 text-[10px] text-subtle-foreground">Criado em {t.created} · Último uso {t.lastUsed}</div>
                    </div>
                  ))}
                </div>
                <button className="mt-4 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow">Gerar novo token</button>
              </div>
            )}

            {(active === "profile" || active === "appearance" || active === "permissions") && (
              <div className="rounded-xl border border-border bg-surface p-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  {(() => { const Sec = sections.find(s => s.id === active)!; return <Sec.icon className="h-5 w-5" />; })()}
                </div>
                <h3 className="mt-4 text-sm font-semibold">{sections.find(s => s.id === active)?.label}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{sections.find(s => s.id === active)?.desc}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div>
    <label className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">{label}</label>
    <input
      defaultValue={value}
      className={cn(
        "mt-1 w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20",
        mono && "font-mono"
      )}
    />
  </div>
);

const Toggle = ({ on }: { on: boolean }) => {
  const [v, setV] = useState(on);
  return (
    <button
      onClick={() => setV(!v)}
      className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors", v ? "bg-primary" : "bg-muted")}
    >
      <span className={cn("inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform", v ? "translate-x-5" : "translate-x-1")} />
    </button>
  );
};

// ============== Channels Panel (WhatsApp / Instagram / Email) ==============

// Fila and SocialWebhook types are imported from ./configuracoes/WebhookEditor

const SETORES_INICIAIS = ["Atendimento Geral", "Financeiro", "Operacional", "Suporte Técnico", "Comercial"];

const EMAILS_NOTIFICACAO = [
  "atendimento@acme.com.br",
  "financeiro@acme.com.br",
  "suporte@acme.com.br",
  "comercial@acme.com.br",
  "operacional@acme.com.br",
];

const initialWhatsapp: SocialWebhook[] = [
  {
    id: "wh_01", name: "Atendimento Principal", number: "+55 11 4002-8922",
    phoneId: "1029384756102", wabaId: "9876543210",
    token: "EAAG••••••••••••••••42a9", verifyToken: "vt_acme_main_8f2a",
    callbackUrl: "https://api.acme.com/wa/webhooks/wh_01",
    status: "ativo", lastMessageAt: "há 12s", msgs24h: 4280,
    queues: [
      { name: "Geral", setores: ["Atendimento Geral"], notifyEmail: "atendimento@acme.com.br" },
      { name: "Suporte", setores: ["Suporte Técnico", "Operacional"], notifyEmail: "suporte@acme.com.br" },
    ],
  },
  {
    id: "wh_02", name: "Vendas SP", number: "+55 11 4002-3120",
    phoneId: "1029384756103", wabaId: "9876543210",
    token: "EAAG••••••••••••••••91bf", verifyToken: "vt_acme_sales_2c10",
    callbackUrl: "https://api.acme.com/wa/webhooks/wh_02",
    status: "ativo", lastMessageAt: "há 1m", msgs24h: 1210,
    queues: [{ name: "Comercial", setores: ["Comercial", "Financeiro"], notifyEmail: "comercial@acme.com.br" }],
  },
  {
    id: "wh_03", name: "Suporte Técnico", number: "+55 11 4002-7710",
    phoneId: "1029384756104", wabaId: "9876543210",
    token: "EAAG••••••••••••••••3d7e", verifyToken: "vt_acme_tech_71fa",
    callbackUrl: "https://api.acme.com/wa/webhooks/wh_03",
    status: "erro", lastMessageAt: "há 2h", msgs24h: 0,
    queues: [{ name: "Suporte Técnico", setores: ["Suporte Técnico"], notifyEmail: "suporte@acme.com.br" }],
  },
];

const initialInstagram: SocialWebhook[] = [
  {
    id: "ig_01", name: "@acmefarmacias", number: "@acmefarmacias",
    phoneId: "17841400000000001", wabaId: "1789200000000001",
    token: "IGQ••••••••••••••••f0a2", verifyToken: "vt_acme_ig_main_3d11",
    callbackUrl: "https://api.acme.com/ig/webhooks/ig_01",
    status: "ativo", lastMessageAt: "há 4m", msgs24h: 312,
    queues: [{ name: "DM Instagram", setores: ["Atendimento Geral", "Comercial"], notifyEmail: "atendimento@acme.com.br" }],
  },
];

const ChannelsPanel = () => {
  const [tab, setTab] = useState<"whatsapp" | "instagram" | "email">("whatsapp");
  const [setoresGlobais, setSetoresGlobais] = useState<string[]>(SETORES_INICIAIS);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
        <ChannelTab id="whatsapp" current={tab} onClick={setTab} icon={<MessageSquare className="h-3.5 w-3.5" />} label="WhatsApp" color="text-channel-whatsapp" />
        <ChannelTab id="instagram" current={tab} onClick={setTab} icon={<Instagram className="h-3.5 w-3.5" />} label="Instagram" color="text-channel-instagram" />
        <ChannelTab id="email" current={tab} onClick={setTab} icon={<Mail className="h-3.5 w-3.5" />} label="E-mail" color="text-channel-email" />
      </div>

      {tab === "whatsapp" && (
        <SocialChannelManager kind="whatsapp" setoresGlobais={setoresGlobais} setSetoresGlobais={setSetoresGlobais} initial={initialWhatsapp} />
      )}
      {tab === "instagram" && (
        <SocialChannelManager kind="instagram" setoresGlobais={setoresGlobais} setSetoresGlobais={setSetoresGlobais} initial={initialInstagram} />
      )}
      {tab === "email" && <EmailChannelPanel />}
    </div>
  );
};

const ChannelTab = ({ id, current, onClick, icon, label, color }: any) => (
  <button
    onClick={() => onClick(id)}
    className={cn(
      "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors",
      current === id ? "bg-surface-elevated text-foreground" : "text-muted-foreground hover:bg-surface-hover"
    )}
  >
    <span className={current === id ? color : ""}>{icon}</span> {label}
  </button>
);

const SocialChannelManager = ({
  kind, setoresGlobais, setSetoresGlobais, initial,
}: {
  kind: "whatsapp" | "instagram";
  setoresGlobais: string[];
  setSetoresGlobais: (s: string[]) => void;
  initial: SocialWebhook[];
}) => {
  const [webhooks, setWebhooks] = useState(initial);
  const [editing, setEditing] = useState<SocialWebhook | null>(null);
  const [creating, setCreating] = useState(false);

  const meta = kind === "whatsapp"
    ? { title: "WhatsApp Business API", desc: "Gerencie credenciais e webhooks. Suporta múltiplas conexões para escalar o produto.", icon: <MessageSquare className="h-5 w-5 text-channel-whatsapp" />, bg: "bg-channel-whatsapp/15", labels: { id: "Phone Number ID", waba: "WABA ID", token: "Access Token (Meta)", number: "Número" } }
    : { title: "Instagram Direct API", desc: "Conecte contas do Instagram via Meta Cloud. Cada webhook recebe DMs e menções da conta vinculada.", icon: <Instagram className="h-5 w-5 text-channel-instagram" />, bg: "bg-channel-instagram/15", labels: { id: "Instagram User ID", waba: "Business Account ID", token: "Access Token (Instagram Graph)", number: "Handle" } };

  const statusColor: Record<SocialWebhook["status"], string> = {
    ativo: "bg-success/15 text-success",
    pausado: "bg-muted text-muted-foreground",
    erro: "bg-destructive/15 text-destructive",
  };

  return (
    <>
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", meta.bg)}>{meta.icon}</div>
            <div>
              <h3 className="text-sm font-semibold">{meta.title}</h3>
              <p className="text-[11px] text-muted-foreground">{meta.desc}</p>
            </div>
          </div>
          <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow">
            <Plus className="h-3.5 w-3.5" /> Novo webhook
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat label="Webhooks ativos" value={webhooks.filter(w => w.status === "ativo").length} tone="success" />
          <Stat label="Mensagens 24h" value={webhooks.reduce((a, w) => a + w.msgs24h, 0).toLocaleString("pt-BR")} />
          <Stat label="Com problema" value={webhooks.filter(w => w.status === "erro").length} tone="destructive" />
        </div>
      </div>

      <div className="space-y-2">
        {webhooks.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-surface p-6 text-center text-xs text-muted-foreground">
            Nenhum webhook conectado. Clique em "Novo webhook" para começar.
          </div>
        )}
        {webhooks.map(w => (
          <div key={w.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{w.name}</span>
                  <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium", statusColor[w.status])}>
                    {w.status === "ativo" && <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />}
                    {w.status}
                  </span>
                  <span className="text-[10px] text-subtle-foreground">· última msg {w.lastMessageAt} · {w.msgs24h.toLocaleString("pt-BR")} msgs/24h</span>
                </div>
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">{w.number} · {meta.labels.id} {w.phoneId}</div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-subtle-foreground">Filas:</span>
                  {w.queues.map(q => (
                    <span key={q.name} className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                      {q.name}{q.setores.length > 0 && <span className="ml-1 text-primary/60">· {q.setores.length} setor{q.setores.length > 1 ? "es" : ""}</span>}
                      {q.notifyEmail && <span className="ml-1 text-primary/50">· ✉ {q.notifyEmail}</span>}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setEditing(w)} className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-surface-hover"><Edit3 className="h-3 w-3" /> Editar</button>
                <button onClick={() => navigator.clipboard.writeText(w.callbackUrl)} className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-surface-hover"><Copy className="h-3 w-3" /> URL</button>
                <button onClick={() => setWebhooks(ws => ws.filter(x => x.id !== w.id))} className="rounded-md border border-destructive/30 px-2 py-1 text-destructive hover:bg-destructive/10"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5 text-primary"><CheckCircle2 className="h-3.5 w-3.5" /> <span className="font-medium">Credenciais centralizadas</span></div>
        <p className="mt-1">A plataforma consome estas credenciais automaticamente — não é necessário tocar no código. Adicione novos webhooks aqui para escalar o produto.</p>
      </div>

      {(editing || creating) && (
        <WebhookEditor
          kind={kind}
          labels={meta.labels}
          webhook={editing}
          setoresGlobais={setoresGlobais}
          setSetoresGlobais={setSetoresGlobais}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={(w) => {
            if (editing) setWebhooks(ws => ws.map(x => x.id === w.id ? w : x));
            else setWebhooks(ws => [...ws, { ...w, id: `${kind === "whatsapp" ? "wh" : "ig"}_${String(ws.length + 1).padStart(2, "0")}` }]);
            setEditing(null); setCreating(false);
          }}
        />
      )}
    </>
  );
};

const Stat = ({ label, value, tone }: { label: string; value: any; tone?: "success" | "destructive" }) => (
  <div className="rounded-md bg-background/40 p-3">
    <div className="text-[10px] uppercase tracking-wider text-subtle-foreground">{label}</div>
    <div className={cn("mt-1 font-mono text-lg font-semibold", tone === "success" && "text-success", tone === "destructive" && "text-destructive")}>{value}</div>
  </div>
);

const WebhookEditor = ({
  kind, labels, webhook, setoresGlobais, setSetoresGlobais, onClose, onSave,
}: {
  kind: "whatsapp" | "instagram";
  labels: { id: string; waba: string; token: string; number: string };
  webhook: SocialWebhook | null;
  setoresGlobais: string[];
  setSetoresGlobais: (s: string[]) => void;
  onClose: () => void;
  onSave: (w: SocialWebhook) => void;
}) => {
  const [showToken, setShowToken] = useState(false);
  const initial = webhook ?? {
    id: "", name: "", number: "", phoneId: "", wabaId: "",
    token: "", verifyToken: "",
    callbackUrl: `https://api.acme.com/${kind === "whatsapp" ? "wa" : "ig"}/webhooks/new`,
    status: "ativo" as const, lastMessageAt: "—", msgs24h: 0, queues: [] as Fila[],
  };
  const [filas, setFilas] = useState<Fila[]>(initial.queues);
  const [novaFila, setNovaFila] = useState("");
  const [novoSetor, setNovoSetor] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [testing, setTesting] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const flash = (msg: string) => { setFeedback(msg); setTimeout(() => setFeedback(null), 1800); };

  const addFila = () => {
    const n = novaFila.trim();
    if (!n) return flash("Informe o nome da fila");
    if (filas.some(f => f.name.toLowerCase() === n.toLowerCase())) return flash("Já existe uma fila com esse nome");
    setFilas([...filas, { name: n, setores: [], notifyEmail: "" }]);
    setNovaFila("");
    flash(`Fila "${n}" adicionada`);
  };
  const removeFila = (name: string) => setFilas(filas.filter(f => f.name !== name));
  const toggleSetor = (filaName: string, setor: string) =>
    setFilas(filas.map(f => f.name !== filaName ? f : {
      ...f,
      setores: f.setores.includes(setor) ? f.setores.filter(s => s !== setor) : [...f.setores, setor],
    }));
  const removeSetorFromFila = (filaName: string, setor: string) =>
    setFilas(filas.map(f => f.name !== filaName ? f : { ...f, setores: f.setores.filter(s => s !== setor) }));
  const setNotifyEmail = (filaName: string, email: string) =>
    setFilas(filas.map(f => f.name !== filaName ? f : { ...f, notifyEmail: email }));

  const addSetorGlobal = () => {
    const s = novoSetor.trim();
    if (!s) return flash("Informe o nome do setor");
    if (setoresGlobais.some(x => x.toLowerCase() === s.toLowerCase())) return flash("Setor já existe");
    setSetoresGlobais([...setoresGlobais, s]);
    setNovoSetor("");
    flash(`Setor "${s}" criado`);
  };
  const removeSetorGlobal = (s: string) => {
    setSetoresGlobais(setoresGlobais.filter(x => x !== s));
    setFilas(filas.map(f => ({ ...f, setores: f.setores.filter(x => x !== s) })));
    flash(`Setor "${s}" removido`);
  };

  const handleTestConnection = () => {
    setTesting("loading");
    setTimeout(() => setTesting(Math.random() > 0.1 ? "ok" : "err"), 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-2xl rounded-xl border border-border bg-surface shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="text-sm font-semibold">{webhook ? "Editar webhook" : `Novo webhook ${kind === "whatsapp" ? "WhatsApp" : "Instagram"}`}</h3>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Cole as credenciais da Meta Cloud API. A plataforma usará automaticamente.</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Nome de exibição" value={initial.name} />
            <Field label={labels.number} value={initial.number} mono />
            <Field label={labels.id} value={initial.phoneId} mono />
            <Field label={labels.waba} value={initial.wabaId} mono />
          </div>
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">{labels.token}</label>
            <div className="mt-1 flex gap-2">
              <input type={showToken ? "text" : "password"} defaultValue={initial.token} className="flex-1 rounded-md border border-border bg-background/40 px-3 py-2 font-mono text-xs" />
              <button type="button" onClick={() => setShowToken(s => !s)} className="rounded-md border border-border px-3 hover:bg-surface-hover">
                {showToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <Field label="Verify Token" value={initial.verifyToken} mono />
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">Callback URL (configure na Meta)</label>
            <div className="mt-1 flex gap-2">
              <input readOnly value={initial.callbackUrl} className="flex-1 rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs" />
              <button type="button" onClick={() => navigator.clipboard.writeText(initial.callbackUrl)} className="rounded-md border border-border px-3 hover:bg-surface-hover"><Copy className="h-3.5 w-3.5" /></button>
            </div>
          </div>

          {/* Setores globais */}
          <div className="rounded-md border border-border bg-background/40 p-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">Setores disponíveis</label>
              <span className="text-[10px] text-muted-foreground">{setoresGlobais.length} setor{setoresGlobais.length !== 1 ? "es" : ""}</span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Crie setores reutilizáveis para vincular às filas (ex.: Financeiro, Suporte).</p>
            <div className="mt-3 flex gap-2">
              <input
                value={novoSetor}
                onChange={e => setNovoSetor(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSetorGlobal())}
                placeholder="Novo setor (ex.: Pós-venda)"
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-xs"
              />
              <button type="button" onClick={addSetorGlobal} className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow">
                <Plus className="h-3 w-3" /> Setor
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {setoresGlobais.map(s => (
                <span key={s} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] text-foreground">
                  {s}
                  <button type="button" onClick={() => removeSetorGlobal(s)} className="text-muted-foreground hover:text-destructive"><X className="h-2.5 w-2.5" /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Filas + setores + email de notificação */}
          <div className="rounded-md border border-border bg-background/40 p-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">Filas, setores e notificação</label>
              <span className="text-[10px] text-muted-foreground">{filas.length} fila{filas.length !== 1 ? "s" : ""}</span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Cada fila pode conter setores e um e-mail de notificação dedicado.</p>

            <div className="mt-3 flex gap-2">
              <input
                value={novaFila}
                onChange={e => setNovaFila(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addFila())}
                placeholder="Nome da fila (ex.: Geral, Vendas, Plantão)"
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-xs"
              />
              <button type="button" onClick={addFila} className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow">
                <Plus className="h-3 w-3" /> Fila
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {filas.length === 0 && (
                <div className="rounded-md border border-dashed border-border px-3 py-4 text-center text-[11px] text-muted-foreground">
                  Nenhuma fila. Adicione uma fila acima para vincular setores.
                </div>
              )}
              {filas.map(f => (
                <div key={f.name} className="rounded-md border border-border bg-surface p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">{f.name}</span>
                      <span className="text-[10px] text-muted-foreground">{f.setores.length} setor{f.setores.length !== 1 ? "es" : ""}</span>
                    </div>
                    <button type="button" onClick={() => removeFila(f.name)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-3 w-3" /></button>
                  </div>
                  {f.setores.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {f.setores.map(s => (
                        <span key={s} className="inline-flex items-center gap-1 rounded bg-primary/15 px-1.5 py-0.5 text-[10px] text-primary">
                          {s}
                          <button type="button" onClick={() => removeSetorFromFila(f.name, s)} className="hover:text-destructive" title="Remover setor da fila">
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {setoresGlobais.map(s => {
                      const on = f.setores.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSetor(f.name, s)}
                          className={cn(
                            "rounded-md border px-2 py-1 text-[10px] transition-colors",
                            on ? "border-primary bg-primary/10 text-primary" : "border-border bg-background/40 text-muted-foreground hover:bg-surface-hover"
                          )}
                        >
                          {on && "✓ "}{s}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3">
                    <label className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">E-mail de notificação</label>
                    <select
                      value={f.notifyEmail || ""}
                      onChange={e => setNotifyEmail(f.name, e.target.value)}
                      className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                    >
                      <option value="">— Nenhum —</option>
                      {EMAILS_NOTIFICACAO.map(em => <option key={em} value={em}>{em}</option>)}
                    </select>
                    <p className="mt-1 text-[10px] text-subtle-foreground">Receberá alertas de novas conversas, SLA vencido e relatórios desta fila.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleTestConnection} className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-[11px] hover:bg-surface-hover">
              <Send className="h-3 w-3" /> Testar conexão
            </button>
            {testing === "loading" && <span className="text-[11px] text-muted-foreground">Testando…</span>}
            {testing === "ok" && <span className="flex items-center gap-1 text-[11px] text-success"><CheckCircle2 className="h-3 w-3" /> Conexão OK</span>}
            {testing === "err" && <span className="text-[11px] text-destructive">Falha — verifique credenciais</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="rounded-md border border-border px-3 py-1.5 text-xs">Cancelar</button>
            <button onClick={() => { onSave({ ...initial, queues: filas }); }} className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow">Salvar credenciais</button>
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

// ============== Email Channel (SMTP de envio de notificações) ==============

const EmailChannelPanel = () => {
  const [provider, setProvider] = useState<"smtp" | "sendgrid" | "resend" | "ses">("smtp");
  const [tls, setTls] = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  const [testing, setTesting] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [testEmail, setTestEmail] = useState("");
  const [caixas, setCaixas] = useState<string[]>(EMAILS_NOTIFICACAO);
  const [adding, setAdding] = useState(false);
  const [novaCaixa, setNovaCaixa] = useState("");

  const handleTest = () => {
    if (!testEmail.trim()) return;
    setTesting("loading");
    setTimeout(() => setTesting("ok"), 800);
  };
  const addCaixa = () => {
    const e = novaCaixa.trim();
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return;
    if (caixas.includes(e)) return;
    setCaixas([...caixas, e]);
    setNovaCaixa(""); setAdding(false);
  };
  const removeCaixa = (e: string) => setCaixas(caixas.filter(x => x !== e));

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-channel-email/15">
            <Mail className="h-5 w-5 text-channel-email" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">E-mail de envio (SMTP)</h3>
            <p className="text-[11px] text-muted-foreground">Configure o servidor que enviará notificações da plataforma para clientes e equipe.</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
        <div>
          <label className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">Provedor</label>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {(["smtp", "sendgrid", "resend", "ses"] as const).map(p => (
              <button
                key={p}
                onClick={() => setProvider(p)}
                className={cn(
                  "rounded-md border px-3 py-2 text-xs font-medium transition-colors",
                  provider === p ? "border-primary bg-primary/10 text-primary" : "border-border bg-background/40 text-muted-foreground hover:bg-surface-hover"
                )}
              >
                {p === "smtp" ? "SMTP" : p === "sendgrid" ? "SendGrid" : p === "resend" ? "Resend" : "Amazon SES"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Nome do remetente" value="Acme Notificações" />
          <Field label="E-mail remetente" value="no-reply@acme.com.br" mono />
          <Field label="E-mail de resposta" value="atendimento@acme.com.br" mono />
          <Field label="Domínio verificado" value="acme.com.br" mono />
        </div>

        {provider === "smtp" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Host SMTP" value="smtp.acme.com.br" mono />
            <Field label="Porta" value="587" mono />
            <Field label="Usuário" value="notify@acme.com.br" mono />
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">Senha</label>
              <div className="mt-1 flex gap-2">
                <input type={showPwd ? "text" : "password"} defaultValue="••••••••••••" className="flex-1 rounded-md border border-border bg-background/40 px-3 py-2 font-mono text-xs" />
                <button type="button" onClick={() => setShowPwd(s => !s)} className="rounded-md border border-border px-3 hover:bg-surface-hover">
                  {showPwd ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {provider !== "smtp" && (
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">API Key</label>
            <div className="mt-1 flex gap-2">
              <input type={showPwd ? "text" : "password"} defaultValue="sk_••••••••••••••••42a9" className="flex-1 rounded-md border border-border bg-background/40 px-3 py-2 font-mono text-xs" />
              <button type="button" onClick={() => setShowPwd(s => !s)} className="rounded-md border border-border px-3 hover:bg-surface-hover">
                {showPwd ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2">
          <div>
            <div className="text-xs font-medium">TLS / STARTTLS</div>
            <div className="text-[10px] text-muted-foreground">Recomendado para portas 587/465.</div>
          </div>
          <Toggle on={tls} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold">Caixas autorizadas para notificação</h4>
            <p className="mt-0.5 text-[11px] text-muted-foreground">E-mails liberados para receber alertas das filas/webhooks. Selecione-os ao configurar cada webhook.</p>
          </div>
          <button onClick={() => setAdding(a => !a)} className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-surface-hover">
            <Plus className="h-3 w-3" /> Adicionar
          </button>
        </div>
        {adding && (
          <div className="mt-3 flex gap-2 rounded-md border border-dashed border-primary/40 bg-primary/5 p-2">
            <input
              autoFocus
              value={novaCaixa}
              onChange={e => setNovaCaixa(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCaixa())}
              placeholder="novo@dominio.com"
              className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs"
            />
            <button type="button" onClick={addCaixa} className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary-glow">Adicionar</button>
            <button type="button" onClick={() => { setAdding(false); setNovaCaixa(""); }} className="rounded-md border border-border px-3 py-1 text-xs">Cancelar</button>
          </div>
        )}
        <div className="mt-3 space-y-1.5">
          {caixas.map(em => (
            <div key={em} className="flex items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-channel-email" />
                <span className="font-mono text-xs">{em}</span>
                <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] text-success">verificado</span>
              </div>
              <button onClick={() => removeCaixa(em)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold">Teste de envio</h4>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Envie um e-mail de teste para validar as credenciais.</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              placeholder="seu@email.com"
              className="rounded-md border border-border bg-background px-3 py-2 text-xs"
            />
            <button onClick={handleTest} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow">
              <Send className="h-3 w-3" /> Enviar teste
            </button>
          </div>
        </div>
        {testing === "loading" && <div className="mt-3 text-[11px] text-muted-foreground">Enviando…</div>}
        {testing === "ok" && (
          <div className="mt-3 flex items-center gap-1.5 rounded-md bg-success/10 px-3 py-2 text-[11px] text-success">
            <CheckCircle2 className="h-3.5 w-3.5" /> E-mail de teste enviado para {testEmail}.
          </div>
        )}
      </div>
    </div>
  );
};

export default Configuracoes;
