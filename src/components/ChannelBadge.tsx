import { cn } from "@/lib/utils";
import { MessageCircle, Instagram, Mail, Globe, Send } from "lucide-react";

const channelConfig = {
  whatsapp: { icon: MessageCircle, color: "text-channel-whatsapp", bg: "bg-channel-whatsapp/10", label: "WhatsApp" },
  instagram: { icon: Instagram, color: "text-channel-instagram", bg: "bg-channel-instagram/10", label: "Instagram" },
  email: { icon: Mail, color: "text-channel-email", bg: "bg-channel-email/10", label: "E-mail" },
  webchat: { icon: Globe, color: "text-channel-webchat", bg: "bg-channel-webchat/10", label: "Webchat" },
  telegram: { icon: Send, color: "text-channel-telegram", bg: "bg-channel-telegram/10", label: "Telegram" },
} as const;

export type Channel = keyof typeof channelConfig;

interface ChannelBadgeProps {
  channel: Channel;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export const ChannelBadge = ({ channel, size = "sm", showLabel = false, className }: ChannelBadgeProps) => {
  const cfg = channelConfig[channel];
  const Icon = cfg.icon;
  const dim = size === "sm" ? "h-5 w-5" : "h-7 w-7";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("inline-flex items-center justify-center rounded-md", dim, cfg.bg)}>
        <Icon className={cn(iconSize, cfg.color)} strokeWidth={2.2} />
      </span>
      {showLabel && <span className="text-xs font-medium text-muted-foreground">{cfg.label}</span>}
    </div>
  );
};
