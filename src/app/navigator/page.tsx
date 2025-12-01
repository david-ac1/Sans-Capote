"use client";

import { useMemo } from "react";
import { useSettings } from "../settings-provider";
import { countryGuides } from "../../data/countryGuides";
import { strings, t } from "../../i18n/strings";

export default function NavigatorPage() {
  const { language, countryCode } = useSettings();

  const guide = useMemo(
    () => countryGuides.find((c) => c.code === countryCode) ?? countryGuides[0],
    [countryCode]
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 bg-zinc-950 px-4 py-6 text-zinc-50">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">
          {t(strings.navigator.title, language)}
        </h1>
        <p className="text-xs text-zinc-300">
          {t(strings.navigator.subtitle, language)} {guide.name}.
        </p>
      </header>

      <section className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 text-xs text-zinc-100">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
          PrEP – preventing HIV before exposure
        </p>
        <h2 className="text-sm font-semibold text-zinc-50">{guide.prep.title}</h2>
        <div className="space-y-2">
          {guide.prep.steps.map((step) => (
            <div
              key={step.title}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
            >
              <p className="text-[11px] font-semibold text-zinc-100">
                {step.title}
              </p>
              <p className="mt-1 text-[11px] text-zinc-300">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 text-xs text-zinc-100">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-red-300">
          PEP – after a possible exposure
        </p>
        <h2 className="text-sm font-semibold text-zinc-50">{guide.pep.title}</h2>
        <div className="space-y-2">
          {guide.pep.steps.map((step) => (
            <div
              key={step.title}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
            >
              <p className="text-[11px] font-semibold text-zinc-100">
                {step.title}
              </p>
              <p className="mt-1 text-[11px] text-zinc-300">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 text-xs text-zinc-100">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-300">
          Testing – knowing your status
        </p>
        <h2 className="text-sm font-semibold text-zinc-50">
          {guide.testing.title}
        </h2>
        <div className="space-y-2">
          {guide.testing.steps.map((step) => (
            <div
              key={step.title}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
            >
              <p className="text-[11px] font-semibold text-zinc-100">
                {step.title}
              </p>
              <p className="mt-1 text-[11px] text-zinc-300">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
