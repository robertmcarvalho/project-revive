import { useState } from "react";
import { Truck, Phone, Mail, MapPin, Search, ChevronRight, Star, Bike, Shield } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const entregadores = [
  { id: 1, nome: "João Pereira", tel: "(11) 99876-0001", email: "joao@a.com", veiculo: "Moto Honda CG", placa: "BRA-2E19", farmacia: "Farmácia São Bento", cnh: "Vencida em 30 dias", status: "ativo", rating: 4.8, entregas: 1240 },
  { id: 2, nome: "Pedro Martins", tel: "(11) 99876-0002", email: "pedro@a.com", veiculo: "Moto Yamaha Factor", placa: "BRA-3K22", farmacia: "Drogaria Vida+", cnh: "Válida", status: "ativo", rating: 4.9, entregas: 980 },
  { id: 3, nome: "Lucas Tavares", tel: "(11) 99876-0003", email: "lucas@a.com", veiculo: "Bike elétrica", placa: "—", farmacia: "Farma Express Centro", cnh: "N/A", status: "folga", rating: 4.6, entregas: 420 },
  { id: 4, nome: "Rafael Kowalski", tel: "(11) 99876-0004", email: "rafael@a.com", veiculo: "Moto Honda Biz", placa: "BRA-9P88", farmacia: "Pharma Zona Sul", cnh: "Válida", status: "ativo", rating: 4.7, entregas: 1560 },
];

export default function LiderEntregadores() {
  const [sel, setSel] = useState(entregadores[0]);
  const [q, setQ] = useState("");
  const list = entregadores.filter(e => e.nome.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="p-8 max-w-7xl">
      <PageHeader
        eyebrow="Cadastros"
        title="Meus entregadores"
        description="Equipe vinculada à sua liderança."
      />

      <div className="grid lg:grid-cols-[360px_1fr] gap-4">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar entregador..."
                className="w-full rounded-md border border-border bg-background/40 pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
          <ul className="divide-y divide-border">
            {list.map((e) => (
              <li key={e.id}>
                <button
                  onClick={() => setSel(e)}
                  className={`w-full flex items-center gap-3 p-3 text-left hover:bg-surface-hover ${sel.id === e.id ? "bg-surface-hover" : ""}`}
                >
                  <div className="relative">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-channel-instagram text-xs font-semibold text-primary-foreground">
                      {e.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${e.status === "ativo" ? "bg-success" : "bg-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{e.nome}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{e.farmacia}</div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-channel-instagram text-base font-semibold text-primary-foreground">
                {sel.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{sel.nome}</h2>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1"><Star className="h-3 w-3 text-warning fill-warning" /> {sel.rating}</span>
                  <span>{sel.entregas} entregas</span>
                  <span>· {sel.farmacia}</span>
                </div>
              </div>
            </div>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] ${sel.status === "ativo" ? "border-success/40 text-success bg-success/10" : "border-muted text-muted-foreground bg-muted/30"}`}>
              {sel.status}
            </span>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <Field icon={Phone} label="Telefone" value={sel.tel} />
            <Field icon={Mail} label="E-mail" value={sel.email} />
            <Field icon={Bike} label="Veículo" value={sel.veiculo} />
            <Field icon={MapPin} label="Placa" value={sel.placa} />
            <Field icon={Shield} label="CNH" value={sel.cnh} />
            <Field icon={Truck} label="Vínculo" value={sel.farmacia} />
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Documentos</h4>
            <div className="grid sm:grid-cols-3 gap-2">
              {["RG / CPF", "CNH", "Comprovante residência"].map((d) => (
                <div key={d} className="rounded-lg border border-border bg-background/40 p-3 text-xs flex items-center justify-between">
                  <span>{d}</span>
                  <span className="text-success text-[10px]">✓ enviado</span>
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
