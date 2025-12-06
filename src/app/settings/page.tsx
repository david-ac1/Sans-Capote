"use client";

import { useState } from "react";
import { useSettings } from "../settings-provider";
import { strings, t } from "../../i18n/strings";

export default function SettingsPage() {
  const {
    language,
    setLanguage,
    countryCode,
    setCountryCode,
    playbackRate,
    setPlaybackRate,
    voicePreference,
    setVoicePreference,
  } = useSettings();
  // Use discreet mode from global settings so it persists app-wide
  const { discreetMode, setDiscreetMode } = useSettings();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 bg-[#F9F9F9] px-6 py-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-[#222222]">
          {t(strings.app.settingsTitle, language)}
        </h1>
        <p className="text-sm text-[#555555]">
          {t(strings.settings.intro, language)}
        </p>
      </header>

      <section className="space-y-4 rounded-xl border border-[#222222]/10 bg-white px-5 py-5 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#222222]">
            {t(strings.settings.languageLabel, language)}
          </p>
          <select
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value === "fr" ? "fr" : "en")
            }
            className="w-full rounded-lg border border-[#222222]/20 bg-white px-3 py-2.5 text-sm text-[#222222] outline-none focus:border-[#008080] transition-colors"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#222222]">
            {t(strings.settings.countryLabel, language)}
          </p>
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
            className="w-full rounded-lg border border-[#222222]/20 bg-white px-3 py-2.5 text-sm text-[#222222] outline-none focus:border-[#008080] transition-colors"
          >
            <option value="NG">Nigeria</option>
            <option value="KE">Kenya</option>
            <option value="UG">Uganda</option>
            <option value="ZA">South Africa</option>
            <option value="RW">Rwanda</option>
            <option value="GH">Ghana</option>
          </select>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#222222]">
            {t(strings.settings.playbackRateLabel, language)}
          </p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={2}
              step={0.1}
              value={playbackRate}
              onChange={(e) => setPlaybackRate(Number(e.target.value))}
              className="w-full accent-[#008080]"
            />
            <div className="text-sm font-medium text-[#222222]">{playbackRate.toFixed(1)}x</div>
          </div>
          <p className="text-xs text-[#555555]">
            {t(strings.settings.playbackRateHelp, language)}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#222222]">
            {t(strings.settings.voicePrefLabel, language)}
          </p>
          <select
            value={voicePreference}
            onChange={(e) => setVoicePreference(e.target.value === "text" ? "text" : "voice")}
            className="w-full rounded-lg border border-[#222222]/20 bg-white px-3 py-2.5 text-sm text-[#222222] outline-none focus:border-[#008080] transition-colors"
          >
            <option value="voice">{language === 'fr' ? 'Vocal' : 'Voice'}</option>
            <option value="text">{language === 'fr' ? 'Texte' : 'Text'}</option>
          </select>
          <p className="text-xs text-[#555555]">
            {t(strings.settings.voicePrefHelp, language)}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-[#222222]/10 bg-[#F9F9F9] px-4 py-3">
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-[#222222]">
              {t(strings.settings.discreetLabel, language)}
            </p>
            <p className="text-xs text-[#555555]">
              {t(strings.settings.discreetHelp, language)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDiscreetMode(!discreetMode)}
            className={`flex h-7 w-12 items-center rounded-full px-0.5 transition-colors ${
              discreetMode ? "bg-[#008080]" : "bg-[#222222]/20"
            }`}
          >
            <span
              className={`h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                discreetMode ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </section>
    </main>
  );
}
