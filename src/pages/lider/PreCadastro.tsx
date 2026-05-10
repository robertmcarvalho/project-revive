import { UserPlus, Upload, CheckCircle2, Clock, XCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const pendentes = [
  { nome: "Maria Lima", doc: "123.456.789-00", enviado: "Hoje", status: "analise" },
  { nome: "Carlos Eduardo", doc: "987.654.321-00", enviado: "2 dias", status: "aprovado" },
  { nome: "Bruno Alves", doc: "456.123.789-00", enviado: "5 dias", status: "rejeitado" },
];

const statusMap: any = {
  analise: { label: "Em análise", icon: Clock, cls: "border-warning/40 text-warning bg-warning/10" },
  aprovado: { label: "Aprovado", icon: CheckCircle2, cls: "border-success/40 text-success bg-success/10" },
  rejeitado: { label: "Rejeitado", icon: XCircle, cls: "border-destructive/40 text-destructive bg-destructive/10" },
};

export default function LiderPreCadastro() {
  return (
    <div className="p-8 max-w-7xl">
      <PageHeader
        eyebrow="Cadastros"
        title="Pré-cadastro de entregador"
        description="Inicie o processo. O RH receberá para validação dos documentos."
      />

      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Novo cadastro</h3>
          </div>

          <Section title="Dados pessoais">
            <div className="grid sm:grid-cols-2 gap-3">
              <Input label="Nome completo" placeholder="Nome do entregador" />
              <Input label="CPF" placeholder="000.000.000-00" />
              <Input label="RG" placeholder="00.000.000-0" />
              <Input label="Data de nascimento" type="date" />
              <Input label="Telefone" placeholder="(11) 90000-0000" />
              <Input label="E-mail" type="email" placeholder="entregador@exemplo.com" />
            </div>
          </Section>

          <Section title="Endereço">
            <div className="grid sm:grid-cols-3 gap-3">
              <Input label="CEP" placeholder="00000-000" />
              <div className="sm:col-span-2"><Input label="Rua" placeholder="Logradouro" /></div>
              <Input label="Número" />
              <Input label="Bairro" />
              <Input label="Cidade" />
            </div>
          </Section>

          <Section title="Veículo">
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Tipo</label>
                <select className="mt-1 w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm">
                  <option>Moto</option><option>Carro</option><option>Bike</option><option>Bike elétrica</option>
                </select>
              </div>
              <Input label="Modelo" placeholder="Ex.: Honda CG 160" />
              <Input label="Placa" placeholder="ABC-1D23" />
              <Input label="CNH" placeholder="00000000000" />
              <Input label="Validade CNH" type="date" />
              <div>
                <label className="text-xs text-muted-foreground">Categoria</label>
                <select className="mt-1 w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm">
                  <option>A</option><option>B</option><option>AB</option>
                </select>
              </div>
            </div>
          </Section>

          <Section title="Vínculo">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Farmácia</label>
                <select className="mt-1 w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm">
                  <option>Farmácia São Bento</option><option>Drogaria Vida+</option><option>Farma Express Centro</option><option>Pharma Zona Sul</option>
                </select>
              </div>
              <Input label="Início previsto" type="date" />
            </div>
          </Section>

          <Section title="Documentos">
            <div className="grid sm:grid-cols-3 gap-3">
              {["RG / CPF", "CNH", "Comprovante residência"].map(d => (
                <div key={d} className="rounded-lg border-2 border-dashed border-border bg-background/40 p-4 text-center">
                  <Upload className="h-4 w-4 mx-auto text-muted-foreground" />
                  <div className="mt-2 text-xs">{d}</div>
                  <div className="text-[10px] text-muted-foreground">PDF, JPG até 5MB</div>
                </div>
              ))}
            </div>
          </Section>

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <button className="rounded-md border border-border px-4 py-2 text-sm hover:bg-surface-hover">Salvar rascunho</button>
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-glow">
              Enviar para RH
            </button>
          </div>
        </div>

        <aside className="rounded-xl border border-border bg-card overflow-hidden self-start">
          <div className="border-b border-border px-4 py-3">
            <h4 className="text-sm font-semibold">Em andamento</h4>
            <p className="text-[11px] text-muted-foreground">Cadastros que você iniciou</p>
          </div>
          <ul className="divide-y divide-border">
            {pendentes.map((p, i) => {
              const s = statusMap[p.status];
              return (
                <li key={i} className="p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium">{p.nome}</div>
                      <div className="text-[11px] text-muted-foreground">CPF {p.doc}</div>
                    </div>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] inline-flex items-center gap-1 ${s.cls}`}>
                      <s.icon className="h-3 w-3" /> {s.label}
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] text-subtle-foreground">Enviado: {p.enviado}</div>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
}

const Section = ({ title, children }: any) => (
  <div>
    <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">{title}</h4>
    {children}
  </div>
);

const Input = ({ label, type = "text", placeholder }: any) => (
  <div>
    <label className="text-xs text-muted-foreground">{label}</label>
    <input type={type} placeholder={placeholder}
      className="mt-1 w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm focus:outline-none focus:border-primary/50" />
  </div>
);
