import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, Phone, Mail, MapPin, Truck, Star, Calendar, FileText,
  CreditCard, Building2, ChevronRight, Edit3, ShieldCheck, Crown, Clock,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusDot } from "@/components/StatusDot";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Status = "online" | "busy" | "idle" | "offline";

const ENTREGADORES_DB: Record<string, any> = {
  "1": {
    nome: "João Silva", iniciais: "JS", cpf: "123.456.789-00",
    email: "joao.silva@aethera.com", telefone: "+55 11 99000-1111",
    estado: "SP", cidade: "São Paulo", regiao: "Zona Sul - SP",
    tipo: "Fixo", veiculo: "Moto", placa: "ABC-1D23",
    status: "online" as Status, lider: { id: "1", nome: "Marina Souza" },
    isLider: false,
    mei: { possui: true, cnpj: "12.345.678/0001-90" },
    certificado: { possui: true, expiracao: "2026-08-15" },
    pix: { tipo: "CPF", chave: "123.456.789-00" },
    farmacias: [
      { id: "1", nome: "Farmácia Central", code: "FC-001" },
      { id: "7", nome: "Drogasil Moema", code: "DGS-204" },
    ],
    metricas: {
      entregasMes: 47, entregasTotal: 1284, avaliacao: 4.9,
      slaMedio: 96, kmRodados: 1820, diasAtivos: 22,
    },
    escala: [
      { dia: "Seg", turno: "08:00 - 18:00" },
      { dia: "Ter", turno: "08:00 - 18:00" },
      { dia: "Qua", turno: "08:00 - 18:00" },
      { dia: "Qui", turno: "08:00 - 18:00" },
      { dia: "Sex", turno: "08:00 - 18:00" },
      { dia: "Sáb", turno: "08:00 - 13:00" },
      { dia: "Dom", turno: "Folga" },
    ],
    historico: [
      { data: "13/05/2026", evento: "Diária lançada", detalhe: "R$ 180,00 - Farmácia Central" },
      { data: "10/05/2026", evento: "Avaliação recebida", detalhe: "5★ - 'Entrega rápida'" },
      { data: "05/05/2026", evento: "Vínculo adicionado", detalhe: "Drogasil Moema" },
      { data: "01/05/2026", evento: "Certificado renovado", detalhe: "Válido até 15/08/2026" },
    ],
  },
};

const STATUS_LABEL: Record<Status, string> = {
  online: "Disponível", busy: "Em rota", idle: "Pausa", offline: "Offline",
};

