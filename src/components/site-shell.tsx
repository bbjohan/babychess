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
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8 text-gray-100">
      <header className="mb-8 border-b border-gray-700 pb-6">
        <div className="space-y-2 mb-4">
          <div className="text-xs uppercase tracking-widest text-gray-400">
            {eyebrow}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-300 sm:text-base">
              {subtitle}
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
          <Link className="border-b-2 border-transparent pb-1 text-gray-100 hover:text-gray-300" href="/">
            Partite
          </Link>
          <Link className="border-b-2 border-transparent pb-1 text-gray-100 hover:text-gray-300" href="/add">
            Inserisci
          </Link>
        </nav>
      </header>

      {actions ? <div className="mb-6">{actions}</div> : null}

      <main className="flex-1">{children}</main>
    </div>
  );
}
