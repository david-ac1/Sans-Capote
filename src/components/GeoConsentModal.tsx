"use client";

import React from "react";
import { strings, t } from "../i18n/strings";

export default function GeoConsentModal({
  language = "en",
  onAllow,
  onDeny,
}: {
  language?: "en" | "fr";
  onAllow: () => void;
  onDeny: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-w-md rounded-lg bg-zinc-900 p-4 text-zinc-50">
        <h3 className="font-semibold">{t(strings.navigator.geoConsentTitle, language)}</h3>
        <p className="mt-2 text-[12px] text-zinc-300">{t(strings.navigator.geoConsentBody, language)}</p>
        <div className="mt-4 flex gap-2">
          <button onClick={onAllow} className="flex-1 rounded-lg bg-emerald-500 px-3 py-2 font-semibold text-zinc-900">{t(strings.navigator.geoAllow, language)}</button>
          <button onClick={onDeny} className="flex-1 rounded-lg border border-zinc-700 px-3 py-2 font-semibold">{t(strings.navigator.geoDeny, language)}</button>
        </div>
      </div>
    </div>
  );
}
