import { useMemo, useState } from "react";
import { Download, Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { atendentes, type LoginEventType } from "@/data/equipeMock";
import { exportEventosCsv, filterEventos, findAtendente, fmtDateTime, fmtDuration } from "@/lib/equipeApi";
import { cn } from "@/lib/utils";

const tipoLabel: Record<LoginEventType, { label: string; cls: string }> = {
  login:   { label: "Login",   cls: "bg-success/15 text-success" },
  logout:  { label: "Logout",  cls: "bg-muted text-muted-foreground" },
  timeout: { label: "Timeout", cls: "bg-warning/15 text-warning" },
  forced:  { label: "Forçado", cls: "bg-destructive/15 text-destructive" },
};

export const LoginHistoryTable = () => {
  const [periodo, setPeriodo] = useState("24");
  const [atendenteId, setAtendenteId] = useState<string>("all");
  const [tipo, setTipo] = useState<LoginEventType | "all">("all");

  const rows = useMemo(
    () => filterEventos({ atendenteId, tipo, periodoHoras: Number(periodo) }),
    [periodo, atendenteId, tipo],
  );

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Histórico de login/logout</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{rows.length} evento(s) no período</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24">Hoje</SelectItem>
              <SelectItem value="168">7 dias</SelectItem>
              <SelectItem value="720">30 dias</SelectItem>
            </SelectContent>
          </Select>
          <Select value={atendenteId} onValueChange={setAtendenteId}>
            <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os atendentes</SelectItem>
              {atendentes.map((a) => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={tipo} onValueChange={(v) => setTipo(v as any)}>
            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
              <SelectItem value="timeout">Timeout</SelectItem>
              <SelectItem value="forced">Forçado</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => exportEventosCsv(rows)}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Exportar CSV
          </Button>
        </div>
      </div>

      <div className="mt-5">
        <div className="grid grid-cols-12 gap-3 border-b border-border px-3 pb-2 text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">
          <div className="col-span-3">Atendente</div>
          <div className="col-span-1">Evento</div>
          <div className="col-span-2">Data‑hora</div>
          <div className="col-span-2">Duração</div>
          <div className="col-span-2">Dispositivo</div>
          <div className="col-span-1">IP</div>
          <div className="col-span-1 text-right">Local</div>
        </div>
        {rows.map((e) => {
          const a = findAtendente(e.atendenteId);
          const t = tipoLabel[e.tipo];
          const DeviceIcon = e.device === "mobile" ? Smartphone : Monitor;
          return (
            <div key={e.id} className="grid grid-cols-12 items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-surface-hover transition-colors">
              <div className="col-span-3 flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/40 to-channel-instagram/40 text-[10px] font-semibold">
                  {a?.iniciais ?? "?"}
                </div>
                <span className="truncate font-medium">{a?.nome ?? e.atendenteId}</span>
              </div>
              <div className="col-span-1">
                <span className={cn("rounded px-1.5 py-0.5 font-mono text-[10px]", t.cls)}>{t.label}</span>
              </div>
              <div className="col-span-2 font-mono text-[11px] text-muted-foreground">{fmtDateTime(e.quando)}</div>
              <div className="col-span-2 font-mono text-[11px]">{e.duracaoSeg ? fmtDuration(e.duracaoSeg) : "—"}</div>
              <div className="col-span-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <DeviceIcon className="h-3.5 w-3.5" /> <span className="truncate">{e.navegador}</span>
              </div>
              <div className="col-span-1 font-mono text-[11px] text-muted-foreground">{e.ip}</div>
              <div className="col-span-1 truncate text-right text-[11px] text-muted-foreground">{e.local}</div>
            </div>
          );
        })}
        {rows.length === 0 && (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">Nenhum evento no período.</div>
        )}
      </div>
    </div>
  );
};

export default LoginHistoryTable;
