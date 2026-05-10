import { useState } from "react";
import { UserX, AlertTriangle, Send } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const team = ["João Pereira", "Pedro Martins", "Lucas Tavares", "Rafael Kowalski"];

const historico = [
  { data: "08/05/2026", nome: "Lucas Tavares", motivo: "Atestado médico", status: "justificada" },
  { data: "05/05/2026", nome: "João Pereira", motivo: "Não compareceu", status: "injustificada" },
  { data: "01/05/2026", nome: "Pedro Martins", motivo: "Acidente na moto", status: "justificada" },
];

export default function LiderFaltas() {
  const [nome, setNome] = useState(team[0]);
  const [tipo, setTipo] = useState("Injustificada");
  const [motivo, setMotivo] = useState("");

  return (
    <div className="p-8 max-w-7xl">
      <PageHeader
        eyebrow="Operação"
        title="Lançamento de faltas"
        description="Registre ausências da sua equipe e anexe documentos quando houver."
      />

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserX className="h-4 w-4 text-destructive" />
            <h3 className="text-sm font-semibold">Nova falta</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">Entregador</label>
              <select value={nome} onChange={(e) => setNome(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm">
                {team.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Data</label>
                <input type="date" defaultValue={new Date().toISOString().slice(0, 10)}
                  className="mt-1 w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Turno</label>
                <select className="mt-1 w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm">
                  <option>Dia inteiro</option><option>Manhã</option><option>Tarde</option><option>Noite</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Classificação</label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {["Justificada", "Injustificada", "Atestado"].map(t => (
                  <button key={t} onClick={() => setTipo(t)}
                    className={`rounded-md border px-3 py-2 text-xs font-medium transition-colors ${tipo === t ? "border-primary bg-primary/10 text-primary" : "border-border bg-background/40 text-muted-foreground hover:bg-surface-hover"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Motivo / observações</label>
              <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={4}
                placeholder="Descreva o ocorrido..."
                className="mt-1 w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Anexar comprovante (opcional)</label>
              <div className="mt-1 rounded-lg border-2 border-dashed border-border bg-background/40 p-6 text-center text-xs text-muted-foreground">
                Arraste um arquivo aqui ou <span className="text-primary cursor-pointer">selecione</span>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              Faltas injustificadas geram notificação automática ao RH.
            </div>

            <button className="w-full rounded-lg bg-destructive py-2.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 flex items-center justify-center gap-2">
              <Send className="h-4 w-4" /> Registrar falta
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold">Faltas recentes</h3>
            <p className="text-[11px] text-muted-foreground">Últimos 30 dias</p>
          </div>
          <ul className="divide-y divide-border">
            {historico.map((h, i) => (
              <li key={i} className="p-4 hover:bg-surface-hover">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium">{h.nome}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{h.motivo}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-muted-foreground">{h.data}</div>
                    <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] ${h.status === "justificada" ? "border-success/40 text-success bg-success/10" : "border-destructive/40 text-destructive bg-destructive/10"}`}>
                      {h.status}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
