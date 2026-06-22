import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, ReferenceLine,
} from "recharts";
import {
  FileText, Receipt, CalendarDays, TrendingUp, TrendingDown, Users, Package,
  CreditCard, Copy, ShieldCheck, Building2, Banknote,
} from "lucide-react";
import { financeiroApi } from "@/lib/financeiroApi";
import { fmtBRL, fmtDate } from "@/lib/baixas";
import { toast } from "@/hooks/use-toast";
import type {
  Fatura, LegalEntity, Farmacia, CentroCusto, Acerto, Entregador,
} from "@/data/financeiroMock";

const MONTH_LABELS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
  return h >>> 0;
}
function rand(seed: number) { return ((seed * 9301 + 49297) % 233280) / 233280; }

function buildHistoricoMensal(fatura: Fatura) {
  // gera 3 meses anteriores + ciclo atual (determinístico via id)
  const base = fatura.valor;
  const ref = new Date(fatura.cicloFim);
  const seed = hashSeed(fatura.id);
  const out: Array<{ mes: string; valor: number; entregas: number; isAtual?: boolean }> = [];
  for (let i = 3; i >= 1; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
    const variation = 0.78 + rand(seed + i * 13) * 0.4; // 0.78–1.18
    const valor = +(base * variation).toFixed(2);
    const entregas = Math.round((valor / Math.max(base / 60, 5)));
    out.push({ mes: `${MONTH_LABELS[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`, valor, entregas });
  }
  out.push({
    mes: `${MONTH_LABELS[ref.getMonth()]}/${String(ref.getFullYear()).slice(2)}`,
    valor: base, entregas: 0, isAtual: true,
  });
  return out;
}

