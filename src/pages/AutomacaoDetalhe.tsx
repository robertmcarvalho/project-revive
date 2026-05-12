import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Pencil, Play, Pause, Bot, GitBranch, MessageSquare, Filter, Bell,
  Check, AlertCircle, Clock, ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const tabs = ["Visão geral", "Execuções", "Logs", "Versões"] as const;
type Tab = typeof tabs[number];

const mockRuns = Array.from({ length: 14 }).map((_, i) => {
  const status = i % 9 === 0 ? "fail" : i % 5 === 0 ? "warn" : "ok";
  const date = new Date(Date.now() - i * 1000 * 60 * 23);
  return {
    id: `RUN-${10298 - i}`,
    status,
    date,
    duration: 120 + Math.round(Math.random() * 800),
    canal: ["WhatsApp", "Instagram", "Webchat"][i % 3],
    cliente: `C-${9000 + i}`,
  };
});

const flowSteps = [
  { type: "trigger", label: "Nova conversa", icon: MessageSquare, color: "text-primary bg-primary/15" },
  { type: "filter", label: "canal é WhatsApp", icon: Filter, color: "text-warning bg-warning/15" },
  { type: "action", label: "Resposta com IA", icon: Bot, color: "text-primary bg-primary/15" },
  { type: "action", label: "Aplicar etiqueta: Triagem", icon: Filter, color: "text-warning bg-warning/15" },
  { type: "action", label: "Rotear para fila: Suporte", icon: GitBranch, color: "text-channel-instagram bg-channel-instagram/15" },
  { type: "action", label: "Notificar equipe", icon: Bell, color: "text-destructive bg-destructive/15" },
];

const fmtTime = (d: Date) =>
  d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

