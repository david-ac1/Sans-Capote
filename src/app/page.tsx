"use client";

import { useSettings } from "./settings-provider";
import { strings, t } from "../i18n/strings";

export default function Home() {
  const { language } = useSettings();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 py-6">
        <header className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
            {t(strings.app.brand, language)}
          </p>
          <h1 className="text-2xl font-semibold leading-snug">
            {t(strings.home.subtitle, language)}
          </h1>
          <p className="text-sm text-zinc-300">
            {t(strings.home.description, language)}
          </p>
        </header>

        <section className="grid gap-3">
          <a
            href="/guide"
            className="block rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <p className="text-sm font-semibold text-emerald-300">
              {t(strings.home.cards.guide.title, language)}
            </p>
            <p className="text-xs text-zinc-300">
              {t(strings.home.cards.guide.body, language)}
            </p>
          </a>

          <a
            href="/navigator"
            className="block rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <p className="text-sm font-semibold text-emerald-300">
              {t(strings.home.cards.navigator.title, language)}
            </p>
            <p className="text-xs text-zinc-300">
              {t(strings.home.cards.navigator.body, language)}
            </p>
          </a>

          <a
            href="/resources"
            className="block rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <p className="text-sm font-semibold text-emerald-300">
              {t(strings.home.cards.resources.title, language)}
            </p>
            <p className="text-xs text-zinc-300">
              {t(strings.home.cards.resources.body, language)}
            </p>
          </a>

          <a
            href="/crisis"
            className="block rounded-xl border border-red-900 bg-red-950 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <p className="text-sm font-semibold text-red-300">
              {t(strings.home.cards.crisis.title, language)}
            </p>
            <p className="text-xs text-red-100">
              {t(strings.home.cards.crisis.body, language)}
            </p>
          </a>

          <a
            href="/settings"
            className="block rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <p className="text-sm font-semibold text-emerald-300">
              {t(strings.home.cards.settings.title, language)}
            </p>
            <p className="text-xs text-zinc-300">
              {t(strings.home.cards.settings.body, language)}
            </p>
          </a>
        </section>

        <footer className="mt-auto pt-4 text-xs text-zinc-500">
          <p>{t(strings.home.footerNotice, language)}</p>
        </footer>
      </main>
    </div>
  );
}
