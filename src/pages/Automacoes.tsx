import { useState } from "react";
import { Plus, Bot, Zap, Clock, MessageSquare, GitBranch, MoreHorizontal, Play, Pencil, Copy, Trash2, BarChart3, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface Automation {
  id: number; name: string; trigger: string; actions: number;
  runs: number; success: number; enabled: boolean; type: string;
}

const initial: Automation[] = [
  { id: 1, name: "Triagem inicial - Bot", trigger: "Nova conversa", actions: 4, runs: 12480, success: 98.4, enabled: true, type: "bot" },
  { id: 2, name: "Roteamento por palavra-chave", trigger: "Mensagem recebida", actions: 2, runs: 8932, success: 96.1, enabled: true, type: "routing" },
  { id: 3, name: "Auto-resposta fora do horário", trigger: "Fora do horário comercial", actions: 1, runs: 4521, success: 100, enabled: true, type: "schedule" },
  { id: 4, name: "Lembrete parcela em atraso (3 dias)", trigger: "Parcela vencida +3d", actions: 2, runs: 287, success: 92.7, enabled: true, type: "financial" },
  { id: 5, name: "Pesquisa CSAT pós-atendimento", trigger: "Conversa resolvida", actions: 1, runs: 2104, success: 94.8, enabled: true, type: "csat" },
  { id: 6, name: "Reabertura por inatividade 24h", trigger: "Conversa sem resposta 24h", actions: 3, runs: 712, success: 88.2, enabled: false, type: "reopen" },
  { id: 7, name: "Escalação SLA crítico", trigger: "SLA < 5min", actions: 2, runs: 156, success: 99.4, enabled: true, type: "sla" },
];

const typeMeta: Record<string, { icon: typeof Bot; color: string }> = {
  bot: { icon: Bot, color: "text-primary bg-primary/15" },
  routing: { icon: GitBranch, color: "text-channel-instagram bg-channel-instagram/15" },
  schedule: { icon: Clock, color: "text-warning bg-warning/15" },
  financial: { icon: Zap, color: "text-success bg-success/15" },
  csat: { icon: MessageSquare, color: "text-channel-whatsapp bg-channel-whatsapp/15" },
  reopen: { icon: Clock, color: "text-muted-foreground bg-muted" },
  sla: { icon: Zap, color: "text-destructive bg-destructive/15" },
};

const Automacoes = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Automation[]>(initial);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Automation | null>(null);

  const toggle = (id: number) => {
    setItems(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
    const a = items.find(x => x.id === id);
    if (a) toast({ title: a.enabled ? "Automação pausada" : "Automação ativada", description: a.name });
  };

  const duplicate = (a: Automation) => {
    const newId = Math.max(...items.map(x => x.id)) + 1;
    setItems(prev => [...prev, { ...a, id: newId, name: `${a.name} (cópia)`, enabled: false, runs: 0, success: 0 }]);
    setOpenMenuId(null);
    toast({ title: "Automação duplicada", description: `Nova: ${a.name} (cópia)` });
  };

  const remove = (a: Automation) => {
    setItems(prev => prev.filter(x => x.id !== a.id));
    setConfirmDelete(null);
    toast({ title: "Automação excluída", description: a.name });
  };

  return (
    <div className="h-full overflow-y-auto" onClick={() => setOpenMenuId(null)}>
      <div className="mx-auto max-w-7xl px-8 py-8">
        <PageHeader
          eyebrow="Inteligência"
          title="Automações"
          description="Fluxos, bots de triagem e regras de roteamento."
          actions={
            <Link
              to="/automacoes/nova"
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Nova automação
            </Link>
          }
        />

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Automações ativas", value: `${items.filter(i => i.enabled).length} / ${items.length}` },
            { label: "Execuções (mês)", value: "29.1k" },
            { label: "Taxa de sucesso", value: "96.7%", accent: "text-success" },
            { label: "Tempo médio economizado", value: "1.840h", accent: "text-primary" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-border bg-surface p-4">
              <div className={cn("text-xl font-semibold tracking-tight", s.accent)}>{s.value}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="overflow-visible rounded-xl border border-border bg-surface">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">
                <th className="px-4 py-3">Automação</th>
                <th className="px-4 py-3">Gatilho</th>
                <th className="px-4 py-3 text-center">Ações</th>
                <th className="px-4 py-3 text-right">Execuções</th>
                <th className="px-4 py-3 text-right">Sucesso</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(a => {
                const meta = typeMeta[a.type];
                const Icon = meta.icon;
                return (
                  <tr
                    key={a.id}
                    onClick={() => navigate(`/automacoes/${a.id}`)}
                    className="cursor-pointer border-b border-border/50 last:border-0 hover:bg-surface-hover transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", meta.color)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{a.name}</div>
                          <div className="text-[10px] text-subtle-foreground">ID: AUT-{String(a.id).padStart(4, "0")}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded bg-background/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                        <Play className="h-2.5 w-2.5" /> {a.trigger}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-xs">{a.actions}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm">{a.runs.toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn("font-mono text-sm", a.success >= 95 ? "text-success" : a.success >= 85 ? "text-warning" : "text-destructive")}>
                        {a.success}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggle(a.id); }}
                        className={cn(
                          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                          a.enabled ? "bg-primary" : "bg-muted"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                          a.enabled ? "translate-x-5" : "translate-x-1"
                        )} />
                      </button>
                    </td>
                    <td className="px-4 py-3 relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === a.id ? null : a.id); }}
                        className="flex h-7 w-7 items-center justify-center rounded hover:bg-surface-elevated"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      {openMenuId === a.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-2 top-10 z-20 w-48 rounded-lg border border-border bg-popover shadow-elevated py-1"
                        >
                          {[
                            { label: "Editar fluxo", icon: Pencil, onClick: () => { navigate(`/automacoes/nova?edit=${a.id}`); setOpenMenuId(null); } },
                            { label: "Ver execuções", icon: BarChart3, onClick: () => { navigate(`/automacoes/${a.id}`); setOpenMenuId(null); } },
                            { label: "Duplicar", icon: Copy, onClick: () => duplicate(a) },
                            { label: "Excluir", icon: Trash2, danger: true, onClick: () => { setConfirmDelete(a); setOpenMenuId(null); } },
                          ].map(it => {
                            const I = it.icon;
                            return (
                              <button
                                key={it.label}
                                onClick={it.onClick}
                                className={cn(
                                  "flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-surface-hover transition-colors",
                                  it.danger && "text-destructive"
                                )}
                              >
                                <I className="h-3.5 w-3.5" /> {it.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface shadow-elevated" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="text-sm font-semibold">Excluir automação?</div>
              <button onClick={() => setConfirmDelete(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-4 text-xs text-muted-foreground">
              Tem certeza que deseja excluir <span className="font-medium text-foreground">{confirmDelete.name}</span>?
              Esta ação não pode ser desfeita e o histórico de execuções será removido.
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-surface-hover"
              >
                Cancelar
              </button>
              <button
                onClick={() => remove(confirmDelete)}
                className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:opacity-90"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Automacoes;
