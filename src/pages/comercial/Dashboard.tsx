import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, TrendingUp, Plus, Filter } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { comercialApi } from "@/lib/comercialApi";

const Dashboard = () => {
  const [data, setData] = useState<Awaited<ReturnType<typeof comercialApi.dashboard>> | null>(null);
  const [period, setPeriod] = useState<"7" | "30" | "90">(/* */ "30");

  useEffect(() => { comercialApi.dashboard().then(setData); }, [period]);

  const kpis = [
    { label: "Leads novos", value: data?.novos ?? "—", accent: "text-foreground" },
    { label: "Em qualificação", value: data?.qual ?? "—", accent: "text-info" },
    { label: "Propostas enviadas", value: data?.props ?? "—", accent: "text-warning" },
    { label: "Ganhos", value: data?.ganhos ?? "—", accent: "text-success" },
    { label: "Perdidos", value: data?.perdidos ?? "—", accent: "text-destructive" },
    { label: "Taxa de conversão", value: data ? `${data.taxa}%` : "—", accent: "text-primary" },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <PageHeader
          icon={Briefcase}
          eyebrow="Comercial"
          title="Dashboard"
          description="Visão consolidada do funil comercial e produtividade do time."
          actions={
            <>
              <div className="flex items-center gap-1 rounded-md border border-border bg-surface p-0.5 text-xs">
                {(["7", "30", "90"] as const).map((p) => (
                  <button key={p} onClick={() => setPeriod(p)} className={`rounded px-2 py-1 transition-colors ${period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface-hover"}`}>
                    {p}d
                  </button>
                ))}
              </div>
              <Link to="/comercial/leads/novo" className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-glow">
                <Plus className="h-3.5 w-3.5" /> Novo lead
              </Link>
            </>
          }
        />

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-xl border border-border bg-surface p-4">
              <div className={`text-2xl font-semibold tracking-tight ${k.accent}`}>{k.value}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-tight">Funil por estágio</h3>
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="h-64">
              {data && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.funnel} margin={{ left: -16 }}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="stage" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--surface-elevated))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-tight">Leads criados × ganhos</h3>
              <TrendingUp className="h-3.5 w-3.5 text-success" />
            </div>
            <div className="h-64">
              {data && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.days} margin={{ left: -16 }}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--surface-elevated))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="criados" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="ganhos" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
