"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSettings } from "../settings-provider";
import { servicesDirectory, type ServiceEntry } from "../../data/servicesDirectory";
import { countryGuides } from "../../data/countryGuides";
import { strings, t } from "../../i18n/strings";
import { logConversationMetric } from "../../lib/metrics";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type ViewMode = "triage" | "results";

interface GeolocationCoords {
  latitude: number;
  longitude: number;
}

export default function NavigatorPage() {
  const { language, countryCode } = useSettings();
  const [viewMode, setViewMode] = useState<ViewMode>("triage");
  const [timeSinceExposure, setTimeSinceExposure] = useState<number | null>(null);
  const [exposureType, setExposureType] = useState<string>("penetrative");
  const [condomUsed, setCondomUsed] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<GeolocationCoords | null>(null);
  const [geoRequested, setGeoRequested] = useState(false);
  const [mapActive, setMapActive] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const guide = useMemo(
    () => countryGuides.find((c) => c.code === countryCode) ?? countryGuides[0],
    [countryCode]
  );

  // Filter clinics by country
  const countryClinics = useMemo(
    () => servicesDirectory.filter((s) => s.country === countryCode),
    [countryCode]
  );

  // Compute distance from user to clinic (Haversine formula)
  const computeDistance = (
    userLat: number,
    userLng: number,
    clinicLat: number,
    clinicLng: number
  ): number => {
    const R = 6371; // Earth radius in km
    const dLat = ((clinicLat - userLat) * Math.PI) / 180;
    const dLng = ((clinicLng - userLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLat * Math.PI) / 180) *
        Math.cos((clinicLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Sort clinics by distance if user location available
  const sortedClinics = useMemo(() => {
    if (!userLocation) return countryClinics;
    return countryClinics
      .map((clinic) => ({
        clinic,
        distance: clinic.lat && clinic.lng
          ? computeDistance(userLocation.latitude, userLocation.longitude, clinic.lat, clinic.lng)
          : Infinity,
      }))
      .sort((a, b) => a.distance - b.distance)
      .map(({ clinic }) => clinic);
  }, [userLocation, countryClinics]);

  // Determine PEP urgency
  const pepStatus = useMemo(() => {
    if (timeSinceExposure === null) return null;
    if (timeSinceExposure <= 72) {
      return timeSinceExposure <= 2 ? "urgent" : "window";
    }
    return "closed";
  }, [timeSinceExposure]);

  // Request geolocation
  const requestGeolocation = () => {
    setGeoRequested(true);
    if (typeof window === "undefined" || !navigator.geolocation) {
      console.error("Geolocation not available");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
      }
    );
  };

  // Handle form submission
  const handleTriageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (timeSinceExposure === null) return;
    
    // Log navigator event
    logConversationMetric({
      timestamp: new Date().toISOString(),
      type: "conversation_request",
      durationMs: 0,
      language,
      countryCode,
      mode: "navigator_pep",
      requestLength: 0,
      responseLength: 0,
      modelUsed: "rule_based",
    });

    setViewMode("results");
  };

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 bg-zinc-950 px-4 py-6 text-zinc-50">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">
          {t(strings.navigator.title, language)}
        </h1>
        <p className="text-xs text-zinc-300">
          {t(strings.navigator.subtitle, language)} {guide.name}.
        </p>
        <div className="mt-2 rounded-lg border border-red-900 bg-red-950 px-3 py-2 text-[11px] text-red-100">
          {t(strings.navigator.disclaimer, language)}
        </div>
      </header>

      {/* Offline notice */}
      {!isOnline && (
        <div className="rounded-lg border border-yellow-900 bg-yellow-950 px-3 py-2 text-[11px] text-yellow-100">
          {t(strings.navigator.offlineNotice, language)}
        </div>
      )}

      {/* Triage form or results view */}
      {viewMode === "triage" ? (
        <section className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-xs">
          <p className="text-[11px] font-semibold uppercase text-emerald-300">
            {t(strings.navigator.exposureForm, language)}
          </p>

          <form onSubmit={handleTriageSubmit} className="space-y-4">
            {/* Time since exposure */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-100">
                {t(strings.navigator.timeSinceExposure, language)}
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={timeSinceExposure ?? ""}
                onChange={(e) => setTimeSinceExposure(e.target.value ? Number(e.target.value) : null)}
                placeholder={language === "fr" ? "p. ex., 24" : "e.g., 24"}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-[11px] text-zinc-100 outline-none"
              />
            </div>

            {/* Exposure type */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-100">
                {t(strings.navigator.exposureTypeLabel, language)}
              </label>
              <select
                value={exposureType}
                onChange={(e) => setExposureType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-[11px] text-zinc-100 outline-none"
              >
                <option value="penetrative">
                  {language === "fr" ? "Pénétration" : "Penetrative sex"}
                </option>
                <option value="condom_break">
                  {language === "fr" ? "Préservatif endommagé" : "Condom break"}
                </option>
                <option value="needle">
                  {language === "fr" ? "Piqûre d'aiguille" : "Needle stick"}
                </option>
              </select>
            </div>

            {/* Condom used */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="condom"
                checked={condomUsed}
                onChange={(e) => setCondomUsed(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              <label htmlFor="condom" className="text-[11px] font-semibold text-zinc-100">
                {t(strings.navigator.condomUsedLabel, language)}
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={timeSinceExposure === null}
              className="w-full rounded-lg bg-emerald-500 px-3 py-2 text-[11px] font-semibold text-zinc-950 disabled:opacity-60"
            >
              {t(strings.navigator.submit, language)}
            </button>
          </form>

          {/* PrEP/PEP guidance sections (always shown) */}
          <div className="mt-6 space-y-4 border-t border-zinc-800 pt-4">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase text-emerald-300">
                PrEP – preventing HIV before exposure
              </p>
              <h2 className="text-sm font-semibold text-zinc-50">{guide.prep.title}</h2>
              <div className="space-y-2">
                {guide.prep.steps.slice(0, 3).map((step) => (
                  <div
                    key={step.title}
                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
                  >
                    <p className="text-[11px] font-semibold text-zinc-100">{step.title}</p>
                    <p className="mt-1 text-[11px] text-zinc-300">{step.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Results view */
        <section className="space-y-4">
          {/* PEP status */}
          {pepStatus && (
            <div
              className={`rounded-lg border px-3 py-2 text-[11px] ${
                pepStatus === "urgent"
                  ? "border-red-800 bg-red-950 text-red-100"
                  : pepStatus === "window"
                  ? "border-yellow-800 bg-yellow-950 text-yellow-100"
                  : "border-zinc-800 bg-zinc-900 text-zinc-100"
              }`}
            >
              {pepStatus === "urgent" && t(strings.navigator.pepUrgent, language)}
              {pepStatus === "window" && t(strings.navigator.pepWindow, language)}
              {pepStatus === "closed" && t(strings.navigator.pepClosed, language)}
            </div>
          )}

          {/* Geolocation prompt */}
          {!userLocation && !geoRequested && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-3">
              <p className="text-[11px] font-semibold text-zinc-100">
                {t(strings.navigator.geoConsentTitle, language)}
              </p>
              <p className="mt-1 text-[11px] text-zinc-300">
                {t(strings.navigator.geoConsentBody, language)}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={requestGeolocation}
                  className="flex-1 rounded-lg bg-emerald-500/20 px-2 py-1 text-center text-[11px] font-semibold text-emerald-100"
                >
                  {t(strings.navigator.geoAllow, language)}
                </button>
                <button
                  onClick={() => setGeoRequested(true)}
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-[11px] font-semibold text-zinc-100"
                >
                  {t(strings.navigator.geoDeny, language)}
                </button>
              </div>
            </div>
          )}

          {/* View toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setMapActive(false)}
              className={`flex-1 rounded-lg px-3 py-2 text-[11px] font-semibold ${
                !mapActive
                  ? "bg-emerald-500 text-zinc-950"
                  : "border border-zinc-700 bg-zinc-900 text-zinc-100"
              }`}
            >
              {t(strings.navigator.listViewToggle, language)}
            </button>
            <button
              onClick={() => setMapActive(true)}
              className={`flex-1 rounded-lg px-3 py-2 text-[11px] font-semibold ${
                mapActive
                  ? "bg-emerald-500 text-zinc-950"
                  : "border border-zinc-700 bg-zinc-900 text-zinc-100"
              }`}
            >
              {t(strings.navigator.mapViewToggle, language)}
            </button>
          </div>

          {/* Clinic list view */}
          {!mapActive && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-zinc-300">
                {t(strings.navigator.nearestClinics, language)}
              </p>
              {sortedClinics.slice(0, 5).map((clinic) => (
                <ClinicCard key={clinic.id} clinic={clinic} language={language} />
              ))}
            </div>
          )}

          {/* Map placeholder (Mapbox to be integrated) */}
          {mapActive && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-6 text-center text-[11px] text-zinc-400">
              {language === "fr" ? "Carte à venir..." : "Map view coming soon..."}
              <p className="mt-2 text-[10px]">
                {language === "fr"
                  ? "Les cliniques seront affichées sur la carte interactive Mapbox."
                  : "Clinics will be displayed on an interactive Mapbox map."}
              </p>
            </div>
          )}

          {/* Back button */}
          <button
            onClick={() => {
              setViewMode("triage");
              setTimeSinceExposure(null);
            }}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-[11px] font-semibold text-zinc-100"
          >
            {language === "fr" ? "Retour à la forme" : "Back to form"}
          </button>
        </section>
      )}
    </main>
  );
}

/**
 * Clinic card component showing ratings, availability, and CTAs
 */
function ClinicCard({
  clinic,
  language,
}: {
  clinic: ServiceEntry;
  language: "en" | "fr";
}) {
  const ratingStars = (rating?: number) => {
    if (!rating) return "—";
    return "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
  };

  const availabilityBadge = (availability?: "high" | "medium" | "low" | "unknown") => {
    if (availability === "high") return "✓ High";
    if (availability === "medium") return "◐ Medium";
    if (availability === "low") return "✗ Low";
    return "? Unknown";
  };

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-3 text-[11px]">
      {/* Name & type */}
      <h3 className="font-semibold text-zinc-100">{clinic.name}</h3>
      <p className="text-[10px] text-zinc-400">{clinic.city}</p>

      {/* Ratings & availability */}
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

      {/* Notes */}
      <p className="mt-2 text-[10px] text-zinc-300">
        {language === "fr" ? clinic.notesFr : clinic.notesEn}
      </p>

      {/* CTA buttons */}
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

