import { Link } from "react-router-dom";
import { ArrowRight, Crown, Headphones } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";

const Login = () => {
  const [perfil, setPerfil] = useState<"operador" | "lider">("operador");
  const destino = perfil === "lider" ? "/lider" : "/";
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background flex items-center justify-center px-4 py-12">
      {/* Animated mesh gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-primary/30 blur-[120px] animate-pulse" />
        <div
          className="absolute top-1/3 -right-40 h-[520px] w-[520px] rounded-full bg-channel-instagram/20 blur-[120px] animate-pulse"
          style={{ animationDelay: "1.5s", animationDuration: "5s" }}
        />
        <div
          className="absolute -bottom-40 left-1/4 h-[460px] w-[460px] rounded-full bg-primary-glow/25 blur-[120px] animate-pulse"
          style={{ animationDelay: "2.8s", animationDuration: "6s" }}
        />
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        {/* vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/80" />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-[400px]">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Logo size={36} />
              <div className="absolute inset-0 blur-lg opacity-50 -z-10">
                <Logo size={36} />
              </div>
            </div>
            <span className="text-xl font-semibold tracking-tight">Aethera</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Plataforma omnichannel inteligente</p>
        </div>

        {/* Glass card */}
        <div className="relative rounded-2xl border border-white/10 bg-surface/40 p-7 backdrop-blur-2xl shadow-[0_20px_70px_-20px_hsl(var(--primary)/0.25)]">
          {/* inner highlight */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.06] to-transparent" />

          <div className="relative">
            <div className="font-mono text-[10px] uppercase tracking-wider text-subtle-foreground">Entrar</div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">Bem-vindo de volta</h2>
            <p className="mt-1 text-xs text-muted-foreground">Acesse seu workspace para continuar.</p>

            <form className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Tipo de acesso</label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {[
                    { id: "operador", label: "Operador", icon: Headphones },
                    { id: "lider", label: "Líder", icon: Crown },
                  ].map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setPerfil(p.id as any)}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                        perfil === p.id
                          ? "border-primary/60 bg-primary/10 text-primary"
                          : "border-border bg-background/40 text-muted-foreground hover:bg-surface-hover"
                      }`}
                    >
                      <p.icon className="h-3.5 w-3.5" /> {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">E-mail</label>
                <input
                  type="email"
                  placeholder="voce@empresa.com"
                  className="mt-1.5 block w-full rounded-lg border border-border bg-background/40 px-3 py-2.5 text-sm placeholder:text-subtle-foreground focus:border-primary/50 focus:outline-none focus:ring-glow transition-all backdrop-blur"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Senha</label>
                  <a href="#" className="text-[10px] text-primary hover:underline">
                    Esqueci a senha
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="mt-1.5 block w-full rounded-lg border border-border bg-background/40 px-3 py-2.5 text-sm placeholder:text-subtle-foreground focus:border-primary/50 focus:outline-none focus:ring-glow transition-all backdrop-blur"
                />
              </div>

              <Link
                to={destino}
                className="group flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-glow transition-all shadow-glow"
              >
                Entrar como {perfil === "lider" ? "líder" : "operador"}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-surface/40 backdrop-blur px-2 text-[10px] uppercase tracking-wider text-subtle-foreground">
                    ou
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background/40 px-4 py-2.5 text-sm font-medium hover:bg-surface-hover transition-colors backdrop-blur"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuar com Google
              </button>
            </form>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Não tem conta?{" "}
          <a href="#" className="font-medium text-primary hover:underline">
            Criar workspace
          </a>
        </p>

        <p className="mt-8 text-center font-mono text-[10px] text-subtle-foreground">
          © 2026 Aethera · Todos os direitos reservados
        </p>
      </div>
    </div>
  );
};

export default Login;
