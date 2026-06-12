import { Outlet } from "react-router-dom";
import { Wallet } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { FinanceiroSubNav } from "@/components/financeiro/SubNav";

const FinanceiroLayout = () => (
  <div className="h-full overflow-y-auto">
    <div className="mx-auto max-w-7xl px-8 py-8">
      <PageHeader
        live
        icon={Wallet}
        eyebrow="Financeiro"
        title="Financeiro"
        description="Acertos, faturamento, contas a pagar/receber, despesas e DRE — tudo em um só lugar."
      />
      <FinanceiroSubNav />
      <Outlet />
    </div>
  </div>
);

export default FinanceiroLayout;
