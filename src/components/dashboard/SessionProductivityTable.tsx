import { Spark } from "@/components/operacao/Spark";
import { listSessoes, findAtendente, fmtDuration, fmtDateTime } from "@/lib/equipeApi";

export const SessionProductivityTable = () => {
  const rows = listSessoes();
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div>
        <h3 className="text-sm font-semibold tracking-tight">Produtividade por sessão</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">Sessões encerradas · últimos 7 dias</p>
      </div>

      <div className="mt-5">
        <div className="grid grid-cols-12 gap-3 border-b border-border px-3 pb-2 text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">
          <div className="col-span-3">Atendente</div>
          <div className="col-span-2">Início</div>
          <div className="col-span-1 text-right">Logado</div>
          <div className="col-span-1 text-right">Pausa</div>
          <div className="col-span-1 text-right">Atend.</div>
          <div className="col-span-1 text-right">Conv.</div>
          <div className="col-span-1 text-right">CSAT</div>
          <div className="col-span-1 text-right">1ª resp.</div>
          <div className="col-span-1 text-right">Ritmo</div>
        </div>
        {rows.map((s) => {
          const a = findAtendente(s.atendenteId);
          return (
            <div key={s.id} className="grid grid-cols-12 items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-surface-hover transition-colors">
              <div className="col-span-3 flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/40 to-channel-instagram/40 text-[10px] font-semibold">
                  {a?.iniciais ?? "?"}
                </div>
                <span className="truncate font-medium">{a?.nome ?? s.atendenteId}</span>
              </div>
              <div className="col-span-2 font-mono text-[11px] text-muted-foreground">{fmtDateTime(s.inicio)}</div>
              <div className="col-span-1 text-right font-mono text-xs">{fmtDuration(s.logadoSeg)}</div>
              <div className="col-span-1 text-right font-mono text-xs text-warning">{fmtDuration(s.pausaSeg)}</div>
              <div className="col-span-1 text-right font-mono text-xs text-success">{fmtDuration(s.atendimentoSeg)}</div>
              <div className="col-span-1 text-right font-mono text-sm">{s.conversas}</div>
              <div className="col-span-1 text-right font-mono text-sm">{s.csat}<span className="text-subtle-foreground text-[10px]">/5</span></div>
              <div className="col-span-1 text-right font-mono text-xs">{s.primeiraRespostaSeg}s</div>
              <div className="col-span-1 flex justify-end"><Spark data={s.atendimentosPorHora} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SessionProductivityTable;
