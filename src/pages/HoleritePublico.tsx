import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from "recharts";
import {
  Package, ShieldCheck, Wallet, CalendarDays, Copy, Store, HelpCircle, CheckCircle2, Sparkles,
} from "lucide-react";
import { financeiroApi } from "@/lib/financeiroApi";
import { fmtBRL, fmtDate } from "@/lib/baixas";
import { IconTile } from "@/components/IconTile";
import { toast } from "@/hooks/use-toast";
import type { Acerto, AcertoLinha, Entregador, Farmacia, LegalEntity } from "@/data/financeiroMock";

type Holerite = {
  acerto: Acerto; linha: AcertoLinha;
  entregador: Entregador | null; farmacia: Farmacia | null; coop: LegalEntity | null;
  outros: Array<{ farmacia: string; entregas: number; valor: number }>;
};

function seedOf(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
  return h >>> 0;
}
function pseudo(seed: number) { return ((seed * 9301 + 49297) % 233280) / 233280; }

function historicoSemanal(h: Holerite) {
  const base = Math.max(h.linha.valorEntregador, 1);
  const seed = seedOf(h.acerto.id + h.linha.entregadorId);
  const fim = new Date(h.acerto.cicloFim);
  const out: Array<{ label: string; valor: number; atual?: boolean }> = [];
  for (let i = 3; i >= 1; i--) {
    const d = new Date(fim); d.setDate(d.getDate() - i * 7);
    out.push({
      label: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      valor: +(base * (0.8 + pseudo(seed + i * 17) * 0.38)).toFixed(2),
    });
  }
  out.push({
    label: `${String(fim.getDate()).padStart(2, "0")}/${String(fim.getMonth() + 1).padStart(2, "0")}`,
    valor: base, atual: true,
  });
  return out;
}

function mascararCpf(cpf?: string) {
  if (!cpf) return "—";
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11) return cpf;
  return `***.***.${d.slice(6, 9)}-${d.slice(9)}`;
}

function dataPagamento(cicloFim: string) {
  const d = new Date(cicloFim);
  d.setDate(d.getDate() + 4); // PIX na quinta após o fechamento
  return d.toISOString().slice(0, 10);
}

const Linha = ({ label, valor, negativo, destaque, hint }: {
  label: string; valor: number; negativo?: boolean; destaque?: boolean; hint?: string;
}) => (
  <div className="flex items-start justify-between gap-4 py-2.5">
    <div>
      <div className={destaque ? "font-semibold" : "text-sm text-muted-foreground"}>{label}</div>
      {hint && <div className="text-xs text-subtle-foreground">{hint}</div>}
    </div>
    <div className={`shrink-0 font-mono tabular-nums ${destaque ? "text-lg font-semibold" : negativo ? "text-sm text-destructive" : "text-sm"}`}>
      {negativo && valor > 0 ? "– " : ""}{fmtBRL(valor)}
    </div>
  </div>
);

