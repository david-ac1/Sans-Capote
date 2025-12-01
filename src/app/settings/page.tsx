export default function SettingsPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 bg-zinc-950 px-4 py-6 text-zinc-50">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Settings &amp; Privacy</h1>
        <p className="text-xs text-zinc-300">
          Choose your language, country, and discreet mode. No login or account
          is required.
        </p>
      </header>
      <section className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-4 text-xs text-zinc-300">
        <p>
          Here we will later add controls for English/French, your country,
          offline data, and how the app appears on your device.
        </p>
      </section>
    </main>
  );
}
