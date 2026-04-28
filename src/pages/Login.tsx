import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, Instagram, Mail, Globe, Send, Sparkles } from "lucide-react";

const Login = () => {
  return (
    <div className="min-h-screen w-full bg-background grid lg:grid-cols-2">
      {/* Left — brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between border-r border-border bg-surface p-10 overflow-hidden">
        {/* glow */}
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-channel-instagram/15 blur-3xl pointer-events-none" />

        <div className="relative flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary shadow-glow">
            <span className="text-sm font-bold text-primary-foreground">A</span>
          </div>
          <span className="text-base font-semibold tracking-tight">Atende</span>
        </div>

        <div className="relative space-y-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated/60 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              Novo · Respostas com IA
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tighter text-balance leading-[1.1]">
              Uma caixa de entrada para <span className="gradient-text">todos os canais</span>.
            </h1>
            <p className="mt-4 max-w-md text-sm text-muted-foreground leading-relaxed">
              WhatsApp, Instagram, e-mail e webchat num só lugar. Atenda mais rápido, com menos esforço e dados em tempo real.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {[MessageCircle, Instagram, Mail, Globe, Send].map((Icon, i) => (
              <div key={i} className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background/40 backdrop-blur transition-transform hover:scale-105 hover:border-primary/40">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6 border-t border-border pt-6 max-w-md">
            {[
              { v: "2.4M", l: "Mensagens/mês" },
              { v: "94%", l: "Resolução" },
              { v: "1m 42s", l: "Resp. média" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-xl font-semibold tracking-tight">{s.v}</div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative font-mono text-[10px] text-subtle-foreground">
          © 2026 Atende · Todos os direitos reservados
        </div>
      </div>

      {/* Right — form */}
      <div className="flex flex-col justify-center px-6 py-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary">
              <span className="text-sm font-bold text-primary-foreground">A</span>
            </div>
            <span className="text-base font-semibold">Atende</span>
          </div>

          <div className="font-mono text-[10px] uppercase tracking-wider text-subtle-foreground">Entrar</div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Bem-vindo de volta</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Acesse seu workspace para continuar.</p>

          <form className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">E-mail</label>
              <input
                type="email"
                placeholder="voce@empresa.com"
                className="mt-1.5 block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm placeholder:text-subtle-foreground focus:border-primary/50 focus:outline-none focus:ring-glow transition-all"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Senha</label>
                <a href="#" className="text-[10px] text-primary hover:underline">Esqueci a senha</a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="mt-1.5 block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm placeholder:text-subtle-foreground focus:border-primary/50 focus:outline-none focus:ring-glow transition-all"
              />
            </div>

            <Link
              to="/"
              className="group flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-glow transition-all shadow-glow"
            >
              Entrar
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center"><span className="bg-background px-2 text-[10px] uppercase tracking-wider text-subtle-foreground">ou</span></div>
            </div>

            <button type="button" className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-surface-hover transition-colors">
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continuar com Google
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Não tem conta? <a href="#" className="font-medium text-primary hover:underline">Criar workspace</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
