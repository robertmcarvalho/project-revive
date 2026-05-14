import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, User, Bell, Shield, Webhook, MessageSquare, Palette, Key, ChevronRight, Users, Plus, Copy, Trash2, Eye, EyeOff, Edit3, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

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

export default Configuracoes;
