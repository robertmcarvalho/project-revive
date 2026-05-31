import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Briefcase, MessageCircle, FileText, Trophy, X, Edit3, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { comercialApi } from "@/lib/comercialApi";
import type { Activity, ChatMessage, Lead, LossReason, PipelineStage } from "@/data/comercialMock";
import { users } from "@/data/comercialMock";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type TabId = "resumo" | "conversa" | "atividades" | "proposta" | "viabilidade" | "arquivos";

const tabs: { id: TabId; label: string }[] = [
  { id: "resumo", label: "Resumo" },
  { id: "conversa", label: "Conversa" },
  { id: "atividades", label: "Atividades" },
  { id: "proposta", label: "Proposta" },
  { id: "viabilidade", label: "Viabilidade" },
  { id: "arquivos", label: "Arquivos" },
];

const LeadFicha = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [tab, setTab] = useState<TabId>("resumo");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reasons, setReasons] = useState<LossReason[]>([]);
  const [showLoss, setShowLoss] = useState(false);
  const [showWon, setShowWon] = useState(false);
  const [draft, setDraft] = useState("");

  const reload = () => id && comercialApi.getLead(id).then(setLead);

  useEffect(() => {
    if (!id) return;
    comercialApi.getLead(id).then(setLead);
    comercialApi.listStages().then(setStages);
    comercialApi.listActivities(id).then(setActivities);
    comercialApi.listMessages(id).then(setMessages);
    comercialApi.listLossReasons().then(setReasons);
  }, [id]);

  if (!lead) {
    return <div className="p-8 text-sm text-muted-foreground">Carregando ficha do lead...</div>;
  }

  const stage = stages.find((s) => s.id === lead.stageId);
  const owner = users.find((u) => u.id === lead.ownerId);
  const isClosed = !!stage?.is_won || !!stage?.is_lost;

  const handleStageChange = async (newStageId: string) => {
    await comercialApi.updateLead(lead.id, { stageId: newStageId });
    reload();
    comercialApi.listActivities(lead.id).then(setActivities);
    toast({ title: "Estágio atualizado" });
  };

  const sendMsg = async () => {
    if (!draft.trim()) return;
    const m = await comercialApi.sendMessage(lead.id, draft.trim());
    setMessages((p) => [...p, m]);
    setDraft("");
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-8 py-8">
        <Link to="/comercial/leads" className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Voltar para leads
        </Link>

        <PageHeader
          icon={Briefcase}
          eyebrow="Comercial"
          title={lead.fantasyName}
          description={`${lead.city}/${lead.uf} · ${lead.decisorName}`}
          actions={
            <>
              <button className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs hover:bg-surface-hover">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </button>
              <button className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs hover:bg-surface-hover">
                <FileText className="h-3.5 w-3.5" /> Gerar proposta
              </button>
              {!isClosed && (
                <>
                  <button onClick={() => setShowWon(true)} className="flex items-center gap-1.5 rounded-md border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-medium text-success hover:bg-success/15">
                    <Trophy className="h-3.5 w-3.5" /> Ganho
                  </button>
                  <button onClick={() => setShowLoss(true)} className="flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/15">
                    <X className="h-3.5 w-3.5" /> Perdido
                  </button>
                </>
              )}
              <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow">
                <Edit3 className="h-3.5 w-3.5" /> Editar
              </button>
            </>
          }
        />

        {/* Badges row */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {stage && (
            <select value={stage.id} onChange={(e) => handleStageChange(e.target.value)} disabled={isClosed}
              className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium" style={{ borderColor: `hsl(${stage.color}/0.4)` }}>
              {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
          <span className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-muted-foreground">Origem: <span className="text-foreground capitalize">{lead.origin}</span></span>
          <span className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-muted-foreground">Owner: <span className="text-foreground">{owner?.name}</span></span>
          {typeof lead.score === "number" && (
            <span className="rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs text-primary">Score IA: <span className="font-mono font-semibold">{lead.score}</span></span>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-1 overflow-x-auto border-b border-border">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("relative px-3 py-2 text-xs font-medium transition-colors", tab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
              {t.label}
              {tab === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded bg-primary" />}
            </button>
          ))}
        </div>

        {tab === "resumo" && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface p-5 lg:col-span-2">
              <h3 className="mb-3 text-sm font-semibold">Dados do lead</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <F label="Razão social" value={lead.companyName ?? "—"} />
                <F label="CNPJ" value={lead.cnpj ?? "—"} mono />
                <F label="WhatsApp" value={lead.whatsapp} mono />
                <F label="E-mail" value={lead.decisorEmail ?? "—"} />
                <F label="Entregas/mês" value={lead.estDeliveries ? String(lead.estDeliveries) : "—"} mono />
                <F label="Nº entregadores" value={lead.estDrivers ? String(lead.estDrivers) : "—"} mono />
                <F label="ERP" value={lead.erp ?? "—"} />
                <F label="Horário de pico" value={lead.peakHours ?? "—"} />
              </div>
              {Object.keys(lead.customFields).length > 0 && (
                <>
                  <h4 className="mt-5 mb-2 text-xs font-semibold uppercase tracking-wider text-subtle-foreground">Campos personalizados</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {Object.entries(lead.customFields).map(([k, v]) => <F key={k} label={k} value={String(v)} />)}
                  </div>
                </>
              )}
            </div>
            <div className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-2 text-sm font-semibold">Notas</h3>
              <p className="text-xs text-muted-foreground">{lead.notes ?? "Sem notas registradas."}</p>
              {lead.lossReasonId && (
                <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs">
                  <div className="flex items-center gap-1.5 text-destructive"><AlertCircle className="h-3.5 w-3.5" /> Motivo da perda</div>
                  <div className="mt-1 text-foreground">{reasons.find((r) => r.id === lead.lossReasonId)?.name}</div>
                  {lead.lossNotes && <div className="mt-1 text-muted-foreground">{lead.lossNotes}</div>}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "conversa" && (
          <div className="flex h-[60vh] flex-col overflow-hidden rounded-xl border border-border bg-surface">
            <div className="border-b border-border px-4 py-2.5 text-xs text-muted-foreground">Canal comercial · {lead.whatsapp}</div>
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {messages.length === 0 && <div className="py-8 text-center text-xs text-muted-foreground">Nenhuma mensagem ainda.</div>}
              {messages.map((m) => (
                <div key={m.id} className={cn("flex", m.from === "agent" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[70%] rounded-2xl px-3.5 py-2 text-sm", m.from === "agent" ? "border border-primary/30 bg-primary/5 text-foreground" : "border border-border bg-surface-elevated text-foreground")}>
                    {m.text}
                    <div className="mt-1 text-right font-mono text-[9px] text-subtle-foreground">{new Date(m.at).toLocaleString("pt-BR")}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-border p-3">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMsg()}
                placeholder="Escrever mensagem..." className="flex-1 rounded-md border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary/60" />
              <button onClick={sendMsg} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary-glow">
                <Send className="h-3.5 w-3.5" /> Enviar
              </button>
            </div>
          </div>
        )}

        {tab === "atividades" && (
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="mb-4 text-sm font-semibold">Linha do tempo</h3>
            <ol className="space-y-3">
              {activities.map((a) => (
                <li key={a.id} className="flex gap-3">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" style={{ boxShadow: "0 0 6px hsl(var(--primary)/0.6)" }} />
                  <div className="flex-1 border-b border-border/50 pb-3">
                    <div className="text-sm text-foreground">{a.text}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-subtle-foreground">{new Date(a.at).toLocaleString("pt-BR")} {a.actor && `· ${a.actor}`}</div>
                  </div>
                </li>
              ))}
              {activities.length === 0 && <div className="text-xs text-muted-foreground">Sem atividades.</div>}
            </ol>
          </div>
        )}

        {tab === "proposta" && (
          <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="mt-3 text-sm font-semibold">Gerador de propostas</h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">Em breve: template HTML com pricing dinâmico + envio por WhatsApp/PDF.</p>
            <button className="mt-4 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground opacity-60" disabled>Gerar proposta (P2)</button>
          </div>
        )}

        {tab === "viabilidade" && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <ViabCard label="Cobertura na praça" value="Atendido" ok />
            <ViabCard label="Volume compatível" value={lead.estDeliveries ? `${lead.estDeliveries}/mês` : "—"} ok={!!lead.estDeliveries && lead.estDeliveries > 100} />
            <ViabCard label="Tempo estimado de entrega" value="42 min" ok />
          </div>
        )}

        {tab === "arquivos" && (
          <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center text-xs text-muted-foreground">
            Upload de contratos e anexos em breve (P3).
          </div>
        )}
      </div>

      {/* Modal perdido */}
      {showLoss && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowLoss(false)}>
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()} style={{ boxShadow: "var(--shadow-elevated), var(--shadow-top-highlight)" }}>
            <h3 className="text-sm font-semibold">Marcar como perdido</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Selecione o motivo e adicione uma observação.</p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              await comercialApi.loseLead(lead.id, String(fd.get("reason")), String(fd.get("notes") || ""));
              setShowLoss(false); reload();
              toast({ title: "Lead marcado como perdido" });
            }} className="mt-4 space-y-3">
              <select name="reason" required className="w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm">
                <option value="">Selecione o motivo</option>
                {reasons.filter((r) => r.active).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <textarea name="notes" rows={3} placeholder="Notas (opcional)" className="w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary/60" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowLoss(false)} className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs hover:bg-surface-hover">Cancelar</button>
                <button type="submit" className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:opacity-90">Confirmar perda</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Wizard ganho */}
      {showWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowWon(false)}>
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()} style={{ boxShadow: "var(--shadow-elevated), var(--shadow-top-highlight)" }}>
            <div className="flex items-center gap-2 text-success"><Trophy className="h-4 w-4" /> <h3 className="text-sm font-semibold">Converter em farmácia</h3></div>
            <p className="mt-1 text-xs text-muted-foreground">Vamos criar o registro definitivo em Farmácias. Confirme os dados.</p>
            <div className="mt-4 space-y-2 rounded-md border border-border bg-background/40 p-4 text-xs">
              <Row label="Nome fantasia" value={lead.fantasyName} />
              <Row label="CNPJ" value={lead.cnpj ?? "—"} />
              <Row label="Cidade/UF" value={`${lead.city}/${lead.uf}`} />
              <Row label="Líder responsável" value="A definir" />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowWon(false)} className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs hover:bg-surface-hover">Cancelar</button>
              <button onClick={async () => {
                const r = await comercialApi.convertLead(lead.id);
                setShowWon(false); reload();
                toast({ title: "Farmácia criada", description: `ID: ${r.pharmacyId}` });
              }} className="flex items-center gap-1.5 rounded-md bg-success px-3 py-1.5 text-xs font-medium text-success-foreground hover:opacity-90">
                <CheckCircle2 className="h-3.5 w-3.5" /> Converter agora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const F = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div className="rounded-md border border-border bg-background/40 px-3 py-2">
    <div className="text-[10px] uppercase tracking-wider text-subtle-foreground">{label}</div>
    <div className={cn("mt-0.5 text-foreground", mono && "font-mono")}>{value}</div>
  </div>
);
const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-3"><span className="text-muted-foreground">{label}</span><span className="text-foreground">{value}</span></div>
);
const ViabCard = ({ label, value, ok }: { label: string; value: string; ok?: boolean }) => (
  <div className="rounded-xl border border-border bg-surface p-4">
    <div className="text-[10px] uppercase tracking-wider text-subtle-foreground">{label}</div>
    <div className={cn("mt-1 text-lg font-semibold", ok ? "text-success" : "text-warning")}>{value}</div>
  </div>
);

export default LeadFicha;
