import { cn } from "@/lib/utils";
import type { Empresa } from "@/data/financeiroMock";

export const EmpresaBadge = ({ empresa, className }: { empresa: Empresa; className?: string }) => {
  const isCoop = empresa === "coop";
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ring-1",
      isCoop ? "bg-success/15 text-success ring-success/20" : "bg-channel-instagram/15 text-channel-instagram ring-channel-instagram/20",
      className,
    )}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {isCoop ? "Cooperativa" : "Flux Farma"}
    </span>
  );
};
