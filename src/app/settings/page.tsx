"use client";

import { useState } from "react";
import { useSettings } from "../settings-provider";

export default function SettingsPage() {
  const { language, setLanguage, countryCode, setCountryCode } = useSettings();
  const [discreetMode, setDiscreetMode] = useState(false);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 bg-zinc-950 px-4 py-6 text-zinc-50">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Settings &amp; Privacy</h1>
        <p className="text-xs text-zinc-300">
          Choose your language, country, and discreet mode. No login or account
          is required.
        </p>
      </header>

      <section className="mt-2 space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 text-xs text-zinc-100">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold text-zinc-300">Language</p>
          <select
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value === "fr" ? "fr" : "en")
            }
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-[11px] text-zinc-100 outline-none"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] font-semibold text-zinc-300">Country</p>
          <select
            value={countryCode}
            onChange={(e) =>
              setCountryCode(
                (e.target.value || "NG") as
                  | "NG"
                  | "KE"
                  | "UG"
                  | "ZA"
                  | "RW"
                  | "GH"
              )
            }
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-[11px] text-zinc-100 outline-none"
          >
            <option value="NG">Nigeria</option>
            <option value="KE">Kenya</option>
            <option value="UG">Uganda</option>
            <option value="ZA">South Africa</option>
            <option value="RW">Rwanda</option>
            <option value="GH">Ghana</option>
          </select>
        </div>

        <div className="mt-2 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
          <div className="space-y-0.5 text-[11px]">
            <p className="font-semibold text-zinc-100">Discreet mode</p>
            <p className="text-zinc-400">
              Use a neutral app name and hide explicit sexual health wording
              where possible.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDiscreetMode((v) => !v)}
            className={`flex h-6 w-11 items-center rounded-full border border-zinc-700 px-0.5 text-[10px] transition-colors ${
              discreetMode ? "bg-emerald-500" : "bg-zinc-900"
            }`}
          >
            <span
              className={`h-4 w-4 rounded-full bg-zinc-100 transition-transform ${
                discreetMode ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </section>
    </main>
  );
}
