import { Link } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Moon, UserCog } from "lucide-react";
import { useCurrentUser } from "@/lib/workspace";
import { StatusDot } from "./StatusDot";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const UserMenu = () => {
  const user = useCurrentUser();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-2.5 rounded-md p-1.5 hover:bg-sidebar-accent transition-colors">
          <div className="relative">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-channel-instagram text-xs font-semibold text-primary-foreground">
              {user.iniciais}
            </div>
            <StatusDot status={user.status} pulse={user.status === "online"} className="absolute -bottom-0.5 -right-0.5" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="truncate text-xs font-medium text-foreground">{user.nome}</div>
            <div className="truncate text-[10px] text-muted-foreground">
              {user.papel} · {user.chatsAtivos} chats
            </div>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
          {user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/conta" className="cursor-pointer">
            <UserCog className="mr-2 h-3.5 w-3.5" /> Minha conta
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/conta?tab=notificacoes" className="cursor-pointer">
            <Bell className="mr-2 h-3.5 w-3.5" /> Notificações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Moon className="mr-2 h-3.5 w-3.5" /> Trocar tema
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/login" className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-3.5 w-3.5" /> Sair
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
