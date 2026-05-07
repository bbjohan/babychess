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
      <header className="mb-8 border-b border-gray-300 pb-6">
        <div className="space-y-2 mb-4">
          <div className="text-xs uppercase tracking-widest text-gray-600">
            {eyebrow}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 sm:text-base">
              {subtitle}
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
          <Link className="border-b-2 border-black pb-1 text-black hover:text-gray-600" href="/">
            Partite
          </Link>
          <Link className="border-b-2 border-transparent pb-1 text-gray-600 hover:text-black" href="/add">
            Inserisci
          </Link>
          <Link className="border-b-2 border-transparent pb-1 text-gray-600 hover:text-black" href="/login">
            Accesso
          </Link>
        </nav>
      </header>

      {actions ? <div className="mb-6">{actions}</div> : null}

      <main className="flex-1">{children}</main>
    </div>
  );
}
