"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type SupportedLanguage = "en" | "fr" | "sw";

export type SupportedCountryCode = "NG" | "KE" | "UG" | "ZA" | "RW" | "GH";

export type VoicePreference = "voice" | "text";
interface SettingsState {
  language: SupportedLanguage;
  countryCode: SupportedCountryCode;
  playbackRate: number;
  voicePreference: VoicePreference;
  discreetMode: boolean;
  setLanguage: (value: SupportedLanguage) => void;
  setCountryCode: (value: SupportedCountryCode) => void;
  setPlaybackRate: (value: number) => void;
  setVoicePreference: (value: VoicePreference) => void;
  setDiscreetMode: (v: boolean) => void;
}

const SettingsContext = createContext<SettingsState | undefined>(undefined);

export function SettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [countryCode, setCountryCode] = useState<SupportedCountryCode>("NG");
  const [playbackRate, setPlaybackRate] = useState<number>(1.2);
  const [voicePreference, setVoicePreference] = useState<VoicePreference>("voice");
  const [discreetMode, setDiscreetMode] = useState<boolean>(false);

  // Load initial settings from localStorage on first mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedLanguage = window.localStorage.getItem("sc_language");
      const storedCountry = window.localStorage.getItem("sc_country_code");
      const storedPlayback = window.localStorage.getItem("sc_playback_rate");
        const storedVoicePref = window.localStorage.getItem("sc_voice_pref");
        const storedDiscreet = window.localStorage.getItem("sc_discreet_mode");
        const storedDarkMode = window.localStorage.getItem("sc_dark_mode");

      if (storedLanguage === "en" || storedLanguage === "fr" || storedLanguage === "sw") {
        setLanguage(storedLanguage);
      }

      if (
        storedCountry === "NG" ||
        storedCountry === "KE" ||
        storedCountry === "UG" ||
        storedCountry === "ZA" ||
        storedCountry === "RW" ||
        storedCountry === "GH"
      ) {
        setCountryCode(storedCountry);
      }

      if (storedPlayback) {
        const n = Number(storedPlayback);
        if (!Number.isNaN(n) && n > 0 && n <= 3) {
          setPlaybackRate(n);
        }
      }

      if (storedVoicePref === "voice" || storedVoicePref === "text") {
        setVoicePreference(storedVoicePref);
      }

      if (storedDiscreet === "true") {
        setDiscreetMode(true);
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  // Persist settings when they change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("sc_language", language);
      window.localStorage.setItem("sc_country_code", countryCode);
      window.localStorage.setItem("sc_playback_rate", String(playbackRate));
      window.localStorage.setItem("sc_voice_pref", voicePreference);
        window.localStorage.setItem("sc_discreet_mode", String(discreetMode));
    } catch {
      // ignore localStorage errors
    }
  }, [language, countryCode, playbackRate, voicePreference, discreetMode]);

  return (
    <SettingsContext.Provider
      value={{
        language,
        countryCode,
        playbackRate,
          voicePreference,
          discreetMode,
        setLanguage,
        setCountryCode,
        setPlaybackRate,
          setVoicePreference,
          setDiscreetMode,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
}
