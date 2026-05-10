import { useState } from "react";
import { Building2, MapPin, Phone, Mail, Clock, Search, ChevronRight, User } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const farmacias = [
  { id: 1, nome: "Farmácia São Bento", endereco: "Rua das Flores, 123 — Zona Sul", tel: "(11) 4002-8922", email: "contato@saobento.com", responsavel: "Ana Lima", status: "ativa", entregadores: 4, abertura: "07:00 — 22:00" },
  { id: 2, nome: "Drogaria Vida+", endereco: "Av. Paulista, 900 — Zona Sul", tel: "(11) 4002-1010", email: "ger@vidamais.com", responsavel: "Carlos Souza", status: "ativa", entregadores: 3, abertura: "08:00 — 23:00" },
  { id: 3, nome: "Farma Express Centro", endereco: "R. XV de Novembro, 45", tel: "(11) 4002-3030", email: "centro@farma.com", responsavel: "Beatriz Mota", status: "ativa", entregadores: 5, abertura: "24h" },
  { id: 4, nome: "Pharma Zona Sul", endereco: "Av. Ibirapuera, 2000", tel: "(11) 4002-7070", email: "sul@pharma.com", responsavel: "Diego Reis", status: "alerta", entregadores: 6, abertura: "07:00 — 21:00" },
];

export default function LiderFarmacias() {
  const [sel, setSel] = useState(farmacias[0]);
  const [q, setQ] = useState("");
  const list = farmacias.filter(f => f.nome.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="p-8 max-w-7xl">
      <PageHeader
        eyebrow="Cadastros"
        title="Minhas farmácias"
        description="Farmácias vinculadas à sua zona. Abra a ficha para ver os dados completos."
      />

      <div className="grid lg:grid-cols-[360px_1fr] gap-4">
        {/* Lista */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar farmácia..."
                className="w-full rounded-md border border-border bg-background/40 pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
          <ul className="divide-y divide-border">
            {list.map((f) => (
              <li key={f.id}>
                <button
                  onClick={() => setSel(f)}
                  className={`w-full flex items-center gap-3 p-3 text-left hover:bg-surface-hover transition-colors ${sel.id === f.id ? "bg-surface-hover" : ""}`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium truncate">{f.nome}</span>
                      <span className={`h-1.5 w-1.5 rounded-full ${f.status === "ativa" ? "bg-success" : "bg-warning"}`} />
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">{f.endereco}</div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Ficha */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-channel-instagram text-primary-foreground">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{sel.nome}</h2>
                <span className="text-xs text-muted-foreground">ID #{sel.id} · {sel.entregadores} entregadores ativos</span>
              </div>
            </div>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] ${sel.status === "ativa" ? "border-success/40 text-success bg-success/10" : "border-warning/40 text-warning bg-warning/10"}`}>
              {sel.status === "ativa" ? "Operando" : "Atenção"}
            </span>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <Field icon={MapPin} label="Endereço" value={sel.endereco} />
            <Field icon={Phone} label="Telefone" value={sel.tel} />
            <Field icon={Mail} label="E-mail" value={sel.email} />
            <Field icon={User} label="Responsável" value={sel.responsavel} />
            <Field icon={Clock} label="Funcionamento" value={sel.abertura} />
            <Field icon={Building2} label="CNPJ" value="12.345.678/0001-90" />
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Equipe vinculada</h4>
            <div className="flex flex-wrap gap-2">
              {["João P.", "Pedro M.", "Lucas T.", "Rafael K."].slice(0, sel.entregadores).map((n) => (
                <div key={n} className="flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-1">
                  <div className="h-5 w-5 rounded-full bg-gradient-to-br from-primary to-channel-instagram text-[10px] flex items-center justify-center text-primary-foreground">
                    {n[0]}
                  </div>
                  <span className="text-xs">{n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Field = ({ icon: Icon, label, value }: any) => (
  <div className="rounded-lg border border-border bg-background/40 p-3">
    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
      <Icon className="h-3 w-3" /> {label}
    </div>
    <div className="mt-1 text-sm">{value}</div>
  </div>
);
