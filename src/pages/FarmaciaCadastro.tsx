import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Building2, FileText, MapPin, Phone, Mail, User, Users,
  Crown, Headphones, Plus, X, Save, Search, Truck, Calendar,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const LIDERES = ["Marina Souza", "Lucas Andrade", "Carla Mendes", "Rafael Pinto", "Beatriz Lima"];
const ATENDENTES = ["Ana Costa", "Bruno Lima", "Camila Reis", "Diego Alves", "Elis Mota", "Felipe Tavares"];
const SETORES = ["Atendimento Geral", "Financeiro", "Operacional", "Suporte Técnico"] as const;
const PERFIS_CONTATO = ["Expedição", "Financeiro", "Gestor"] as const;

const ENTREGADORES_VINC = [
  { nome: "João Silva", iniciais: "JS", escala: "Seg–Sex · 08–18", status: "Disponível" },
  { nome: "Pedro Henrique", iniciais: "PH", escala: "Seg–Sáb · 12–22", status: "Em rota" },
  { nome: "Felipe Moreira", iniciais: "FM", escala: "Ter–Sáb · 09–19", status: "Folga" },
];

const Field = ({ icon: Icon, label, children, required }: any) => (
  <div className="space-y-1.5">
    <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      {Icon && <Icon className="h-3 w-3" />} {label}{required && <span className="text-destructive">*</span>}
    </Label>
    {children}
  </div>
);

const Section = ({ title, desc, children, action }: any) => (
  <section className="rounded-xl border border-border bg-surface p-5">
    <div className="mb-4 flex items-end justify-between border-b border-border pb-3">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        {desc && <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>}
      </div>
      {action}
    </div>
    <div className="space-y-4">{children}</div>
  </section>
);

