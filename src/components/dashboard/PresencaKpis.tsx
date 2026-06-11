import { Users, UserCheck, UserMinus, UserX, Clock } from "lucide-react";
import { IconTile, type IconTileTone } from "@/components/IconTile";
import { countByStatus, avgLoggedSeconds, fmtDuration } from "@/lib/equipeApi";

const Card = ({
  icon, tone, label, value, hint,
}: { icon: any; tone: IconTileTone; label: string; value: string; hint?: string }) => (
  <div className="rounded-xl border border-border bg-surface p-5 transition-colors hover:bg-surface-elevated">
    <div className="flex items-start justify-between">
      <IconTile icon={icon} tone={tone} size="md" />
      {hint && <span className="font-mono text-[10px] text-subtle-foreground">{hint}</span>}
    </div>
    <div className="mt-4">
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </div>
  </div>
);

export const PresencaKpis = () => {
  const c = countByStatus();
  const avg = avgLoggedSeconds();
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      <Card icon={UserCheck} tone="success"     label="Online"           value={String(c.online)} />
      <Card icon={Users}     tone="warning"     label="Ausentes"         value={String(c.idle)} />
      <Card icon={UserMinus} tone="destructive" label="Ocupados"         value={String(c.busy)} />
      <Card icon={UserX}     tone="muted"       label="Offline"          value={String(c.offline)} />
      <Card icon={Clock}     tone="info"        label="Tempo médio logado" value={fmtDuration(avg)} hint="média 7d" />
    </div>
  );
};

export default PresencaKpis;
