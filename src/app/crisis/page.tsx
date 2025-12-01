export default function CrisisPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 bg-zinc-950 px-4 py-6 text-zinc-50">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">I was just exposed</h1>
        <p className="text-xs text-zinc-300">
          A rapid, step-by-step guide for what to do after a possible HIV
          exposure.
        </p>
      </header>
      <section className="mt-4 space-y-3 rounded-xl border border-red-900 bg-red-950 px-3 py-4 text-xs text-red-100">
        <p>
          Soon, this flow will explain PEP timing, where to go right now, and
          what to do if PEP is not available.
        </p>
      </section>
    </main>
  );
}
