import { cn } from "@/lib/utils";

type Status = "online" | "idle" | "offline" | "busy";

const colors: Record<Status, string> = {
  online: "bg-success",
  idle: "bg-warning",
  busy: "bg-destructive",
  offline: "bg-muted-foreground/40",
};

export const StatusDot = ({ status, pulse = false, className }: { status: Status; pulse?: boolean; className?: string }) => (
  <span
    className={cn(
      "inline-block h-2 w-2 rounded-full ring-2 ring-background",
      colors[status],
      pulse && status === "online" && "animate-pulse-dot",
      className
    )}
  />
);