const FarmaciaCadastro = () => {
  const nav = useNavigate();
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState({ logradouro: "", numero: "", bairro: "", complemento: "", cidade: "", uf: "" });
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [status, setStatus] = useState(true);
  const [contatos, setContatos] = useState<{ perfil: string; nome: string; telefone: string; email: string }[]>([
    { perfil: "Gestor", nome: "", telefone: "", email: "" },
  ]);
  const [opSetor, setOpSetor] = useState<Record<string, string>>(
    Object.fromEntries(SETORES.map(s => [s, ""]))
  );

  const buscarCep = async () => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    setBuscandoCep(true);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const d = await r.json();
      if (!d.erro) {
        setEndereco({
          logradouro: d.logradouro || "",
          numero: "",
          bairro: d.bairro || "",
          complemento: d.complemento || "",
          cidade: d.localidade || "",
          uf: d.uf || "",
        });
      }
    } finally { setBuscandoCep(false); }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-8 py-8">
        <Link to="/farmacias" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Voltar para farmácias
        </Link>
        <PageHeader
          eyebrow="Operação · Cadastro"
          title="Nova farmácia"
          description="Cadastre uma unidade parceira e configure atendimento."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => nav(-1)}>Cancelar</Button>
              <Button size="sm" className="gap-1.5"><Save className="h-3.5 w-3.5" /> Salvar farmácia</Button>
            </div>
          }
        />

        <div className="space-y-5">
          <Section title="Dados da empresa">
            <div className="grid gap-4 md:grid-cols-2">
              <Field icon={Building2} label="Nome fantasia" required><Input placeholder="Farmácia Central" /></Field>
              <Field icon={FileText} label="Razão social" required><Input placeholder="Farmácia Central LTDA" /></Field>
              <Field icon={FileText} label="CNPJ" required><Input placeholder="00.000.000/0000-00" /></Field>
              <Field icon={Phone} label="Telefone da farmácia" required><Input placeholder="+55 11 3000-0000" /></Field>
              <Field label="Status">
                <div className="flex h-10 items-center justify-between rounded-md border border-border bg-background px-3">
                  <span className={cn("text-xs font-medium", status ? "text-success" : "text-muted-foreground")}>
                    {status ? "Ativa" : "Inativa"}
                  </span>
                  <Switch checked={status} onCheckedChange={setStatus} />
                </div>
              </Field>
            </div>
          </Section>

          <Section title="Endereço" desc="Insira o CEP para preenchimento automático.">
            <div className="grid gap-4 md:grid-cols-3">
              <Field icon={MapPin} label="CEP" required>
                <div className="flex gap-2">
                  <Input placeholder="00000-000" value={cep} onChange={(e) => setCep(e.target.value)} />
                  <Button type="button" variant="outline" onClick={buscarCep} disabled={buscandoCep} className="gap-1.5">
                    <Search className="h-3.5 w-3.5" /> {buscandoCep ? "..." : "Buscar"}
                  </Button>
                </div>
              </Field>
              <div className="md:col-span-2">
                <Field label="Logradouro" required>
                  <Input value={endereco.logradouro} onChange={(e) => setEndereco({ ...endereco, logradouro: e.target.value })} />
                </Field>
              </div>
              <Field label="Número" required>
                <Input value={endereco.numero} onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })} />
              </Field>
              <Field label="Bairro" required>
                <Input value={endereco.bairro} onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })} />
              </Field>
              <Field label="Complemento">
                <Input value={endereco.complemento} onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })} />
              </Field>
              <Field label="Cidade" required>
                <Input value={endereco.cidade} onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })} />
              </Field>
              <Field label="UF" required>
                <Input value={endereco.uf} onChange={(e) => setEndereco({ ...endereco, uf: e.target.value })} maxLength={2} />
              </Field>
            </div>
          </Section>

          <Section
            title="Contatos por perfil"
            desc="Adicione um responsável por perfil de operação."
            action={
              <Button type="button" variant="outline" size="sm" className="h-7 gap-1"
                onClick={() => setContatos([...contatos, { perfil: "Expedição", nome: "", telefone: "", email: "" }])}>
                <Plus className="h-3 w-3" /> Adicionar contato
              </Button>
            }
          >
            <div className="space-y-2">
              {contatos.map((c, i) => (
                <div key={i} className="grid gap-2 rounded-md border border-border bg-background p-3 md:grid-cols-[140px_1fr_1fr_1fr_auto]">
                  <Select value={c.perfil} onValueChange={(v) => { const n=[...contatos]; n[i].perfil=v; setContatos(n); }}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>{PERFIS_CONTATO.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input className="h-9" placeholder="Nome" value={c.nome}
                    onChange={(e) => { const n=[...contatos]; n[i].nome=e.target.value; setContatos(n); }} />
                  <Input className="h-9" placeholder="Telefone" value={c.telefone}
                    onChange={(e) => { const n=[...contatos]; n[i].telefone=e.target.value; setContatos(n); }} />
                  <Input className="h-9" placeholder="E-mail" value={c.email}
                    onChange={(e) => { const n=[...contatos]; n[i].email=e.target.value; setContatos(n); }} />
                  <button onClick={() => setContatos(contatos.filter((_, x) => x !== i))}
                    className="flex items-center justify-center text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Vínculos & atendimento">
            <div className="grid gap-4 md:grid-cols-2">
              <Field icon={Crown} label="Líder responsável" required>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Selecione o líder" /></SelectTrigger>
                  <SelectContent>{LIDERES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <div />
              <Field icon={Headphones} label="Atendente principal" required>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Selecione o atendente" /></SelectTrigger>
                  <SelectContent>{ATENDENTES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field icon={Headphones} label="Atendente secundário">
                <Select>
                  <SelectTrigger><SelectValue placeholder="Selecione o atendente" /></SelectTrigger>
                  <SelectContent>{ATENDENTES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-subtle-foreground">
                Atendentes opcionais por setor
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {SETORES.map(s => (
                  <div key={s} className="flex items-center gap-3 rounded-md border border-border bg-background p-3">
                    <span className="w-36 text-xs font-medium">{s}</span>
                    <Select value={opSetor[s]} onValueChange={(v) => setOpSetor({ ...opSetor, [s]: v })}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Atendente opcional" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">— Nenhum —</SelectItem>
                        {ATENDENTES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section title="Entregadores vinculados" desc="Visualize a escala de cada entregador da unidade.">
            <div className="overflow-hidden rounded-md border border-border">
              <table className="w-full text-xs">
                <thead className="bg-background">
                  <tr className="text-left text-[10px] uppercase tracking-wider text-subtle-foreground">
                    <th className="px-3 py-2">Entregador</th>
                    <th className="px-3 py-2"><Calendar className="inline h-3 w-3" /> Escala</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ENTREGADORES_VINC.map(e => (
                    <tr key={e.nome} className="border-t border-border/60">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-channel-whatsapp/40 to-primary/40 text-[10px] font-semibold">{e.iniciais}</div>
                          <span className="font-medium">{e.nome}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{e.escala}</td>
                      <td className="px-3 py-2">
                        <span className={cn(
                          "rounded px-2 py-0.5 text-[10px] font-medium",
                          e.status === "Disponível" && "bg-success/15 text-success",
                          e.status === "Em rota" && "bg-warning/15 text-warning",
                          e.status === "Folga" && "bg-muted text-muted-foreground",
                        )}>{e.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button type="button" variant="outline" size="sm" className="gap-1.5">
              <Truck className="h-3.5 w-3.5" /> Vincular entregador existente
            </Button>
          </Section>

          <div className="flex justify-end gap-2 pb-8">
            <Button variant="outline" onClick={() => nav(-1)}>Cancelar</Button>
            <Button className="gap-1.5"><Save className="h-3.5 w-3.5" /> Salvar farmácia</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmaciaCadastro;
