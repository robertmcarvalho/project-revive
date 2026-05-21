import { ReactNode } from "react";
import { Sparkles } from "lucide-react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Mostra o chip pulsante "ONLINE" antes das ações. */
  live?: boolean;
  /** Ícone do badge à esquerda. Padrão: Sparkles. */
  icon?: React.ComponentType<{ className?: string }>;
}

export const PageHeader = ({
  eyebrow,
  title,
  description,
  actions,
  live = false,
  icon: Icon = Sparkles,
}: PageHeaderProps) => (
  <header className="relative mb-6 overflow-hidden rounded-xl border border-border bg-card">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_circle_at_20%_0%,hsl(190_90%_55%/.12),transparent_60%),radial-gradient(600px_circle_at_80%_100%,hsl(175_80%_45%/.08),transparent_60%)]" />
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    <div className="relative flex flex-wrap items-center justify-between gap-4 px-6 py-5">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-gradient-to-br from-primary/20 to-primary-glow/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <h1 className="truncate text-2xl font-semibold tracking-tightest">{title}</h1>
            <span className="hidden font-mono text-[10px] uppercase tracking-widest text-primary md:inline">
              {eyebrow}
            </span>
          </div>
          {description && (
            <p className="mt-1 max-w-2xl text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {live && (
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="text-muted-foreground">Tempo real</span>
            <span className="font-mono">ONLINE</span>
          </div>
        )}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  </header>
);
