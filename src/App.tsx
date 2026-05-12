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
import FarmaciaCadastro from "./pages/FarmaciaCadastro.tsx";
import Campanhas from "./pages/Campanhas.tsx";
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
import Financeiro from "./pages/Financeiro.tsx";
import Configuracoes from "./pages/Configuracoes.tsx";
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
          <Route path="/entregadores" element={<AppShell><Entregadores /></AppShell>} />
          <Route path="/entregadores/novo" element={<AppShell><EntregadorCadastro /></AppShell>} />
          <Route path="/lideres" element={<AppShell><Lideres /></AppShell>} />
          <Route path="/lideres/:id" element={<AppShell><LiderFicha /></AppShell>} />
          <Route path="/campanhas" element={<AppShell><Campanhas /></AppShell>} />
          <Route path="/automacoes" element={<AppShell><Automacoes /></AppShell>} />
          <Route path="/automacoes/nova" element={<AppShell><AutomacaoNova /></AppShell>} />
          <Route path="/automacoes/:id" element={<AppShell><AutomacaoDetalhe /></AppShell>} />
          <Route path="/flows" element={<AppShell><Flows /></AppShell>} />
          <Route path="/flows/:id" element={<AppShell><FlowEditor /></AppShell>} />
          <Route path="/financeiro" element={<AppShell><Financeiro /></AppShell>} />
          <Route path="/configuracoes" element={<AppShell><Configuracoes /></AppShell>} />
          <Route path="/export" element={<AppShell><Export /></AppShell>} />

          {/* Painel do Líder */}
          <Route path="/lider" element={<LiderShell><LiderDashboard /></LiderShell>} />
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
