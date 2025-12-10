import { ServiceEntry } from '../data/servicesDirectory';

interface PlaceDetails {
  isOpen?: boolean;
  openingHours?: string[];
  currentStatus?: 'OPEN' | 'CLOSED' | 'UNKNOWN';
  distance?: number; // in meters
  rating?: number;
  userRatingsTotal?: number;
  formattedAddress?: string;
  formattedPhoneNumber?: string;
  website?: string;
  placeId?: string;
}

export interface EnrichedServiceEntry extends ServiceEntry {
  realTimeStatus?: PlaceDetails;
}

/**
 * Search for a place using Google Places API Text Search (via server endpoint)
 */
async function searchPlace(
  name: string,
  location: { lat: number; lng: number },
  radius: number = 5000
): Promise<string | null> {
  try {
    const response = await fetch('/api/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'search',
        query: name,
        location,
        radius,
      }),
    });

    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      return data.results[0].place_id;
    }

    return null;
  } catch (error) {
    console.error('Error searching place:', error);
    return null;
  }
}

/**
 * Get detailed information about a place including current open status (via server endpoint)
 */
async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  try {
    const response = await fetch('/api/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'details',
        placeId,
      }),
    });

    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      const result = data.result;
      const openingHours = result.opening_hours;

      return {
        isOpen: openingHours?.open_now,
        openingHours: openingHours?.weekday_text || [],
        currentStatus: openingHours?.open_now === true 
          ? 'OPEN' 
          : openingHours?.open_now === false 
          ? 'CLOSED' 
          : 'UNKNOWN',
        rating: result.rating,
        userRatingsTotal: result.user_ratings_total,
        formattedAddress: result.formatted_address,
        formattedPhoneNumber: result.formatted_phone_number,
        website: result.website,
        placeId,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Enrich a single service entry with real-time Google Places data
 */
export async function enrichServiceWithPlaces(
  service: ServiceEntry,
  userLocation?: { lat: number; lng: number }
): Promise<EnrichedServiceEntry> {
  // Calculate distance if user location provided
  let distance: number | undefined;
  if (userLocation && service.lat && service.lng) {
    distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      service.lat,
      service.lng
    );
  }

  // Skip Places API lookup if no coordinates
  if (!service.lat || !service.lng) {
    return {
      ...service,
      realTimeStatus: distance ? { distance } : undefined,
    };
  }

  try {
    // Search for the place
    const placeId = await searchPlace(
      service.name,
      { lat: service.lat, lng: service.lng },
      1000 // 1km radius
    );

    if (!placeId) {
      return {
        ...service,
        realTimeStatus: distance ? { distance } : undefined,
      };
    }

    // Get detailed info
    const details = await getPlaceDetails(placeId);

    return {
      ...service,
      realTimeStatus: {
        ...details,
        distance,
      },
    };
  } catch (error) {
    console.error(`Error enriching service ${service.id}:`, error);
    return {
      ...service,
      realTimeStatus: distance ? { distance } : undefined,
    };
  }
}

/**
 * Enrich multiple services in parallel (with rate limiting)
 */
export async function enrichServicesWithPlaces(
  services: ServiceEntry[],
  userLocation?: { lat: number; lng: number },
  maxConcurrent: number = 5
): Promise<EnrichedServiceEntry[]> {
  const results: EnrichedServiceEntry[] = [];

  // Process in batches to avoid rate limits
  for (let i = 0; i < services.length; i += maxConcurrent) {
    const batch = services.slice(i, i + maxConcurrent);
    const enrichedBatch = await Promise.all(
      batch.map(service => enrichServiceWithPlaces(service, userLocation))
    );
    results.push(...enrichedBatch);

    // Small delay between batches
    if (i + maxConcurrent < services.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return results;
}

/**
 * Sort services by priority (open now + closest first)
 */
export function sortServicesByAvailability(
  services: EnrichedServiceEntry[]
): EnrichedServiceEntry[] {
  return [...services].sort((a, b) => {
    // Priority 1: Open now
    const aOpen = a.realTimeStatus?.currentStatus === 'OPEN' ? 1 : 0;
    const bOpen = b.realTimeStatus?.currentStatus === 'OPEN' ? 1 : 0;
    if (aOpen !== bOpen) return bOpen - aOpen;

    // Priority 2: Distance (if available)
    const aDist = a.realTimeStatus?.distance ?? Infinity;
    const bDist = b.realTimeStatus?.distance ?? Infinity;
    if (aDist !== bDist) return aDist - bDist;

    // Priority 3: Rating
    const aRating = a.realTimeStatus?.rating ?? 0;
    const bRating = b.realTimeStatus?.rating ?? 0;
    return bRating - aRating;
  });
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Get human-readable status
 */
export function getStatusText(
  status?: 'OPEN' | 'CLOSED' | 'UNKNOWN',
  language: 'en' | 'fr' | 'sw' = 'en'
): string {
  if (!status || status === 'UNKNOWN') {
    return language === 'fr' ? 'Horaires inconnus' : 'Hours unknown';
  }
  if (status === 'OPEN') {
    return language === 'fr' ? '🟢 Ouvert maintenant' : '🟢 Open now';
  }
  return language === 'fr' ? '🔴 Fermé' : '🔴 Closed';
}
