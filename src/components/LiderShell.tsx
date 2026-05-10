import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Truck,
  CalendarCheck,
  UserX,
  UserPlus,
  MessageCircle,
  LogOut,
  Settings,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { StatusDot } from "./StatusDot";

const nav = [
  { to: "/lider", label: "Visão geral", icon: LayoutDashboard, end: true },
  { to: "/lider/farmacias", label: "Minhas farmácias", icon: Building2 },
  { to: "/lider/entregadores", label: "Meus entregadores", icon: Truck },
  { to: "/lider/diarias", label: "Lançar diárias", icon: CalendarCheck },
  { to: "/lider/faltas", label: "Lançar faltas", icon: UserX },
  { to: "/lider/pre-cadastro", label: "Pré-cadastro", icon: UserPlus },
  { to: "/lider/chat", label: "Chat atendimento", icon: MessageCircle, badge: 3 },
];

export const LiderShell = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen w-full overflow-hidden bg-background">
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-14 items-center gap-2.5 px-4 border-b border-sidebar-border">
        <Logo size={26} />
        <div className="flex flex-col leading-none">
          <span className="text-sm font-semibold tracking-tight text-foreground">Aethera</span>
          <span className="text-[10px] text-muted-foreground">Painel do líder</span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="rounded bg-success/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-success">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3 space-y-1">
        <div className="flex items-center gap-2.5 rounded-md p-1.5 hover:bg-sidebar-accent transition-colors cursor-pointer">
          <div className="relative">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-channel-instagram text-xs font-semibold text-primary-foreground">
              MS
            </div>
            <StatusDot status="online" pulse className="absolute -bottom-0.5 -right-0.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-xs font-medium text-foreground">Marcos Silva</div>
            <div className="truncate text-[10px] text-muted-foreground">Líder · Zona Sul</div>
          </div>
          <Settings className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <Link
          to="/login"
          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair
        </Link>
      </div>
    </aside>

    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex h-14 items-center justify-between border-b border-border bg-surface/40 px-6 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-subtle-foreground">Líder</span>
          <span className="text-sm text-foreground">Marcos Silva</span>
          <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
            Zona Sul · 8 farmácias · 24 entregadores
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative rounded-md border border-border p-2 hover:bg-surface-hover">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive" />
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  </div>
);
