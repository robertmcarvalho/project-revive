import { Link } from "react-router-dom";
import { useWorkspace } from "@/lib/workspace";
import { Logo } from "./Logo";

export const WorkspaceCard = () => {
  const ws = useWorkspace();
  const proximoLimite = ws.agentesUsados / ws.agentesLimite >= 0.85;

  return (
    <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/20">
        {ws.inicial}
      </div>
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-sm font-semibold tracking-tight text-foreground">{ws.nome}</span>
        {proximoLimite ? (
          <Link
            to="/configuracoes"
            className="truncate font-mono text-[10px] text-primary hover:underline"
          >
            Plano {ws.plano} · {ws.agentesUsados}/{ws.agentesLimite} agentes →
          </Link>
        ) : (
          <span className="truncate font-mono text-[10px] text-muted-foreground">Plano {ws.plano}</span>
        )}
      </div>
      <Logo size={16} />
    </div>
  );
};