const EntregadorFicha = () => {
  const { id = "1" } = useParams();
  const e = ENTREGADORES_DB[id] ?? ENTREGADORES_DB["1"];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-8 py-8">
        <Link to="/entregadores" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Voltar para entregadores
        </Link>

        <PageHeader
          eyebrow="Pessoas · Ficha"
          title="Ficha do entregador"
          description="Cadastro completo, escala, vínculos e histórico operacional."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Exportar
              </Button>
              <Button size="sm" className="gap-1.5" asChild>
                <Link to="/entregadores/novo"><Edit3 className="h-3.5 w-3.5" /> Editar</Link>
              </Button>
            </div>
          }
        />

        {/* Identificação */}
        <section className="mb-5 rounded-xl border border-border bg-surface p-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-channel-whatsapp/40 to-primary/40 text-lg font-semibold">
                {e.iniciais}
              </div>
              {e.isLider && (
                <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-warning text-warning-foreground">
                  <Crown className="h-3.5 w-3.5" />
                </div>
              )}
              <StatusDot status={e.status} pulse={e.status === "online"} className="absolute -bottom-0.5 -right-0.5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">{e.nome}</h2>
                <span className={cn(
                  "rounded px-2 py-0.5 text-[10px] font-medium",
                  e.status === "online" && "bg-success/15 text-success",
                  e.status === "busy" && "bg-warning/15 text-warning",
                  e.status === "idle" && "bg-muted text-muted-foreground",
                  e.status === "offline" && "bg-muted/50 text-subtle-foreground"
                )}>{STATUS_LABEL[e.status as Status]}</span>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  {e.tipo}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Mail className="h-3 w-3" /> {e.email}</span>
                <span className="inline-flex items-center gap-1.5 font-mono"><Phone className="h-3 w-3" /> {e.telefone}</span>
                <span className="inline-flex items-center gap-1.5 font-mono">CPF · {e.cpf}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {e.regiao}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5 border-l border-border pl-6">
              <div>
                <div className="font-mono text-2xl font-semibold">{e.metricas.entregasMes}</div>
                <div className="text-[10px] uppercase tracking-wider text-subtle-foreground">Entregas/mês</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-semibold inline-flex items-center gap-1">
                  {e.metricas.avaliacao}<Star className="h-3.5 w-3.5 fill-warning text-warning" />
                </div>
                <div className="text-[10px] uppercase tracking-wider text-subtle-foreground">Avaliação</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-semibold text-success">{e.metricas.slaMedio}%</div>
                <div className="text-[10px] uppercase tracking-wider text-subtle-foreground">SLA</div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Coluna principal */}
          <div className="space-y-5 lg:col-span-2">
            {/* Documentação */}
            <section className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-3 text-sm font-semibold">Documentação fiscal</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium">MEI</span>
                    <span className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-medium",
                      e.mei.possui ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                    )}>{e.mei.possui ? "Sim" : "Não"}</span>
                  </div>
                  {e.mei.possui && (
                    <div className="font-mono text-xs text-muted-foreground">CNPJ · {e.mei.cnpj}</div>
                  )}
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                      <ShieldCheck className="h-3.5 w-3.5" /> Certificado digital
                    </span>
                    <span className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-medium",
                      e.certificado.possui ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                    )}>{e.certificado.possui ? "Ativo" : "Não"}</span>
                  </div>
                  {e.certificado.possui && (
                    <div className="text-xs text-muted-foreground">Expira em <span className="font-mono text-foreground">{e.certificado.expiracao}</span></div>
                  )}
                </div>
                <div className="rounded-lg border border-border bg-background p-3 md:col-span-2">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-medium">
                    <CreditCard className="h-3.5 w-3.5" /> Chave PIX
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">{e.pix.tipo} · {e.pix.chave}</div>
                </div>
              </div>
            </section>

            {/* Farmácias vinculadas */}
            <section className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-3 text-sm font-semibold">Farmácias vinculadas</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {e.farmacias.map((f: any) => (
                  <Link key={f.id} to={`/farmacias/${f.id}`}
                    className="group flex items-center gap-3 rounded-lg border border-border bg-background p-3 hover:border-primary/40 hover:bg-surface-elevated transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
                      <Building2 className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{f.nome}</div>
                      <div className="font-mono text-[10px] text-subtle-foreground">{f.code}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  </Link>
                ))}
              </div>
            </section>

            {/* Escala */}
            <section className="rounded-xl border border-border bg-surface p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold">
                  <Calendar className="h-3.5 w-3.5" /> Escala semanal
                </h3>
                <button className="text-[11px] font-medium text-primary hover:underline">Editar escala</button>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {e.escala.map((d: any) => (
                  <div key={d.dia} className={cn(
                    "rounded-md border p-2 text-center",
                    d.turno === "Folga" ? "border-border/50 bg-muted/30" : "border-border bg-background"
                  )}>
                    <div className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">{d.dia}</div>
                    <div className={cn(
                      "mt-1 font-mono text-[10px]",
                      d.turno === "Folga" ? "text-subtle-foreground" : "text-foreground"
                    )}>{d.turno}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Histórico */}
            <section className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold">
                <Clock className="h-3.5 w-3.5" /> Histórico recente
              </h3>
              <div className="space-y-2">
                {e.historico.map((h: any, i: number) => (
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
              <h3 className="mb-3 text-sm font-semibold">Veículo</h3>
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{e.veiculo}</span>
                </div>
                <div className="mt-1 font-mono text-xs text-muted-foreground">Placa · {e.placa}</div>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-3 text-sm font-semibold">Líder responsável</h3>
              <Link to={`/lideres/${e.lider.id}`}
                className="group flex items-center gap-3 rounded-lg border border-border bg-background p-3 hover:border-primary/40 hover:bg-surface-elevated">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-warning/20 text-warning">
                  <Crown className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{e.lider.nome}</div>
                  <div className="text-[10px] text-subtle-foreground">Ver ficha do líder</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
              </Link>
            </section>

            <section className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-3 text-sm font-semibold">Métricas gerais</h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Entregas totais</span><span className="font-mono font-medium">{e.metricas.entregasTotal.toLocaleString("pt-BR")}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">KM rodados</span><span className="font-mono font-medium">{e.metricas.kmRodados.toLocaleString("pt-BR")}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Dias ativos (mês)</span><span className="font-mono font-medium">{e.metricas.diasAtivos}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">SLA médio</span><span className="font-mono font-medium text-success">{e.metricas.slaMedio}%</span></div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntregadorFicha;
