"use client";

import { useState } from "react";
import { useSettings } from "../settings-provider";
import CrisisVoiceAgent from "../../components/CrisisVoiceAgent";
import { strings, t } from "../../i18n/strings";
import { ServiceEntry } from "../../data/servicesDirectory";

interface CrisisResponse {
  answer: string;
  safetyNotice: string;
  localMatches: ServiceEntry[];
}

export default function CrisisPage() {
  const { language, discreetMode } = useSettings();
  const [result, setResult] = useState<CrisisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className={`mx-auto flex min-h-screen max-w-xl flex-col gap-4 ${discreetMode ? "bg-black" : "bg-zinc-950"} px-4 py-6 text-zinc-50`}>
      <header className="flex items-center justify-between gap-2">
        <div className="space-y-1 flex-1">
          {!discreetMode && (
            <>
              <h1 className="text-xl font-semibold">{t(strings.crisis.title, language)}</h1>
              <p className="text-xs text-zinc-300">{t(strings.crisis.subtitle, language)}</p>
            </>
          )}
        </div>
      </header>

      <CrisisVoiceAgent
        onComplete={(res) => {
          setResult(res as CrisisResponse);
        }}
      />

      {error && <section className="rounded-xl border border-red-900 bg-red-950 px-3 py-2 text-[11px] text-red-100">{error}</section>}

      {result && (
        <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-xs text-zinc-100">
          <p className="text-[11px] font-semibold text-red-300">{t(strings.crisis.step2, language)}</p>
          <p>{result.answer}</p>
          <p className="mt-2 text-[11px] text-zinc-400">{result.safetyNotice}</p>

          {result.localMatches && result.localMatches.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-zinc-700 pt-4">
              <p className="text-[11px] font-semibold uppercase text-emerald-300">{language === "fr" ? "🏥 Cliniques recommandées" : "🏥 Recommended clinics"}</p>
              <div className="space-y-2">
                {result.localMatches.map((m) => (
                  <div key={m.id} className="rounded-lg border border-zinc-700 bg-zinc-900 p-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-zinc-100 truncate">{m.name}</p>
                        <p className="text-[10px] text-zinc-400">{m.city}</p>
                      </div>
                      {m.phone && (
                        <a href={`tel:${m.phone}`} className="rounded-lg bg-red-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-red-700 flex-shrink-0">📞</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
