import { useMemo, useState } from "react";
import { LogOut, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/StatusDot";
import { filterAtendentes, fmtRelative } from "@/lib/equipeApi";
import type { PresenceStatus } from "@/data/equipeMock";

const statusLabel: Record<PresenceStatus, string> = {
  online: "Online", idle: "Ausente", busy: "Ocupado", offline: "Offline",
};

export const AtendentesStatusTable = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PresenceStatus | "all">("all");
  const [papel, setPapel] = useState<"all" | "Admin" | "Líder" | "Operador">("all");

  const rows = useMemo(() => filterAtendentes({ search, status, papel }), [search, status, papel]);

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Status atual dos atendentes</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Presença em tempo real · {rows.length} resultado(s)</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar nome…" className="h-8 w-48 pl-8 text-xs" />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as any)}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="idle">Ausente</SelectItem>
              <SelectItem value="busy">Ocupado</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
          <Select value={papel} onValueChange={(v) => setPapel(v as any)}>
            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Papel" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os papéis</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Líder">Líder</SelectItem>
              <SelectItem value="Operador">Operador</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-5">
        <div className="grid grid-cols-12 gap-3 border-b border-border px-3 pb-2 text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">
          <div className="col-span-4">Atendente</div>
          <div className="col-span-2">Papel</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Chats</div>
          <div className="col-span-2 text-right">Último ping</div>
          <div className="col-span-1 text-right">Ação</div>
        </div>
        {rows.map((a) => (
          <div key={a.id} className="grid grid-cols-12 items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-surface-hover transition-colors">
            <div className="col-span-4 flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/40 to-channel-instagram/40 text-[10px] font-semibold">
                  {a.iniciais}
                </div>
                <StatusDot status={a.status} pulse={a.status === "online"} className="absolute -bottom-0.5 -right-0.5" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-medium">{a.nome}</div>
                <div className="truncate font-mono text-[10px] text-subtle-foreground">há {fmtRelative(a.desde).replace("há ", "")} neste status</div>
              </div>
            </div>
            <div className="col-span-2 text-xs text-muted-foreground">{a.papel}</div>
            <div className="col-span-2 flex items-center gap-1.5">
              <StatusDot status={a.status} />
              <span className="text-xs">{statusLabel[a.status]}</span>
            </div>
            <div className="col-span-1 text-right font-mono text-sm">{a.chatsAtivos}</div>
            <div className="col-span-2 text-right font-mono text-[11px] text-muted-foreground">{fmtRelative(a.ultimoHeartbeat)}</div>
            <div className="col-span-1 flex justify-end">
              {a.status !== "offline" && (
                <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]">
                  <LogOut className="mr-1 h-3 w-3" /> Encerrar
                </Button>
              )}
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">Nenhum atendente encontrado.</div>
        )}
      </div>
    </div>
  );
};

export default AtendentesStatusTable;
