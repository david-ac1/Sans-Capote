import { useState, useEffect } from 'react';
import { ServiceEntry } from '../data/servicesDirectory';
import { 
  enrichServicesWithPlaces, 
  sortServicesByAvailability,
  EnrichedServiceEntry 
} from '../lib/places-api';

export type { EnrichedServiceEntry } from '../lib/places-api';

interface UsePlacesOptions {
  enabled?: boolean;
  userLocation?: { lat: number; lng: number } | null;
  autoSort?: boolean;
}

export function usePlacesEnrichment(
  services: ServiceEntry[],
  options: UsePlacesOptions = {}
) {
  const { enabled = true, userLocation, autoSort = true } = options;
  const [enrichedServices, setEnrichedServices] = useState<EnrichedServiceEntry[]>(services);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || services.length === 0) {
      setEnrichedServices(services);
      return;
    }

    let cancelled = false;

    async function enrich() {
      setIsLoading(true);
      setError(null);

      try {
        const enriched = await enrichServicesWithPlaces(
          services,
          userLocation ?? undefined
        );

        if (!cancelled) {
          const sorted = autoSort 
            ? sortServicesByAvailability(enriched)
            : enriched;
          setEnrichedServices(sorted);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setEnrichedServices(services);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    enrich();

    return () => {
      cancelled = true;
    };
  }, [services, enabled, userLocation, autoSort]);

  return {
    services: enrichedServices,
    isLoading,
    error,
  };
}
