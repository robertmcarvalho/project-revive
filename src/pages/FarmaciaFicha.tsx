import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, Building2, MapPin, Phone, Mail, Users, Truck, Crown,
  ChevronRight, Edit3, FileText, Clock, MessageSquare, Headphones, Wallet, Wrench,
  DollarSign, CalendarDays, PieChart, Layers, Link2, Hash,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusDot } from "@/components/StatusDot";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  farmacias as billingFarmacias, centrosCusto as billingCC,
  splitFaturamento as billingSplit, regrasVinculo as billingRegras,
  entregadores as billingEntregadores,
} from "@/data/financeiroMock";
import { fmtBRL } from "@/lib/baixas";

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Status = "online" | "busy" | "offline";
type EntStatus = "online" | "busy" | "idle" | "offline";

const FARMACIAS_DB: Record<string, any> = {
  "1": {
    nome: "Farmácia Central", code: "FC-001",
    cnpj: "12.345.678/0001-90", razaoSocial: "Farmácia Central LTDA",
    cidade: "São Paulo / SP", endereco: "Av. Paulista, 1234 - Bela Vista",
    cep: "01310-100", telefone: "+55 11 3000-0001", email: "contato@central.com.br",
    status: "online" as Status,
    lider: { id: "1", nome: "Marina Souza", telefone: "+55 11 99100-2030" },
    contatos: {
      principal: { nome: "Ana Paula", cargo: "Gerente", telefone: "+55 11 98000-1111", email: "ana@central.com.br" },
      secundario: { nome: "Roberto Lima", cargo: "Sub-gerente", telefone: "+55 11 98000-2222", email: "roberto@central.com.br" },
      expedicao: { nome: "Carlos Souza", telefone: "+55 11 98000-3333" },
      financeiro: { nome: "Marina Costa", telefone: "+55 11 98000-4444" },
      gestor: { nome: "Eduardo Tavares", telefone: "+55 11 98000-5555" },
    },
    atendentes: {
      geral: "Marina Souza", financeiro: "Lucas Andrade",
      operacional: "Carla Mendes", suporte: "Rafael Pinto",
    },
    condicoes: {
      taxaEntrega: 850,
      taxaEntregaRepasse: 620,
      minGarantido: 1200,
      minGarantidoRepasse: 900,
    },
    horarioDelivery: {
      Seg: { ativo: true, ini: "08:00", fim: "22:00" },
      Ter: { ativo: true, ini: "08:00", fim: "22:00" },
      Qua: { ativo: true, ini: "08:00", fim: "22:00" },
      Qui: { ativo: true, ini: "08:00", fim: "22:00" },
      Sex: { ativo: true, ini: "08:00", fim: "23:00" },
      Sáb: { ativo: true, ini: "09:00", fim: "20:00" },
      Dom: { ativo: false, ini: "10:00", fim: "16:00" },
    },
    feriadosDelivery: [
      { data: "2026-12-25", descricao: "Natal", abre: false, ini: "10:00", fim: "16:00" },
      { data: "2026-01-01", descricao: "Ano Novo", abre: false, ini: "10:00", fim: "16:00" },
    ],
    metricas: {
      entregadores: 12, ativos: 9, slaMedio: 98, conversasAbertas: 47,
      entregasMes: 842, ticketMedio: "R$ 87,40",
    },
    entregadores: [
      { id: "1", nome: "João Silva", iniciais: "JS", telefone: "+55 11 99000-1111", status: "online" as EntStatus, escala: "Seg-Sáb · 08-18h" },
      { id: "7", nome: "Felipe Moreira", iniciais: "FM", telefone: "+55 11 99000-7777", status: "busy" as EntStatus, escala: "Seg-Sex · 14-22h" },
      { id: "8", nome: "Gabriel Santos", iniciais: "GS", telefone: "+55 11 99000-8888", status: "online" as EntStatus, escala: "Ter-Dom · 10-19h" },
      { id: "4", nome: "Ricardo Souza", iniciais: "RS", telefone: "+55 11 99000-4444", status: "idle" as EntStatus, escala: "Seg-Sex · 06-15h" },
    ],
    historico: [
      { data: "13/05/2026", evento: "Novo entregador vinculado", detalhe: "Gabriel Santos" },
      { data: "11/05/2026", evento: "SLA atingiu 98%", detalhe: "Melhor mês do trimestre" },
      { data: "08/05/2026", evento: "Atendente alterado", detalhe: "Suporte técnico → Rafael Pinto" },
    ],
  },
};

