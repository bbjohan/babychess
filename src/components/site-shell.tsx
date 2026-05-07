import Link from "next/link";

type SiteShellProps = {
  title: string;
  eyebrow: string;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function SiteShell({ title, eyebrow, subtitle, actions, children }: SiteShellProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/8 px-5 py-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.32em] text-cyan-200/80">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_24px_rgba(103,232,249,0.8)]" />
            {eyebrow}
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
              {subtitle}
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-200">
          <Link className="rounded-full border border-white/10 px-4 py-2 transition hover:bg-white/10" href="/">
            Partite
          </Link>
          <Link className="rounded-full border border-white/10 px-4 py-2 transition hover:bg-white/10" href="/add">
            Inserisci
          </Link>
          <Link className="rounded-full border border-white/10 px-4 py-2 transition hover:bg-white/10" href="/login">
            Accesso
          </Link>
        </nav>
      </header>

      {actions ? <div className="mb-6">{actions}</div> : null}

      <main className="flex-1">{children}</main>
    </div>
  );
}
