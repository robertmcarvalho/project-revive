import type { QuotaSchedule } from "@/data/financeiroMock";

export interface ProxVencimento { quotaId: string; entregadorId: string; valor: number; data: string }

// Calcula a Nésima ocorrência de um dia da semana em um mês (1-based)
export function dataOcorrencia(year: number, month0: number, weekday: number, n: number): Date | null {
  const d = new Date(year, month0, 1);
  let count = 0;
  while (d.getMonth() === month0) {
    if (d.getDay() === weekday) { count++; if (count === n) return new Date(d); }
    d.setDate(d.getDate() + 1);
  }
  return null;
}

export function proximosVencimentos(quotas: QuotaSchedule[], mesesAdiante = 3): ProxVencimento[] {
  const now = new Date();
  const out: ProxVencimento[] = [];
  for (let m = 0; m < mesesAdiante; m++) {
    const ref = new Date(now.getFullYear(), now.getMonth() + m, 1);
    quotas.filter((q) => q.ativa).forEach((q) => {
      const d = dataOcorrencia(ref.getFullYear(), ref.getMonth(), q.diaSemana, q.ocorrenciaNoMes);
      if (!d) return;
      if (d < now && m === 0) return;
      out.push({ quotaId: q.id, entregadorId: q.entregadorId, valor: q.valor, data: d.toISOString().slice(0, 10) });
    });
  }
  return out.sort((a, b) => a.data.localeCompare(b.data));
}

export const diaSemanaLabel = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const ocorrenciaLabel = ["", "1ª", "2ª", "3ª", "4ª", "5ª"];
