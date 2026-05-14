import { useMemo, useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import {
  BarChart3, Users, Clock, Target, Smile, RefreshCw, MessageSquare, Activity,
  Filter, X, Download, Settings2, ArrowUp, ArrowDown, ChevronRight, FileText,
  Search,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import {
  ATENDENTES, CANAIS, FILAS, STATUS, SUPERVISORES, TAGS,
  gerarTickets, type Canal, type StatusTicket, type Ticket, type PerfilAtual,
} from "@/data/relatoriosMock";
import {
  aggregate, deltaPct, exportCsv, fmtSec, METAS_PADRAO, statusMeta,
  type Kpis, type Metas, type Sentido,
} from "@/lib/relatorios";

// Perfil simulado do usuário logado (integrar com auth real depois)
const PERFIL_ATUAL: PerfilAtual = "administrador";
const USUARIO_ATUAL_ID = "u4";

type RangePreset = "hoje" | "7d" | "30d" | "mes" | "mes_anterior" | "custom";

const PRESETS: { id: RangePreset; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "7d", label: "7 dias" },
  { id: "30d", label: "30 dias" },
  { id: "mes", label: "Mês atual" },
  { id: "mes_anterior", label: "Mês anterior" },
  { id: "custom", label: "Customizado" },
];

function rangeFor(preset: RangePreset): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date(end);
  switch (preset) {
    case "hoje": start.setHours(0, 0, 0, 0); break;
    case "7d": start.setDate(end.getDate() - 7); break;
    case "30d": start.setDate(end.getDate() - 30); break;
    case "mes": start.setDate(1); start.setHours(0, 0, 0, 0); break;
    case "mes_anterior": {
      const s = new Date(end.getFullYear(), end.getMonth() - 1, 1);
      const e = new Date(end.getFullYear(), end.getMonth(), 0, 23, 59, 59);
      return { start: s, end: e };
    }
    case "custom": start.setDate(end.getDate() - 14); break;
  }
  return { start, end };
}

const CANAL_LABEL: Record<Canal, string> = { whatsapp: "WhatsApp", instagram: "Instagram", email: "Email" };
const CANAL_COLOR: Record<Canal, string> = {
  whatsapp: "hsl(var(--channel-whatsapp))",
  instagram: "hsl(var(--channel-instagram))",
  email: "hsl(var(--channel-email))",
};
const STATUS_LABEL: Record<StatusTicket, string> = {
  aberto: "Aberto", em_andamento: "Em andamento", resolvido: "Resolvido", reaberto: "Reaberto",
};

