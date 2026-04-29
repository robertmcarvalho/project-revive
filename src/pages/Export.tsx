import { useState } from "react";
import { Check, Copy, Download, FileCode, Search } from "lucide-react";
import { REDESIGN_FILES } from "@/data/redesignFiles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Export = () => {
  const [active, setActive] = useState(REDESIGN_FILES[0].path);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = REDESIGN_FILES.filter((f) =>
    f.path.toLowerCase().includes(query.toLowerCase())
  );
  const current = REDESIGN_FILES.find((f) => f.path === active) ?? REDESIGN_FILES[0];

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const downloadFile = (path: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = path.split("/").pop() ?? "file.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    REDESIGN_FILES.forEach((f) => {
      const blob = new Blob([f.content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = f.path.replace(/\//g, "__");
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface/40 px-6 backdrop-blur">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Export do Redesign</h1>
          <p className="text-xs text-muted-foreground">
            {REDESIGN_FILES.length} arquivos · copie ou baixe individualmente
          </p>
        </div>
        <Button size="sm" onClick={downloadAll} className="gap-2">
          <Download className="h-3.5 w-3.5" /> Baixar todos
        </Button>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* File list */}
        <aside className="flex w-72 shrink-0 flex-col border-r border-border bg-surface/30">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar arquivos..."
                className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-2 text-xs text-foreground outline-none transition-colors focus:border-primary"
              />
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto p-2">
            {filtered.map((f) => (
              <button
                key={f.path}
                onClick={() => setActive(f.path)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                  active === f.path
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                )}
              >
                <FileCode className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate font-mono">{f.path}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                Nenhum arquivo
              </p>
            )}
          </nav>
        </aside>

        {/* Viewer */}
        <section className="flex flex-1 flex-col overflow-hidden">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-surface/40 px-4">
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-primary" />
              <span className="font-mono text-xs text-foreground">{current.path}</span>
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {current.content.split("\n").length} linhas
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadFile(current.path, current.content)}
                className="h-7 gap-1.5 text-xs"
              >
                <Download className="h-3 w-3" /> Baixar
              </Button>
              <Button
                size="sm"
                onClick={() => copy(current.content, current.path)}
                className="h-7 gap-1.5 text-xs"
              >
                {copied === current.path ? (
                  <>
                    <Check className="h-3 w-3" /> Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" /> Copiar código
                  </>
                )}
              </Button>
            </div>
          </div>
          <pre className="flex-1 overflow-auto bg-background p-4 font-mono text-xs leading-relaxed text-foreground">
            <code>{current.content}</code>
          </pre>
        </section>
      </div>
    </div>
  );
};

export default Export;
