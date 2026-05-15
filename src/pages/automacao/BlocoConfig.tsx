import {
  setores, filas, perfis, demandasPorPerfil, perfisFarmacia,
  cidadesDisponiveis, gestores, tagsSugeridas, type Perfil,
} from "@/data/atendimentoCatalog";
import type { Bloco } from "@/lib/fluxo";

interface Props {
  bloco: Bloco;
  onChange: (key: string, value: any) => void;
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs";
const selectCls = inputCls;

export const BlocoConfig = ({ bloco, onChange }: Props) => {
  const c = bloco.config;

  switch (bloco.tipo) {
    case "identificar":
      return (
        <Field label="Origem da identificação">
          <select className={selectCls} value={c.origem} onChange={e => onChange("origem", e.target.value)}>
            <option value="telefone">Telefone do contato</option>
            <option value="email">E-mail</option>
            <option value="documento">Documento (CPF/CNPJ)</option>
          </select>
        </Field>
      );

    case "selecionar-setor":
      return (
        <div className="space-y-3">
          <Field label="Modo de seleção">
            <select className={selectCls} value={c.modo} onChange={e => onChange("modo", e.target.value)}>
              <option value="menu">Apresentar menu ao cliente</option>
              <option value="fixo">Setor fixo</option>
            </select>
          </Field>
          <Field label="Setores disponíveis">
            <div className="flex flex-wrap gap-1.5">
              {setores.map(s => {
                const sel = (c.setoresIds as string[]).includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      const cur = c.setoresIds as string[];
                      onChange("setoresIds", sel ? cur.filter(x => x !== s.id) : [...cur, s.id]);
                    }}
                    className={
                      "rounded-full border px-2 py-0.5 text-[11px] transition-colors " +
                      (sel
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border text-muted-foreground hover:border-border-strong")
                    }
                  >
                    {s.nome}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>
      );

    case "selecionar-demanda": {
      const perfil = c.perfil as Perfil;
      const opcoes = demandasPorPerfil[perfil] ?? [];
      return (
        <div className="space-y-3">
          <Field label="Perfil de origem">
            <select className={selectCls} value={c.perfil} onChange={e => onChange("perfil", e.target.value)}>
              {perfis.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </Field>
          <Field label={`Demandas (${opcoes.length} pré-cadastradas)`}>
            <div className="flex flex-wrap gap-1.5">
              {opcoes.map(d => {
                const sel = (c.demandas as string[]).includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => {
                      const cur = c.demandas as string[];
                      onChange("demandas", sel ? cur.filter(x => x !== d) : [...cur, d]);
                    }}
                    className={
                      "rounded-full border px-2 py-0.5 text-[11px] transition-colors " +
                      (sel
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border text-muted-foreground hover:border-border-strong")
                    }
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>
      );
    }

    case "pergunta":
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Pergunta exibida">
            <input className={inputCls} value={c.rotulo} onChange={e => onChange("rotulo", e.target.value)} />
          </Field>
          <Field label="Variável de saída">
            <input className={inputCls} value={c.variavel} onChange={e => onChange("variavel", e.target.value)} />
          </Field>
          <label className="col-span-2 flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={!!c.obrigatorio}
              onChange={e => onChange("obrigatorio", e.target.checked)}
            />
            Resposta obrigatória
          </label>
        </div>
      );

    case "menu-farmacias":
      return (
        <Field label="Variável que contém a cidade">
          <select className={selectCls} value={c.variavelCidade} onChange={e => onChange("variavelCidade", e.target.value)}>
            <option value="cidade">cidade</option>
            <option value="endereco_cidade">endereco_cidade</option>
          </select>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Cidades com farmácias cadastradas: {cidadesDisponiveis.join(", ")}.
          </p>
        </Field>
      );

    case "enviar-mensagem":
      return (
        <div className="space-y-3">
          <Field label="Mensagem">
            <textarea
              rows={3}
              className={inputCls + " resize-none"}
              value={c.texto}
              onChange={e => onChange("texto", e.target.value)}
            />
          </Field>
          <Field label="Aguardar antes de enviar (segundos)">
            <input
              type="number"
              min={0}
              className={inputCls}
              value={c.delaySeg}
              onChange={e => onChange("delaySeg", Number(e.target.value))}
            />
          </Field>
        </div>
      );

    case "script-bot":
      return (
        <Field label="Mensagens (uma por linha)">
          <textarea
            rows={4}
            className={inputCls + " resize-none"}
            value={(c.mensagens as string[]).join("\n")}
            onChange={e => onChange("mensagens", e.target.value.split("\n"))}
          />
        </Field>
      );

    case "ia-resposta":
      return (
        <div className="space-y-3">
          <Field label="Modelo">
            <select className={selectCls} value={c.modelo} onChange={e => onChange("modelo", e.target.value)}>
              <option value="gpt-4o-mini">gpt-4o-mini</option>
              <option value="gpt-4o">gpt-4o</option>
              <option value="claude-3-5-sonnet">claude-3-5-sonnet</option>
            </select>
          </Field>
          <Field label="Instruções">
            <textarea rows={3} className={inputCls + " resize-none"} value={c.instrucoes} onChange={e => onChange("instrucoes", e.target.value)} />
          </Field>
        </div>
      );

    case "criar-precadastro":
      return (
        <div className="space-y-3">
          <Field label="Tipo de cadastro">
            <select className={selectCls} value={c.tipo} onChange={e => onChange("tipo", e.target.value)}>
              <option value="entregador">Entregador</option>
              <option value="farmacia">Farmácia</option>
            </select>
          </Field>
          {c.tipo === "farmacia" && (
            <Field label="Perfis aceitos na farmácia">
              <div className="text-[11px] text-muted-foreground">{perfisFarmacia.join(" · ")}</div>
            </Field>
          )}
          <Field label="Campos extras (separados por vírgula)">
            <input className={inputCls} value={c.camposExtras} onChange={e => onChange("camposExtras", e.target.value)} placeholder="ex.: cnh, placa, banco" />
          </Field>
        </div>
      );

    case "aplicar-tag":
      return (
        <Field label="Tag">
          <input className={inputCls} value={c.tag} onChange={e => onChange("tag", e.target.value)} list="tags-sugeridas" />
          <datalist id="tags-sugeridas">{tagsSugeridas.map(t => <option key={t} value={t} />)}</datalist>
        </Field>
      );

    case "notificar-atendente":
      return (
        <div className="space-y-3">
          <Field label="Canal de notificação">
            <select className={selectCls} value={c.canal} onChange={e => onChange("canal", e.target.value)}>
              <option value="painel">Painel do atendente</option>
              <option value="email">E-mail</option>
              <option value="slack">Slack</option>
            </select>
          </Field>
          <Field label="Mensagem">
            <input className={inputCls} value={c.mensagem} onChange={e => onChange("mensagem", e.target.value)} />
          </Field>
        </div>
      );

    case "atribuir-fila":
      return (
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={!!c.dinamica} onChange={e => onChange("dinamica", e.target.checked)} />
            Fila dinâmica (resolve a partir do setor escolhido)
          </label>
          {!c.dinamica && (
            <Field label="Fila">
              <select className={selectCls} value={c.filaId} onChange={e => onChange("filaId", e.target.value)}>
                <option value="">Selecione…</option>
                {filas.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </select>
            </Field>
          )}
        </div>
      );

    case "sla-etapa":
    case "sla-fila":
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tempo limite (minutos)">
            <input type="number" min={1} className={inputCls} value={c.tempoMin} onChange={e => onChange("tempoMin", Number(e.target.value))} />
          </Field>
          <Field label="Ação ao estourar">
            <select className={selectCls} value={c.acaoEstouro} onChange={e => onChange("acaoEstouro", e.target.value)}>
              <option value="notificar">Notificar gestor</option>
              <option value="escalar">Escalar atendimento</option>
              <option value="mover">Mover para outra fila</option>
              <option value="mensagem">Enviar mensagem ao cliente</option>
            </select>
          </Field>
        </div>
      );

    case "escalar-gestor":
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Gestor">
            <select className={selectCls} value={c.gestorId} onChange={e => onChange("gestorId", e.target.value)}>
              <option value="">Selecione…</option>
              {gestores.map(g => <option key={g.id} value={g.id}>{g.nome} · {g.area}</option>)}
            </select>
          </Field>
          <Field label="Canal de aviso">
            <select className={selectCls} value={c.canal} onChange={e => onChange("canal", e.target.value)}>
              <option value="email">E-mail</option>
              <option value="painel">Painel</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </Field>
        </div>
      );

    case "csat":
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Pergunta">
            <input className={inputCls} value={c.pergunta} onChange={e => onChange("pergunta", e.target.value)} />
          </Field>
          <Field label="Escala">
            <select className={selectCls} value={c.escala} onChange={e => onChange("escala", e.target.value)}>
              <option value="1-5">1 a 5 estrelas</option>
              <option value="0-10">NPS · 0 a 10</option>
              <option value="binario">Bom / Ruim</option>
            </select>
          </Field>
        </div>
      );

    default:
      return null;
  }
};
