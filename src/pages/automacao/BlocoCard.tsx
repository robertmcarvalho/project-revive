import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Bloco, type BlocoTipo, labelOf } from "@/lib/fluxo";
import { BlocoConfig } from "./BlocoConfig";
import { PaletaBlocos } from "./PaletaBlocos";

interface Props {
  bloco: Bloco;
  depth?: number;
  onConfigChange: (id: string, key: string, value: any) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
  onAddToBranch: (parentId: string, ramo: string, tipo: BlocoTipo) => void;
}

export const BlocoCard = ({
  bloco, depth = 0, onConfigChange, onRemove, onToggle, onAddToBranch,
}: Props) => {
  const collapsed = bloco.collapsed;
  const hasRamos = !!bloco.ramos;

  return (
    <div
      className={cn(
        "rounded-lg border bg-surface",
        depth === 0 ? "border-border" : "border-border/70 bg-background/40"
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          onClick={() => onToggle(bloco.id)}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Expandir/recolher"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        <span className="text-[10px] font-mono text-subtle-foreground">{bloco.tipo}</span>
        <span className="flex-1 text-sm font-medium">{labelOf(bloco.tipo)}</span>
        <button
          onClick={() => onRemove(bloco.id)}
          className="text-muted-foreground hover:text-destructive"
          aria-label="Remover bloco"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {!collapsed && (
        <div className="space-y-3 border-t border-border px-3 py-3">
          <BlocoConfig
            bloco={bloco}
            onChange={(k, v) => onConfigChange(bloco.id, k, v)}
          />

          {hasRamos && (
            <div className="space-y-2 pt-1">
              {Object.entries(bloco.ramos!).map(([ramo, filhos]) => (
                <div key={ramo} className="rounded-md border border-dashed border-border bg-background/30 p-2">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Se <span className="text-foreground">{ramo}</span>
                    </span>
                    <PaletaBlocos
                      size="sm"
                      label="Adicionar"
                      onAdd={tipo => onAddToBranch(bloco.id, ramo, tipo)}
                    />
                  </div>
                  {filhos.length === 0 ? (
                    <div className="px-1 py-2 text-[11px] italic text-subtle-foreground">
                      Nenhum bloco neste ramo.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filhos.map(filho => (
                        <BlocoCard
                          key={filho.id}
                          bloco={filho}
                          depth={depth + 1}
                          onConfigChange={onConfigChange}
                          onRemove={onRemove}
                          onToggle={onToggle}
                          onAddToBranch={onAddToBranch}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