const ENT_STATUS_LABEL: Record<EntStatus, string> = {
  online: "Disponível", busy: "Em rota", idle: "Pausa", offline: "Offline",
};

const SETOR_ICONS = {
  geral: MessageSquare, financeiro: Wallet, operacional: Headphones, suporte: Wrench,
};

const FarmaciaFicha = () => {
  const { id = "1" } = useParams();
  const f = FARMACIAS_DB[id] ?? FARMACIAS_DB["1"];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-8 py-8">
        <Link to="/farmacias" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Voltar para farmácias
        </Link>

        <PageHeader
          eyebrow="Operação · Ficha"
          title="Ficha da farmácia"
          description="Cadastro completo, contatos, atendentes e equipe vinculada."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Exportar
              </Button>
              <Button size="sm" className="gap-1.5" asChild>
                <Link to="/farmacias/nova"><Edit3 className="h-3.5 w-3.5" /> Editar</Link>
              </Button>
            </div>
          }
        />

        {/* Identificação */}
        <section className="mb-5 rounded-xl border border-border bg-surface p-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                <Building2 className="h-7 w-7" />
              </div>
              <StatusDot status={f.status} pulse={f.status === "online"} className="absolute -bottom-0.5 -right-0.5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">{f.nome}</h2>
                <span className="font-mono text-[10px] text-subtle-foreground">{f.code}</span>
                <span className={cn(
                  "rounded px-2 py-0.5 text-[10px] font-medium",
                  f.status === "online" && "bg-success/15 text-success",
                  f.status === "busy" && "bg-warning/15 text-warning",
                  f.status === "offline" && "bg-muted/50 text-subtle-foreground"
                )}>{f.status === "online" ? "Online" : f.status === "busy" ? "Ocupado" : "Offline"}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {f.endereco} · {f.cidade}</span>
                <span className="inline-flex items-center gap-1.5 font-mono"><Phone className="h-3 w-3" /> {f.telefone}</span>
                <span className="inline-flex items-center gap-1.5"><Mail className="h-3 w-3" /> {f.email}</span>
                <span className="inline-flex items-center gap-1.5 font-mono">CNPJ · {f.cnpj}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5 border-l border-border pl-6">
              <div>
                <div className="font-mono text-2xl font-semibold">{f.metricas.entregadores}</div>
                <div className="text-[10px] uppercase tracking-wider text-subtle-foreground">Entregadores</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-semibold text-success">{f.metricas.slaMedio}%</div>
                <div className="text-[10px] uppercase tracking-wider text-subtle-foreground">SLA</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-semibold">{f.metricas.conversasAbertas}</div>
                <div className="text-[10px] uppercase tracking-wider text-subtle-foreground">Conv. abertas</div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Main */}
          <div className="space-y-5 lg:col-span-2">
            {/* Contatos */}
            <section className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-3 text-sm font-semibold">Contatos por perfil</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { tag: "Principal", c: f.contatos.principal, accent: "text-primary" },
                  { tag: "Secundário", c: f.contatos.secundario, accent: "text-foreground" },
                  { tag: "Expedição", c: f.contatos.expedicao },
                  { tag: "Financeiro", c: f.contatos.financeiro },
                  { tag: "Gestor", c: f.contatos.gestor },
                ].map((it: any) => (
                  <div key={it.tag} className="rounded-lg border border-border bg-background p-3">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className={cn("text-[10px] font-medium uppercase tracking-wider", it.accent ?? "text-subtle-foreground")}>{it.tag}</span>
                    </div>
                    <div className="text-sm font-medium">{it.c.nome}</div>
                    {it.c.cargo && <div className="text-[11px] text-muted-foreground">{it.c.cargo}</div>}
                    <div className="mt-1 font-mono text-xs text-muted-foreground">{it.c.telefone}</div>
                    {it.c.email && <div className="text-[11px] text-muted-foreground truncate">{it.c.email}</div>}
                  </div>
                ))}
              </div>
            </section>

            {/* Atendentes por setor */}
            <section className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-3 text-sm font-semibold">Atendentes por setor</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {([
                  ["geral", "Atendimento Geral"],
                  ["financeiro", "Financeiro"],
                  ["operacional", "Operacional"],
                  ["suporte", "Suporte Técnico"],
                ] as const).map(([key, label]) => {
                  const Icon = SETOR_ICONS[key];
                  return (
                    <div key={key} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] uppercase tracking-wider text-subtle-foreground">{label}</div>
                        <div className="text-sm font-medium">{f.atendentes[key]}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Condições comerciais */}
            <section className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold">
                <DollarSign className="h-3.5 w-3.5" /> Condições comerciais
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="text-[10px] uppercase tracking-wider text-subtle-foreground">Taxa de entrega</div>
                  <div className="mt-1 font-mono text-sm font-medium">{formatBRL(f.condicoes.taxaEntrega)}</div>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="text-[10px] uppercase tracking-wider text-subtle-foreground">Taxa repassada ao entregador</div>
                  <div className="mt-1 font-mono text-sm font-medium">{formatBRL(f.condicoes.taxaEntregaRepasse)}</div>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="text-[10px] uppercase tracking-wider text-subtle-foreground">Mínimo garantido</div>
                  <div className="mt-1 font-mono text-sm font-medium">{formatBRL(f.condicoes.minGarantido)}</div>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="text-[10px] uppercase tracking-wider text-subtle-foreground">Mínimo garantido repassado</div>
                  <div className="mt-1 font-mono text-sm font-medium">{formatBRL(f.condicoes.minGarantidoRepasse)}</div>
                </div>
              </div>
              <div className="mt-3 rounded-md border border-dashed border-border bg-background/40 p-3 text-[11px] text-muted-foreground">
                Valores em reais (BRL). O repasse ao entregador não pode exceder o valor cobrado da farmácia.
              </div>
            </section>

            {/* Horário de funcionamento do delivery */}
            <section className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold">
                <CalendarDays className="h-3.5 w-3.5" /> Horário de funcionamento do delivery
              </h3>
              <div className="overflow-hidden rounded-md border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-background">
                    <tr className="text-left text-[10px] uppercase tracking-wider text-subtle-foreground">
                      <th className="px-3 py-2">Dia</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Início</th>
                      <th className="px-3 py-2">Fim</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(f.horarioDelivery).map(([dia, v]: [string, any]) => (
                      <tr key={dia} className="border-t border-border/60">
                        <td className="px-3 py-2 font-medium">{dia}</td>
                        <td className="px-3 py-2">
                          <span className={cn(
                            "rounded px-2 py-0.5 text-[10px] font-medium",
                            v.ativo ? "bg-success/15 text-success" : "bg-muted/50 text-subtle-foreground"
                          )}>
                            {v.ativo ? "Aberto" : "Fechado"}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono text-muted-foreground">{v.ini}</td>
                        <td className="px-3 py-2 font-mono text-muted-foreground">{v.fim}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {f.feriadosDelivery.length > 0 && (
                <div className="mt-4">
                  <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-subtle-foreground">Feriados</h4>
                  <div className="space-y-2">
                    {f.feriadosDelivery.map((fer: any, i: number) => (
                      <div key={i} className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-background p-2.5 text-xs">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-3 w-3 text-muted-foreground" />
                          <span className="font-mono">{fer.data}</span>
                        </div>
                        <span className="font-medium">{fer.descricao}</span>
                        <span className={cn(
                          "rounded px-2 py-0.5 text-[10px] font-medium",
                          fer.abre ? "bg-success/15 text-success" : "bg-muted/50 text-subtle-foreground"
                        )}>
                          {fer.abre ? `Aberto ${fer.ini}–${fer.fim}` : "Fechado"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Entregadores vinculados + escala */}
            <section className="rounded-xl border border-border bg-surface p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold">
                  <Truck className="h-3.5 w-3.5" /> Entregadores vinculados
                </h3>
                <span className="font-mono text-[10px] text-subtle-foreground">
                  {f.metricas.ativos} ativos / {f.metricas.entregadores} total
                </span>
              </div>
              <div className="overflow-hidden rounded-md border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-background">
                    <tr className="text-left text-[10px] uppercase tracking-wider text-subtle-foreground">
                      <th className="px-3 py-2">Entregador</th>
                      <th className="px-3 py-2">Telefone</th>
                      <th className="px-3 py-2">Escala</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {f.entregadores.map((e: any) => (
                      <tr key={e.id} className="border-t border-border/60 hover:bg-surface-hover">
                        <td className="px-3 py-2">
                          <Link to={`/entregadores/${e.id}`} className="flex items-center gap-2 hover:underline">
                            <div className="relative">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-channel-whatsapp/40 to-primary/40 text-[10px] font-semibold">
                                {e.iniciais}
                              </div>
                              <StatusDot status={e.status} className="absolute -bottom-0.5 -right-0.5" />
                            </div>
                            <span className="font-medium">{e.nome}</span>
                          </Link>
                        </td>
                        <td className="px-3 py-2 font-mono text-muted-foreground">{e.telefone}</td>
                        <td className="px-3 py-2 text-muted-foreground">{e.escala}</td>
                        <td className="px-3 py-2">
                          <span className={cn(
                            "rounded px-2 py-0.5 text-[10px] font-medium",
                            e.status === "online" && "bg-success/15 text-success",
                            e.status === "busy" && "bg-warning/15 text-warning",
                            e.status === "idle" && "bg-muted text-muted-foreground",
                            e.status === "offline" && "bg-muted/50 text-subtle-foreground"
                          )}>{ENT_STATUS_LABEL[e.status as EntStatus]}</span>
                        </td>
                        <td className="px-3 py-2">
                          <Link to={`/entregadores/${e.id}`}>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Histórico */}
            <section className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold">
                <Clock className="h-3.5 w-3.5" /> Histórico recente
              </h3>
              <div className="space-y-2">
                {f.historico.map((h: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 rounded-md border border-border/60 bg-background p-3">
                    <div className="font-mono text-[10px] text-subtle-foreground w-20 pt-0.5">{h.data}</div>
                    <div className="flex-1">
                      <div className="text-xs font-medium">{h.evento}</div>
                      <div className="text-[11px] text-muted-foreground">{h.detalhe}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <section className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-3 text-sm font-semibold">Líder responsável</h3>
              <Link to={`/lideres/${f.lider.id}`}
                className="group flex items-center gap-3 rounded-lg border border-border bg-background p-3 hover:border-primary/40 hover:bg-surface-elevated">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-warning/20 text-warning">
                  <Crown className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{f.lider.nome}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{f.lider.telefone}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
              </Link>
            </section>

            <section className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-3 text-sm font-semibold">Dados cadastrais</h3>
              <div className="space-y-2.5 text-xs">
                <div><div className="text-[10px] uppercase tracking-wider text-subtle-foreground">Razão social</div><div className="mt-0.5">{f.razaoSocial}</div></div>
                <div><div className="text-[10px] uppercase tracking-wider text-subtle-foreground">CEP</div><div className="mt-0.5 font-mono">{f.cep}</div></div>
                <div><div className="text-[10px] uppercase tracking-wider text-subtle-foreground">Endereço</div><div className="mt-0.5">{f.endereco}</div></div>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-3 text-sm font-semibold">Performance do mês</h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Entregas no mês</span><span className="font-mono font-medium">{f.metricas.entregasMes}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Ticket médio</span><span className="font-mono font-medium">{f.metricas.ticketMedio}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Conv. abertas</span><span className="font-mono font-medium">{f.metricas.conversasAbertas}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">SLA</span><span className="font-mono font-medium text-success">{f.metricas.slaMedio}%</span></div>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-3 text-sm font-semibold">Equipe</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {f.metricas.entregadores} entregadores · <span className="text-success">{f.metricas.ativos} ativos</span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmaciaFicha;
