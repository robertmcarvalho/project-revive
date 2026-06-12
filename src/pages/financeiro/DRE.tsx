import { useEffect, useState } from "react";
import { financeiroApi } from "@/lib/financeiroApi";
import { fmtBRL } from "@/lib/baixas";

const DRE = () => {
  const [data, setData] = useState<Awaited<ReturnType<typeof financeiroApi.dre>> | null>(null);
  const [mes, setMes] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => { financeiroApi.dre(mes).then(setData); }, [mes]);

  if (!data) return <div className="text-sm text-muted-foreground">Carregando…</div>;

  const linhas = [
    { label: "Receita bruta (recebida)", value: data.receitas, tone: "text-success" },
    { label: "(−) Repasse a entregadores", value: -data.repasseEntregadores, tone: "text-foreground" },
    { label: "(−) Despesas fixas", value: -data.fixas, tone: "text-foreground" },
    { label: "(−) Despesas variáveis", value: -data.variaveis, tone: "text-foreground" },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <label className="text-xs text-muted-foreground">Competência</label>
        <input type="month" value={mes} onChange={(e) => setMes(e.target.value)}
          className="rounded border border-border bg-background px-2 py-1 text-xs" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <tbody>
            {linhas.map((l) => (
              <tr key={l.label} className="border-b border-border/40">
                <td className="px-6 py-3">{l.label}</td>
                <td className={`px-6 py-3 text-right font-mono ${l.tone}`}>{fmtBRL(l.value)}</td>
              </tr>
            ))}
            <tr className="bg-background/40">
              <td className="px-6 py-4 font-semibold">= Resultado operacional</td>
              <td className={`px-6 py-4 text-right font-mono text-lg font-bold ${data.resultado >= 0 ? "text-success" : "text-destructive"}`}>
                {fmtBRL(data.resultado)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        DRE em regime de caixa — considera apenas baixas registradas no mês selecionado.
      </p>
    </div>
  );
};

export default DRE;
