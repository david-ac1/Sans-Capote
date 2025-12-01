"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type SupportedLanguage = "en" | "fr";

export type SupportedCountryCode = "NG" | "KE" | "UG" | "ZA" | "RW" | "GH";

interface SettingsState {
  language: SupportedLanguage;
  countryCode: SupportedCountryCode;
  setLanguage: (value: SupportedLanguage) => void;
  setCountryCode: (value: SupportedCountryCode) => void;
}

const SettingsContext = createContext<SettingsState | undefined>(undefined);

export function SettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [countryCode, setCountryCode] = useState<SupportedCountryCode>("NG");

  // Load initial settings from localStorage on first mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedLanguage = window.localStorage.getItem("sc_language");
      const storedCountry = window.localStorage.getItem("sc_country_code");

      if (storedLanguage === "en" || storedLanguage === "fr") {
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
    } catch {
      // ignore localStorage errors
    }
  }, [language, countryCode]);

  return (
    <SettingsContext.Provider
      value={{ language, countryCode, setLanguage, setCountryCode }}
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
