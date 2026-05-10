import { useState } from "react";
import { CalendarCheck, Check, Plus, DollarSign, Clock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const team = [
  { id: 1, nome: "João Pereira", farmacia: "Farmácia São Bento", valor: 150 },
  { id: 2, nome: "Pedro Martins", farmacia: "Drogaria Vida+", valor: 150 },
  { id: 3, nome: "Lucas Tavares", farmacia: "Farma Express Centro", valor: 130 },
  { id: 4, nome: "Rafael Kowalski", farmacia: "Pharma Zona Sul", valor: 160 },
];

const historico = [
  { data: "09/05/2026", lancadas: 18, valor: 2740, status: "pago" },
  { data: "08/05/2026", lancadas: 16, valor: 2440, status: "pago" },
  { data: "07/05/2026", lancadas: 19, valor: 2890, status: "pendente" },
];

export default function LiderDiarias() {
  const [sel, setSel] = useState<number[]>([1, 2, 4]);
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [turno, setTurno] = useState("Tarde");

  const total = team.filter(t => sel.includes(t.id)).reduce((a, b) => a + b.valor, 0);
  const toggle = (id: number) => setSel(s => s.includes(id) ? s.filter(i => i !== id) : [...s, id]);

  return (
    <div className="p-8 max-w-7xl">
      <PageHeader
        eyebrow="Operação"
        title="Lançamento de diárias"
        description="Selecione os entregadores em campo no turno e confirme."
        actions={
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-glow flex items-center gap-2">
            <Check className="h-4 w-4" /> Confirmar {sel.length} diárias
          </button>
        }
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="space-y-4">
          {/* Filtros */}
          <div className="rounded-xl border border-border bg-card p-4 grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Data</label>
              <input type="date" value={data} onChange={(e) => setData(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Turno</label>
              <select value={turno} onChange={(e) => setTurno(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm">
                <option>Manhã</option><option>Tarde</option><option>Noite</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Tipo</label>
              <select className="mt-1 w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm">
                <option>Diária padrão</option><option>Hora extra</option><option>Bonificação</option>
              </select>
            </div>
          </div>

          {/* Lista entregadores */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold">Entregadores disponíveis</h3>
              <button onClick={() => setSel(team.map(t => t.id))} className="text-xs text-primary hover:underline">
                Selecionar todos
              </button>
            </div>
            <ul className="divide-y divide-border">
              {team.map((t) => {
                const checked = sel.includes(t.id);
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => toggle(t.id)}
                      className={`w-full flex items-center gap-3 p-3 text-left hover:bg-surface-hover ${checked ? "bg-primary/5" : ""}`}
                    >
                      <div className={`flex h-5 w-5 items-center justify-center rounded border ${checked ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                        {checked && <Check className="h-3 w-3" />}
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-channel-instagram text-[10px] font-semibold text-primary-foreground">
                        {t.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-medium">{t.nome}</div>
                        <div className="text-[10px] text-muted-foreground">{t.farmacia}</div>
                      </div>
                      <span className="font-mono text-xs text-success">R$ {t.valor},00</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Histórico */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold">Histórico recente</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr><th className="text-left p-3">Data</th><th className="text-left p-3">Lançadas</th><th className="text-left p-3">Valor total</th><th className="text-left p-3">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {historico.map((h) => (
                  <tr key={h.data} className="hover:bg-surface-hover">
                    <td className="p-3">{h.data}</td>
                    <td className="p-3">{h.lancadas}</td>
                    <td className="p-3 font-mono">R$ {h.valor.toLocaleString("pt-BR")},00</td>
                    <td className="p-3">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] ${h.status === "pago" ? "border-success/40 text-success bg-success/10" : "border-warning/40 text-warning bg-warning/10"}`}>
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumo */}
        <aside className="space-y-3 lg:sticky lg:top-4 self-start">
          <div className="rounded-xl border border-border bg-card p-4">
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <CalendarCheck className="h-3 w-3" /> Resumo do lançamento
            </h4>
            <Row label="Data" value={data} />
            <Row label="Turno" value={turno} />
            <Row label="Selecionados" value={`${sel.length} entregadores`} />
            <div className="mt-3 border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" /> Total</span>
                <span className="text-lg font-semibold text-success">R$ {total},00</span>
              </div>
            </div>
            <button className="mt-4 w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary-glow">
              Confirmar lançamento
            </button>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 mb-1 text-primary" />
            Diárias confirmadas até as <b className="text-foreground">23h</b> entram no fechamento do dia.
          </div>
        </aside>
      </div>
    </div>
  );
}

const Row = ({ label, value }: any) => (
  <div className="flex items-center justify-between py-1 text-xs">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);
