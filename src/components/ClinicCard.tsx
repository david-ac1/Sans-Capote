"use client";

import React from "react";
import { ServiceEntry } from "../data/servicesDirectory";

export default function ClinicCard({
  clinic,
  language = "en",
}: {
  clinic: ServiceEntry;
  language?: "en" | "fr";
}) {
  const ratingStars = (rating?: number) => {
    if (!rating) return "—";
    return "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
  };

  const availabilityBadge = (
    availability?: "high" | "medium" | "low" | "unknown"
  ) => {
    if (availability === "high") return "✓ High";
    if (availability === "medium") return "◐ Medium";
    if (availability === "low") return "✗ Low";
    return "? Unknown";
  };

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-3 text-[11px]">
      <h3 className="font-semibold text-zinc-100">{clinic.name}</h3>
      <p className="text-[10px] text-zinc-400">{clinic.city}</p>

      <div className="mt-2 flex flex-wrap gap-2">
        {clinic.lgbtqiaFriendly !== undefined && (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-1 text-[10px]">
            <span>🏳️‍🌈</span>
            <span>{ratingStars(clinic.lgbtqiaFriendly)}</span>
          </span>
        )}
        {clinic.pepAvailability && (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-900/30 px-2 py-1 text-[10px] text-red-100">
            <span>PEP:</span>
            <span>{availabilityBadge(clinic.pepAvailability)}</span>
          </span>
        )}
        {clinic.prepAvailability && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/30 px-2 py-1 text-[10px] text-emerald-100">
            <span>PrEP:</span>
            <span>{availabilityBadge(clinic.prepAvailability)}</span>
          </span>
        )}
      </div>

      <p className="mt-2 text-[10px] text-zinc-300">
        {language === "fr" ? clinic.notesFr : clinic.notesEn}
      </p>

      <div className="mt-2 flex gap-2">
        {clinic.phone && (
          <a
            href={`tel:${clinic.phone}`}
            className="flex-1 rounded-lg bg-emerald-500/20 px-2 py-1 text-center text-[10px] font-semibold text-emerald-100 hover:bg-emerald-500/30"
          >
            {language === "fr" ? "Appeler" : "Call"}
          </a>
        )}
        {clinic.lat && clinic.lng && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${clinic.lat},${clinic.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-lg bg-blue-500/20 px-2 py-1 text-center text-[10px] font-semibold text-blue-100 hover:bg-blue-500/30"
          >
            {language === "fr" ? "Itinéraire" : "Directions"}
          </a>
        )}
      </div>
    </div>
  );
}
