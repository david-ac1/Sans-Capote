"use client";

import React, { useState } from "react";
import { strings, t } from "../i18n/strings";

export type PEPValues = {
  timeSince: string;
  exposureType: string;
  condomUsed: string;
  onPrep?: string;
};

export default function PEPForm({
  onSubmit,
  language = "en",
  submitLabel,
  initial = { timeSince: "<24", exposureType: "vaginal", condomUsed: "no" },
}: {
  onSubmit: (values: PEPValues) => void | Promise<void>;
  language?: "en" | "fr";
  submitLabel?: string;
  initial?: PEPValues;
}) {
  const [timeSince, setTimeSince] = useState(initial.timeSince);
  const [exposureType, setExposureType] = useState(initial.exposureType);
  const [condomUsed, setCondomUsed] = useState(initial.condomUsed);
  const [onPrep, setOnPrep] = useState(initial.onPrep ?? "no");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ timeSince, exposureType, condomUsed, onPrep });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <p className="text-[11px]">{t(strings.crisis.timeSince, language)}</p>
        <select
          value={timeSince}
          onChange={(e) => setTimeSince(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-[11px] text-zinc-100 outline-none"
        >
          <option value="<24">{language === "fr" ? "<24 heures" : "Less than 24 hours"}</option>
          <option value="24-48">24–48</option>
          <option value="48-72">48–72</option>
          <option value=">72">{language === "fr" ? ">72 heures" : "More than 72 hours"}</option>
        </select>
      </div>

      <div className="space-y-1">
        <p className="text-[11px]">{t(strings.crisis.exposureType, language)}</p>
        <select
          value={exposureType}
          onChange={(e) => setExposureType(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-[11px] text-zinc-100 outline-none"
        >
          <option value="vaginal">{language === "fr" ? "Rapports vaginaux" : "Vaginal sex"}</option>
          <option value="anal">Anal</option>
          <option value="oral">Oral</option>
          <option value="needle">Needle / sharings</option>
          <option value="blood">Blood contact</option>
        </select>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 space-y-1">
          <p className="text-[11px]">{t(strings.crisis.condomUsed, language)}</p>
          <select
            value={condomUsed}
            onChange={(e) => setCondomUsed(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-[11px] text-zinc-100 outline-none"
          >
            <option value="no">{language === "fr" ? "Non" : "No condom"}</option>
            <option value="broke">{language === "fr" ? "Cassé" : "Broke / slipped"}</option>
            <option value="yes">{language === "fr" ? "Oui" : "Yes"}</option>
          </select>
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-[11px]">{t(strings.crisis.onPrep, language)}</p>
          <select
            value={onPrep}
            onChange={(e) => setOnPrep(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-[11px] text-zinc-100 outline-none"
          >
            <option value="no">No</option>
            <option value="sometimes">Sometimes / missed</option>
            <option value="yes">Yes</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-1 w-full rounded-full bg-red-400 px-4 py-2 text-[11px] font-semibold text-red-950 disabled:opacity-60"
      >
        {loading ? (language === "fr" ? "Envoi..." : "Submitting...") : submitLabel || (language === "fr" ? "Soumettre" : "Submit")}
      </button>
    </form>
  );
}
