export default function ResourcesPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 bg-zinc-950 px-4 py-6 text-zinc-50">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Education Hub</h1>
        <p className="text-xs text-zinc-300">
          Short, simple explanations about HIV, STIs, LGBTQ+ health, consent,
          and mental health.
        </p>
      </header>
      <section className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-4 text-xs text-zinc-300">
        <p>
          This section will work mostly offline, using preloaded articles and
          audio summaries.
        </p>
      </section>
    </main>
  );
}
