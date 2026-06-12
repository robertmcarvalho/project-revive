import { cn } from "@/lib/utils";
import { fmtBRL } from "@/lib/baixas";

export const SaldoCell = ({ valor, valorPago, status }: { valor: number; valorPago: number; status: string }) => {
  const pct = valor > 0 ? Math.min(100, (valorPago / valor) * 100) : 0;
  const cor =
    status === "paga" || status === "recebida" ? "bg-success" :
    status === "vencida" ? "bg-destructive" :
    status === "parcial" ? "bg-warning" : "bg-primary";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-background/60">
        <div className={cn("h-full", cor)} style={{ width: `${pct}%` }} />
      </div>
      <div className="font-mono text-[10px] text-muted-foreground tabular-nums w-20 text-right">
        {fmtBRL(valor - valorPago)}
      </div>
    </div>
  );
};
