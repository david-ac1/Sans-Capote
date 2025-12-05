"use client";

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { EnrichedServiceEntry } from '@/lib/places-api';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface InteractiveServiceMapProps {
  services: EnrichedServiceEntry[];
  userLocation?: { lat: number; lng: number } | null;
  selectedService?: EnrichedServiceEntry | null;
  onServiceClick: (service: EnrichedServiceEntry) => void;
  onMapClick?: (coordinates: { lat: number; lng: number }) => void;
  filters: {
    serviceTypes: string[];
    openNow: boolean;
    rating: number;
  };
  language: 'en' | 'fr';
  mapCenter?: { lat: number; lng: number; zoom: number };
}

export default function InteractiveServiceMap({
  services,
  userLocation,
  selectedService,
  onServiceClick,
  onMapClick,
  filters,
  language,
  mapCenter,
}: InteractiveServiceMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Check if token is available
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      setTimeout(() => {
        setMapError(
          language === 'fr'
            ? 'Token Mapbox manquant. Veuillez configurer NEXT_PUBLIC_MAPBOX_TOKEN.'
            : 'Mapbox token missing. Please configure NEXT_PUBLIC_MAPBOX_TOKEN.'
        );
      }, 0);
      return;
    }

    try {
      const initialCenter: [number, number] = mapCenter && mapCenter.lng !== undefined && mapCenter.lat !== undefined
        ? [mapCenter.lng, mapCenter.lat]
        : userLocation 
        ? [userLocation.lng, userLocation.lat]
        : [6.5244, 3.3792]; // Default to Lagos, Nigeria

      const initialZoom = mapCenter?.zoom || (userLocation ? 12 : 6);

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: initialCenter,
        zoom: initialZoom,
      });

      // Add error handler
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError(
          language === 'fr'
            ? 'Erreur de chargement de la carte. Le token Mapbox pourrait être invalide ou expiré.'
            : 'Map loading error. Mapbox token might be invalid or expired.'
        );
      });

      map.current.on('load', () => {
        setMapError(null); // Clear error on successful load
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        }),
        'top-right'
      );

      // Add click handler for map taps
      map.current.on('click', (e) => {
        if (onMapClick) {
          console.log('🗺️ Map clicked at:', e.lngLat.lat, e.lngLat.lng);
          onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
        }
      });
    } catch (error) {
      console.error('Failed to initialize map:', error);
      setTimeout(() => {
        setMapError(
          language === 'fr'
            ? 'Impossible d\'initialiser la carte. Vérifiez votre connexion internet.'
            : 'Failed to initialize map. Check your internet connection.'
        );
      }, 0);
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [userLocation, mapCenter, language]); // Re-center when user location or mapCenter changes

  // Update map center when mapCenter prop changes (country change)
  useEffect(() => {
    if (!map.current) {
      console.warn('⚠️ Map not initialized yet');
      return;
    }
    
    if (!mapCenter || mapCenter.lng === undefined || mapCenter.lat === undefined) {
      console.warn('⚠️ Invalid mapCenter:', mapCenter);
      return;
    }
    
    console.log('📍 Recentering map to:', mapCenter);
    
    try {
      // Force immediate update for debugging
      map.current.setCenter([mapCenter.lng, mapCenter.lat]);
      map.current.setZoom(mapCenter.zoom);
      
      // Then animate
      setTimeout(() => {
        if (map.current) {
          map.current.flyTo({
            center: [mapCenter.lng, mapCenter.lat],
            zoom: mapCenter.zoom,
            duration: 1500,
            essential: true,
          });
        }
      }, 100);
    } catch (error) {
      console.error('❌ Error recentering map:', error);
    }
  }, [mapCenter]);

  // Update user location marker
  useEffect(() => {
    if (!map.current || !userLocation) return;

    if (userMarker.current) {
      userMarker.current.setLngLat([userLocation.lng, userLocation.lat]);
    } else {
      const el = document.createElement('div');
      el.className = 'user-location-marker';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#3b82f6';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.5)';

      userMarker.current = new mapboxgl.Marker(el)
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
    }

    map.current.flyTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: 12,
      duration: 1500,
    });
  }, [userLocation]);

  // Filter services based on criteria
  const filteredServices = services.filter((service) => {
    // Filter by service type
    if (filters.serviceTypes.length > 0) {
      const hasMatchingType = filters.serviceTypes.some((type) => {
        const notes = (language === 'fr' ? service.notesFr : service.notesEn).toLowerCase();
        return notes.includes(type.toLowerCase());
      });
      if (!hasMatchingType) return false;
    }

    // Filter by open now
    if (filters.openNow && service.realTimeStatus) {
      // Use the pre-computed isOpen from realTimeStatus
      if (!service.realTimeStatus.isOpen) return false;
    }

    // Filter by minimum rating
    if (filters.rating > 0 && service.realTimeStatus) {
      if (!service.realTimeStatus.rating || service.realTimeStatus.rating < filters.rating) return false;
    }

    return true;
  });

  // Update service markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    console.log('🗺️ Rendering', filteredServices.length, 'service markers');

    // Add markers for filtered services
    filteredServices.forEach((service) => {
      // Validate coordinates
      if (!service.lat || !service.lng) {
        console.warn('⚠️ Service missing coordinates:', service.name);
        return;
      }
      
      // Validate coordinate ranges
      if (service.lat < -90 || service.lat > 90 || service.lng < -180 || service.lng > 180) {
        console.warn('⚠️ Invalid coordinates for:', service.name, service.lat, service.lng);
        return;
      }

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'service-marker';
      
      // Determine marker color based on status and source
      const isAiDiscovered = service.aiMetadata?.source === 'gemini';
      const isOpen = service.realTimeStatus?.isOpen;
      const rating = service.realTimeStatus?.rating || 0;
      
      let bgColor = '#6b7280'; // gray - default
      if (isAiDiscovered) {
        bgColor = '#f97316'; // orange - AI-discovered
      } else if (isOpen === true) {
        bgColor = '#10b981'; // green - open
      } else if (isOpen === false) {
        bgColor = '#ef4444'; // red - closed
      } else if (rating >= 4.5) {
        bgColor = '#f59e0b'; // amber - highly rated
      }

      el.style.width = '40px';
      el.style.height = '40px';
      el.style.borderRadius = '50% 50% 50% 0';
      el.style.backgroundColor = bgColor;
      el.style.border = isAiDiscovered ? '3px solid #fb923c' : '3px solid white';
      el.style.boxShadow = isAiDiscovered 
        ? '0 4px 16px rgba(249,115,22,0.6)' 
        : '0 4px 12px rgba(0,0,0,0.4)';
      el.style.cursor = 'pointer';
      el.style.transform = 'rotate(-45deg)';
      el.style.transition = 'all 0.2s';
      el.style.zIndex = isAiDiscovered ? '20' : '10'; // AI services on top
      
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'rotate(-45deg) scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'rotate(-45deg) scale(1)';
      });

      // Add icon or initial
      const iconDiv = document.createElement('div');
      iconDiv.style.transform = 'rotate(45deg)';
      iconDiv.style.width = '100%';
      iconDiv.style.height = '100%';
      iconDiv.style.display = 'flex';
      iconDiv.style.alignItems = 'center';
      iconDiv.style.justifyContent = 'center';
      iconDiv.style.color = 'white';
      iconDiv.style.fontWeight = 'bold';
      iconDiv.style.fontSize = '14px';
      iconDiv.textContent = '🏥'; // All services get clinic icon
      el.appendChild(iconDiv);

      // Highlight selected service
      if (selectedService && selectedService.id === service.id) {
        el.style.transform = 'rotate(-45deg) scale(1.3)';
        el.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.6)';
        el.style.border = '4px solid #3b82f6';
      }

      // Hover effect
      el.addEventListener('mouseenter', () => {
        if (!selectedService || selectedService.id !== service.id) {
          el.style.transform = 'rotate(-45deg) scale(1.2)';
        }
      });
      el.addEventListener('mouseleave', () => {
        if (!selectedService || selectedService.id !== service.id) {
          el.style.transform = 'rotate(-45deg) scale(1)';
        }
      });

      // Create popup
      const notes = language === 'fr' ? service.notesFr : service.notesEn;
      const statusText = isOpen === true 
        ? (language === 'fr' ? '🟢 Ouvert' : '🟢 Open') 
        : isOpen === false 
        ? (language === 'fr' ? '🔴 Fermé' : '🔴 Closed')
        : '';

      const popupContent = `
        <div style="padding: 8px; max-width: 250px;">
          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #111;">
            ${service.name}
          </h3>
          ${statusText ? `<p style="margin: 4px 0; font-size: 12px; font-weight: 600;">${statusText}</p>` : ''}
          ${rating > 0 ? `<p style="margin: 4px 0; font-size: 12px;">⭐ ${rating.toFixed(1)}</p>` : ''}
          ${service.realTimeStatus?.distance ? `<p style="margin: 4px 0; font-size: 12px;">📍 ${(service.realTimeStatus.distance / 1000).toFixed(1)} km</p>` : ''}
          <p style="margin: 4px 0; font-size: 12px; color: #666;">
            ${notes.substring(0, 100)}${notes.length > 100 ? '...' : ''}
          </p>
          ${service.phone ? `<p style="margin: 4px 0; font-size: 12px;">📞 ${service.phone}</p>` : ''}
          <button 
            onclick="window.dispatchEvent(new CustomEvent('service-details', { detail: '${service.id}' }))"
            style="margin-top: 8px; padding: 6px 12px; background: #10b981; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; width: 100%;"
          >
            ${language === 'fr' ? 'Voir détails' : 'View Details'}
          </button>
        </div>
      `;

      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: true,
        closeOnClick: false,
      }).setHTML(popupContent);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([service.lng, service.lat])
        .setPopup(popup)
        .addTo(map.current!);

      marker.getElement().addEventListener('click', () => {
        onServiceClick(service);
      });

      markers.current.push(marker);
    });

    // Fit bounds to show all markers
    if (filteredServices.length > 0 && map.current) {
      const bounds = new mapboxgl.LngLatBounds();
      let hasValidBounds = false;
      
      if (userLocation) {
        bounds.extend([userLocation.lng, userLocation.lat]);
        hasValidBounds = true;
      }

      filteredServices.forEach((service) => {
        if (service.lat && service.lng) {
          bounds.extend([service.lng, service.lat]);
          hasValidBounds = true;
        }
      });

      // Only fit bounds if we have at least one valid coordinate
      if (hasValidBounds) {
        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 14,
          duration: 1000,
        });
      }
    }
  }, [filteredServices, selectedService, language, userLocation, onServiceClick]);

  // Listen for service details events from popups
  useEffect(() => {
    const handleServiceDetails = (event: Event) => {
      const customEvent = event as CustomEvent;
      const serviceId = customEvent.detail;
      const service = services.find((s) => s.id === serviceId);
      if (service) {
        onServiceClick(service);
      }
    };

    window.addEventListener('service-details', handleServiceDetails);
    return () => window.removeEventListener('service-details', handleServiceDetails);
  }, [services, onServiceClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs">
        <div className="font-semibold mb-2 text-zinc-900">
          {language === 'fr' ? 'Légende' : 'Legend'}
        </div>
        <div className="space-y-1 text-zinc-700">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-orange-400"></div>
            <span>{language === 'fr' ? '✨ Découvert par IA' : '✨ AI-discovered'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>{language === 'fr' ? 'Ouvert' : 'Open now'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>{language === 'fr' ? 'Fermé' : 'Closed'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500"></div>
            <span>{language === 'fr' ? 'Très bien noté' : 'Highly rated'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>{language === 'fr' ? 'Votre position' : 'Your location'}</span>
          </div>
        </div>
      </div>

      {/* Service count */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 text-sm font-medium text-zinc-900">
        {filteredServices.length} {language === 'fr' ? 'services trouvés' : 'services found'}
      </div>

      {/* Map error display */}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 rounded-lg">
          <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-xl max-w-md text-center">
            <div className="text-2xl mb-2">⚠️</div>
            <p className="font-medium mb-2">
              {language === 'fr' ? 'Erreur de carte' : 'Map Error'}
            </p>
            <p className="text-sm opacity-90">{mapError}</p>
            <p className="text-xs mt-3 opacity-75">
              {language === 'fr'
                ? 'Utilisez la vue liste comme alternative'
                : 'Use list view as an alternative'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
