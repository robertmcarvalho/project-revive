import { useState } from "react";
import { Plus, Search, Shield, UserCog, Headphones, Crown, Mail, Phone, MoreHorizontal, Eye, Key, RotateCcw, UserX, Trash2, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Perfil = "administrador" | "gestor" | "atendente" | "lider";

const perfilMeta: Record<Perfil, { label: string; color: string; icon: any }> = {
  administrador: { label: "Administrador", color: "bg-destructive/15 text-destructive", icon: Shield },
  gestor: { label: "Gestor", color: "bg-primary/15 text-primary", icon: UserCog },
  atendente: { label: "Atendente", color: "bg-success/15 text-success", icon: Headphones },
  lider: { label: "Líder", color: "bg-warning/15 text-warning", icon: Crown },
};

const usuarios = [
  { id: "u1", nome: "Ana Souza", email: "ana@acme.com", telefone: "+55 11 99876-1010", perfil: "administrador" as Perfil, setor: "—", status: "ativo", filas: 4 },
  { id: "u2", nome: "Carlos Lima", email: "carlos@acme.com", telefone: "+55 11 99812-7710", perfil: "gestor" as Perfil, setor: "Operacional", status: "ativo", filas: 3 },
  { id: "u3", nome: "Mariana Reis", email: "mariana@acme.com", telefone: "+55 11 99902-3318", perfil: "gestor" as Perfil, setor: "Financeiro", status: "ativo", filas: 1 },
  { id: "u4", nome: "Pedro Alves", email: "pedro@acme.com", telefone: "+55 11 99441-7782", perfil: "atendente" as Perfil, setor: "Atendimento Geral", status: "ativo", filas: 2 },
  { id: "u5", nome: "Júlia Mendes", email: "julia@acme.com", telefone: "+55 11 99321-9920", perfil: "atendente" as Perfil, setor: "Suporte Técnico", status: "ativo", filas: 1 },
  { id: "u6", nome: "Roberto Tavares", email: "roberto@acme.com", telefone: "+55 11 98821-4422", perfil: "lider" as Perfil, setor: "Zona Sul · 12 entregadores", status: "ativo", filas: 1 },
  { id: "u7", nome: "Fernanda Costa", email: "fernanda@acme.com", telefone: "+55 11 98712-1198", perfil: "lider" as Perfil, setor: "Zona Norte · 8 entregadores", status: "inativo", filas: 0 },
];

const Usuarios = () => {
  const [filter, setFilter] = useState<Perfil | "todos">("todos");
  const [showNew, setShowNew] = useState(false);

  const filtered = filter === "todos" ? usuarios : usuarios.filter(u => u.perfil === filter);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <PageHeader
          eyebrow="Configurações"
          title="Usuários e Perfis"
          description="Gestão de acesso, perfis e permissões da plataforma."
          actions={
            <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow">
              <Plus className="h-3.5 w-3.5" /> Novo usuário
            </button>
          }
        />

        {/* KPIs por perfil */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {(Object.keys(perfilMeta) as Perfil[]).map(p => {
            const meta = perfilMeta[p];
            const Icon = meta.icon;
            const count = usuarios.filter(u => u.perfil === p).length;
            return (
              <button key={p} onClick={() => setFilter(p)} className={cn("rounded-xl border border-border bg-surface p-4 text-left transition-colors", filter === p && "ring-2 ring-primary/40")}>
                <div className="flex items-center justify-between">
                  <div className={cn("flex h-7 w-7 items-center justify-center rounded-md", meta.color)}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="font-mono text-lg font-semibold">{count}</div>
                </div>
                <div className="mt-2 text-xs font-medium">{meta.label}</div>
                <div className="text-[10px] text-muted-foreground">{count === 1 ? "1 usuário" : `${count} usuários`}</div>
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="mb-3 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Buscar por nome, email ou telefone..." className="w-full rounded-md border border-border bg-background/40 pl-9 pr-3 py-2 text-xs outline-none focus:border-primary/60" />
          </div>
          <button onClick={() => setFilter("todos")} className={cn("rounded-md border border-border px-3 py-1.5 text-xs", filter === "todos" && "bg-surface-elevated")}>Todos</button>
        </div>

        {/* Lista */}
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated text-[10px] uppercase tracking-wider text-subtle-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left">Usuário</th>
                <th className="px-4 py-2.5 text-left">Perfil</th>
                <th className="px-4 py-2.5 text-left">Setor / Vínculo</th>
                <th className="px-4 py-2.5 text-left">Filas WhatsApp</th>
                <th className="px-4 py-2.5 text-left">Status</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const meta = perfilMeta[u.perfil];
                const Icon = meta.icon;
                return (
                  <tr key={u.id} className="border-t border-border hover:bg-surface-elevated transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/configuracoes/usuarios/${u.id}`} className="block">
                        <div className="text-xs font-medium hover:text-primary">{u.nome}</div>
                        <div className="mt-0.5 flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><Mail className="h-2.5 w-2.5" /> {u.email}</span>
                          <span className="inline-flex items-center gap-1"><Phone className="h-2.5 w-2.5" /> {u.telefone}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium", meta.color)}>
                        <Icon className="h-2.5 w-2.5" /> {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{u.setor}</td>
                    <td className="px-4 py-3 font-mono text-xs">{u.filas}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium", u.status === "ativo" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", u.status === "ativo" ? "bg-success" : "bg-muted-foreground")} /> {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded p-1 text-muted-foreground hover:bg-surface-hover hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild><Link to={`/configuracoes/usuarios/${u.id}`} className="flex items-center gap-2"><Eye className="h-3.5 w-3.5" /> Ver ficha</Link></DropdownMenuItem>
                          <DropdownMenuItem><Key className="h-3.5 w-3.5" /> Editar senha</DropdownMenuItem>
                          <DropdownMenuItem><RotateCcw className="h-3.5 w-3.5" /> Reenviar acesso</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>{u.status === "ativo" ? <><UserX className="h-3.5 w-3.5" /> Desativar</> : <><UserCog className="h-3.5 w-3.5" /> Ativar</>}</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive"><Trash2 className="h-3.5 w-3.5" /> Excluir usuário</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showNew && <NovoUsuarioModal onClose={() => setShowNew(false)} />}
    </div>
  );
};

const lideresCadastrados = [
  { id: "l1", nome: "Roberto Tavares", email: "roberto@acme.com", telefone: "+55 11 98821-4422", zona: "Zona Sul", entregadores: 12 },
  { id: "l2", nome: "Fernanda Costa", email: "fernanda@acme.com", telefone: "+55 11 98712-1198", zona: "Zona Norte", entregadores: 8 },
  { id: "l3", nome: "Marcos Pereira", email: "marcos@acme.com", telefone: "+55 11 98512-2278", zona: "ABC", entregadores: 15 },
];

const setores = ["Atendimento Geral", "Financeiro", "Operacional", "Suporte Técnico", "Comercial"];
const webhooks: { name: string; setores: string[] }[] = [
  { name: "Atendimento Principal", setores: ["Atendimento Geral", "Suporte Técnico"] },
  { name: "Vendas SP", setores: ["Comercial", "Financeiro"] },
  { name: "Suporte Técnico", setores: ["Suporte Técnico", "Operacional"] },
  { name: "Plantão 24h", setores: ["Atendimento Geral", "Operacional"] },
];

const NovoUsuarioModal = ({ onClose }: { onClose: () => void }) => {
  const [perfil, setPerfil] = useState<Perfil>("atendente");
  const [liderId, setLiderId] = useState<string>("");
  const lider = lideresCadastrados.find(l => l.id === liderId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-2xl rounded-xl border border-border bg-surface shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="border-b border-border px-6 py-4">
          <h3 className="text-sm font-semibold">Novo usuário</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Login e senha são gerados automaticamente e enviados por email.</p>
        </div>

        <div className="space-y-5 p-6">
          {/* Perfil */}
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">Perfil</label>
            <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
              {(Object.keys(perfilMeta) as Perfil[]).map(p => {
                const m = perfilMeta[p];
                const Icon = m.icon;
                return (
                  <button key={p} onClick={() => setPerfil(p)} className={cn("flex flex-col items-center gap-1.5 rounded-md border p-3 text-xs transition-colors", perfil === p ? "border-primary bg-primary/5" : "border-border hover:bg-surface-elevated")}>
                    <Icon className="h-4 w-4" /> {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Líder pré-cadastrado */}
          {perfil === "lider" && (
            <div className="rounded-md border border-warning/30 bg-warning/5 p-4">
              <label className="text-[10px] font-medium uppercase tracking-wider text-warning">Selecionar líder cadastrado</label>
              <select value={liderId} onChange={e => setLiderId(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm">
                <option value="">— escolher líder —</option>
                {lideresCadastrados.map(l => <option key={l.id} value={l.id}>{l.nome} · {l.zona}</option>)}
              </select>
              {lider && (
                <div className="mt-3 grid grid-cols-2 gap-3 rounded-md bg-background/40 p-3">
                  <Field label="Nome" value={lider.nome} readOnly />
                  <Field label="Telefone" value={lider.telefone} readOnly />
                  <Field label="Email" value={lider.email} readOnly />
                  <Field label="Equipe" value={`${lider.entregadores} entregadores`} readOnly />
                </div>
              )}
            </div>
          )}

          {/* Dados pessoais */}
          {perfil !== "lider" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Nome completo" placeholder="Ex.: Maria Silva" />
              <Field label="Telefone" placeholder="+55 11 98765-4321" />
              <div className="md:col-span-2"><Field label="Email" placeholder="maria@empresa.com" /></div>
            </div>
          )}

          {/* Administrador: sem fila/setor — visão global */}
          {perfil === "administrador" && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5 text-destructive"><Shield className="h-3.5 w-3.5" /> <span className="font-medium">Acesso administrativo total</span></div>
              <p className="mt-1">Administradores não realizam atendimento. Têm visão global de todos os tickets, conversas, filas e setores da plataforma.</p>
            </div>
          )}

          {/* Líder: sem fila/setor — vai gerar usuário do Portal do Líder */}
          {perfil === "lider" && (
            <div className="rounded-md border border-warning/30 bg-warning/5 p-3 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5 text-warning"><Crown className="h-3.5 w-3.5" /> <span className="font-medium">Usuário do Portal do Líder</span></div>
              <p className="mt-1">Líderes não atuam em filas de atendimento. Este cadastro gera o acesso ao Portal do Líder para gestão de equipe e escalas.</p>
            </div>
          )}

          {/* Atendente / Gestor: filas + setores por fila */}
          {(perfil === "atendente" || perfil === "gestor") && (
            <FilasSetoresPicker perfil={perfil} />
          )}

          {/* Geração de credenciais */}
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5 text-primary"><Mail className="h-3.5 w-3.5" /> <span className="font-medium">Credenciais automáticas</span></div>
            <p className="mt-1">Ao salvar, geraremos <span className="font-mono">usuario.acme</span> e uma senha temporária forte. Os dados serão enviados ao email cadastrado.</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-3">
          <button onClick={onClose} className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-surface-hover">Cancelar</button>
          <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow">Criar e enviar acesso</button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, placeholder, readOnly }: { label: string; value?: string; placeholder?: string; readOnly?: boolean }) => (
  <div>
    <label className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">{label}</label>
    <input defaultValue={value} placeholder={placeholder} readOnly={readOnly} className={cn("mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-primary/60", readOnly ? "bg-muted/30" : "bg-background/40")} />
  </div>
);

export default Usuarios;
