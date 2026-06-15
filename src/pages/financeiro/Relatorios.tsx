import { Link } from "react-router-dom";
import { FileSpreadsheet, ShieldCheck, Banknote } from "lucide-react";

const cards = [
  { to: "/financeiro/relatorios/inss-contabilidade", title: "INSS — Contabilidade",
    desc: "Lista mensal de cooperados (nome, CPF, valor faturado) para envio ao contador. INSS é custo da CoopMob.",
    icon: FileSpreadsheet, tone: "bg-primary/15 text-primary" },
  { to: "/financeiro/relatorios/seguradora", title: "Seguradora",
    desc: "Cooperados ativos na data de corte + desligados no mês de competência.",
    icon: ShieldCheck, tone: "bg-success/15 text-success" },
  { to: "/financeiro/relatorios/pagamento-pix", title: "Pagamento PIX em lote",
    desc: "Arquivo CSV por ciclo aprovado para upload no internet banking (uma linha por entregador).",
    icon: Banknote, tone: "bg-warning/15 text-warning" },
];

const RelatoriosHub = () => (
  <div>
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((c) => (
        <Link key={c.to} to={c.to}
          className="group rounded-xl border border-border bg-surface p-5 transition-colors hover:border-primary/40 hover:bg-surface-hover">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.tone}`}>
            <c.icon className="h-4 w-4" />
          </div>
          <h3 className="mt-3 text-sm font-semibold">{c.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
          <div className="mt-3 text-[11px] font-medium text-primary group-hover:underline">Abrir →</div>
        </Link>
      ))}
    </div>
    <p className="mt-6 text-[11px] text-muted-foreground">
      Toggle <strong>Competência / Caixa</strong> aparece dentro de cada relatório financeiro aplicável.
    </p>
  </div>
);

export default RelatoriosHub;
