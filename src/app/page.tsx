export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 py-6">
        <header className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
            Sans Capote
          </p>
          <h1 className="text-2xl font-semibold leading-snug">
            Private sexual health &amp; HIV support.
          </h1>
          <p className="text-sm text-zinc-300">
            Designed for African contexts. Low data. Stigma-free. Works even with
            weak or no network.
          </p>
        </header>

        <section className="grid gap-3">
          <a
            href="/guide"
            className="block rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <p className="text-sm font-semibold text-emerald-300">
              AI Sexual Health Guide
            </p>
            <p className="text-xs text-zinc-300">
              Ask questions in private. Get clear, non-judgmental answers.
            </p>
          </a>

          <a
            href="/navigator"
            className="block rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <p className="text-sm font-semibold text-emerald-300">
              HIV Prevention Navigator
            </p>
            <p className="text-xs text-zinc-300">
              Learn about PrEP, PEP, condoms, and testing in your country.
            </p>
          </a>

          <a
            href="/resources"
            className="block rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <p className="text-sm font-semibold text-emerald-300">
              Education Hub
            </p>
            <p className="text-xs text-zinc-300">
              Simple guides on HIV, STIs, consent, LGBTQ+ health, and stigma.
            </p>
          </a>

          <a
            href="/crisis"
            className="block rounded-xl border border-red-900 bg-red-950 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <p className="text-sm font-semibold text-red-300">
              I was just exposed
            </p>
            <p className="text-xs text-red-100">
              Step-by-step guidance on PEP, timing, and where to go now.
            </p>
          </a>

          <a
            href="/settings"
            className="block rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <p className="text-sm font-semibold text-emerald-300">
              Settings &amp; Privacy
            </p>
            <p className="text-xs text-zinc-300">
              Choose language, country, and discreet mode. No account needed.
            </p>
          </a>
        </section>

        <footer className="mt-auto pt-4 text-xs text-zinc-500">
          <p>
            This tool does not replace a doctor. In an emergency, go to the
            nearest clinic or hospital.
          </p>
        </footer>
      </main>
    </div>
  );
}
