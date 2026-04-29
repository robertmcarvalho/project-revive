import { useState } from "react";
import { Search, Plus, Filter, Download, Phone, MessageSquare, Tag, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ChannelBadge } from "@/components/ChannelBadge";
import { cn } from "@/lib/utils";

const contacts = [
  { id: 1, name: "Ana Beatriz Lima", phone: "+55 11 98765-4321", tags: ["VIP", "Recorrente"], pharmacy: "Farmácia Central", lastChat: "há 2h", conversations: 47, status: "active" },
  { id: 2, name: "Carlos Eduardo Souza", phone: "+55 21 99876-5432", tags: ["Novo"], pharmacy: "Drogaria São Paulo", lastChat: "há 5h", conversations: 3, status: "active" },
  { id: 3, name: "Mariana Costa", phone: "+55 31 98765-1234", tags: ["VIP"], pharmacy: "Farmácia Popular", lastChat: "ontem", conversations: 28, status: "active" },
  { id: 4, name: "Roberto Almeida", phone: "+55 11 91234-5678", tags: ["Bloqueado"], pharmacy: "—", lastChat: "há 3d", conversations: 12, status: "blocked" },
  { id: 5, name: "Patrícia Ferreira", phone: "+55 41 98888-7777", tags: ["Recorrente"], pharmacy: "Farmácia Central", lastChat: "há 1h", conversations: 65, status: "active" },
  { id: 6, name: "Fernando Ribeiro", phone: "+55 11 97654-3210", tags: ["Novo", "Lead"], pharmacy: "Drogaria São Paulo", lastChat: "há 30min", conversations: 1, status: "active" },
  { id: 7, name: "Juliana Martins", phone: "+55 51 96543-2109", tags: ["VIP"], pharmacy: "Farmácia Popular", lastChat: "há 4h", conversations: 89, status: "active" },
  { id: 8, name: "Diego Pereira", phone: "+55 11 95432-1098", tags: [], pharmacy: "—", lastChat: "há 1 sem", conversations: 8, status: "inactive" },
];

const tagColors: Record<string, string> = {
  VIP: "bg-warning/15 text-warning border-warning/30",
  Recorrente: "bg-primary/15 text-primary border-primary/30",
  Novo: "bg-success/15 text-success border-success/30",
  Lead: "bg-channel-instagram/15 text-channel-instagram border-channel-instagram/30",
  Bloqueado: "bg-destructive/15 text-destructive border-destructive/30",
};

const Contatos = () => {
  const [q, setQ] = useState("");
  const filtered = contacts.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q));

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <PageHeader
          eyebrow="CRM"
          title="Contatos"
          description="Base unificada de clientes e leads do WhatsApp."
          actions={
            <>
              <button className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-surface-hover transition-colors">
                <Download className="h-3.5 w-3.5" /> Exportar
              </button>
              <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow transition-colors">
                <Plus className="h-3.5 w-3.5" /> Novo contato
              </button>
            </>
          }
        />

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Total de contatos", value: "12.847" },
            { label: "Novos este mês", value: "+248", accent: "text-success" },
            { label: "Ativos (30d)", value: "4.123" },
            { label: "Tags em uso", value: "34" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-border bg-surface p-4">
              <div className={cn("text-xl font-semibold tracking-tight", s.accent)}>{s.value}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-surface px-3 py-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, telefone ou tag..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-subtle-foreground"
            />
          </div>
          <button className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium hover:bg-surface-hover">
            <Filter className="h-3.5 w-3.5" /> Filtros
          </button>
          <button className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium hover:bg-surface-hover">
            <Tag className="h-3.5 w-3.5" /> Tags
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">
                <th className="px-4 py-3 w-8"><input type="checkbox" className="rounded border-border bg-background" /></th>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Farmácia vinculada</th>
                <th className="px-4 py-3 text-right">Conversas</th>
                <th className="px-4 py-3">Última interação</th>
                <th className="px-4 py-3 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-border/50 last:border-0 hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3"><input type="checkbox" className="rounded border-border bg-background" /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/40 to-channel-instagram/40 text-[11px] font-semibold">
                        {c.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{c.name}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{c.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.tags.map(t => (
                        <span key={t} className={cn("rounded border px-1.5 py-0.5 text-[10px] font-medium", tagColors[t] ?? "bg-muted text-muted-foreground border-border")}>{t}</span>
                      ))}
                      {c.tags.length === 0 && <span className="text-[10px] text-subtle-foreground">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{c.pharmacy}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm">{c.conversations}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{c.lastChat}</td>
                  <td className="px-4 py-3">
                    <button className="flex h-7 w-7 items-center justify-center rounded hover:bg-surface-elevated">
                      <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Contatos;
