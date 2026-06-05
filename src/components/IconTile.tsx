import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type IconTileTone = "primary" | "success" | "warning" | "destructive" | "muted" | "info";
export type IconTileSize = "sm" | "md" | "lg" | "xl";

// Chip arredondado, premium, com cor temática suave e ring leve.
// Padrão visual unificado para toda a plataforma — substitui ícones "soltos".
export const IconTile = ({
  icon: Icon,
  tone = "primary",
  size = "md",
  className,
}: {
  icon: LucideIcon;
  tone?: IconTileTone;
  size?: IconTileSize;
  className?: string;
}) => {
  const toneCls = {
    primary: "bg-primary/15 text-primary ring-primary/20",
    success: "bg-success/15 text-success ring-success/20",
    warning: "bg-warning/15 text-warning ring-warning/20",
    destructive: "bg-destructive/15 text-destructive ring-destructive/20",
    info: "bg-channel-instagram/15 text-channel-instagram ring-channel-instagram/20",
    muted: "bg-muted text-muted-foreground ring-border",
  }[tone];
  const sizeCls = {
    sm: "h-7 w-7 rounded-md",
    md: "h-9 w-9 rounded-lg",
    lg: "h-11 w-11 rounded-xl",
    xl: "h-14 w-14 rounded-2xl",
  }[size];
  const iconSize = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
    xl: "h-7 w-7",
  }[size];
  return (
    <div className={cn("flex items-center justify-center ring-1", sizeCls, toneCls, className)}>
      <Icon className={iconSize} strokeWidth={1.75} />
    </div>
  );
};

export default IconTile;
