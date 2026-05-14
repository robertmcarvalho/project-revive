import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Shield, Key, Webhook, LayoutGrid, Lock, RotateCcw, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

const allSections = [
  { id: "inbox", label: "Inbox / Conversas" },
  { id: "contatos", label: "Contatos" },
  { id: "campanhas", label: "Campanhas" },
  { id: "automacoes", label: "Automações" },
  { id: "flows", label: "Flows" },
  { id: "farmacias", label: "Farmácias" },
  { id: "entregadores", label: "Entregadores" },
  { id: "lideres", label: "Líderes" },
  { id: "financeiro", label: "Financeiro" },
  { id: "configuracoes", label: "Configurações" },
];

const allPermissions = [
  { id: "view_inbox", label: "Visualizar conversas", group: "Atendimento" },
  { id: "send_message", label: "Enviar mensagens", group: "Atendimento" },
  { id: "transfer_chat", label: "Transferir conversa", group: "Atendimento" },
  { id: "close_chat", label: "Encerrar conversa", group: "Atendimento" },
  { id: "create_campaign", label: "Criar campanhas", group: "Engajamento" },
  { id: "approve_campaign", label: "Aprovar disparo", group: "Engajamento" },
  { id: "manage_automation", label: "Gerenciar automações", group: "Automação" },
  { id: "edit_flows", label: "Editar flows", group: "Automação" },
  { id: "manage_users", label: "Gerenciar usuários", group: "Administrativo" },
  { id: "manage_webhooks", label: "Configurar webhooks", group: "Administrativo" },
  { id: "view_financial", label: "Visualizar financeiro", group: "Financeiro" },
  { id: "manage_financial", label: "Lançar diárias e faltas", group: "Financeiro" },
];

const webhooks = [
  { id: "w1", name: "Atendimento Principal", number: "+55 11 4002-8922" },
  { id: "w2", name: "Vendas SP", number: "+55 11 4002-3120" },
  { id: "w3", name: "Suporte Técnico", number: "+55 11 4002-7710" },
];

