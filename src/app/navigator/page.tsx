export default function NavigatorPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 bg-zinc-950 px-4 py-6 text-zinc-50">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">HIV Prevention Navigator</h1>
        <p className="text-xs text-zinc-300">
          Learn about PrEP, PEP, condoms, and HIV testing, with guidance that can
          be tailored to your country.
        </p>
      </header>
      <section className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-4 text-xs text-zinc-300">
        <p>
          Soon, this page will guide you step-by-step: how to get PrEP, what to
          do after a risk, and where to get tested.
        </p>
      </section>
    </main>
  );
}