function iniciais(nome: string) {
  return nome.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

const FaturaPublica = () => {
  const { token = "" } = useParams();
  const [fatura, setFatura] = useState<Fatura | null>(null);
  const [entity, setEntity] = useState<LegalEntity | null>(null);
  const [farm, setFarm] = useState<Farmacia | null>(null);
  const [cc, setCc] = useState<CentroCusto | null>(null);
  const [acerto, setAcerto] = useState<Acerto | null>(null);
  const [entregadores, setEntregadores] = useState<Entregador[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    financeiroApi.getFaturaByToken(token).then(async (f) => {
      if (!f) { setLoaded(true); return; }
      setFatura(f);
      const cat = await financeiroApi.catalogos();
      setEntity(cat.legalEntities.find((e) => e.entityType === f.empresa) ?? null);
      setFarm(cat.farmacias.find((x) => x.id === f.farmaciaId) ?? null);
      setCc(cat.centrosCusto.find((x) => x.id === f.centroCustoId) ?? null);
      setEntregadores(cat.entregadores);
      setAcerto(await financeiroApi.getAcerto(f.origemAcertoId));
      setLoaded(true);
    });
  }, [token]);

  const historico = useMemo(() => (fatura ? buildHistoricoMensal(fatura) : []), [fatura]);
  const media3m = useMemo(() => {
    if (historico.length < 4) return 0;
    return historico.slice(0, 3).reduce((s, x) => s + x.valor, 0) / 3;
  }, [historico]);
  const variacao = useMemo(() => {
    if (!fatura || !media3m) return 0;
    return ((fatura.valor - media3m) / media3m) * 100;
  }, [fatura, media3m]);

  const totalEntregas = acerto?.linhas.reduce((s, l) => s + l.qtdEntregas, 0) ?? 0;
  const totalEntregadores = acerto?.linhas.length ?? 0;
  const ticketMedio = totalEntregas ? (fatura?.valor ?? 0) / totalEntregas : 0;

  const entregadorNome = (id: string) => entregadores.find((e) => e.id === id)?.nome ?? id;

  const copyPix = () => {
    if (!entity?.pixKey) return;
    navigator.clipboard.writeText(entity.pixKey);
    toast({ title: "Chave PIX copiada" });
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Carregando fatura…</p>
      </div>
    );
  }

  if (!fatura) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="rounded-xl border border-border bg-surface p-8 text-center max-w-sm">
          <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">Fatura não encontrada ou link expirado.</p>
        </div>
      </div>
    );
  }

  const empresaTone = fatura.empresa === "coop"
    ? "from-primary/15 via-primary/5 to-transparent"
    : "from-success/15 via-success/5 to-transparent";

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="mx-auto max-w-5xl space-y-5 px-4">
        {/* ===== Header card ===== */}
        <article className={`relative overflow-hidden rounded-2xl border border-border bg-surface shadow-sm`}>
          <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-br ${empresaTone} pointer-events-none`} />
          <div className="relative p-8">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${
                    fatura.empresa === "coop"
                      ? "bg-primary/15 text-primary ring-primary/20"
                      : "bg-success/15 text-success ring-success/20"
                  }`}>
                    <Building2 className="h-3 w-3" /> {entity?.tradeName}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {fatura.status === "paga" ? "Paga" : fatura.status === "enviada" ? "Enviada" : "Aberta"}
                  </span>
                </div>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">Fatura {fatura.numero}</h1>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Ciclo de {fmtDate(fatura.cicloInicio)} a {fmtDate(fatura.cicloFim)} · vencimento em {fmtDate(fatura.vencimento)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-subtle-foreground">Total da fatura</div>
                <div className="text-4xl font-semibold tracking-tight">{fmtBRL(fatura.valor)}</div>
                {media3m > 0 && (
                  <div className={`mt-1 inline-flex items-center gap-1 text-[11px] font-medium ${variacao >= 0 ? "text-success" : "text-destructive"}`}>
                    {variacao >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {variacao >= 0 ? "+" : ""}{variacao.toFixed(1)}% vs média 3 meses
                  </div>
                )}
              </div>
            </div>

            {/* Sacado / Emissor */}
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-background/40 p-4">
                <div className="text-[10px] uppercase tracking-wider text-subtle-foreground">Sacado</div>
                <div className="mt-1 text-sm font-semibold">{farm?.nome}</div>
                <div className="text-xs text-muted-foreground">{cc?.nome}</div>
                {cc?.cnpj && <div className="mt-1 font-mono text-[11px] text-muted-foreground">CNPJ {cc.cnpj}</div>}
              </div>
              {entity && (
                <div className="rounded-xl border border-border bg-background/40 p-4">
                  <div className="text-[10px] uppercase tracking-wider text-subtle-foreground">Emissor</div>
                  <div className="mt-1 text-sm font-semibold">{entity.legalName}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">CNPJ {entity.cnpj}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {entity.address.logradouro}, {entity.address.numero} — {entity.address.cidade}/{entity.address.uf}
                  </div>
                </div>
              )}
            </div>
          </div>
        </article>

        {/* ===== KPIs ===== */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard icon={Package} label="Entregas no ciclo" value={String(totalEntregas)} tone="text-primary" />
          <KpiCard icon={Users} label="Entregadores" value={String(totalEntregadores)} tone="text-info" />
          <KpiCard icon={Receipt} label="Ticket médio" value={fmtBRL(ticketMedio)} tone="text-warning" />
          <KpiCard icon={TrendingUp} label="Média 3 meses" value={media3m ? fmtBRL(media3m) : "—"} tone="text-success" />
        </section>

        {/* ===== Comparativo / Histórico ===== */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold tracking-tight">Faturamento × 3 meses anteriores</h3>
                <p className="text-[11px] text-muted-foreground">Linha tracejada = média do trimestre</p>
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historico} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                    contentStyle={{ background: "hsl(var(--surface-elevated))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => fmtBRL(v)}
                  />
                  <ReferenceLine y={media3m} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
                  <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                    {historico.map((h, i) => (
                      <RectFillCell key={i} isAtual={!!h.isAtual} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold tracking-tight">Tendência do volume</h3>
              <p className="text-[11px] text-muted-foreground">Evolução da fatura mensal</p>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historico} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip contentStyle={{ background: "hsl(var(--surface-elevated))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => fmtBRL(v)} />
                  <Line type="monotone" dataKey="valor" stroke="hsl(var(--primary))" strokeWidth={2.5}
                    dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ===== Linhas da fatura ===== */}
        <section className="rounded-xl border border-border bg-surface">
          <header className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold tracking-tight">Detalhamento por entregador</h3>
            <span className="text-[11px] text-muted-foreground">{acerto?.linhas.length ?? 0} linhas</span>
          </header>
          <ul className="divide-y divide-border/40">
            {acerto?.linhas.map((l, i) => {
              const nome = entregadorNome(l.entregadorId);
              return (
                <li key={i} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
                    {iniciais(nome)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{nome}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {l.qtdEntregas} entregas no ciclo
                      {l.minimoAplicado && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-medium text-warning ring-1 ring-warning/20">
                          <ShieldCheck className="h-2.5 w-2.5" /> mínimo garantido
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-semibold">{fmtBRL(l.valorFaturadoFarmacia)}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {fmtBRL(l.qtdEntregas ? l.valorFaturadoFarmacia / l.qtdEntregas : 0)} / entrega
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <footer className="flex items-center justify-between border-t border-border px-5 py-3">
            <span className="text-[11px] uppercase tracking-wider text-subtle-foreground">Total</span>
            <span className="font-mono text-base font-semibold">{fmtBRL(fatura.valor)}</span>
          </footer>
        </section>

        {/* ===== Pagamento ===== */}
        {entity && (
          <section className="rounded-xl border border-border bg-surface p-6">
            <div className="mb-4 flex items-center gap-2">
              <Banknote className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold tracking-tight">Dados para pagamento</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-background/40 p-4">
                <div className="text-[10px] uppercase tracking-wider text-subtle-foreground">PIX</div>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <span className="truncate font-mono text-sm">{entity.pixKey ?? "—"}</span>
                  {entity.pixKey && (
                    <button onClick={copyPix} className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-[11px] hover:bg-surface-hover">
                      <Copy className="h-3 w-3" /> Copiar
                    </button>
                  )}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground capitalize">Tipo: {entity.pixKeyType ?? "—"}</div>
              </div>
              <div className="rounded-lg bg-background/40 p-4">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-subtle-foreground">
                  <CreditCard className="h-3 w-3" /> Conta bancária
                </div>
                <div className="mt-1 text-sm font-medium">{entity.bank.name} ({entity.bank.code})</div>
                <div className="text-[11px] text-muted-foreground">
                  Ag. {entity.bank.branch} · Conta {entity.bank.account}-{entity.bank.digit} · {entity.bank.type === "checking" ? "Corrente" : "Poupança"}
                </div>
              </div>
            </div>
            {entity.invoiceFooterNotes && (
              <p className="mt-4 text-[11px] text-muted-foreground">{entity.invoiceFooterNotes}</p>
            )}
          </section>
        )}

        <p className="pb-4 text-center text-[10px] text-subtle-foreground">
          Documento gerado automaticamente pela plataforma Aethera. Em caso de dúvidas, contate {entity?.financialEmail ?? "o financeiro"}.
        </p>
      </div>
    </div>
  );
};

const KpiCard = ({ icon: Icon, label, value, tone }: { icon: typeof FileText; label: string; value: string; tone: string }) => (
  <div className="rounded-xl border border-border bg-surface p-4">
    <div className="flex items-center justify-between">
      <span className="text-[10px] uppercase tracking-wider text-subtle-foreground">{label}</span>
      <Icon className={`h-3.5 w-3.5 ${tone}`} />
    </div>
    <div className={`mt-2 text-xl font-semibold tracking-tight ${tone}`}>{value}</div>
  </div>
);

// Cell wrapper — recharts Cell precisa de import nomeado para tipagem; usamos rect raw via fill.
const RectFillCell = ({ isAtual }: { isAtual: boolean }) => (
  // recharts aceita componentes filhos como <Cell />; reaproveitamos para colorir destaque
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <Cell fill={isAtual ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.35)"} />
);

import { Cell } from "recharts";

export default FaturaPublica;
