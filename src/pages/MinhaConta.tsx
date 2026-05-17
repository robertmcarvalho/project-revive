import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrentUser } from "@/lib/workspace";
import { Monitor, Smartphone, LogOut } from "lucide-react";

const MinhaConta = () => {
  const user = useCurrentUser();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "perfil";

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl p-8">
        <PageHeader
          eyebrow="Minha conta"
          title={user.nome}
          description="Suas preferências pessoais. Não afetam a operação da empresa."
        />

        <Tabs value={tab} onValueChange={(v) => setParams({ tab: v })}>
          <TabsList>
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
            <TabsTrigger value="preferencias">Preferências</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="sessoes">Sessões</TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="mt-6 space-y-4 rounded-lg border border-border bg-surface/40 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Nome</Label>
                <Input defaultValue={user.nome} className="mt-1.5" />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input defaultValue={user.email} type="email" className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label>Senha atual</Label>
              <Input type="password" placeholder="••••••••" className="mt-1.5" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Nova senha</Label>
                <Input type="password" className="mt-1.5" />
              </div>
              <div>
                <Label>Confirmar nova senha</Label>
                <Input type="password" className="mt-1.5" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button>Salvar alterações</Button>
            </div>
          </TabsContent>

          <TabsContent value="preferencias" className="mt-6 space-y-4 rounded-lg border border-border bg-surface/40 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Idioma da interface</Label>
                <Select defaultValue="pt-BR">
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fuso horário</Label>
                <Select defaultValue="America/Sao_Paulo">
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                    <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                    <SelectItem value="America/Rio_Branco">Rio Branco (GMT-5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <div className="text-sm font-medium">Tema escuro</div>
                <div className="text-xs text-muted-foreground">Usa o esquema escuro mesmo em telas claras do sistema</div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <div className="text-sm font-medium">Atalhos de teclado</div>
                <div className="text-xs text-muted-foreground">Ativa navegação rápida com ⌘K e atalhos no inbox</div>
              </div>
              <Switch defaultChecked />
            </div>
          </TabsContent>

          <TabsContent value="notificacoes" className="mt-6 space-y-3 rounded-lg border border-border bg-surface/40 p-6">
            {[
              { label: "Novo atendimento atribuído", desc: "Quando um chat é roteado para você" },
              { label: "Menção em conversa interna", desc: "Quando alguém usa @você" },
              { label: "SLA prestes a estourar", desc: "Aviso 5 min antes do prazo" },
              { label: "Pesquisa CSAT respondida", desc: "Quando um cliente responde a avaliação" },
              { label: "Resumo diário", desc: "Resumo dos seus atendimentos no fim do expediente" },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <div className="text-sm font-medium">{n.label}</div>
                  <div className="text-xs text-muted-foreground">{n.desc}</div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Switch defaultChecked /> Push
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Switch /> E-mail
                  </label>
                </div>
              </div>
            ))}
            <div className="rounded-md border border-border p-3">
              <Label className="text-sm font-medium">Mute por horário</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">Não receber notificações fora deste intervalo</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Input type="time" defaultValue="08:00" />
                <Input type="time" defaultValue="20:00" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sessoes" className="mt-6 space-y-3 rounded-lg border border-border bg-surface/40 p-6">
            {[
              { icon: Monitor, label: "MacBook Pro · Chrome", loc: "São Paulo · agora", current: true },
              { icon: Smartphone, label: "iPhone 15 · Safari", loc: "São Paulo · há 2h" },
              { icon: Monitor, label: "Windows · Edge", loc: "Rio de Janeiro · há 3 dias" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 rounded-md border border-border p-3">
                <s.icon className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.loc}</div>
                </div>
                {s.current ? (
                  <span className="rounded bg-primary/15 px-2 py-0.5 font-mono text-[10px] text-primary">atual</span>
                ) : (
                  <Button variant="ghost" size="sm">Encerrar</Button>
                )}
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <Button variant="destructive">
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Sair de todos os dispositivos
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MinhaConta;
