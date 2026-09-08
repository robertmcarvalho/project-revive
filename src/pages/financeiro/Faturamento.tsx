import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Barcode,
  Building2,
  CalendarRange,
  CircleDollarSign,
  Clock3,
  Download,
  Eye,
  FileText,
  FileCheck2,
  MoreHorizontal,
  Search,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconTile } from "@/components/IconTile";
import { financeiroApi } from "@/lib/financeiroApi";
import { fmtBRL, fmtDate } from "@/lib/baixas";
import { EmpresaBadge } from "@/components/financeiro/EmpresaBadge";
import { cn } from "@/lib/utils";
import type { Fatura, Farmacia, CentroCusto, StatusFatura, StatusNfse, StatusBoleto } from "@/data/financeiroMock";
import { toast } from "@/hooks/use-toast";

const statusLabel: Record<StatusFatura, string> = {
  aberta: "Em aberto",
  enviada: "Enviada",
  paga: "Paga",
  vencida: "Vencida",
};

const statusStyle: Record<StatusFatura, string> = {
  aberta: "border-warning/25 bg-warning/10 text-warning",
  enviada: "border-primary/25 bg-primary/10 text-primary",
  paga: "border-success/25 bg-success/10 text-success",
  vencida: "border-destructive/25 bg-destructive/10 text-destructive",
};

type StatusFiltro = "todas" | StatusFatura;

const nfseLabel: Record<StatusNfse, string> = { pendente: "Pendente", emitida: "Emitida", erro: "Com erro", cancelada: "Cancelada" };
const boletoLabel: Record<StatusBoleto, string> = { pendente: "Pendente", gerado: "Gerado", pago: "Pago", vencido: "Vencido", cancelado: "Cancelado" };
const documentoStyle: Record<StatusNfse | StatusBoleto, string> = {
  pendente: "border-border bg-muted/40 text-muted-foreground",
  emitida: "border-success/25 bg-success/10 text-success",
  erro: "border-destructive/25 bg-destructive/10 text-destructive",
  cancelada: "border-border bg-muted/40 text-subtle-foreground",
  gerado: "border-primary/25 bg-primary/10 text-primary",
  pago: "border-success/25 bg-success/10 text-success",
  vencido: "border-destructive/25 bg-destructive/10 text-destructive",
  cancelado: "border-border bg-muted/40 text-subtle-foreground",
};

