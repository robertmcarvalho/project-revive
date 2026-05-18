import { useNavigate } from "react-router-dom";
import { CopilotoPanel } from "@/components/CopilotoPanel";
import { OperationContextBar } from "@/components/OperationContextBar";

const Copiloto = () => {
  const navigate = useNavigate();
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-6 pt-4">
        <OperationContextBar breadcrumb={["Webhook B2B Farmácias", "Conversa › Marina Costa"]} />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 bg-muted/20 p-6 text-sm text-muted-foreground">
          <p className="max-w-md">
            Esta visualização do Copiloto está disponível ao lado da conversa, no
            painel de atendimento. Abra uma conversa na caixa de entrada e clique em
            <strong className="text-foreground"> Copiloto</strong> para usar sem sair da tela.
          </p>
          <button
            onClick={() => navigate("/inbox")}
            className="mt-4 inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/15"
          >
            Ir para a caixa de entrada
          </button>
        </div>
        <CopilotoPanel onClose={() => navigate("/inbox")} />
      </div>
    </div>
  );
};

export default Copiloto;
