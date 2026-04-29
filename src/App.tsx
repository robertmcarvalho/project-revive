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
import Campanhas from "./pages/Campanhas.tsx";
import Automacoes from "./pages/Automacoes.tsx";
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
          <Route path="/entregadores" element={<AppShell><Entregadores /></AppShell>} />
          <Route path="/lideres" element={<AppShell><Lideres /></AppShell>} />
          <Route path="/campanhas" element={<AppShell><Campanhas /></AppShell>} />
          <Route path="/automacoes" element={<AppShell><Automacoes /></AppShell>} />
          <Route path="/financeiro" element={<AppShell><Financeiro /></AppShell>} />
          <Route path="/configuracoes" element={<AppShell><Configuracoes /></AppShell>} />
          <Route path="/export" element={<AppShell><Export /></AppShell>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