const Atendimento = () => {
  // Filtros
  const [preset, setPreset] = useState<RangePreset>("30d");
  const [comparar, setComparar] = useState(true);
  const [atendentesSel, setAtendentesSel] = useState<string[]>(
    PERFIL_ATUAL === "atendente" ? [USUARIO_ATUAL_ID] : []
  );
  const [supervisoresSel, setSupervisoresSel] = useState<string[]>([]);
  const [filasSel, setFilasSel] = useState<string[]>([]);
  const [setoresSel, setSetoresSel] = useState<string[]>([]);
  const [canaisSel, setCanaisSel] = useState<Canal[]>([]);
  const [statusSel, setStatusSel] = useState<StatusTicket[]>([]);
  const [tagsSel, setTagsSel] = useState<string[]>([]);
  const [granularidade, setGranularidade] = useState<"dia" | "semana" | "mes">("dia");
  const [busca, setBusca] = useState("");

  const [showMetas, setShowMetas] = useState(false);
  const [drillId, setDrillId] = useState<string | null>(null);

  // Metas (persistidas em localStorage)
  const [metas, setMetas] = useState<Metas>(() => {
    try { return { ...METAS_PADRAO, ...JSON.parse(localStorage.getItem("relatorios.metas") || "{}") }; }
    catch { return METAS_PADRAO; }
  });
  useEffect(() => { localStorage.setItem("relatorios.metas", JSON.stringify(metas)); }, [metas]);

  // Período atual e anterior
  const { start, end } = useMemo(() => rangeFor(preset), [preset]);
  const ms = end.getTime() - start.getTime();
  const prevStart = new Date(start.getTime() - ms);
  const prevEnd = new Date(end.getTime() - ms);

  const allCurr = useMemo(() => gerarTickets(start, end, 42), [start, end]);
  const allPrev = useMemo(() => gerarTickets(prevStart, prevEnd, 99), [prevStart, prevEnd]);

  // Aplica permissões (escopo por perfil)
  const escopo = (t: Ticket) => {
    if (PERFIL_ATUAL === "atendente") return t.atendenteId === USUARIO_ATUAL_ID;
    return true;
  };

  const aplicaFiltros = (tickets: Ticket[]) => tickets.filter(t => {
    if (!escopo(t)) return false;
    if (atendentesSel.length && !atendentesSel.includes(t.atendenteId)) return false;
    if (supervisoresSel.length) {
      const at = ATENDENTES.find(a => a.id === t.atendenteId);
      if (!at || !supervisoresSel.includes(SUPERVISORES.find(s => s.nome === at.supervisor)?.id || "")) return false;
    }
    if (filasSel.length && !filasSel.includes(t.fila)) return false;
    if (setoresSel.length && !setoresSel.includes(t.setor)) return false;
    if (canaisSel.length && !canaisSel.includes(t.canal)) return false;
    if (statusSel.length && !statusSel.includes(t.status)) return false;
    if (tagsSel.length && !tagsSel.includes(t.tag)) return false;
    if (busca) {
      const q = busca.toLowerCase();
      if (!t.contato.toLowerCase().includes(q) && !t.id.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const tickets = useMemo(() => aplicaFiltros(allCurr), [allCurr, atendentesSel, supervisoresSel, filasSel, setoresSel, canaisSel, statusSel, tagsSel, busca]);
  const ticketsPrev = useMemo(() => aplicaFiltros(allPrev), [allPrev, atendentesSel, supervisoresSel, filasSel, setoresSel, canaisSel, statusSel, tagsSel, busca]);

  const kpis = useMemo(() => aggregate(tickets), [tickets]);
  const kpisPrev = useMemo(() => aggregate(ticketsPrev), [ticketsPrev]);

  // Setores disponíveis dependentes das filas
  const setoresDisp = useMemo(() => {
    const base = filasSel.length ? FILAS.filter(f => filasSel.includes(f.name)) : FILAS;
    return Array.from(new Set(base.flatMap(f => f.setores)));
  }, [filasSel]);

  const filtrosAtivos =
    atendentesSel.length + supervisoresSel.length + filasSel.length + setoresSel.length +
    canaisSel.length + statusSel.length + tagsSel.length + (busca ? 1 : 0);

  const limparFiltros = () => {
    setAtendentesSel(PERFIL_ATUAL === "atendente" ? [USUARIO_ATUAL_ID] : []);
    setSupervisoresSel([]); setFilasSel([]); setSetoresSel([]);
    setCanaisSel([]); setStatusSel([]); setTagsSel([]); setBusca("");
  };

  // Série temporal
  const serie = useMemo(() => {
    const buckets: Record<string, { date: string; whatsapp: number; instagram: number; email: number; total: number }> = {};
    const fmt = (d: Date) => {
      if (granularidade === "mes") return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (granularidade === "semana") {
        const onejan = new Date(d.getFullYear(), 0, 1);
        const w = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
        return `${d.getFullYear()}-S${w}`;
      }
      return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    };
    tickets.forEach(t => {
      const k = fmt(t.abertoEm);
      buckets[k] ||= { date: k, whatsapp: 0, instagram: 0, email: 0, total: 0 };
      buckets[k][t.canal]++; buckets[k].total++;
    });
    return Object.values(buckets).sort((a, b) => a.date.localeCompare(b.date));
  }, [tickets, granularidade]);

  const porCanal = useMemo(() => CANAIS.map(c => ({
    name: CANAL_LABEL[c], value: tickets.filter(t => t.canal === c).length, color: CANAL_COLOR[c],
  })), [tickets]);

  const porFila = useMemo(() => FILAS.map(f => ({
    name: f.name, tickets: tickets.filter(t => t.fila === f.name).length,
  })), [tickets]);

  const porTag = useMemo(() => {
    const m: Record<string, number> = {};
    tickets.forEach(t => { m[t.tag] = (m[t.tag] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [tickets]);

  // Ranking
  const ranking = useMemo(() => {
    const byAtt: Record<string, Ticket[]> = {};
    tickets.forEach(t => { (byAtt[t.atendenteId] ||= []).push(t); });
    return ATENDENTES.map(a => {
      const ts = byAtt[a.id] || [];
      const k = aggregate(ts);
      const tsPrev = ticketsPrev.filter(t => t.atendenteId === a.id);
      const kPrev = aggregate(tsPrev);
      return {
        atendente: a, kpis: k, prev: kPrev,
        delta: deltaPct(k.tickets, kPrev.tickets),
      };
    }).filter(r => r.kpis.tickets > 0).sort((a, b) => b.kpis.tickets - a.kpis.tickets);
  }, [tickets, ticketsPrev]);

  // Export
  const handleExportCsv = () => {
    const rows: (string | number)[][] = [
      ["Relatório de Atendimento"],
      ["Período", start.toLocaleDateString(), "→", end.toLocaleDateString()],
      [],
      ["KPI", "Valor", "Período anterior", "Δ%"],
      ["Tickets", kpis.tickets, kpisPrev.tickets, deltaPct(kpis.tickets, kpisPrev.tickets)],
      ["TMR (s)", kpis.tmr, kpisPrev.tmr, deltaPct(kpis.tmr, kpisPrev.tmr)],
      ["TMA (s)", kpis.tma, kpisPrev.tma, deltaPct(kpis.tma, kpisPrev.tma)],
      ["TME (s)", kpis.tme, kpisPrev.tme, deltaPct(kpis.tme, kpisPrev.tme)],
      ["SLA %", kpis.slaPct, kpisPrev.slaPct, deltaPct(kpis.slaPct, kpisPrev.slaPct)],
      ["CSAT", kpis.csat, kpisPrev.csat, deltaPct(kpis.csat, kpisPrev.csat)],
      ["FCR %", kpis.fcrPct, kpisPrev.fcrPct, deltaPct(kpis.fcrPct, kpisPrev.fcrPct)],
      ["Reabertura %", kpis.reaberturaPct, kpisPrev.reaberturaPct, deltaPct(kpis.reaberturaPct, kpisPrev.reaberturaPct)],
      [],
      ["Ranking de atendentes"],
      ["Atendente", "Setor", "Tickets", "TMR (s)", "TMA (s)", "SLA %", "CSAT", "FCR %", "Δ% tickets"],
      ...ranking.map(r => [
        r.atendente.nome, r.atendente.setor, r.kpis.tickets, r.kpis.tmr, r.kpis.tma,
        r.kpis.slaPct, r.kpis.csat, r.kpis.fcrPct, r.delta,
      ]),
    ];
    exportCsv(`relatorio-atendimento-${start.toISOString().slice(0, 10)}-${end.toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <PageHeader
          eyebrow="Relatórios"
          title="Desempenho de Atendimento"
          description={`Período: ${start.toLocaleDateString()} — ${end.toLocaleDateString()} · ${tickets.length} tickets`}
          actions={
            <>
              <button onClick={() => setShowMetas(true)} className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-hover">
                <Settings2 className="h-3.5 w-3.5" /> Metas
              </button>
              <button onClick={handleExportCsv} className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-hover">
                <Download className="h-3.5 w-3.5" /> CSV
              </button>
              <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow">
                <FileText className="h-3.5 w-3.5" /> PDF
              </button>
            </>
          }
        />

        {/* Banner perfil */}
        {PERFIL_ATUAL === "atendente" && (
          <div className="mb-4 rounded-md border border-primary/30 bg-primary/5 p-3 text-[11px] text-muted-foreground">
            Você está visualizando apenas seus próprios atendimentos.
          </div>
        )}

        {/* Filtros */}
        <div className="mb-4 rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">Período</span>
            <div className="flex flex-wrap gap-1">
              {PRESETS.map(p => (
                <button key={p.id} onClick={() => setPreset(p.id)}
                  className={cn("rounded-md border px-2.5 py-1 text-[11px]",
                    preset === p.id ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-surface-hover")}>
                  {p.label}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer">
                <input type="checkbox" checked={comparar} onChange={e => setComparar(e.target.checked)} className="h-3.5 w-3.5 rounded border-border" />
                Comparar com período anterior
              </label>
              <select value={granularidade} onChange={e => setGranularidade(e.target.value as any)}
                className="rounded-md border border-border bg-background/40 px-2 py-1 text-[11px]">
                <option value="dia">Diário</option>
                <option value="semana">Semanal</option>
                <option value="mes">Mensal</option>
              </select>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            <MultiSelect label="Atendente" options={ATENDENTES.map(a => ({ value: a.id, label: a.nome }))}
              value={atendentesSel} onChange={setAtendentesSel} disabled={PERFIL_ATUAL === "atendente"} />
            <MultiSelect label="Supervisor/Gestor" options={SUPERVISORES.map(s => ({ value: s.id, label: s.nome }))}
              value={supervisoresSel} onChange={setSupervisoresSel} />
            <MultiSelect label="Fila" options={FILAS.map(f => ({ value: f.name, label: f.name }))}
              value={filasSel} onChange={setFilasSel} />
            <MultiSelect label="Setor" options={setoresDisp.map(s => ({ value: s, label: s }))}
              value={setoresSel} onChange={setSetoresSel} />
            <MultiSelect label="Canal" options={CANAIS.map(c => ({ value: c, label: CANAL_LABEL[c] }))}
              value={canaisSel} onChange={v => setCanaisSel(v as Canal[])} />
            <MultiSelect label="Status" options={STATUS.map(s => ({ value: s, label: STATUS_LABEL[s] }))}
              value={statusSel} onChange={v => setStatusSel(v as StatusTicket[])} />
            <MultiSelect label="Tag/Motivo" options={TAGS.map(t => ({ value: t, label: t }))}
              value={tagsSel} onChange={setTagsSel} />
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">Busca</label>
              <div className="relative mt-1">
                <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Contato, ID..."
                  className="w-full rounded-md border border-border bg-background/40 pl-7 pr-2 py-1.5 text-xs outline-none focus:border-primary/60" />
              </div>
            </div>
          </div>

          {filtrosAtivos > 0 && (
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-[11px] text-muted-foreground">{filtrosAtivos} filtro{filtrosAtivos !== 1 ? "s" : ""} ativo{filtrosAtivos !== 1 ? "s" : ""}</span>
              <button onClick={limparFiltros} className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-surface-hover">
                <X className="h-3 w-3" /> Limpar
              </button>
            </div>
          )}
        </div>

        {/* KPIs */}
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard icon={Users} label="Tickets" value={kpis.tickets.toString()}
            delta={comparar ? deltaPct(kpis.tickets, kpisPrev.tickets) : null} />
          <KpiCard icon={Clock} label="TMR (1ª resposta)" value={fmtSec(kpis.tmr)}
            delta={comparar ? -deltaPct(kpis.tmr, kpisPrev.tmr) : null}
            status={statusMeta(kpis.tmr, metas.tmr, "menor")} />
          <KpiCard icon={Activity} label="TMA (duração)" value={fmtSec(kpis.tma)}
            delta={comparar ? -deltaPct(kpis.tma, kpisPrev.tma) : null}
            status={statusMeta(kpis.tma, metas.tma, "menor")} />
          <KpiCard icon={Clock} label="TME (espera)" value={fmtSec(kpis.tme)}
            delta={comparar ? -deltaPct(kpis.tme, kpisPrev.tme) : null} />
          <KpiCard icon={Target} label="SLA cumprido" value={`${kpis.slaPct}%`}
            delta={comparar ? deltaPct(kpis.slaPct, kpisPrev.slaPct) : null}
            status={statusMeta(kpis.slaPct, metas.slaPct, "maior")} />
          <KpiCard icon={Smile} label="CSAT" value={kpis.csat.toFixed(2)}
            delta={comparar ? deltaPct(kpis.csat, kpisPrev.csat) : null}
            status={statusMeta(kpis.csat, metas.csat, "maior")} />
          <KpiCard icon={Target} label="FCR" value={`${kpis.fcrPct}%`}
            delta={comparar ? deltaPct(kpis.fcrPct, kpisPrev.fcrPct) : null}
            status={statusMeta(kpis.fcrPct, metas.fcrPct, "maior")} />
          <KpiCard icon={RefreshCw} label="Reabertura" value={`${kpis.reaberturaPct}%`}
            delta={comparar ? -deltaPct(kpis.reaberturaPct, kpisPrev.reaberturaPct) : null}
            status={statusMeta(kpis.reaberturaPct, metas.reaberturaPct, "menor")} />
        </div>

        {/* Linha 2 mini KPIs */}
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <MiniKpi icon={MessageSquare} label="Mensagens enviadas" value={kpis.msgEnv.toLocaleString()} />
          <MiniKpi icon={MessageSquare} label="Mensagens recebidas" value={kpis.msgRec.toLocaleString()} />
          <MiniKpi icon={Activity} label="Transferências" value={`${kpis.transferenciaPct}%`} />
          <MiniKpi icon={Users} label="Ocupação média" value={`${kpis.ocupacaoPct}%`} />
        </div>

        {/* Gráficos */}
        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-4 lg:col-span-2">
            <h3 className="mb-3 text-sm font-semibold">Volume ao longo do tempo</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={serie}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="whatsapp" stroke={CANAL_COLOR.whatsapp} strokeWidth={2} dot={false} name="WhatsApp" />
                  <Line type="monotone" dataKey="instagram" stroke={CANAL_COLOR.instagram} strokeWidth={2} dot={false} name="Instagram" />
                  <Line type="monotone" dataKey="email" stroke={CANAL_COLOR.email} strokeWidth={2} dot={false} name="Email" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <h3 className="mb-3 text-sm font-semibold">Por canal</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={porCanal} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {porCanal.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-4">
            <h3 className="mb-3 text-sm font-semibold">Tickets por fila</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porFila}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 11 }} />
                  <Bar dataKey="tickets" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <h3 className="mb-3 text-sm font-semibold">Motivos de encerramento</h3>
            <div className="space-y-1.5">
              {porTag.slice(0, 7).map(t => {
                const max = porTag[0]?.value || 1;
                const pct = (t.value / max) * 100;
                return (
                  <div key={t.name} className="flex items-center gap-2">
                    <span className="w-32 truncate text-[11px]">{t.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-10 text-right font-mono text-[11px] text-muted-foreground">{t.value}</span>
                  </div>
                );
              })}
              {porTag.length === 0 && <div className="text-[11px] text-muted-foreground">Sem dados no período</div>}
            </div>
          </div>
        </div>

        {/* Heatmap dia x hora */}
        <Heatmap tickets={tickets} />

        {/* Ranking */}
        <div className="mt-4 rounded-xl border border-border bg-surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Ranking de atendentes
            </h3>
            <span className="text-[11px] text-muted-foreground">{ranking.length} atendente{ranking.length !== 1 ? "s" : ""}</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated text-[10px] uppercase tracking-wider text-subtle-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left">#</th>
                <th className="px-4 py-2.5 text-left">Atendente</th>
                <th className="px-4 py-2.5 text-right">Tickets</th>
                <th className="px-4 py-2.5 text-right">TMR</th>
                <th className="px-4 py-2.5 text-right">TMA</th>
                <th className="px-4 py-2.5 text-right">SLA</th>
                <th className="px-4 py-2.5 text-right">CSAT</th>
                <th className="px-4 py-2.5 text-right">FCR</th>
                {comparar && <th className="px-4 py-2.5 text-right">Δ%</th>}
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((r, i) => (
                <tr key={r.atendente.id} onClick={() => setDrillId(r.atendente.id)}
                  className="border-t border-border hover:bg-surface-elevated transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-medium">{r.atendente.nome}</div>
                    <div className="text-[10px] text-muted-foreground">{r.atendente.setor} · {r.atendente.supervisor}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{r.kpis.tickets}</td>
                  <td className={cn("px-4 py-3 text-right font-mono text-xs", colorByStatus(statusMeta(r.kpis.tmr, metas.tmr, "menor")))}>{fmtSec(r.kpis.tmr)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{fmtSec(r.kpis.tma)}</td>
                  <td className={cn("px-4 py-3 text-right font-mono text-xs", colorByStatus(statusMeta(r.kpis.slaPct, metas.slaPct, "maior")))}>{r.kpis.slaPct}%</td>
                  <td className={cn("px-4 py-3 text-right font-mono text-xs", colorByStatus(statusMeta(r.kpis.csat, metas.csat, "maior")))}>{r.kpis.csat.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{r.kpis.fcrPct}%</td>
                  {comparar && (
                    <td className={cn("px-4 py-3 text-right font-mono text-xs", r.delta >= 0 ? "text-success" : "text-destructive")}>
                      {r.delta >= 0 ? "+" : ""}{r.delta}%
                    </td>
                  )}
                  <td className="px-4 py-3 text-right"><ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /></td>
                </tr>
              ))}
              {ranking.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-xs text-muted-foreground">Sem dados para os filtros aplicados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showMetas && <MetasSheet metas={metas} onChange={setMetas} onClose={() => setShowMetas(false)} />}
      {drillId && <DrillDownSheet atendenteId={drillId} tickets={tickets.filter(t => t.atendenteId === drillId)} onClose={() => setDrillId(null)} />}
    </div>
  );
};

const colorByStatus = (s: "ok" | "warn" | "bad") =>
  s === "ok" ? "text-success" : s === "warn" ? "text-warning" : "text-destructive";

const KpiCard = ({ icon: Icon, label, value, delta, status }: {
  icon: any; label: string; value: string; delta: number | null; status?: "ok" | "warn" | "bad";
}) => {
  const statusColor = status === "ok" ? "border-success/40 bg-success/5"
    : status === "warn" ? "border-warning/40 bg-warning/5"
    : status === "bad" ? "border-destructive/40 bg-destructive/5"
    : "border-border bg-surface";
  return (
    <div className={cn("rounded-xl border p-4 transition-colors", statusColor)}>
      <div className="flex items-center justify-between">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        {delta != null && (
          <span className={cn("flex items-center gap-0.5 font-mono text-[10px]", delta >= 0 ? "text-success" : "text-destructive")}>
            {delta >= 0 ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-2 font-mono text-xl font-semibold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
};

const MiniKpi = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2">
    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
    </div>
    <div>
      <div className="font-mono text-sm font-semibold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  </div>
);

const MultiSelect = ({ label, options, value, onChange, disabled }: {
  label: string;
  options: { value: string; label: string }[];
  value: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const summary = value.length === 0 ? "Todos" : value.length === 1
    ? options.find(o => o.value === value[0])?.label || "1 selecionado"
    : `${value.length} selecionados`;
  return (
    <div className="relative">
      <label className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">{label}</label>
      <button disabled={disabled} onClick={() => setOpen(o => !o)}
        className={cn("mt-1 w-full rounded-md border border-border bg-background/40 px-2.5 py-1.5 text-left text-xs outline-none focus:border-primary/60 flex items-center justify-between",
          disabled && "opacity-60 cursor-not-allowed")}>
        <span className="truncate">{summary}</span>
        <ChevronRight className={cn("h-3 w-3 transition-transform", open && "rotate-90")} />
      </button>
      {open && !disabled && (
        <div className="absolute z-30 mt-1 w-full rounded-md border border-border bg-popover p-1 shadow-lg max-h-56 overflow-y-auto">
          {options.length === 0 && <div className="px-2 py-1.5 text-[11px] text-muted-foreground">Nenhuma opção</div>}
          {options.map(o => {
            const on = value.includes(o.value);
            return (
              <label key={o.value} className="flex items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-surface-hover cursor-pointer">
                <input type="checkbox" checked={on} onChange={() => onChange(on ? value.filter(v => v !== o.value) : [...value, o.value])} className="h-3.5 w-3.5 rounded border-border" />
                {o.label}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Heatmap = ({ tickets }: { tickets: Ticket[] }) => {
  const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  tickets.forEach(t => { grid[t.abertoEm.getDay()][t.abertoEm.getHours()]++; });
  const max = Math.max(1, ...grid.flat());
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold">Heatmap dia × hora</h3>
      <div className="overflow-x-auto">
        <div className="inline-block">
          <div className="flex">
            <div className="w-10" />
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="w-5 text-center font-mono text-[9px] text-muted-foreground">{h}</div>
            ))}
          </div>
          {grid.map((row, d) => (
            <div key={d} className="flex items-center">
              <div className="w-10 font-mono text-[10px] text-muted-foreground">{dias[d]}</div>
              {row.map((v, h) => {
                const op = v / max;
                return (
                  <div key={h} className="m-[1px] h-4 w-4 rounded-sm" title={`${dias[d]} ${h}h: ${v}`}
                    style={{ backgroundColor: `hsl(var(--primary) / ${0.05 + op * 0.95})` }} />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MetasSheet = ({ metas, onChange, onClose }: { metas: Metas; onChange: (m: Metas) => void; onClose: () => void }) => {
  const [draft, setDraft] = useState(metas);
  const fields: { key: keyof Metas; label: string; sentido: Sentido; suffix?: string }[] = [
    { key: "tmr", label: "TMR (1ª resposta) — segundos", sentido: "menor", suffix: "s" },
    { key: "tma", label: "TMA (duração) — segundos", sentido: "menor", suffix: "s" },
    { key: "slaPct", label: "SLA cumprido (%)", sentido: "maior", suffix: "%" },
    { key: "csat", label: "CSAT (1 a 5)", sentido: "maior" },
    { key: "fcrPct", label: "FCR (%)", sentido: "maior", suffix: "%" },
    { key: "reaberturaPct", label: "Reabertura (%)", sentido: "menor", suffix: "%" },
  ];
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="h-full w-full max-w-md overflow-y-auto border-l border-border bg-surface">
        <div className="border-b border-border px-6 py-4">
          <h3 className="text-sm font-semibold">Configurar metas</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Cards e ranking ganham cor verde/amarelo/vermelho conforme atingimento.</p>
        </div>
        <div className="space-y-4 p-6">
          {fields.map(f => (
            <div key={f.key}>
              <label className="text-[11px] font-medium">{f.label}</label>
              <div className="mt-1 text-[10px] text-muted-foreground">Meta: {f.sentido === "menor" ? "valor menor é melhor" : "valor maior é melhor"}</div>
              <input type="number" step={f.key === "csat" ? 0.1 : 1} value={draft[f.key]}
                onChange={e => setDraft({ ...draft, [f.key]: Number(e.target.value) })}
                className="mt-1 w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary/60" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-3">
          <button onClick={() => setDraft(METAS_PADRAO)} className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-surface-hover">Restaurar padrão</button>
          <button onClick={onClose} className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-surface-hover">Cancelar</button>
          <button onClick={() => { onChange(draft); onClose(); }} className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-glow">Salvar metas</button>
        </div>
      </div>
    </div>
  );
};

const DrillDownSheet = ({ atendenteId, tickets, onClose }: {
  atendenteId: string; tickets: Ticket[]; onClose: () => void;
}) => {
  const at = ATENDENTES.find(a => a.id === atendenteId)!;
  const k = aggregate(tickets);
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="h-full w-full max-w-3xl overflow-y-auto border-l border-border bg-surface">
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-subtle-foreground">Drill-down</div>
            <h3 className="mt-1 text-base font-semibold">{at.nome}</h3>
            <p className="text-[11px] text-muted-foreground">{at.setor} · Supervisor: {at.supervisor}</p>
          </div>
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-surface-hover"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3 p-6 md:grid-cols-4">
          <MiniKpi icon={Users} label="Tickets" value={k.tickets.toString()} />
          <MiniKpi icon={Clock} label="TMR" value={fmtSec(k.tmr)} />
          <MiniKpi icon={Target} label="SLA" value={`${k.slaPct}%`} />
          <MiniKpi icon={Smile} label="CSAT" value={k.csat.toFixed(2)} />
        </div>
        <div className="px-6 pb-6">
          <h4 className="mb-2 text-xs font-semibold">Tickets do período ({tickets.length})</h4>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-surface-elevated text-[10px] uppercase tracking-wider text-subtle-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">Contato</th>
                  <th className="px-3 py-2 text-left">Canal</th>
                  <th className="px-3 py-2 text-left">Aberto</th>
                  <th className="px-3 py-2 text-right">TMR</th>
                  <th className="px-3 py-2 text-right">TMA</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-right">CSAT</th>
                </tr>
              </thead>
              <tbody>
                {tickets.slice(0, 80).map(t => (
                  <tr key={t.id} className="border-t border-border hover:bg-surface-elevated">
                    <td className="px-3 py-2 font-mono text-[11px]">{t.id}</td>
                    <td className="px-3 py-2">{t.contato}</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px]"
                        style={{ backgroundColor: `${CANAL_COLOR[t.canal]}20`, color: CANAL_COLOR[t.canal] }}>
                        {CANAL_LABEL[t.canal]}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">{t.abertoEm.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-mono">{fmtSec(t.tmrSeg)}</td>
                    <td className="px-3 py-2 text-right font-mono">{fmtSec(t.tmaSeg)}</td>
                    <td className="px-3 py-2 text-[10px]">{STATUS_LABEL[t.status]}</td>
                    <td className="px-3 py-2 text-right font-mono">{t.csat ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tickets.length > 80 && <div className="border-t border-border px-3 py-2 text-center text-[11px] text-muted-foreground">Mostrando 80 de {tickets.length} tickets</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Atendimento;