const Faturamento = () => {
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [farmacias, setFarmacias] = useState<Farmacia[]>([]);
  const [ccs, setCcs] = useState<CentroCusto[]>([]);
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<StatusFiltro>("todas");
  const [farmaciaId, setFarmaciaId] = useState("todas");

  const load = () => financeiroApi.listFaturas().then(setFaturas);
  useEffect(() => {
    load();
    financeiroApi.catalogos().then((c) => { setFarmacias(c.farmacias); setCcs(c.centrosCusto); });
  }, []);

  const enviar = async (id: string) => {
    await financeiroApi.marcarFaturaEnviada(id);
    await load();
    toast({ title: "Fatura enviada" });
  };

  const farm = (id: string) => farmacias.find((f) => f.id === id)?.nome ?? id;
  const cc = (id: string) => ccs.find((c) => c.id === id)?.nome ?? id;

  const resumo = useMemo(() => {
    const total = faturas.reduce((acc, fatura) => acc + fatura.valor, 0);
    const aberto = faturas.filter((fatura) => fatura.status === "aberta" || fatura.status === "enviada");
    const vencidas = faturas.filter((fatura) => fatura.status === "vencida");
    return {
      total,
      aberto: aberto.reduce((acc, fatura) => acc + fatura.valor, 0),
      abertas: aberto.length,
      vencido: vencidas.reduce((acc, fatura) => acc + fatura.valor, 0),
      vencidas: vencidas.length,
    };
  }, [faturas]);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return faturas.filter((fatura) => {
      const correspondeStatus = status === "todas" || fatura.status === status;
      const correspondeFarmacia = farmaciaId === "todas" || fatura.farmaciaId === farmaciaId;
      const texto = `${fatura.numero} ${farm(fatura.farmaciaId)} ${cc(fatura.centroCustoId)}`.toLocaleLowerCase("pt-BR");
      return correspondeStatus && correspondeFarmacia && (!termo || texto.includes(termo));
    });
  }, [busca, cc, farmaciaId, farm, faturas, status]);

  return (
    <div className="space-y-5 pb-8">
      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle-foreground">Faturado no ciclo</p>
              <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">{fmtBRL(resumo.total)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{faturas.length} {faturas.length === 1 ? "fatura gerada" : "faturas geradas"}</p>
            </div>
            <IconTile icon={CircleDollarSign} tone="primary" size="lg" />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle-foreground">A receber</p>
              <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-warning">{fmtBRL(resumo.aberto)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{resumo.abertas} {resumo.abertas === 1 ? "cobrança pendente" : "cobranças pendentes"}</p>
            </div>
            <IconTile icon={Clock3} tone="warning" size="lg" />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle-foreground">Vencido</p>
              <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-destructive">{fmtBRL(resumo.vencido)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {resumo.vencidas ? `${resumo.vencidas} ${resumo.vencidas === 1 ? "fatura exige" : "faturas exigem"} atenção` : "Nenhuma pendência vencida"}
              </p>
            </div>
            <IconTile icon={AlertTriangle} tone="destructive" size="lg" />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle-foreground" />
            <Input
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar por número, farmácia ou centro..."
              className="h-10 pl-9"
              aria-label="Buscar faturas"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={farmaciaId} onValueChange={setFarmaciaId}>
              <SelectTrigger className="h-10 w-full sm:w-52" aria-label="Filtrar por farmácia">
                <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Todas as farmácias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as farmácias</SelectItem>
                {farmacias.map((farmacia) => <SelectItem key={farmacia.id} value={farmacia.id}>{farmacia.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(value) => setStatus(value as StatusFiltro)}>
              <SelectTrigger className="h-10 w-full sm:w-40" aria-label="Filtrar por status">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos os status</SelectItem>
                {Object.entries(statusLabel).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {faturas.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <IconTile icon={FileText} tone="primary" size="xl" className="mx-auto mb-4" />
            <h2 className="font-semibold">Nenhuma fatura emitida ainda</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Aprove um acerto para gerar automaticamente as faturas da CoopMob e da Flux Farma.</p>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <Search className="mx-auto mb-3 h-6 w-6 text-subtle-foreground" />
            <h2 className="font-medium">Nenhuma fatura encontrada</h2>
            <p className="mt-1 text-sm text-muted-foreground">Tente remover um filtro ou buscar por outro termo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1220px] text-left text-sm">
              <thead className="border-b border-border bg-background/35 text-[10px] font-semibold uppercase tracking-wider text-subtle-foreground">
                <tr>
                  <th className="px-5 py-3.5">Fatura</th>
                  <th className="px-5 py-3.5">Farmácia</th>
                  <th className="px-5 py-3.5">Entidade</th>
                  <th className="px-5 py-3.5">Ciclo</th>
                  <th className="px-5 py-3.5">Vencimento</th>
                  <th className="px-5 py-3.5 text-right">Valor</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">NFS-e</th>
                  <th className="px-5 py-3.5">Boleto</th>
                  <th className="w-16 px-5 py-3.5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtradas.map((fatura) => (
                  <tr key={fatura.id} className="group transition-colors hover:bg-surface-hover/60">
                    <td className="px-5 py-4">
                      <div className="font-mono text-xs font-medium text-foreground">{fatura.numero}</div>
                      <div className="mt-1 text-[11px] text-subtle-foreground">Origem: {fatura.origemAcertoId}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium">{farm(fatura.farmaciaId)}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{cc(fatura.centroCustoId)}</div>
                    </td>
                    <td className="px-5 py-4"><EmpresaBadge empresa={fatura.empresa} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                        <CalendarRange className="h-3.5 w-3.5" />
                        {fmtDate(fatura.cicloInicio)} — {fmtDate(fatura.cicloFim)}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{fmtDate(fatura.vencimento)}</td>
                    <td className="px-5 py-4 text-right font-mono font-semibold tabular-nums">{fmtBRL(fatura.valor)}</td>
                    <td className="px-5 py-4">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium", statusStyle[fatura.status])}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {statusLabel[fatura.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <FileCheck2 className="h-4 w-4 text-subtle-foreground" />
                        <div>
                          <span className={cn("inline-flex rounded-md border px-2 py-1 text-[11px] font-medium", documentoStyle[fatura.nfseStatus ?? "pendente"])}>
                            {nfseLabel[fatura.nfseStatus ?? "pendente"]}
                          </span>
                          {fatura.nfseNumero && <p className="mt-1 font-mono text-[10px] text-subtle-foreground">Nº {fatura.nfseNumero}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Barcode className="h-4 w-4 text-subtle-foreground" />
                        <span className={cn("inline-flex rounded-md border px-2 py-1 text-[11px] font-medium", documentoStyle[fatura.boletoStatus ?? "pendente"])}>
                          {boletoLabel[fatura.boletoStatus ?? "pendente"]}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Ações da fatura ${fatura.numero}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {fatura.publicToken && (
                            <DropdownMenuItem asChild>
                              <Link to={`/public/billing/${fatura.publicToken}`} target="_blank">
                                <Eye className="mr-2 h-4 w-4" /> Visualizar fatura
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onSelect={() => toast({ title: "Exportação preparada", description: `PDF da fatura ${fatura.numero}.` })}>
                            <Download className="mr-2 h-4 w-4" /> Baixar PDF
                          </DropdownMenuItem>
                           {fatura.nfseStatus === "emitida" && (
                             <DropdownMenuItem onSelect={() => toast({ title: "XML preparado", description: `NFS-e ${fatura.nfseNumero}.` })}>
                               <FileCheck2 className="mr-2 h-4 w-4" /> Baixar XML da NFS-e
                             </DropdownMenuItem>
                           )}
                           {fatura.boletoStatus && fatura.boletoStatus !== "pendente" && fatura.boletoStatus !== "cancelado" && (
                             <DropdownMenuItem onSelect={() => toast({ title: "Boleto preparado", description: `Cobrança da fatura ${fatura.numero}.` })}>
                               <Barcode className="mr-2 h-4 w-4" /> Baixar boleto
                             </DropdownMenuItem>
                           )}
                          {fatura.status === "aberta" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onSelect={() => enviar(fatura.id)}>
                                <Send className="mr-2 h-4 w-4" /> Enviar cobrança
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {faturas.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-border bg-background/25 px-5 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>Exibindo {filtradas.length} de {faturas.length} faturas</span>
            <span>Valores atualizados conforme o ciclo selecionado</span>
          </div>
        )}
      </section>
    </div>
  );
};

export default Faturamento;