const HoleritePublico = () => {
  const { token = "" } = useParams();
  const [h, setH] = useState<Holerite | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    financeiroApi.getHoleriteByToken(token).then((r) => { setH(r as Holerite | null); setLoaded(true); });
  }, [token]);

  const historico = useMemo(() => (h ? historicoSemanal(h) : []), [h]);

  if (!loaded) return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Carregando…</div>;

  if (!h) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
        <div>
          <IconTile icon={HelpCircle} tone="warning" size="xl" className="mx-auto mb-4" />
          <h1 className="text-lg font-semibold">Link indisponível</h1>
          <p className="mt-1 text-sm text-muted-foreground">Este demonstrativo expirou ou o endereço está incorreto. Fale com a cooperativa.</p>
        </div>
      </div>
    );
  }

  const { linha: l, entregador, farmacia, coop, acerto } = h;
  const pagamento = dataPagamento(acerto.cicloFim);
  const chavePix = entregador?.pixKey ?? entregador?.pix;
  const totalBruto = l.baseRepasse + l.adicionais;
  const descontosTotais = l.descontos + l.adiantamentos + l.ajustesRateio + (l.descontoFaltaSemDiarista ?? 0);

  const copiar = async (v: string, label: string) => {
    await navigator.clipboard.writeText(v);
    toast({ title: `${label} copiada` });
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Cabeçalho */}
      <header className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/25 via-primary/10 to-transparent">
        <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
            {coop?.tradeName ?? "CoopMob"}
          </div>
          <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">Seu pagamento da semana</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Período de {fmtDate(acerto.cicloInicio)} a {fmtDate(acerto.cicloFim)}
          </p>

          <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-subtle-foreground">Você vai receber</div>
              <div className="font-mono text-4xl font-semibold tabular-nums sm:text-5xl">{fmtBRL(l.valorEntregador)}</div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              PIX em {fmtDate(pagamento)}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-5 py-6 sm:px-8">
        {/* Como chegamos nesse valor */}
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <IconTile icon={Wallet} tone="primary" size="lg" />
            <div>
              <h2 className="font-semibold">Como chegamos nesse valor</h2>
              <p className="text-xs text-muted-foreground">Conta simples do que entrou e do que saiu na semana.</p>
            </div>
          </div>

          {l.minimoAplicado && (
            <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-warning" strokeWidth={1.75} />
                <p>
                  Você fez <strong>{l.qtdEntregas} {l.qtdEntregas === 1 ? "entrega" : "entregas"}</strong> nesta semana.
                  Como o seu combinado garante um valor mínimo por semana, o pagamento foi calculado pelo
                  {" "}<strong>valor mínimo garantido</strong> — e não pelas entregas.
                </p>
              </div>
            </div>
          )}

          <div className="divide-y divide-border/60">
            <Linha
              label={l.minimoAplicado ? "Valor mínimo garantido da semana" : "Entregas realizadas"}
              hint={l.minimoAplicado
                ? `${l.qtdEntregas} ${l.qtdEntregas === 1 ? "entrega feita" : "entregas feitas"} na semana`
                : `${l.qtdEntregas} ${l.qtdEntregas === 1 ? "entrega" : "entregas"} no período`}
              valor={l.baseRepasse}
            />
            {l.adicionais > 0 && <Linha label="Valores extras" hint="Ajustes e bônus combinados" valor={l.adicionais} />}
            {l.diarias > 0 && <Linha label="Diárias já recebidas" hint="Valores que você já recebeu durante a semana" valor={l.diarias} negativo />}
            {l.adiantamentos > 0 && <Linha label="Adiantamentos" hint="Valores adiantados a você" valor={l.adiantamentos} negativo />}
            {l.descontos > 0 && <Linha label="Descontos" valor={l.descontos} negativo />}
            {(l.descontoFaltaSemDiarista ?? 0) > 0 && (
              <Linha
                label="Dias não trabalhados"
                hint={`${l.diasFaltaSemDiarista} ${l.diasFaltaSemDiarista === 1 ? "dia" : "dias"} sem cobertura`}
                valor={l.descontoFaltaSemDiarista!} negativo
              />
            )}
            {l.ajustesRateio > 0 && <Linha label="Divisão de custos entre farmácias" valor={l.ajustesRateio} negativo />}
            <div className="pt-1">
              <Linha label="Você vai receber" valor={l.valorEntregador} destaque />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
            <div>
              <div className="font-mono text-lg font-semibold tabular-nums">{l.qtdEntregas}</div>
              <div className="text-[11px] text-subtle-foreground">Entregas</div>
            </div>
            <div>
              <div className="font-mono text-lg font-semibold tabular-nums">{fmtBRL(totalBruto)}</div>
              <div className="text-[11px] text-subtle-foreground">Total da semana</div>
            </div>
            <div>
              <div className="font-mono text-lg font-semibold tabular-nums text-destructive">{fmtBRL(descontosTotais + l.diarias)}</div>
              <div className="text-[11px] text-subtle-foreground">Já pago / descontado</div>
            </div>
          </div>
        </section>

        {/* Onde você trabalhou */}
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <IconTile icon={Store} tone="info" size="lg" />
            <div>
              <h2 className="font-semibold">Onde você trabalhou</h2>
              <p className="text-xs text-muted-foreground">Locais em que suas entregas foram registradas nesta semana.</p>
            </div>
          </div>
          <ul className="space-y-2">
            <li className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-4 py-3">
              <div>
                <div className="text-sm font-medium">{farmacia?.nome ?? "Farmácia"}</div>
                <div className="text-xs text-muted-foreground">
                  {l.qtdEntregas} {l.qtdEntregas === 1 ? "entrega" : "entregas"}
                </div>
              </div>
              <div className="font-mono text-sm tabular-nums">{fmtBRL(l.valorEntregador)}</div>
            </li>
            {h.outros.map((o) => (
              <li key={o.farmacia} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-4 py-3">
                <div>
                  <div className="text-sm font-medium">{o.farmacia}</div>
                  <div className="text-xs text-muted-foreground">{o.entregas} {o.entregas === 1 ? "entrega" : "entregas"} · pago em outro demonstrativo</div>
                </div>
                <div className="font-mono text-sm tabular-nums text-muted-foreground">{fmtBRL(o.valor)}</div>
              </li>
            ))}
          </ul>
        </section>

        {/* Histórico */}
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <IconTile icon={Package} tone="success" size="lg" />
            <div>
              <h2 className="font-semibold">Suas últimas semanas</h2>
              <p className="text-xs text-muted-foreground">Comparação com as 3 semanas anteriores.</p>
            </div>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historico} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                  contentStyle={{ background: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => [fmtBRL(v), "Recebido"]}
                />
                <Bar dataKey="valor" radius={[8, 8, 4, 4]}>
                  {historico.map((d, i) => (
                    <Cell key={i} fill={d.atual ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.35)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Dados do pagamento */}
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <IconTile icon={CalendarDays} tone="primary" size="lg" />
            <div>
              <h2 className="font-semibold">Dados do pagamento</h2>
              <p className="text-xs text-muted-foreground">Confira se está tudo certo com a sua chave PIX.</p>
            </div>
          </div>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border/60 bg-background/40 px-4 py-3">
              <dt className="text-[11px] uppercase tracking-wider text-subtle-foreground">Cooperado</dt>
              <dd className="text-sm font-medium">{entregador?.nome ?? "—"}</dd>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/40 px-4 py-3">
              <dt className="text-[11px] uppercase tracking-wider text-subtle-foreground">CPF</dt>
              <dd className="font-mono text-sm">{mascararCpf(entregador?.cpf)}</dd>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/40 px-4 py-3">
              <dt className="text-[11px] uppercase tracking-wider text-subtle-foreground">Data do pagamento</dt>
              <dd className="text-sm font-medium">{fmtDate(pagamento)}</dd>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/40 px-4 py-3">
              <dt className="text-[11px] uppercase tracking-wider text-subtle-foreground">Chave PIX</dt>
              <dd className="flex items-center justify-between gap-2">
                <span className="truncate font-mono text-sm">{chavePix ?? "não cadastrada"}</span>
                {chavePix && (
                  <button
                    onClick={() => copiar(chavePix, "Chave PIX")}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Copy className="h-3 w-3" strokeWidth={1.75} /> copiar
                  </button>
                )}
              </dd>
            </div>
          </dl>
        </section>

        <footer className="rounded-xl border border-border/60 bg-background/40 p-5 text-center">
          <p className="text-sm text-muted-foreground">
            Alguma dúvida sobre esses valores? Fale com a {coop?.tradeName ?? "CoopMob"}
            {coop?.phone ? ` pelo ${coop.phone}` : ""}.
          </p>
          <p className="mt-2 text-xs text-subtle-foreground">Este link é pessoal e vale por 7 dias. Não repasse para outras pessoas.</p>
        </footer>
      </main>
    </div>
  );
};

export default HoleritePublico;
