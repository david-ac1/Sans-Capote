"use client";

import { useState } from "react";
import { useSettings } from "../settings-provider";

interface CrisisResponse {
  answer: string;
  safetyNotice: string;
}

export default function CrisisPage() {
  const { language, countryCode } = useSettings();

  const [timeSince, setTimeSince] = useState("<24");
  const [exposureType, setExposureType] = useState("vaginal");
  const [condomUsed, setCondomUsed] = useState("no");
  const [onPrep, setOnPrep] = useState("no");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CrisisResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const summary =
      language === "fr"
        ? `Exposition possible au VIH. Délai depuis l'exposition: ${timeSince} heures/jours. Type: ${exposureType}. Préservatif utilisé: ${condomUsed}. PrEP: ${onPrep}. Pays: ${countryCode}.`
        : `Possible HIV exposure. Time since exposure: ${timeSince} hours/days. Type: ${exposureType}. Condom used: ${condomUsed}. On PrEP: ${onPrep}. Country: ${countryCode}.`;

    try {
      const res = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: summary }],
          language,
          countryCode,
          mode: "crisis",
        }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data = (await res.json()) as CrisisResponse;
      setResult(data);
    } catch (e) {
      console.error(e);
      setError(
        language === "fr"
          ? "Impossible de charger les recommandations pour le moment. Vérifiez votre connexion et réessayez."
          : "We could not load guidance right now. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 bg-zinc-950 px-4 py-6 text-zinc-50">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">I was just exposed</h1>
        <p className="text-xs text-zinc-300">
          A rapid, step-by-step guide for what to do after a possible HIV
          exposure.
        </p>
      </header>

      <section className="space-y-3 rounded-xl border border-red-900 bg-red-950 px-3 py-3 text-xs text-red-100">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-red-200">
          Step 1: Tell us what happened
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <p className="text-[11px]">Time since exposure</p>
            <select
              value={timeSince}
              onChange={(e) => setTimeSince(e.target.value)}
              className="w-full rounded-lg border border-red-800 bg-red-950 px-2 py-2 text-[11px] text-red-50 outline-none"
            >
              <option value="<24">Less than 24 hours</option>
              <option value="24-48">24–48 hours</option>
              <option value="48-72">48–72 hours</option>
              <option value=">72">More than 72 hours</option>
            </select>
          </div>

          <div className="space-y-1">
            <p className="text-[11px]">Type of exposure</p>
            <select
              value={exposureType}
              onChange={(e) => setExposureType(e.target.value)}
              className="w-full rounded-lg border border-red-800 bg-red-950 px-2 py-2 text-[11px] text-red-50 outline-none"
            >
              <option value="vaginal">Vaginal sex</option>
              <option value="anal">Anal sex</option>
              <option value="oral">Oral sex</option>
              <option value="needle">Sharing a needle</option>
              <option value="blood">Contact with blood</option>
            </select>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <p className="text-[11px]">Condom used?</p>
              <select
                value={condomUsed}
                onChange={(e) => setCondomUsed(e.target.value)}
                className="w-full rounded-lg border border-red-800 bg-red-950 px-2 py-2 text-[11px] text-red-50 outline-none"
              >
                <option value="no">No condom</option>
                <option value="broke">Condom broke or slipped</option>
                <option value="yes">Condom stayed on</option>
              </select>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-[11px">On PrEP?</p>
              <select
                value={onPrep}
                onChange={(e) => setOnPrep(e.target.value)}
                className="w-full rounded-lg border border-red-800 bg-red-950 px-2 py-2 text-[11px] text-red-50 outline-none"
              >
                <option value="no">No</option>
                <option value="sometimes">Sometimes / missed doses</option>
                <option value="yes">Yes, taken regularly</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-full bg-red-400 px-4 py-2 text-[11px] font-semibold text-red-950 disabled:opacity-60"
          >
            {loading ? "Checking timing…" : "Get urgent guidance"}
          </button>
        </form>
      </section>

      {error && (
        <section className="rounded-xl border border-red-900 bg-red-950 px-3 py-2 text-[11px] text-red-100">
          {error}
        </section>
      )}

      {result && (
        <section className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-xs text-zinc-100">
          <p className="text-[11px] font-semibold text-red-300">
            Step 2: What this means
          </p>
          <p>{result.answer}</p>
          <p className="mt-2 text-[11px] text-zinc-400">{result.safetyNotice}</p>
        </section>
      )}
    </main>
  );
}
