import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutGrid, Receipt, FileText, ArrowDownToLine, ArrowUpFromLine, Coins, Banknote, BarChart3, Settings } from "lucide-react";

const items = [
  { to: "/financeiro", label: "Visão geral", icon: LayoutGrid, end: true },
  { to: "/financeiro/acertos", label: "Acertos", icon: Receipt },
  { to: "/financeiro/faturamento", label: "Faturamento", icon: FileText },
  { to: "/financeiro/a-receber", label: "A receber", icon: ArrowDownToLine },
  { to: "/financeiro/a-pagar", label: "A pagar", icon: ArrowUpFromLine },
  { to: "/financeiro/despesas", label: "Despesas", icon: Coins },
  { to: "/financeiro/conciliacao", label: "Conciliação", icon: Banknote },
  { to: "/financeiro/dre", label: "DRE", icon: BarChart3 },
  { to: "/financeiro/configuracoes", label: "Configurações", icon: Settings },
];

export const FinanceiroSubNav = () => (
  <div className="mb-6 flex flex-wrap gap-1 rounded-xl border border-border bg-surface p-1">
    {items.map((it) => (
      <NavLink key={it.to} to={it.to} end={it.end}
        className={({ isActive }) => cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
          isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
        )}>
        <it.icon className="h-3.5 w-3.5" />
        {it.label}
      </NavLink>
    ))}
  </div>
);
