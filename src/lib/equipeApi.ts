import {
  atendentes,
  eventosLogin,
  sessoes,
  type Atendente,
  type LoginEvento,
  type PresenceStatus,
  type SessaoProdutividade,
} from "@/data/equipeMock";

export const listAtendentes = () => atendentes;
export const listSessoes = () => sessoes;
export const listEventosLogin = () => eventosLogin;

export const countByStatus = (lista = atendentes) =>
  lista.reduce(
    (acc, a) => ({ ...acc, [a.status]: (acc[a.status] ?? 0) + 1 }),
    { online: 0, idle: 0, busy: 0, offline: 0 } as Record<PresenceStatus, number>,
  );

export const avgLoggedSeconds = (lista = sessoes) =>
  Math.round(lista.reduce((s, x) => s + x.logadoSeg, 0) / (lista.length || 1));

export const filterAtendentes = (
  q: { search?: string; status?: PresenceStatus | "all"; papel?: Atendente["papel"] | "all" },
) =>
  atendentes.filter((a) => {
    if (q.search && !a.nome.toLowerCase().includes(q.search.toLowerCase())) return false;
    if (q.status && q.status !== "all" && a.status !== q.status) return false;
    if (q.papel && q.papel !== "all" && a.papel !== q.papel) return false;
    return true;
  });

export const filterEventos = (
  q: { atendenteId?: string | "all"; tipo?: LoginEvento["tipo"] | "all"; periodoHoras?: number },
) => {
  const cutoff = q.periodoHoras ? Date.now() - q.periodoHoras * 3600_000 : 0;
  return eventosLogin
    .filter((e) => {
      if (q.atendenteId && q.atendenteId !== "all" && e.atendenteId !== q.atendenteId) return false;
      if (q.tipo && q.tipo !== "all" && e.tipo !== q.tipo) return false;
      if (cutoff && new Date(e.quando).getTime() < cutoff) return false;
      return true;
    })
    .sort((a, b) => new Date(b.quando).getTime() - new Date(a.quando).getTime());
};

export const fmtDuration = (sec: number) => {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm ? `${h}h ${rm}m` : `${h}h`;
};

export const fmtRelative = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "agora";
  if (diff < 3600) return `há ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
  return `há ${Math.floor(diff / 86400)}d`;
};

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export const findAtendente = (id: string) => atendentes.find((a) => a.id === id);

export const exportEventosCsv = (rows: LoginEvento[]) => {
  const header = ["Atendente", "Evento", "DataHora", "DuracaoSeg", "Device", "Navegador", "IP", "Local"];
  const lines = rows.map((e) => {
    const a = findAtendente(e.atendenteId);
    return [
      a?.nome ?? e.atendenteId,
      e.tipo,
      e.quando,
      e.duracaoSeg ?? "",
      e.device,
      e.navegador,
      e.ip,
      e.local,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",");
  });
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `historico-login-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
