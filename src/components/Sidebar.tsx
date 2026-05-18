import { NavLink } from "react-router-dom";
import { Inbox, LayoutDashboard, Users, Bot, Settings, Search, Command, Code2, Building2, Truck, Crown, Megaphone, Wallet, Workflow, BarChart3, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceCard } from "./WorkspaceCard";
import { UserMenu } from "./UserMenu";

const nav = [
  { to: "/", label: "Caixa de entrada", icon: Inbox, badge: 12 },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/contatos", label: "Contatos", icon: Users },
  { to: "/farmacias", label: "Farmácias", icon: Building2 },
  { to: "/entregadores", label: "Entregadores", icon: Truck },
  { to: "/lideres", label: "Líderes", icon: Crown },
  { to: "/campanhas", label: "Campanhas", icon: Megaphone },
  { to: "/automacoes", label: "Automações", icon: Bot },
  { to: "/flows", label: "Flows", icon: Workflow },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
  { to: "/export", label: "Export Redesign", icon: Code2 },
];

export const Sidebar = () => {
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Workspace */}
      <WorkspaceCard />

      {/* Search */}
      <div className="px-3 pt-3">
        <button className="flex w-full items-center gap-2 rounded-md border border-sidebar-border bg-background/40 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent">
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Buscar...</span>
          <kbd className="flex items-center gap-0.5 rounded border border-sidebar-border bg-sidebar-accent px-1 py-0.5 font-mono text-[10px]">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4" strokeWidth={2} />
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="rounded bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-primary">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-sidebar-border p-3">
        <UserMenu />
      </div>
    </aside>
  );
};