const AutomacaoDetalhe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("Visão geral");
  const [enabled, setEnabled] = useState(true);
  const [selectedRun, setSelectedRun] = useState<typeof mockRuns[number] | null>(null);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <Link to="/automacoes" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Automações
        </Link>

        <PageHeader
          eyebrow={`AUT-${String(id ?? "0001").padStart(4, "0")} · Inteligência`}
          title="Triagem inicial - Bot"
          description="Classifica novas conversas e direciona para a fila correta usando IA."
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setEnabled(!enabled); toast({ title: enabled ? "Automação pausada" : "Automação ativada" }); }}
                className={cn(
                  "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                  enabled
                    ? "border-warning/40 bg-warning/10 text-warning hover:bg-warning/15"
                    : "border-success/40 bg-success/10 text-success hover:bg-success/15"
                )}
              >
                {enabled ? <><Pause className="h-3.5 w-3.5" /> Pausar</> : <><Play className="h-3.5 w-3.5" /> Ativar</>}
              </button>
              <button
                onClick={() => navigate(`/automacoes/nova?edit=${id}`)}
                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" /> Editar fluxo
              </button>
            </div>
          }
        />

        {/* KPIs */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Execuções (24h)", value: "412" },
            { label: "Taxa de sucesso", value: "98.4%", accent: "text-success" },
            { label: "Latência média", value: "286ms" },
            { label: "Falhas hoje", value: "6", accent: "text-warning" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-border bg-surface p-4">
              <div className={cn("text-xl font-semibold tracking-tight", s.accent)}>{s.value}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-4 flex items-center gap-1 border-b border-border">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors",
                tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Visão geral" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground mb-4">
                Estrutura do fluxo
              </div>
              <div className="space-y-2">
                {flowSteps.map((s, i) => {
                  const I = s.icon;
                  return (
                    <div key={i}>
                      <div className="flex items-center gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5">
                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", s.color)}>
                          <I className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-[10px] uppercase tracking-wider text-subtle-foreground">
                            {s.type === "trigger" ? "Gatilho" : s.type === "filter" ? "Condição" : `Ação ${i - 1}`}
                          </div>
                          <div className="text-sm">{s.label}</div>
                        </div>
                      </div>
                      {i < flowSteps.length - 1 && (
                        <div className="ml-7 h-3 border-l border-dashed border-border" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border border-border bg-surface p-4">
                <div className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground mb-3">Detalhes</div>
                <dl className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Estado</dt>
                    <dd>
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                        enabled ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                      )}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", enabled ? "bg-success" : "bg-muted-foreground")} />
                        {enabled ? "Ativa" : "Pausada"}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Prioridade</dt><dd className="font-medium">Alta</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Canais</dt><dd className="font-medium">WhatsApp, Webchat</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Criada por</dt><dd className="font-medium">Maria Souza</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Última edição</dt><dd className="font-medium">há 2 dias</dd></div>
                </dl>
              </div>

              <div className="rounded-xl border border-border bg-surface p-4">
                <div className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground mb-2">Tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {["triagem", "ia", "whatsapp", "produção"].map(t => (
                    <span key={t} className="rounded-full bg-background/60 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">{t}</span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}

        {tab === "Execuções" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Quando</th>
                    <th className="px-4 py-3">Canal</th>
                    <th className="px-4 py-3 text-right">Duração</th>
                    <th className="px-4 py-3 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {mockRuns.map(r => (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRun(r)}
                      className={cn(
                        "cursor-pointer border-b border-border/50 last:border-0 hover:bg-surface-hover transition-colors",
                        selectedRun?.id === r.id && "bg-surface-hover"
                      )}
                    >
                      <td className="px-4 py-2.5 font-mono text-xs">{r.id}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                          r.status === "ok" && "bg-success/15 text-success",
                          r.status === "warn" && "bg-warning/15 text-warning",
                          r.status === "fail" && "bg-destructive/15 text-destructive",
                        )}>
                          {r.status === "ok" && <Check className="h-2.5 w-2.5" />}
                          {r.status === "warn" && <Clock className="h-2.5 w-2.5" />}
                          {r.status === "fail" && <AlertCircle className="h-2.5 w-2.5" />}
                          {r.status === "ok" ? "Sucesso" : r.status === "warn" ? "Lento" : "Falha"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">{fmtTime(r.date)}</td>
                      <td className="px-4 py-2.5 text-xs">{r.canal}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs">{r.duration}ms</td>
                      <td className="px-4 py-2.5"><ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <aside className="rounded-xl border border-border bg-surface p-4 h-fit sticky top-4">
              <div className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground mb-3">
                {selectedRun ? `Execução ${selectedRun.id}` : "Selecione uma execução"}
              </div>
              {selectedRun ? (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Cliente</span><span className="font-mono">{selectedRun.cliente}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Canal</span><span>{selectedRun.canal}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Início</span><span className="font-mono">{fmtTime(selectedRun.date)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Duração</span><span className="font-mono">{selectedRun.duration}ms</span></div>

                  <div className="pt-2 border-t border-border">
                    <div className="text-[10px] uppercase tracking-wider text-subtle-foreground mb-2">Trace</div>
                    <div className="space-y-1 font-mono text-[11px]">
                      <div className="text-muted-foreground">[+0ms] Gatilho disparado</div>
                      <div className="text-muted-foreground">[+12ms] Filtro avaliado: true</div>
                      <div className="text-success">[+128ms] ✓ Resposta com IA</div>
                      <div className="text-success">[+156ms] ✓ Etiqueta aplicada</div>
                      <div className={selectedRun.status === "fail" ? "text-destructive" : "text-success"}>
                        [+{selectedRun.duration}ms] {selectedRun.status === "fail" ? "✗ Rotear (timeout)" : "✓ Roteamento concluído"}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">Clique em uma linha para ver o trace completo.</div>
              )}
            </aside>
          </div>
        )}

        {tab === "Logs" && (
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="font-mono text-[11px] space-y-1 max-h-[60vh] overflow-y-auto">
              {[
                "[2026-05-12 14:32:01] INFO  Automação iniciada · run=RUN-10298",
                "[2026-05-12 14:32:01] DEBUG Trigger payload recebido (1.2kb)",
                "[2026-05-12 14:32:01] INFO  Filtro 'canal=WhatsApp' avaliado como true",
                "[2026-05-12 14:32:01] INFO  Ação 1 'ai-reply' iniciada",
                "[2026-05-12 14:32:01] DEBUG OpenAI request (modelo=gpt-4o-mini)",
                "[2026-05-12 14:32:02] INFO  Ação 1 concluída em 128ms",
                "[2026-05-12 14:32:02] INFO  Ação 2 'tag' aplicou 'Triagem'",
                "[2026-05-12 14:32:02] INFO  Ação 3 'route' direcionou para fila Suporte",
                "[2026-05-12 14:32:02] INFO  Run finalizada com sucesso",
                "[2026-05-12 14:31:38] WARN  Run RUN-10297 concluiu em 812ms (acima da meta)",
                "[2026-05-12 14:30:11] ERROR Run RUN-10296 falhou em 'route': fila inexistente 'BackOffice2'",
              ].map((l, i) => (
                <div key={i} className={cn(
                  l.includes("ERROR") && "text-destructive",
                  l.includes("WARN") && "text-warning",
                  l.includes("DEBUG") && "text-subtle-foreground",
                  !l.match(/ERROR|WARN|DEBUG/) && "text-muted-foreground",
                )}>{l}</div>
              ))}
            </div>
          </div>
        )}

        {tab === "Versões" && (
          <div className="rounded-xl border border-border bg-surface">
            {[
              { v: "v8", date: "12/05 14:02", autor: "Maria Souza", nota: "Adicionada notificação para equipe", current: true },
              { v: "v7", date: "10/05 09:14", autor: "Maria Souza", nota: "Ajuste no prompt da IA" },
              { v: "v6", date: "05/05 16:48", autor: "João Lima", nota: "Nova condição: tag=VIP" },
              { v: "v5", date: "28/04 11:20", autor: "Maria Souza", nota: "Versão inicial publicada" },
            ].map((v, i, arr) => (
              <div key={v.v} className={cn("flex items-center justify-between px-4 py-3", i < arr.length - 1 && "border-b border-border/50")}>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground w-8">{v.v}</span>
                  <div>
                    <div className="text-sm">{v.nota}</div>
                    <div className="text-[10px] text-subtle-foreground">{v.autor} · {v.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {v.current && <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">Atual</span>}
                  {!v.current && (
                    <button
                      onClick={() => toast({ title: "Versão restaurada", description: `${v.v} agora é a versão atual.` })}
                      className="rounded-md border border-border bg-background/40 px-2 py-1 text-[11px] hover:bg-surface-hover"
                    >
                      Restaurar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AutomacaoDetalhe;
