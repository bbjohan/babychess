"use client";

import { SiteShell } from "@/components/site-shell";

export default function LoginPage() {
  return (
    <SiteShell
      eyebrow="Accesso disabilitato"
      title="Login non richiesto"
      subtitle="Usare la pagina Inserisci e specificare il nickname 'babyfeeling' o 'bb' per aggiungere partite."
    >
      <div className="border border-gray-700 bg-gray-900 p-6 text-gray-200">
        <p>Questa applicazione non richiede autenticazione. Vai su <a className="text-gray-100 underline" href="/add">Inserisci</a> e usa come nickname <strong>babyfeeling</strong> o <strong>bb</strong>.</p>
      </div>
    </SiteShell>
  );
}
