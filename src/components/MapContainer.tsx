"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ServiceEntry } from "../data/servicesDirectory";

export default function MapContainer({
  clinics,
  userLocation,
  countryCenter,
  height = 400,
}: {
  clinics: ServiceEntry[];
  userLocation?: { lat: number; lng: number } | null;
  countryCenter?: { lat: number; lng: number } | null;
  height?: number;
}) {
  const container = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!container.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;
    mapboxgl.accessToken = token;

    mapRef.current = new mapboxgl.Map({
      container: container.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [(countryCenter?.lng ?? clinics[0]?.lng ?? 0), (countryCenter?.lat ?? clinics[0]?.lat ?? 0)],
      zoom: userLocation ? 12 : 6,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl());

    if (userLocation) {
      new mapboxgl.Marker({ color: "#4F46E5" })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(new mapboxgl.Popup().setText("📍 Your location"))
        .addTo(mapRef.current);
    }

    const addedMarkers: mapboxgl.Marker[] = [];
    clinics.forEach((clinic) => {
      if (!clinic.lat || !clinic.lng) return;
      let color = "#9CA3AF";
      if (clinic.pepAvailability === "high") color = "#10B981";
      else if (clinic.pepAvailability === "medium") color = "#F59E0B";
      else if (clinic.pepAvailability === "low") color = "#EF4444";

      const marker = new mapboxgl.Marker({ color })
        .setLngLat([clinic.lng, clinic.lat])
        .setPopup(
          new mapboxgl.Popup({ closeButton: true }).setHTML(`
            <div class="text-xs max-w-xs p-2">
              <h3 class="font-bold text-sm">${clinic.name}</h3>
              <p class="text-gray-600 text-xs">${clinic.city}</p>
            </div>
          `)
        )
        .addTo(mapRef.current!);
      addedMarkers.push(marker);
    });

    return () => {
      addedMarkers.forEach((m) => m.remove());
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [clinics, userLocation, countryCenter]);

  return <div ref={container} style={{ width: "100%", height }} className="bg-zinc-800" />;
}
