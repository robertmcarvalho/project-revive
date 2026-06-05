import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/AppShell";
import Index from "./pages/Index.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Login from "./pages/Login.tsx";
import Export from "./pages/Export.tsx";
import Contatos from "./pages/Contatos.tsx";
import Farmacias from "./pages/Farmacias.tsx";
import Entregadores from "./pages/Entregadores.tsx";
import Lideres from "./pages/Lideres.tsx";
import LiderFicha from "./pages/LiderFicha.tsx";
import EntregadorCadastro from "./pages/EntregadorCadastro.tsx";
import EntregadorFicha from "./pages/EntregadorFicha.tsx";
import FarmaciaCadastro from "./pages/FarmaciaCadastro.tsx";
import FarmaciaFicha from "./pages/FarmaciaFicha.tsx";
import Campanhas from "./pages/Campanhas.tsx";
import CampanhaNova from "./pages/CampanhaNova.tsx";
import CampanhaDetalhe from "./pages/CampanhaDetalhe.tsx";
import Usuarios from "./pages/Usuarios.tsx";
import UsuarioFicha from "./pages/UsuarioFicha.tsx";
import Automacoes from "./pages/Automacoes.tsx";
import AutomacaoNova from "./pages/AutomacaoNova.tsx";
import AutomacaoDetalhe from "./pages/AutomacaoDetalhe.tsx";
import Flows from "./pages/Flows.tsx";
import FlowEditor from "./pages/FlowEditor.tsx";
import { LiderShell } from "@/components/LiderShell";
import LiderDashboard from "./pages/lider/Dashboard.tsx";
import LiderFarmacias from "./pages/lider/Farmacias.tsx";
import LiderEntregadores from "./pages/lider/Entregadores.tsx";
import LiderDiarias from "./pages/lider/Diarias.tsx";
import LiderFaltas from "./pages/lider/Faltas.tsx";
import LiderPreCadastro from "./pages/lider/PreCadastro.tsx";
import LiderChat from "./pages/lider/Chat.tsx";
import LiderObrigacoes from "./pages/lider/Obrigacoes.tsx";
import Financeiro from "./pages/Financeiro.tsx";
import Configuracoes from "./pages/Configuracoes.tsx";
import Operacao from "./pages/Operacao.tsx";
import Copiloto from "./pages/Copiloto.tsx";
import Aethera from "./pages/Aethera.tsx";
import MinhaConta from "./pages/MinhaConta.tsx";
import RelatorioAtendimento from "./pages/relatorios/Atendimento.tsx";
import ComercialDashboard from "./pages/comercial/Dashboard.tsx";
import ComercialPipeline from "./pages/comercial/Pipeline.tsx";
import ComercialLeads from "./pages/comercial/Leads.tsx";
import ComercialLeadNovo from "./pages/comercial/LeadNovo.tsx";
import ComercialLeadFicha from "./pages/comercial/LeadFicha.tsx";
import ComercialConfiguracoes from "./pages/comercial/Configuracoes.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AppShell><Index /></AppShell>} />
          <Route path="/dashboard" element={<AppShell><Dashboard /></AppShell>} />
          <Route path="/contatos" element={<AppShell><Contatos /></AppShell>} />
          <Route path="/farmacias" element={<AppShell><Farmacias /></AppShell>} />
          <Route path="/farmacias/nova" element={<AppShell><FarmaciaCadastro /></AppShell>} />
          <Route path="/farmacias/:id" element={<AppShell><FarmaciaFicha /></AppShell>} />
          <Route path="/entregadores" element={<AppShell><Entregadores /></AppShell>} />
          <Route path="/entregadores/novo" element={<AppShell><EntregadorCadastro /></AppShell>} />
          <Route path="/entregadores/:id" element={<AppShell><EntregadorFicha /></AppShell>} />
          <Route path="/lideres" element={<AppShell><Lideres /></AppShell>} />
          <Route path="/lideres/:id" element={<AppShell><LiderFicha /></AppShell>} />
          <Route path="/campanhas" element={<AppShell><Campanhas /></AppShell>} />
          <Route path="/campanhas/nova" element={<AppShell><CampanhaNova /></AppShell>} />
          <Route path="/campanhas/:id" element={<AppShell><CampanhaDetalhe /></AppShell>} />
          <Route path="/configuracoes/usuarios" element={<AppShell><Usuarios /></AppShell>} />
          <Route path="/configuracoes/usuarios/:id" element={<AppShell><UsuarioFicha /></AppShell>} />
          <Route path="/automacoes" element={<AppShell><Automacoes /></AppShell>} />
          <Route path="/automacoes/nova" element={<AppShell><AutomacaoNova /></AppShell>} />
          <Route path="/automacoes/:id" element={<AppShell><AutomacaoDetalhe /></AppShell>} />
          <Route path="/flows" element={<AppShell><Flows /></AppShell>} />
          <Route path="/flows/:id" element={<AppShell><FlowEditor /></AppShell>} />
          <Route path="/financeiro" element={<AppShell><Financeiro /></AppShell>} />
          <Route path="/relatorios" element={<AppShell><RelatorioAtendimento /></AppShell>} />
          <Route path="/relatorios/atendimento" element={<AppShell><RelatorioAtendimento /></AppShell>} />
          <Route path="/configuracoes" element={<AppShell><Configuracoes /></AppShell>} />
          <Route path="/operacao" element={<AppShell><Operacao /></AppShell>} />
          <Route path="/copiloto" element={<AppShell><Copiloto /></AppShell>} />
          <Route path="/aethera" element={<AppShell><Aethera /></AppShell>} />
          <Route path="/conta" element={<AppShell><MinhaConta /></AppShell>} />
          <Route path="/export" element={<AppShell><Export /></AppShell>} />

          {/* CRM Comercial */}
          <Route path="/comercial" element={<AppShell><ComercialDashboard /></AppShell>} />
          <Route path="/comercial/pipeline" element={<AppShell><ComercialPipeline /></AppShell>} />
          <Route path="/comercial/leads" element={<AppShell><ComercialLeads /></AppShell>} />
          <Route path="/comercial/leads/novo" element={<AppShell><ComercialLeadNovo /></AppShell>} />
          <Route path="/comercial/leads/:id" element={<AppShell><ComercialLeadFicha /></AppShell>} />
          <Route path="/comercial/configuracoes" element={<AppShell><ComercialConfiguracoes /></AppShell>} />

          {/* Painel do Líder */}
          <Route path="/lider" element={<LiderShell><LiderDashboard /></LiderShell>} />
          <Route path="/lider/obrigacoes" element={<LiderShell><LiderObrigacoes /></LiderShell>} />

          <Route path="/lider/farmacias" element={<LiderShell><LiderFarmacias /></LiderShell>} />
          <Route path="/lider/entregadores" element={<LiderShell><LiderEntregadores /></LiderShell>} />
          <Route path="/lider/diarias" element={<LiderShell><LiderDiarias /></LiderShell>} />
          <Route path="/lider/faltas" element={<LiderShell><LiderFaltas /></LiderShell>} />
          <Route path="/lider/pre-cadastro" element={<LiderShell><LiderPreCadastro /></LiderShell>} />
          <Route path="/lider/chat" element={<LiderShell><LiderChat /></LiderShell>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
