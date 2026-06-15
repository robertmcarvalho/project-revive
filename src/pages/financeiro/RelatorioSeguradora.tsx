import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { financeiroApi } from "@/lib/financeiroApi";
import { listarAtivos, listarDesligadosNoMes, csvSeguradora, type SegLine } from "@/lib/billing/seguradora";

const baixarCsv = (nome: string, conteudo: string) => {
  const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = nome; a.click();
  URL.revokeObjectURL(url);
};

const RelatorioSeguradora = () => {
  const [dataCorte, setDataCorte] = useState(new Date().toISOString().slice(0, 10));
  const [mes, setMes] = useState(new Date().toISOString().slice(0, 7));
  const [ativos, setAtivos] = useState<SegLine[]>([]);
  const [desligados, setDesligados] = useState<SegLine[]>([]);

  useEffect(() => {
    financeiroApi.catalogos().then((c) => {
      setAtivos(listarAtivos(dataCorte, c.entregadores, c.regrasVinculo, c.farmacias));
      setDesligados(listarDesligadosNoMes(mes, c.entregadores, c.regrasVinculo, c.farmacias));
    });
  }, [dataCorte, mes]);

  return (
    <Tabs defaultValue="ativos">
      <TabsList>
        <TabsTrigger value="ativos">Ativos ({ativos.length})</TabsTrigger>
        <TabsTrigger value="desligados">Desligados no mês ({desligados.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="ativos" className="mt-4">
        <div className="mb-3 flex items-end gap-3">
          <div><Label className="text-[10px] uppercase text-subtle-foreground">Data de corte</Label>
            <Input type="date" value={dataCorte} onChange={(e) => setDataCorte(e.target.value)} className="h-8 w-40" /></div>
          <Button size="sm" variant="outline" className="ml-auto"
            onClick={() => baixarCsv(`seguradora-ativos-${dataCorte}.csv`, csvSeguradora(ativos))}>
            <Download className="h-3.5 w-3.5 mr-1" /> Exportar CSV
          </Button>
        </div>
        <Tabela lines={ativos} />
      </TabsContent>

      <TabsContent value="desligados" className="mt-4">
        <div className="mb-3 flex items-end gap-3">
          <div><Label className="text-[10px] uppercase text-subtle-foreground">Competência (mês)</Label>
            <Input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className="h-8 w-40" /></div>
          <Button size="sm" variant="outline" className="ml-auto"
            onClick={() => baixarCsv(`seguradora-desligados-${mes}.csv`, csvSeguradora(desligados, true))}>
            <Download className="h-3.5 w-3.5 mr-1" /> Exportar CSV
          </Button>
        </div>
        <Tabela lines={desligados} desligados />
      </TabsContent>
    </Tabs>
  );
};

const Tabela = ({ lines, desligados }: { lines: SegLine[]; desligados?: boolean }) => (
  <div className="overflow-hidden rounded-xl border border-border bg-surface">
    <table className="w-full text-sm">
      <thead className="border-b border-border text-left text-[10px] uppercase tracking-wider text-subtle-foreground">
        <tr>
          <th className="px-4 py-3">Nome</th>
          <th className="px-4 py-3">CPF</th>
          <th className="px-4 py-3">Nascimento</th>
          <th className="px-4 py-3">Telefone</th>
          <th className="px-4 py-3">Vínculo desde</th>
          <th className="px-4 py-3">Farmácias</th>
          {desligados && <><th className="px-4 py-3">Desligado em</th><th className="px-4 py-3">Motivo</th></>}
        </tr>
      </thead>
      <tbody>
        {lines.map((l) => (
          <tr key={l.entregadorId} className="border-b border-border/40 last:border-0">
            <td className="px-4 py-2.5 font-medium">{l.nome}</td>
            <td className="px-4 py-2.5 font-mono text-xs">{l.cpf ?? "—"}</td>
            <td className="px-4 py-2.5 font-mono text-xs">{l.nascimento ?? "—"}</td>
            <td className="px-4 py-2.5 text-xs">{l.telefone ?? "—"}</td>
            <td className="px-4 py-2.5 font-mono text-xs">{l.vinculoDesde ?? "—"}</td>
            <td className="px-4 py-2.5 text-xs">{l.farmacias.join(", ")}</td>
            {desligados && <>
              <td className="px-4 py-2.5 font-mono text-xs">{l.inactiveAt}</td>
              <td className="px-4 py-2.5 text-xs">{l.terminationReason ?? "—"}</td>
            </>}
          </tr>
        ))}
        {!lines.length && <tr><td colSpan={desligados ? 8 : 6} className="px-4 py-10 text-center text-sm text-muted-foreground">Nenhum registro.</td></tr>}
      </tbody>
    </table>
  </div>
);

export default RelatorioSeguradora;
