import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Entidades from "./Entidades";
import TiposDespesa from "./TiposDespesa";
import CentrosCusto from "./CentrosCusto";

const Configuracoes = () => (
  <Tabs defaultValue="entidades">
    <TabsList className="flex-wrap">
      <TabsTrigger value="entidades">Entidades</TabsTrigger>
      <TabsTrigger value="centros">Centros de custo</TabsTrigger>
      <TabsTrigger value="tipos">Tipos de despesa</TabsTrigger>
    </TabsList>
    <TabsContent value="entidades" className="mt-4"><Entidades /></TabsContent>
    <TabsContent value="centros" className="mt-4"><CentrosCusto /></TabsContent>
    <TabsContent value="tipos" className="mt-4"><TiposDespesa /></TabsContent>
    <div className="mt-4 rounded-md border border-dashed border-border bg-background/40 p-3 text-[11px] text-muted-foreground">
      Split de faturamento (Coop × Flux), taxas, mínimo garantido e regras de vínculo entregador × farmácia são configurados
      diretamente na <strong>ficha de cada farmácia</strong> — fonte única de verdade.
    </div>
  </Tabs>
);

export default Configuracoes;
