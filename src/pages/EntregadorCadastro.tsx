import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, User, FileText, Phone, Mail, Briefcase, FileCheck, Crown,
  MapPin, KeyRound, Building2, CalendarRange, X, Plus, Save, Truck,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type UF = { id: number; sigla: string; nome: string };
type Cidade = { id: number; nome: string };
const FARMACIAS = [
  "Farmácia Central", "Drogaria São Paulo - Vila Olímpia", "Farmácia Popular Centro",
  "Drogasil Pinheiros", "Pague Menos Setor Bueno", "Farmácia Indiana",
];
const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const Field = ({ icon: Icon, label, children, required }: any) => (
  <div className="space-y-1.5">
    <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      {Icon && <Icon className="h-3 w-3" />} {label}{required && <span className="text-destructive">*</span>}
    </Label>
    {children}
  </div>
);

const Section = ({ title, desc, children }: any) => (
  <section className="rounded-xl border border-border bg-surface p-5">
    <div className="mb-4 border-b border-border pb-3">
      <h2 className="text-sm font-semibold">{title}</h2>
      {desc && <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>}
    </div>
    <div className="space-y-4">{children}</div>
  </section>
);

const EntregadorCadastro = () => {
  const nav = useNavigate();
  const [hasMei, setHasMei] = useState(false);
  const [hasCertDigital, setHasCertDigital] = useState(false);
  const [isLider, setIsLider] = useState(false);
  const [tipo, setTipo] = useState<"fixo" | "diarista">("fixo");

  const [ufs, setUfs] = useState<UF[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [uf, setUf] = useState<string>("");
  const [cidade, setCidade] = useState<string>("");

  const [farmaciasVinc, setFarmaciasVinc] = useState<string[]>([]);
  const [novaFarmacia, setNovaFarmacia] = useState<string>("");

  const [escala, setEscala] = useState<Record<string, { ativo: boolean; ini: string; fim: string }>>(
    Object.fromEntries(DIAS.map(d => [d, { ativo: ["Seg","Ter","Qua","Qui","Sex"].includes(d), ini: "08:00", fim: "18:00" }]))
  );
  const [feriados, setFeriados] = useState<{ data: string; descricao: string; trabalha: boolean }[]>([
    { data: "2026-12-25", descricao: "Natal", trabalha: false },
  ]);
  const [excecoes, setExcecoes] = useState<{ data: string; descricao: string; ini: string; fim: string }[]>([]);

  useEffect(() => {
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then(r => r.json()).then(setUfs).catch(() => setUfs([]));
  }, []);
  useEffect(() => {
    if (!uf) return setCidades([]);
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
      .then(r => r.json()).then(setCidades).catch(() => setCidades([]));
    setCidade("");
  }, [uf]);

  const farmaciasDisponiveis = useMemo(
    () => FARMACIAS.filter(f => !farmaciasVinc.includes(f)),
    [farmaciasVinc]
  );

  const addFarmacia = () => {
    if (novaFarmacia && !farmaciasVinc.includes(novaFarmacia)) {
      setFarmaciasVinc([...farmaciasVinc, novaFarmacia]);
      setNovaFarmacia("");
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-8 py-8">
        <Link to="/entregadores" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Voltar para entregadores
        </Link>
        <PageHeader
          eyebrow="Operação · Cadastro"
          title="Novo entregador"
          description="Preencha as informações para vincular o entregador às farmácias."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => nav(-1)}>Cancelar</Button>
              <Button size="sm" className="gap-1.5"><Save className="h-3.5 w-3.5" /> Salvar entregador</Button>
            </div>
          }
        />

        <div className="space-y-5">
          <Section title="Dados pessoais" desc="Informações básicas do entregador.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field icon={User} label="Nome completo" required><Input placeholder="João da Silva" /></Field>
              <Field icon={FileText} label="CPF" required><Input placeholder="000.000.000-00" /></Field>
              <Field icon={Phone} label="Telefone" required><Input placeholder="+55 11 99000-0000" /></Field>
              <Field icon={Mail} label="E-mail"><Input type="email" placeholder="entregador@email.com" /></Field>
            </div>
          </Section>

          <Section title="Tipo & vínculo">
            <div className="grid gap-4 md:grid-cols-3">
              <Field icon={Truck} label="Tipo de entregador" required>
                <div className="flex gap-1.5 rounded-md border border-border bg-background p-0.5">
                  {(["fixo", "diarista"] as const).map(t => (
                    <button key={t} type="button" onClick={() => setTipo(t)}
                      className={cn(
                        "flex-1 rounded px-2 py-1.5 text-xs font-medium capitalize transition-colors",
                        tipo === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >{t}</button>
                  ))}
                </div>
              </Field>

              <Field icon={Crown} label="É líder?">
                <div className="flex h-10 items-center justify-between rounded-md border border-border bg-background px-3">
                  <span className="text-xs text-muted-foreground">{isLider ? "Sim · acesso ao painel do líder" : "Não"}</span>
                  <Switch checked={isLider} onCheckedChange={setIsLider} />
                </div>
              </Field>

              <Field icon={KeyRound} label="Chave PIX" required>
                <Input placeholder="CPF, e-mail, telefone ou chave aleatória" />
              </Field>
            </div>
          </Section>

          <Section title="Documentação fiscal">
            <div className="grid gap-4 md:grid-cols-2">
              <Field icon={Briefcase} label="Possui MEI?">
                <div className="flex h-10 items-center justify-between rounded-md border border-border bg-background px-3">
                  <span className="text-xs text-muted-foreground">{hasMei ? "Sim" : "Não"}</span>
                  <Switch checked={hasMei} onCheckedChange={setHasMei} />
                </div>
              </Field>
              {hasMei && (
                <Field icon={FileText} label="CNPJ do MEI" required>
                  <Input placeholder="00.000.000/0000-00" />
                </Field>
              )}

              <Field icon={FileCheck} label="Possui certificado digital?">
                <div className="flex h-10 items-center justify-between rounded-md border border-border bg-background px-3">
                  <span className="text-xs text-muted-foreground">{hasCertDigital ? "Sim" : "Não"}</span>
                  <Switch checked={hasCertDigital} onCheckedChange={setHasCertDigital} />
                </div>
              </Field>
              {hasCertDigital && (
                <Field icon={CalendarRange} label="Data de expiração" required>
                  <Input type="date" />
                </Field>
              )}
            </div>
          </Section>

          <Section title="Localização" desc="Dados buscados via IBGE.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field icon={MapPin} label="Estado" required>
                <Select value={uf} onValueChange={setUf}>
                  <SelectTrigger><SelectValue placeholder="Selecione o estado" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {ufs.map(u => <SelectItem key={u.id} value={u.sigla}>{u.nome} ({u.sigla})</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field icon={MapPin} label="Cidade" required>
                <Select value={cidade} onValueChange={setCidade} disabled={!uf}>
                  <SelectTrigger><SelectValue placeholder={uf ? "Selecione a cidade" : "Selecione o estado primeiro"} /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {cidades.map(c => <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </Section>

          <Section title="Farmácias vinculadas" desc="É possível vincular múltiplas unidades.">
            <div className="flex gap-2">
              <Select value={novaFarmacia} onValueChange={setNovaFarmacia}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Selecione uma farmácia para vincular" /></SelectTrigger>
                <SelectContent>
                  {farmaciasDisponiveis.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="button" onClick={addFarmacia} className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Vincular</Button>
            </div>

            {farmaciasVinc.length > 0 && (
              <div className="flex flex-wrap gap-2 rounded-md border border-dashed border-border bg-background/40 p-3">
                {farmaciasVinc.map(f => (
                  <span key={f} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-xs">
                    <Building2 className="h-3 w-3 text-primary" /> {f}
                    <button onClick={() => setFarmaciasVinc(farmaciasVinc.filter(x => x !== f))} className="ml-1 text-muted-foreground hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Section>

          <Section title="Escala de trabalho" desc="Defina turnos por dia, feriados e exceções.">
            <div className="overflow-hidden rounded-md border border-border">
              <table className="w-full text-xs">
                <thead className="bg-background">
                  <tr className="text-left text-[10px] uppercase tracking-wider text-subtle-foreground">
                    <th className="px-3 py-2">Dia</th>
                    <th className="px-3 py-2">Trabalha</th>
                    <th className="px-3 py-2">Início</th>
                    <th className="px-3 py-2">Fim</th>
                  </tr>
                </thead>
                <tbody>
                  {DIAS.map(d => {
                    const v = escala[d];
                    return (
                      <tr key={d} className="border-t border-border/60">
                        <td className="px-3 py-2 font-medium">{d}</td>
                        <td className="px-3 py-2">
                          <Switch checked={v.ativo} onCheckedChange={(c) => setEscala({ ...escala, [d]: { ...v, ativo: c } })} />
                        </td>
                        <td className="px-3 py-2">
                          <Input type="time" disabled={!v.ativo} value={v.ini}
                            onChange={(e) => setEscala({ ...escala, [d]: { ...v, ini: e.target.value } })}
                            className="h-8 w-28" />
                        </td>
                        <td className="px-3 py-2">
                          <Input type="time" disabled={!v.ativo} value={v.fim}
                            onChange={(e) => setEscala({ ...escala, [d]: { ...v, fim: e.target.value } })}
                            className="h-8 w-28" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Feriados */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-subtle-foreground">Feriados</h3>
                <Button type="button" variant="outline" size="sm" className="h-7 gap-1"
                  onClick={() => setFeriados([...feriados, { data: "", descricao: "", trabalha: false }])}>
                  <Plus className="h-3 w-3" /> Adicionar
                </Button>
              </div>
              <div className="space-y-2">
                {feriados.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-md border border-border bg-background p-2">
                    <Input type="date" value={f.data} onChange={(e) => {
                      const n = [...feriados]; n[i].data = e.target.value; setFeriados(n);
                    }} className="h-8 w-40" />
                    <Input placeholder="Descrição" value={f.descricao} onChange={(e) => {
                      const n = [...feriados]; n[i].descricao = e.target.value; setFeriados(n);
                    }} className="h-8 flex-1" />
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Checkbox checked={f.trabalha} onCheckedChange={(c) => {
                        const n = [...feriados]; n[i].trabalha = !!c; setFeriados(n);
                      }} />
                      Trabalha
                    </label>
                    <button onClick={() => setFeriados(feriados.filter((_, x) => x !== i))} className="text-muted-foreground hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {feriados.length === 0 && <div className="text-center text-xs text-subtle-foreground py-2">Nenhum feriado adicionado.</div>}
              </div>
            </div>

            {/* Exceções */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-subtle-foreground">Exceções (turnos especiais)</h3>
                <Button type="button" variant="outline" size="sm" className="h-7 gap-1"
                  onClick={() => setExcecoes([...excecoes, { data: "", descricao: "", ini: "08:00", fim: "12:00" }])}>
                  <Plus className="h-3 w-3" /> Adicionar
                </Button>
              </div>
              <div className="space-y-2">
                {excecoes.map((e, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-md border border-border bg-background p-2">
                    <Input type="date" value={e.data} onChange={(ev) => {
                      const n = [...excecoes]; n[i].data = ev.target.value; setExcecoes(n);
                    }} className="h-8 w-40" />
                    <Input placeholder="Motivo" value={e.descricao} onChange={(ev) => {
                      const n = [...excecoes]; n[i].descricao = ev.target.value; setExcecoes(n);
                    }} className="h-8 flex-1" />
                    <Input type="time" value={e.ini} onChange={(ev) => {
                      const n = [...excecoes]; n[i].ini = ev.target.value; setExcecoes(n);
                    }} className="h-8 w-28" />
                    <Input type="time" value={e.fim} onChange={(ev) => {
                      const n = [...excecoes]; n[i].fim = ev.target.value; setExcecoes(n);
                    }} className="h-8 w-28" />
                    <button onClick={() => setExcecoes(excecoes.filter((_, x) => x !== i))} className="text-muted-foreground hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {excecoes.length === 0 && <div className="text-center text-xs text-subtle-foreground py-2">Nenhuma exceção cadastrada.</div>}
              </div>
            </div>
          </Section>

          <div className="flex justify-end gap-2 pb-8">
            <Button variant="outline" onClick={() => nav(-1)}>Cancelar</Button>
            <Button className="gap-1.5"><Save className="h-3.5 w-3.5" /> Salvar entregador</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntregadorCadastro;
