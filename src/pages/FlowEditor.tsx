import { useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, Play, Save, MoreHorizontal, Search, Zap, MessageSquare,
  GitBranch, Clock, User, Bot, Send, Database, Webhook, Tag, Filter,
  Pause, Settings2, Maximize2, ZoomIn, ZoomOut, Trash2, Copy,
  CheckCircle2, AlertCircle, Sparkles, History, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Tipos ---------- */
type NodeKind =
  | "trigger" | "message" | "ai" | "condition" | "wait" | "assign"
  | "tag" | "webhook" | "db" | "filter" | "send";

type FlowNode = {
  id: string;
  kind: NodeKind;
  title: string;
  subtitle?: string;
  x: number;
  y: number;
  sla?: string;
  status?: "ok" | "warn" | "error";
};

type Edge = { from: string; to: string; label?: string };

/* ---------- Catálogo de nós ---------- */
const nodeCatalog: { kind: NodeKind; label: string; description: string; icon: typeof Zap; color: string; group: string }[] = [
  { kind: "trigger",   label: "Gatilho",         description: "Ponto de entrada do fluxo",       icon: Zap,           color: "text-warning bg-warning/15",                       group: "Início" },
  { kind: "webhook",   label: "Webhook",         description: "Receber chamada HTTP",            icon: Webhook,       color: "text-channel-telegram bg-channel-telegram/15",     group: "Início" },
  { kind: "message",   label: "Enviar mensagem", description: "Texto, mídia ou template",        icon: MessageSquare, color: "text-channel-whatsapp bg-channel-whatsapp/15",     group: "Comunicação" },
  { kind: "send",      label: "Notificar canal", description: "WhatsApp, e-mail, SMS",           icon: Send,          color: "text-channel-email bg-channel-email/15",           group: "Comunicação" },
  { kind: "ai",        label: "IA / Bot",        description: "Classificar, gerar resposta",     icon: Bot,           color: "text-primary bg-primary/15",                       group: "Inteligência" },
  { kind: "condition", label: "Condição",        description: "Ramificar por regra",             icon: GitBranch,     color: "text-channel-instagram bg-channel-instagram/15",   group: "Lógica" },
  { kind: "filter",    label: "Filtro",          description: "Continuar somente se...",         icon: Filter,        color: "text-muted-foreground bg-muted",                   group: "Lógica" },
  { kind: "wait",      label: "Aguardar",        description: "Atraso ou janela de tempo",       icon: Clock,         color: "text-warning bg-warning/15",                       group: "Lógica" },
  { kind: "assign",    label: "Atribuir agente", description: "Encaminhar para fila/agente",     icon: User,          color: "text-success bg-success/15",                       group: "Atendimento" },
  { kind: "tag",       label: "Aplicar tag",     description: "Marcar contato/conversa",         icon: Tag,           color: "text-channel-webchat bg-channel-webchat/15",       group: "Atendimento" },
  { kind: "db",        label: "Buscar dados",    description: "Consultar CRM/ERP",               icon: Database,      color: "text-muted-foreground bg-muted",                   group: "Integrações" },
];

const kindMeta = Object.fromEntries(nodeCatalog.map(n => [n.kind, n])) as Record<NodeKind, typeof nodeCatalog[number]>;

/* ---------- Flow inicial (mock) ---------- */
const initialNodes: FlowNode[] = [
  { id: "n1", kind: "trigger",   title: "Mensagem recebida", subtitle: "Canal: WhatsApp", x: 80,  y: 80,  sla: "—",     status: "ok" },
  { id: "n2", kind: "ai",        title: "Classificar intenção", subtitle: "IA · GPT-4 mini", x: 360, y: 80,  sla: "5s",    status: "ok" },
  { id: "n3", kind: "condition", title: "Intenção = pedido?",   subtitle: "if intent in [pedido, status]", x: 640, y: 80,  sla: "—",   status: "ok" },
  { id: "n4", kind: "db",        title: "Buscar pedido no ERP", subtitle: "GET /pedidos/:cpf", x: 920, y: 20,  sla: "3s",    status: "warn" },
  { id: "n5", kind: "message",   title: "Resposta com status",  subtitle: "Template: pedido_status", x: 1180, y: 20, sla: "1s", status: "ok" },
  { id: "n6", kind: "assign",    title: "Atribuir a Atendimento", subtitle: "Fila: Suporte N1", x: 920, y: 180, sla: "30s", status: "ok" },
  { id: "n7", kind: "tag",       title: "Tag: triagem-ia",       subtitle: "+ contato", x: 1180, y: 180, sla: "—", status: "ok" },
];

const initialEdges: Edge[] = [
  { from: "n1", to: "n2" },
  { from: "n2", to: "n3" },
  { from: "n3", to: "n4", label: "sim" },
  { from: "n3", to: "n6", label: "não" },
  { from: "n4", to: "n5" },
  { from: "n6", to: "n7" },
];

/* ---------- Editor ---------- */
const FlowEditor = () => {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const [nodes, setNodes] = useState<FlowNode[]>(isNew ? [initialNodes[0]] : initialNodes);
  const [edges] = useState<Edge[]>(isNew ? [] : initialEdges);
  const [selected, setSelected] = useState<string | null>(isNew ? "n1" : "n3");
  const [zoom, setZoom] = useState(1);
  const [running, setRunning] = useState(false);
  const [tab, setTab] = useState<"props" | "exec" | "history">("props");
  const dragRef = useRef<{ id: string; offX: number; offY: number } | null>(null);

  const selectedNode = useMemo(() => nodes.find(n => n.id === selected) ?? null, [nodes, selected]);

  /* Drag de nó no canvas */
  const onNodeMouseDown = (e: React.MouseEvent, n: FlowNode) => {
    setSelected(n.id);
    dragRef.current = { id: n.id, offX: e.clientX - n.x * zoom, offY: e.clientY - n.y * zoom };
  };
  const onCanvasMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const { id, offX, offY } = dragRef.current;
    const x = (e.clientX - offX) / zoom;
    const y = (e.clientY - offY) / zoom;
    setNodes(ns => ns.map(n => (n.id === id ? { ...n, x, y } : n)));
  };
  const onCanvasMouseUp = () => { dragRef.current = null; };

  /* Drop de paleta */
  const onPaletteDragStart = (e: React.DragEvent, kind: NodeKind) => {
    e.dataTransfer.setData("kind", kind);
  };
  const onCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const kind = e.dataTransfer.getData("kind") as NodeKind;
    if (!kind) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - 110;
    const y = (e.clientY - rect.top) / zoom - 30;
    const meta = kindMeta[kind];
    const newNode: FlowNode = {
      id: `n${Date.now()}`,
      kind,
      title: meta.label,
      subtitle: meta.description,
      x, y,
      sla: "—",
      status: "ok",
    };
    setNodes(ns => [...ns, newNode]);
    setSelected(newNode.id);
  };

  /* Conexões SVG */
  const renderEdges = () =>
    edges.map((e, i) => {
      const a = nodes.find(n => n.id === e.from);
      const b = nodes.find(n => n.id === e.to);
      if (!a || !b) return null;
      const x1 = a.x + 220, y1 = a.y + 36;
      const x2 = b.x,       y2 = b.y + 36;
      const mid = (x1 + x2) / 2;
      const path = `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
      return (
        <g key={i}>
          <path d={path} stroke="hsl(var(--border-strong))" strokeWidth={1.5} fill="none" />
          <circle cx={x2} cy={y2} r={3} fill="hsl(var(--primary))" />
          {e.label && (
            <g transform={`translate(${mid - 14}, ${(y1 + y2) / 2 - 8})`}>
              <rect width={28} height={14} rx={3} fill="hsl(var(--surface-elevated))" stroke="hsl(var(--border))" />
              <text x={14} y={10} textAnchor="middle" fontSize={9} fill="hsl(var(--muted-foreground))" fontFamily="monospace">{e.label}</text>
            </g>
          )}
        </g>
      );
    });

  /* Agrupamento da paleta */
  const grouped = nodeCatalog.reduce<Record<string, typeof nodeCatalog>>((acc, n) => {
    (acc[n.group] ||= []).push(n);
    return acc;
  }, {});

  return (
    <div className="flex h-full flex-col">
      {/* Topbar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4">
        <div className="flex items-center gap-3">
          <Link to="/flows" className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-hover">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{isNew ? "Novo flow" : "Triagem WhatsApp → IA"}</span>
              <span className="rounded bg-success/10 px-1.5 py-0.5 font-mono text-[10px] text-success border border-success/20">
                {isNew ? "Rascunho" : "Ativo"}
              </span>
            </div>
            <div className="font-mono text-[10px] text-subtle-foreground">{isNew ? "FLW-NEW" : (id || "FLW-001")} · v1.4 · salvo há 2 min</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button className="flex items-center gap-1.5 rounded-md border border-border bg-background/40 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover">
            <Eye className="h-3.5 w-3.5" /> Pré-visualizar
          </button>
          <button className="flex items-center gap-1.5 rounded-md border border-border bg-background/40 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover">
            <History className="h-3.5 w-3.5" /> Versões
          </button>
          <button
            onClick={() => setRunning(r => !r)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
              running
                ? "border-warning/30 bg-warning/10 text-warning hover:bg-warning/20"
                : "border-success/30 bg-success/10 text-success hover:bg-success/20"
            )}
          >
            {running ? <><Pause className="h-3.5 w-3.5" /> Pausar teste</> : <><Play className="h-3.5 w-3.5" /> Testar</>}
          </button>
          <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow">
            <Save className="h-3.5 w-3.5" /> Publicar
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-hover">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Paleta de nós */}
        <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle-foreground" />
              <input
                placeholder="Buscar nó..."
                className="w-full rounded-md border border-border bg-background/40 pl-8 pr-3 py-1.5 text-xs placeholder:text-subtle-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-subtle-foreground">{group}</div>
                <div className="space-y-1">
                  {items.map(n => {
                    const Icon = n.icon;
                    return (
                      <div
                        key={n.kind}
                        draggable
                        onDragStart={e => onPaletteDragStart(e, n.kind)}
                        className="group flex cursor-grab items-center gap-2 rounded-md border border-transparent bg-background/30 p-2 active:cursor-grabbing hover:border-border hover:bg-surface-hover transition-colors"
                      >
                        <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", n.color)}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-medium">{n.label}</div>
                          <div className="truncate text-[10px] text-subtle-foreground">{n.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border p-3">
            <button className="flex w-full items-center justify-center gap-1.5 rounded-md bg-gradient-to-r from-primary/15 to-channel-instagram/15 border border-primary/20 px-3 py-1.5 text-xs font-medium text-primary hover:from-primary/25 hover:to-channel-instagram/25 transition-colors">
              <Sparkles className="h-3.5 w-3.5" /> Gerar com IA
            </button>
          </div>
        </aside>

        {/* Canvas */}
        <div
          className="relative flex-1 overflow-hidden bg-background"
          onMouseMove={onCanvasMouseMove}
          onMouseUp={onCanvasMouseUp}
          onMouseLeave={onCanvasMouseUp}
          onDragOver={e => e.preventDefault()}
          onDrop={onCanvasDrop}
          onClick={() => setSelected(null)}
          style={{
            backgroundImage: "radial-gradient(hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          }}
        >
          {/* Mini toolbar canvas */}
          <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-md border border-border bg-surface/90 p-0.5 backdrop-blur">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="flex h-7 w-7 items-center justify-center rounded hover:bg-surface-hover">
              <ZoomOut className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <span className="px-1.5 font-mono text-[10px] text-muted-foreground">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="flex h-7 w-7 items-center justify-center rounded hover:bg-surface-hover">
              <ZoomIn className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <div className="mx-0.5 h-5 w-px bg-border" />
            <button onClick={() => setZoom(1)} className="flex h-7 w-7 items-center justify-center rounded hover:bg-surface-hover">
              <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Mini status bar */}
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3 rounded-md border border-border bg-surface/90 px-3 py-1.5 backdrop-blur">
            <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
              {nodes.length} nós · {edges.length} conexões
            </span>
            <div className="h-3 w-px bg-border" />
            <span className="font-mono text-[10px] text-muted-foreground">SLA total estimado: 9s</span>
          </div>

          <div
            className="absolute inset-0"
            style={{ transform: `scale(${zoom})`, transformOrigin: "0 0" }}
          >
            <svg className="absolute inset-0 h-[3000px] w-[4000px] pointer-events-none">
              {renderEdges()}
            </svg>

            {nodes.map(n => {
              const meta = kindMeta[n.kind];
              const Icon = meta.icon;
              const isSel = selected === n.id;
              return (
                <div
                  key={n.id}
                  onMouseDown={e => { e.stopPropagation(); onNodeMouseDown(e, n); }}
                  onClick={e => { e.stopPropagation(); setSelected(n.id); }}
                  className={cn(
                    "absolute w-[220px] cursor-grab rounded-lg border bg-surface-elevated shadow-elevated transition-all active:cursor-grabbing",
                    isSel ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-border-strong"
                  )}
                  style={{ left: n.x, top: n.y }}
                >
                  {/* handles */}
                  <div className="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-background bg-border-strong" />
                  <div className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-background bg-primary" />

                  <div className="flex items-center gap-2 border-b border-border p-2.5">
                    <div className={cn("flex h-7 w-7 items-center justify-center rounded-md", meta.color)}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold">{n.title}</div>
                      <div className="truncate text-[10px] text-subtle-foreground">{meta.label}</div>
                    </div>
                    {n.status === "ok"   && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                    {n.status === "warn" && <AlertCircle className="h-3.5 w-3.5 text-warning" />}
                    {n.status === "error"&& <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="line-clamp-2 text-[11px] text-muted-foreground">{n.subtitle}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-subtle-foreground">
                        <Clock className="h-2.5 w-2.5" /> SLA {n.sla}
                      </span>
                      <span className="font-mono text-[10px] text-subtle-foreground">{n.id}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inspector */}
        <aside className="flex w-80 shrink-0 flex-col border-l border-border bg-surface">
          {selectedNode ? (
            <>
              <div className="border-b border-border p-4">
                <div className="flex items-center gap-2.5">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", kindMeta[selectedNode.kind].color)}>
                    {(() => { const I = kindMeta[selectedNode.kind].icon; return <I className="h-4 w-4" />; })()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{selectedNode.title}</div>
                    <div className="font-mono text-[10px] text-subtle-foreground">{kindMeta[selectedNode.kind].label} · {selectedNode.id}</div>
                  </div>
                  <button className="flex h-7 w-7 items-center justify-center rounded hover:bg-surface-hover">
                    <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="flex border-b border-border">
                {([
                  { k: "props", l: "Configuração" },
                  { k: "exec", l: "Execução" },
                  { k: "history", l: "Histórico" },
                ] as const).map(t => (
                  <button
                    key={t.k}
                    onClick={() => setTab(t.k)}
                    className={cn(
                      "flex-1 border-b-2 px-3 py-2 text-[11px] font-medium transition-colors",
                      tab === t.k
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t.l}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {tab === "props" && (
                  <>
                    <Field label="Nome do nó">
                      <input defaultValue={selectedNode.title} className="input" />
                    </Field>
                    <Field label="Descrição">
                      <textarea defaultValue={selectedNode.subtitle} rows={2} className="input resize-none" />
                    </Field>
                    <Field label="SLA do passo">
                      <div className="flex gap-2">
                        <input defaultValue={selectedNode.sla} className="input flex-1" />
                        <select className="input w-20">
                          <option>seg</option><option>min</option><option>h</option>
                        </select>
                      </div>
                    </Field>
                    <Field label="Ao falhar">
                      <select className="input">
                        <option>Continuar fluxo</option>
                        <option>Notificar líder</option>
                        <option>Encerrar com erro</option>
                      </select>
                    </Field>
                    <Field label="Variáveis disponíveis">
                      <div className="flex flex-wrap gap-1">
                        {["{{contato.nome}}", "{{conversa.id}}", "{{intent}}", "{{canal}}"].map(v => (
                          <span key={v} className="inline-flex items-center rounded bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-channel-instagram">
                            {v}
                          </span>
                        ))}
                      </div>
                    </Field>
                  </>
                )}

                {tab === "exec" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-md border border-success/20 bg-success/10 px-3 py-2">
                      <span className="text-xs text-success">Última execução: ok</span>
                      <span className="font-mono text-[10px] text-success">320ms</span>
                    </div>
                    <div className="rounded-md border border-border bg-background/40 p-3">
                      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-subtle-foreground">Input</div>
                      <pre className="overflow-x-auto font-mono text-[10px] text-muted-foreground">
{`{
  "contato": "+55 11 9...",
  "mensagem": "cadê meu pedido?",
  "canal": "whatsapp"
}`}
                      </pre>
                    </div>
                    <div className="rounded-md border border-border bg-background/40 p-3">
                      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-subtle-foreground">Output</div>
                      <pre className="overflow-x-auto font-mono text-[10px] text-muted-foreground">
{`{
  "intent": "pedido_status",
  "confidence": 0.94
}`}
                      </pre>
                    </div>
                  </div>
                )}

                {tab === "history" && (
                  <div className="space-y-2">
                    {[
                      { t: "agora", a: "RC", msg: "Editou SLA do passo" },
                      { t: "há 2h",  a: "MA", msg: "Adicionou condição" },
                      { t: "ontem",  a: "RC", msg: "Publicou versão 1.4" },
                      { t: "3d",     a: "JS", msg: "Criou o nó" },
                    ].map((e, i) => (
                      <div key={i} className="flex gap-2 rounded-md border border-border bg-background/40 p-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-channel-instagram text-[10px] font-semibold text-primary-foreground">
                          {e.a}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs">{e.msg}</div>
                          <div className="font-mono text-[10px] text-subtle-foreground">{e.t}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-border p-3 flex items-center gap-1.5">
                <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-background/40 px-2 py-1.5 text-[11px] text-muted-foreground hover:bg-surface-hover">
                  <Copy className="h-3 w-3" /> Duplicar
                </button>
                <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-[11px] text-destructive hover:bg-destructive/20">
                  <Trash2 className="h-3 w-3" /> Remover
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-elevated">
                <Settings2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-sm font-medium">Nenhum nó selecionado</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Selecione um nó do canvas ou arraste um da paleta para começar.
              </p>
            </div>
          )}
        </aside>
      </div>

      <style>{`
        .input {
          width: 100%;
          border-radius: 6px;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background) / 0.4);
          padding: 6px 10px;
          font-size: 12px;
          color: hsl(var(--foreground));
          outline: none;
        }
        .input:focus {
          border-color: hsl(var(--ring));
          box-shadow: 0 0 0 1px hsl(var(--ring));
        }
      `}</style>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-subtle-foreground">{label}</label>
    {children}
  </div>
);

export default FlowEditor;
