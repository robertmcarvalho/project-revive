import {
  ShieldCheck, CalendarCheck, UserPlus, RefreshCcw, FileMinus2, BadgeCheck,
  Workflow, ChevronRight, Building2, Truck, Users, ScrollText,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { IconTile, type IconTileTone } from "@/components/IconTile";
import { Skeleton } from "@/components/ui/skeleton";
import { operacaoApi } from "@/lib/operacaoApi";
import type { RegraOperacional, OrganogramaItem } from "@/data/operacaoMock";
import { cn } from "@/lib/utils";

const categoriaMeta: Record<RegraOperacional["categoria"], { icon: any; tone: IconTileTone }> = {
  diarias: { icon: CalendarCheck, tone: "primary" },
  cadastro: { icon: UserPlus, tone: "success" },
  escalas: { icon: RefreshCcw, tone: "warning" },
  desligamento: { icon: FileMinus2, tone: "destructive" },
  compliance: { icon: BadgeCheck, tone: "info" },
};

const fluxo = [
  { passo: "1", titulo: "Pré-cadastro", desc: "Líder cria o entregador na plataforma com dados básicos.", icon: UserPlus, tone: "primary" as IconTileTone },
  { passo: "2", titulo: "Finalizar cadastro", desc: "Atendimento Geral conclui o cadastro com documentos.", icon: ScrollText, tone: "info" as IconTileTone },
  { passo: "3", titulo: "Matrícula assinada", desc: "Cooperado assina a matrícula digitalmente.", icon: BadgeCheck, tone: "success" as IconTileTone },
  { passo: "4", titulo: "Lançamento de cotas", desc: "Atendimento Financeiro lança cotas e libera operação.", icon: ShieldCheck, tone: "success" as IconTileTone },
  { passo: "5", titulo: "Operação ativa", desc: "Líder gerencia escalas, diárias e faltas no dia.", icon: Truck, tone: "primary" as IconTileTone },
  { passo: "6", titulo: "Desligamento", desc: "Termo assinado · acerto em até 7 dias úteis.", icon: FileMinus2, tone: "destructive" as IconTileTone },
];

const OrgNode = ({ item, depth = 0 }: { item: OrganogramaItem; depth?: number }) => (
  <div className="space-y-1.5">
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border bg-surface p-2.5",
        depth === 0 && "bg-primary/5 border-primary/30",
      )}
      style={{ marginLeft: depth * 16 }}
    >
      <IconTile
        icon={depth === 0 ? Users : depth === 1 ? Building2 : depth === 2 ? Users : Truck}
        tone={depth === 0 ? "primary" : depth === 1 ? "info" : depth === 2 ? "warning" : "muted"}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.papel}</div>
        <div className="truncate text-xs font-medium">{item.nome}</div>
      </div>
    </div>
    {item.filhos?.map((f, i) => <OrgNode key={i} item={f} depth={depth + 1} />)}
  </div>
);

const Obrigacoes = () => {
  const [regras, setRegras] = useState<RegraOperacional[]>([]);
  const [org, setOrg] = useState<OrganogramaItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([operacaoApi.listRegras(), operacaoApi.getOrganograma()]).then(([r, o]) => {
      setRegras(r); setOrg(o); setLoading(false);
    });
  }, []);

  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      <PageHeader
        icon={ShieldCheck}
        eyebrow="Líder · Obrigações"
        title="Obrigações & regras operacionais"
        description="O guia rápido das responsabilidades do líder, do fluxo operacional e do organograma da operação."
      />

      <section className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <IconTile icon={ScrollText} tone="primary" size="sm" /> Regras operacionais
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
            : regras.map((r) => {
                const meta = categoriaMeta[r.categoria];
                return (
                  <div key={r.id} className="rounded-xl border border-border bg-surface p-4">
                    <div className="flex items-start gap-3">
                      <IconTile icon={meta.icon} tone={meta.tone} />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">{r.titulo}</div>
                        <p className="mt-1 text-xs text-muted-foreground">{r.descricao}</p>
                        <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-foreground">
                          ⏱ {r.prazo}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <IconTile icon={Workflow} tone="info" size="sm" /> Fluxo operacional
        </h2>
        <div className="rounded-xl border border-border bg-surface p-5">
          <ol className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {fluxo.map((f, i) => (
              <li key={f.passo} className="relative flex items-start gap-3 rounded-lg border border-border bg-background/40 p-3">
                <IconTile icon={f.icon} tone={f.tone} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-muted-foreground">Passo {f.passo}</span>
                  </div>
                  <div className="text-sm font-semibold">{f.titulo}</div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{f.desc}</p>
                </div>
                {i < fluxo.length - 1 && (
                  <ChevronRight className="absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-muted-foreground xl:block" strokeWidth={1.75} />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <IconTile icon={Users} tone="warning" size="sm" /> Organograma da operação
        </h2>
        <div className="rounded-xl border border-border bg-surface p-5">
          {loading || !org ? <Skeleton className="h-48 rounded-lg" /> : <OrgNode item={org} />}
        </div>
      </section>
    </div>
  );
};

export default Obrigacoes;