const UsuarioFicha = () => {
  const { id } = useParams();

  const u = {
    id, nome: "Pedro Alves", email: "pedro@acme.com", telefone: "+55 11 99441-7782",
    perfil: "Atendente", setor: "Atendimento Geral", username: "pedro.acme",
    status: "ativo", criadoEm: "12/02/2026", ultimoAcesso: "Hoje, 14:08",
  };

  const [tab, setTab] = useState<"perfil" | "permissoes" | "filas" | "seguranca">("perfil");
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <Link to="/configuracoes/usuarios" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para usuários
        </Link>

        <PageHeader
          eyebrow={`Usuário · ${u.username}`}
          title={u.nome}
          description={`${u.perfil} · ${u.setor} · criado em ${u.criadoEm}`}
          actions={
            <div className="flex items-center gap-2">
              <button onClick={() => setShowPwd(true)} className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-hover"><Key className="h-3.5 w-3.5" /> Editar senha</button>
              <button className="flex items-center gap-1.5 rounded-md border border-warning/40 bg-warning/10 px-3 py-1.5 text-xs font-medium text-warning hover:bg-warning/20"><RotateCcw className="h-3.5 w-3.5" /> Reenviar acesso</button>
            </div>
          }
        />

        {/* Identidade */}
        <div className="mb-6 grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-4 rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-base font-semibold text-primary">{u.nome.split(" ").map(n => n[0]).join("").slice(0,2)}</div>
              <div className="min-w-0">
                <div className="text-sm font-semibold">{u.nome}</div>
                <div className="text-[11px] text-muted-foreground">@{u.username}</div>
              </div>
            </div>
            <div className="mt-4 space-y-1.5 text-[11px]">
              <div className="flex items-center gap-1.5 text-muted-foreground"><Mail className="h-3 w-3" /> {u.email}</div>
              <div className="flex items-center gap-1.5 text-muted-foreground"><Phone className="h-3 w-3" /> {u.telefone}</div>
            </div>
          </div>
          <Stat label="Status" value={u.status} accent="text-success" />
          <Stat label="Último acesso" value={u.ultimoAcesso} />
          <Stat label="Filas conectadas" value="2" />
          <Stat label="Conversas (mês)" value="412" />
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-1 rounded-md bg-muted p-1 w-fit">
          {[
            { id: "perfil", label: "Perfil" },
            { id: "permissoes", label: "Perfis e Permissões" },
            { id: "filas", label: "Filas WhatsApp" },
            { id: "seguranca", label: "Segurança" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)} className={cn("rounded px-3 py-1.5 text-xs font-medium", tab === t.id ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "perfil" && (
          <div className="space-y-4">
            <Card title="Dados de cadastro">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Nome completo" value={u.nome} />
                <Field label="Email" value={u.email} />
                <Field label="Telefone" value={u.telefone} />
                <Field label="Setor" value={u.setor} />
                <Field label="Username" value={u.username} mono />
                <Field label="Perfil" value={u.perfil} />
              </div>
            </Card>

            <Card title="Sessões habilitadas" icon={LayoutGrid}>
              <p className="mb-3 text-[11px] text-muted-foreground">Áreas da plataforma que este usuário pode acessar.</p>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {allSections.map(s => {
                  const enabled = ["inbox", "contatos", "farmacias"].includes(s.id);
                  return (
                    <div key={s.id} className={cn("flex items-center justify-between rounded-md border px-3 py-2 text-xs", enabled ? "border-success/40 bg-success/5" : "border-border bg-background/40 opacity-60")}>
                      <span>{s.label}</span>
                      {enabled && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {tab === "permissoes" && (
          <Card title="Perfis e Permissões" icon={Shield}>
            <p className="mb-4 text-[11px] text-muted-foreground">Habilite ou desabilite ações específicas para este usuário.</p>
            {Object.entries(allPermissions.reduce<Record<string, typeof allPermissions>>((acc, p) => {
              (acc[p.group] ||= []).push(p); return acc;
            }, {})).map(([group, perms]) => (
              <div key={group} className="mb-4 last:mb-0">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-subtle-foreground">{group}</div>
                <div className="space-y-1.5">
                  {perms.map((p, i) => (
                    <div key={p.id} className="flex items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2">
                      <span className="text-xs">{p.label}</span>
                      <Toggle defaultOn={i % 2 === 0} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Card>
        )}

        {tab === "filas" && (
          <Card title="Filas de WhatsApp habilitadas" icon={Webhook}>
            <p className="mb-3 text-[11px] text-muted-foreground">Atendentes e supervisores podem participar de múltiplas filas.</p>
            <div className="space-y-2">
              {webhooks.map((w, i) => (
                <div key={w.id} className="flex items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2.5">
                  <div>
                    <div className="text-xs font-medium">{w.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{w.number}</div>
                  </div>
                  <Toggle defaultOn={i < 2} />
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === "seguranca" && (
          <div className="space-y-4">
            <Card title="Senha" icon={Lock}>
              <p className="mb-3 text-[11px] text-muted-foreground">Use esta opção quando o usuário não conseguir redefinir a senha pelo fluxo padrão.</p>
              <button onClick={() => setShowPwd(true)} className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow">Definir nova senha</button>
            </Card>
            <Card title="2FA">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Autenticação em dois fatores</span>
                <Toggle defaultOn={false} />
              </div>
            </Card>
          </div>
        )}
      </div>

      {showPwd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowPwd(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-xl border border-border bg-surface shadow-xl">
            <div className="border-b border-border px-5 py-4">
              <h3 className="text-sm font-semibold">Definir nova senha</h3>
              <p className="mt-0.5 text-[11px] text-muted-foreground">A nova senha será informada ao usuário por email.</p>
            </div>
            <div className="space-y-3 p-5">
              <Field label="Nova senha" placeholder="Mínimo 8 caracteres" />
              <Field label="Confirmar senha" placeholder="Repita a senha" />
              <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <input type="checkbox" defaultChecked className="h-3.5 w-3.5" /> Forçar troca no próximo login
              </label>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
              <button onClick={() => setShowPwd(false)} className="rounded-md border border-border px-3 py-1.5 text-xs">Cancelar</button>
              <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">Salvar e enviar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Card = ({ title, icon: Icon, children }: any) => (
  <div className="rounded-xl border border-border bg-surface p-5">
    <div className="mb-3 flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
    {children}
  </div>
);

const Stat = ({ label, value, accent }: { label: string; value: string; accent?: string }) => (
  <div className="col-span-6 md:col-span-2 rounded-xl border border-border bg-surface p-4">
    <div className="text-[10px] uppercase tracking-wider text-subtle-foreground">{label}</div>
    <div className={cn("mt-1 text-sm font-semibold", accent)}>{value}</div>
  </div>
);

const Field = ({ label, value, placeholder, mono }: { label: string; value?: string; placeholder?: string; mono?: boolean }) => (
  <div>
    <label className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">{label}</label>
    <input defaultValue={value} placeholder={placeholder} className={cn("mt-1 w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary/60", mono && "font-mono")} />
  </div>
);

const Toggle = ({ defaultOn }: { defaultOn: boolean }) => {
  const [v, setV] = useState(defaultOn);
  return (
    <button onClick={() => setV(!v)} className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors", v ? "bg-primary" : "bg-muted")}>
      <span className={cn("inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform", v ? "translate-x-5" : "translate-x-1")} />
    </button>
  );
};

export default UsuarioFicha;
