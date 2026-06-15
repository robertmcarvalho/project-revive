import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { financeiroApi } from "@/lib/financeiroApi";
import { fmtBRL, fmtDate } from "@/lib/baixas";
import type { Fatura, LegalEntity, Farmacia, CentroCusto, Acerto } from "@/data/financeiroMock";

const FaturaPublica = () => {
  const { token = "" } = useParams();
  const [fatura, setFatura] = useState<Fatura | null>(null);
  const [entity, setEntity] = useState<LegalEntity | null>(null);
  const [farm, setFarm] = useState<Farmacia | null>(null);
  const [cc, setCc] = useState<CentroCusto | null>(null);
  const [acerto, setAcerto] = useState<Acerto | null>(null);

  useEffect(() => {
    financeiroApi.getFaturaByToken(token).then(async (f) => {
      if (!f) return;
      setFatura(f);
      const cat = await financeiroApi.catalogos();
      setEntity(cat.legalEntities.find((e) => e.entityType === f.empresa) ?? null);
      setFarm(cat.farmacias.find((x) => x.id === f.farmaciaId) ?? null);
      setCc(cat.centrosCusto.find((x) => x.id === f.centroCustoId) ?? null);
      setAcerto(await financeiroApi.getAcerto(f.origemAcertoId));
    });
  }, [token]);

  if (!fatura) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Fatura não encontrada ou link expirado.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-10">
      <article className="mx-auto max-w-3xl rounded-xl border border-border bg-surface p-8 shadow-sm">
        <header className="mb-6 flex items-start justify-between border-b border-border pb-5">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-subtle-foreground">Fatura nº</div>
            <h1 className="text-2xl font-semibold tracking-tight">{fatura.numero}</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Ciclo {fmtDate(fatura.cicloInicio)} a {fmtDate(fatura.cicloFim)} · Vencimento {fmtDate(fatura.vencimento)}
            </p>
          </div>
          {entity && (
            <div className="text-right text-xs">
              <div className="font-semibold">{entity.tradeName}</div>
              <div className="text-muted-foreground">{entity.legalName}</div>
              <div className="font-mono">CNPJ {entity.cnpj}</div>
              <div className="mt-1 text-muted-foreground">{entity.address.logradouro}, {entity.address.numero} · {entity.address.cidade}/{entity.address.uf}</div>
            </div>
          )}
        </header>

        {entity?.invoiceHeaderNotes && <p className="mb-4 text-xs text-muted-foreground">{entity.invoiceHeaderNotes}</p>}

        <section className="mb-6 rounded-lg border border-border bg-background/40 p-4">
          <div className="text-[10px] uppercase tracking-wider text-subtle-foreground">Sacado</div>
          <div className="mt-1 text-sm font-semibold">{farm?.nome}</div>
          <div className="text-xs text-muted-foreground">{cc?.nome} {cc?.cnpj && `· CNPJ ${cc.cnpj}`}</div>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-subtle-foreground">Detalhe do ciclo</h2>
          <table className="w-full text-sm">
            <thead className="text-left text-[10px] uppercase text-subtle-foreground">
              <tr><th className="py-2">Entregador</th><th className="py-2 text-right">Qtd entregas</th><th className="py-2 text-right">Valor</th></tr>
            </thead>
            <tbody>
              {acerto?.linhas.map((l, i) => (
                <tr key={i} className="border-t border-border/40">
                  <td className="py-1.5">{l.entregadorId}</td>
                  <td className="py-1.5 text-right font-mono">{l.qtdEntregas}</td>
                  <td className="py-1.5 text-right font-mono">{fmtBRL(l.valorFaturadoFarmacia)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <footer className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-2xl font-semibold">{fmtBRL(fatura.valor)}</div>
          </div>
          {entity && (
            <div className="mt-4 rounded-lg bg-background/40 p-3 text-xs">
              <div className="font-semibold">Dados para pagamento</div>
              <div className="mt-1 grid grid-cols-2 gap-2 text-muted-foreground">
                <div>Banco: {entity.bank.name} ({entity.bank.code})</div>
                <div>Ag. {entity.bank.branch} · Conta {entity.bank.account}-{entity.bank.digit}</div>
                <div>PIX: {entity.pixKey ?? "—"}</div>
                <div>Tipo: {entity.pixKeyType ?? "—"}</div>
              </div>
            </div>
          )}
          {entity?.invoiceFooterNotes && <p className="mt-4 text-[11px] text-muted-foreground">{entity.invoiceFooterNotes}</p>}
        </footer>
      </article>
    </div>
  );
};

export default FaturaPublica;
