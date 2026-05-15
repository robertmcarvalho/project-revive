import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  blocosMeta,
  categoriasMeta,
  type BlocoCategoria,
  type BlocoTipo,
} from "@/lib/fluxo";

interface Props {
  onAdd: (tipo: BlocoTipo) => void;
  label?: string;
  size?: "sm" | "md";
}

export const PaletaBlocos = ({ onAdd, label = "Adicionar bloco", size = "md" }: Props) => {
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState<BlocoCategoria>("identidade");

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          "flex items-center gap-1.5 rounded-md border border-dashed border-border bg-background/40 font-medium text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors",
          size === "sm" ? "px-2 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
        )}
      >
        <Plus className="h-3.5 w-3.5" /> {label}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-50 mt-1 w-72 rounded-lg border border-border bg-surface shadow-elevated">
            <div className="flex flex-wrap gap-1 border-b border-border p-2">
              {categoriasMeta.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  className={cn(
                    "rounded px-2 py-0.5 text-[10px] font-medium transition-colors",
                    cat === c.id
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-surface-hover"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="max-h-72 overflow-y-auto p-1">
              {blocosMeta
                .filter(b => b.categoria === cat)
                .map(b => (
                  <button
                    key={b.tipo}
                    onClick={() => {
                      onAdd(b.tipo);
                      setOpen(false);
                    }}
                    className="block w-full rounded px-2 py-1.5 text-left text-xs hover:bg-surface-hover"
                  >
                    {b.label}
                  </button>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
