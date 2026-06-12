import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ContaPagar, ContaReceber, FormaPagamento, ContaBancaria, Cartao } from "@/data/financeiroMock";
import { fmtBRL } from "@/lib/baixas";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lancamento: ContaPagar | ContaReceber;
  tipo: "pagamento" | "recebimento";
  contas: ContaBancaria[];
  cartoes: Cartao[];
  onConfirm: (input: {
    data: string; valor: number; forma: FormaPagamento;
    contaBancariaId?: string; cartaoId?: string;
    juros?: number; desconto?: number; obs?: string;
  }) => Promise<void>;
}

export const BaixaDialog = ({ open, onOpenChange, lancamento, tipo, contas, cartoes, onConfirm }: Props) => {
  const saldo = lancamento.saldo;
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [valor, setValor] = useState(saldo);
  const [forma, setForma] = useState<FormaPagamento>("pix");
  const [contaBancariaId, setConta] = useState<string | undefined>(contas[0]?.id);
  const [cartaoId, setCartao] = useState<string | undefined>(undefined);
  const [juros, setJuros] = useState(0);
  const [desconto, setDesconto] = useState(0);
  const [obs, setObs] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await onConfirm({
        data, valor: +valor, forma, contaBancariaId: forma === "cartao" ? undefined : contaBancariaId,
        cartaoId: forma === "cartao" ? cartaoId : undefined,
        juros: juros || undefined, desconto: desconto || undefined, obs: obs || undefined,
      });
      onOpenChange(false);
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{tipo === "pagamento" ? "Baixar pagamento" : "Baixar recebimento"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs">
            <div className="text-muted-foreground">Saldo em aberto</div>
            <div className="font-mono text-sm font-semibold">{fmtBRL(saldo)}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Data</Label>
              <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Valor</Label>
              <Input type="number" step="0.01" value={valor} onChange={(e) => setValor(+e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Forma</Label>
              <Select value={forma} onValueChange={(v) => setForma(v as FormaPagamento)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="ted">TED</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="compensacao">Compensação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              {forma === "cartao" ? (
                <>
                  <Label className="text-xs">Cartão</Label>
                  <Select value={cartaoId} onValueChange={setCartao}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {cartoes.map((c) => <SelectItem key={c.id} value={c.id}>{c.bandeira} •••• {c.final}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <>
                  <Label className="text-xs">Conta</Label>
                  <Select value={contaBancariaId} onValueChange={setConta}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {contas.map((c) => <SelectItem key={c.id} value={c.id}>{c.banco} ag {c.agencia} cc {c.conta}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
            <div>
              <Label className="text-xs">Juros/Multa</Label>
              <Input type="number" step="0.01" value={juros} onChange={(e) => setJuros(+e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Desconto</Label>
              <Input type="number" step="0.01" value={desconto} onChange={(e) => setDesconto(+e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Observação</Label>
            <Input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Opcional" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancelar</Button>
          <Button onClick={submit} disabled={busy || valor <= 0 || valor > saldo + 0.01}>
            {busy ? "Salvando…" : "Confirmar baixa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
