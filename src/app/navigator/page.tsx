"use client";

import { useEffect, useState, useMemo } from "react";
import { useSettings } from "../settings-provider";
import { servicesDirectory } from "../../data/servicesDirectory";
import type { ServiceEntry } from "../../data/servicesDirectory";
import { strings, t } from "../../i18n/strings";
import { usePlacesEnrichment } from "../../hooks/usePlacesEnrichment";
import InteractiveServiceMap from "../../components/InteractiveServiceMap";
import ServiceDetailsPanel from "../../components/ServiceDetailsPanel";
import type { EnrichedServiceEntry } from "@/lib/places-api";
import { 
  discoverServices, 
  deduplicateServices,
  type AIDiscoveredService 
} from "@/lib/ai-service-discovery";
import { getServiceRatings, type ServiceRatingAggregate } from "@/lib/supabase";

// Country center coordinates for map positioning
const COUNTRY_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
  NG: { lat: 9.0820, lng: 8.6753, zoom: 6 }, // Nigeria (Abuja)
  KE: { lat: -1.2864, lng: 36.8172, zoom: 7 }, // Kenya (Nairobi)
  UG: { lat: 0.3476, lng: 32.5825, zoom: 7 }, // Uganda (Kampala)
  ZA: { lat: -30.5595, lng: 22.9375, zoom: 6 }, // South Africa (Cape Town)
  RW: { lat: -1.9403, lng: 29.8739, zoom: 9 }, // Rwanda (Kigali)
  GH: { lat: 5.6037, lng: -0.1870, zoom: 7 }, // Ghana (Accra)
};

// Helper function to check if a service is currently open
function isServiceOpen(service: EnrichedServiceEntry): boolean {
  // First check Google Places real-time status
  if (service.realTimeStatus?.isOpen !== undefined) {
    return service.realTimeStatus.isOpen;
  }
  
  // Fallback to parsing hours string
  if (!service.hours) {
    // Assume open if we have no hours data (24/7 or unknown)
    return true;
  }
  
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute; // Total minutes since midnight
  
  const hoursStr = service.hours.toLowerCase();
  
  // Check for 24/7
  if (hoursStr.includes('24/7') || hoursStr.includes('24 hours') || hoursStr.includes('24h')) {
    return true;
  }
  
  // Parse common patterns like "Mon-Fri 8am-5pm" or "Mon-Sat 9am-5pm"
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const currentDayName = dayNames[currentDay];
  
  // Check if today is mentioned in the hours string
  const hasDayRange = hoursStr.match(/(mon|tue|wed|thu|fri|sat|sun)(?:-|\s*to\s*)(mon|tue|wed|thu|fri|sat|sun)/);
  const hasSingleDay = hoursStr.match(/(mon|tue|wed|thu|fri|sat|sun)(?!-)/);
  
  let isToday = false;
  
  if (hasDayRange) {
    const [_, startDay, endDay] = hasDayRange;
    const startIndex = dayNames.indexOf(startDay);
    const endIndex = dayNames.indexOf(endDay);
    
    if (startIndex <= endIndex) {
      isToday = currentDay >= startIndex && currentDay <= endIndex;
    } else {
      // Wraps around (e.g., Sat-Mon)
      isToday = currentDay >= startIndex || currentDay <= endIndex;
    }
  } else if (hasSingleDay) {
    isToday = hoursStr.includes(currentDayName);
  } else {
    // If no day specified, assume it applies to all days
    isToday = true;
  }
  
  if (!isToday) {
    return false;
  }
  
  // Parse time ranges like "8am-5pm" or "9:00-17:00"
  const timeMatch = hoursStr.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*-\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  
  if (timeMatch) {
    const [_, startHourStr, startMinStr = '0', startPeriod, endHourStr, endMinStr = '0', endPeriod] = timeMatch;
    
    let startHour = parseInt(startHourStr);
    let endHour = parseInt(endHourStr);
    const startMin = parseInt(startMinStr);
    const endMin = parseInt(endMinStr);
    
    // Convert to 24-hour format
    if (startPeriod === 'pm' && startHour !== 12) startHour += 12;
    if (startPeriod === 'am' && startHour === 12) startHour = 0;
    if (endPeriod === 'pm' && endHour !== 12) endHour += 12;
    if (endPeriod === 'am' && endHour === 12) endHour = 0;
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    return currentTime >= startTime && currentTime <= endTime;
  }
  
  // If we can't parse, assume open (better UX than filtering out)
  return true;
}

export default function NavigatorPage() {
  const { language, countryCode, setCountryCode } = useSettings();
  
  // View state
  const [showMap, setShowMap] = useState(true);
  const [selectedService, setSelectedService] = useState<EnrichedServiceEntry | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showEmptyState, setShowEmptyState] = useState(false);
  
  // Filter state - Initialize from countryCode but maintain independent state
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    // Check URL params first, then settings, then default
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('country') || countryCode || "NG";
    }
    return countryCode || "NG";
  });
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number; zoom: number }>(() => 
    COUNTRY_CENTERS[selectedCountry] || COUNTRY_CENTERS.NG
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    serviceTypes: [] as string[],
    openNow: false,
    rating: 0,
    communityRating: 0, // Minimum community rating (0-5)
    judgementFree: false, // Only show judgement-free services
  });
  
  // Community ratings cache
  const [communityRatings, setCommunityRatings] = useState<Map<string, ServiceRatingAggregate>>(new Map());
  const [loadingCommunityRatings, setLoadingCommunityRatings] = useState(false);
  
  // AI discovery state
  const [aiServices, setAiServices] = useState<AIDiscoveredService[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Filter services by country
  const countryServices = useMemo(() => {
    return servicesDirectory.filter((s) => s.country === selectedCountry);
  }, [selectedCountry]);
  
  // Convert AI services to ServiceEntry format for merging
  const aiServicesAsEntries = useMemo((): ServiceEntry[] => {
    if (aiServices.length === 0) return [];
    
    return aiServices.map((aiService, index) => ({
      id: `ai_${selectedCountry}_${index}`,
      country: selectedCountry as import('@/data/countryGuides').CountryCode,
      city: aiService.city || 'Unknown',
      name: aiService.name,
      type: 'ngo' as const, // Default type for AI-discovered
      services: {
        hivTesting: aiService.metadata.hivTestingAvailable,
        pep: aiService.metadata.pepAvailable,
        prep: aiService.metadata.prepAvailable,
        sti: aiService.metadata.stiPanelAvailable,
        mentalHealth: aiService.metadata.peerSupportPresent,
      },
      notesEn: aiService.metadata.reasoning || 'AI-discovered service',
      notesFr: aiService.metadata.reasoning || 'Service découvert par IA',
      lat: aiService.lat,
      lng: aiService.lng,
      phone: aiService.phone,
      website: aiService.website,
      hours: aiService.hours,
      lgbtqiaFriendly: aiService.metadata.lgbtFriendlyScore,
      aiMetadata: aiService.metadata,
    }));
  }, [aiServices, selectedCountry]);
  
  // Merge directory + AI services
  const mergedServices = useMemo(() => {
    return [...countryServices, ...aiServicesAsEntries];
  }, [countryServices, aiServicesAsEntries]);

  // Enrich with Google Places data
  const { services: enrichedServices, isLoading } = usePlacesEnrichment(
    mergedServices,
    {
      enabled: true,
      userLocation,
      autoSort: true,
    }
  );

  // Apply search and filters
  const filteredServices = useMemo(() => {
    let results = enrichedServices;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter((service) => {
        const searchText = `${service.name} ${service.city} ${service.notesEn} ${service.notesFr}`.toLowerCase();
        return searchText.includes(query);
      });
    }

    // Service type filter
    if (filters.serviceTypes.length > 0) {
      results = results.filter((service) => {
        const notes = (language === 'fr' ? service.notesFr : service.notesEn).toLowerCase();
        
        return filters.serviceTypes.some((type) => {
          // Map service types to search terms
          const searchTerms: Record<string, string[]> = {
            prep: ['prep', 'pre-exposure', 'prophylaxis', 'prevention'],
            pep: ['pep', 'post-exposure', 'emergency'],
            testing: ['test', 'testing', 'dépistage', 'screening', 'hiv test'],
            treatment: ['treatment', 'traitement', 'art', 'antiretroviral', 'arv'],
            counseling: ['counsel', 'conseil', 'support', 'therapy', 'psycho'],
            lgbtqia: ['lgbt', 'lgbtq', 'gay', 'lesbian', 'trans', 'queer', 'friendly', 'inclusive', 'welcoming', 'safe space', 'affirming', 'non-discriminat'],
          };
          const terms = searchTerms[type] || [type];
          
          // For inclusive filter, also check lgbtqiaFriendly score
          if (type === 'lgbtqia') {
            const hasInclusiveScore = service.lgbtqiaFriendly && service.lgbtqiaFriendly >= 3;
            const hasInclusiveTerms = terms.some(term => notes.includes(term));
            return hasInclusiveScore || hasInclusiveTerms;
          }
          
          return terms.some(term => notes.includes(term));
        });
      });
    }

    // Open now filter
    if (filters.openNow) {
      results = results.filter((service) => {
        return isServiceOpen(service);
      });
    }

    // Rating filter (Google Places)
    if (filters.rating > 0) {
      results = results.filter((service) => {
        const rating = service.realTimeStatus?.rating || 0;
        return rating >= filters.rating;
      });
    }

    // Community rating filter
    if (filters.communityRating > 0) {
      results = results.filter((service) => {
        const communityRating = communityRatings.get(service.id);
        if (!communityRating) return false;
        
        // Use average of all rating categories
        const avgRating = (
          communityRating.avg_friendliness + 
          communityRating.avg_privacy + 
          communityRating.avg_wait_time
        ) / 3;
        
        return avgRating >= filters.communityRating;
      });
    }

    // Judgement-free filter
    if (filters.judgementFree) {
      results = results.filter((service) => {
        const communityRating = communityRatings.get(service.id);
        if (!communityRating) return false;
        
        // Show services with >75% judgement-free rating
        return communityRating.judgement_free_percentage >= 75;
      });
    }

    return results;
  }, [enrichedServices, searchQuery, filters, language, communityRatings]);

  // Request user location
  const requestLocation = () => {
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError(
        language === 'fr'
          ? "La géolocalisation n'est pas supportée par votre navigateur"
          : "Geolocation is not supported by your browser"
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError(
          language === 'fr'
            ? "Impossible d'obtenir votre position. Veuillez activer la géolocalisation."
            : "Unable to get your location. Please enable location services."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  };

  // Request location on mount
  useEffect(() => {
    if (userLocation || locationError) return;
    
    // Use timeout to avoid React's setState-in-effect warning
    const timer = setTimeout(() => {
      if (!navigator.geolocation) {
        setLocationError(
          language === 'fr'
            ? "La géolocalisation n'est pas supportée par votre navigateur"
            : "Geolocation is not supported by your browser"
        );
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError(
            language === 'fr'
              ? "Impossible d'obtenir votre position. Veuillez activer la géolocalisation."
              : "Unable to get your location. Please enable location services."
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // Cache for 5 minutes
        }
      );
    }, 0);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync with settings countryCode changes (only on initial mount)
  useEffect(() => {
    // Only sync if user hasn't manually selected a country yet
    if (countryCode && !window.sessionStorage.getItem('manualCountrySelection')) {
      if (countryCode !== selectedCountry) {
        console.log('🔄 Syncing from settings:', countryCode);
        setSelectedCountry(countryCode);
        setMapCenter(COUNTRY_CENTERS[countryCode] || COUNTRY_CENTERS.NG);
      }
    }
  }, [countryCode]); // Only depend on countryCode, not selectedCountry

  // Update map center when country changes
  useEffect(() => {
    const center = COUNTRY_CENTERS[selectedCountry];
    if (!center) {
      console.error('❌ No center found for country:', selectedCountry);
      setMapCenter(COUNTRY_CENTERS.NG);
      return;
    }
    console.log('🗺️ Updating map center for', selectedCountry, ':', center);
    setMapCenter(center);
  }, [selectedCountry]);

  // Smart empty state - only show if no coordinates in DIRECTORY services
  useEffect(() => {
    setShowEmptyState(false);
    
    // Only check directory services (not AI services which load async)
    const servicesWithCoords = countryServices.filter(s => s.lat && s.lng);
    
    console.log(`📊 ${selectedCountry}: ${countryServices.length} directory services, ${servicesWithCoords.length} with coordinates`);
    
    // Only start timer if we have directory services but none have coordinates
    if (countryServices.length > 0 && servicesWithCoords.length === 0) {
      // Show message after 2 seconds
      const showTimer = setTimeout(() => {
        const currentServices = servicesDirectory.filter(s => s.country === selectedCountry);
        const currentWithCoords = currentServices.filter(s => s.lat && s.lng);
        if (currentWithCoords.length === 0) {
          console.log('⚠️ Showing empty state for', selectedCountry);
          setShowEmptyState(true);
          
          // Auto-hide after 5-10 seconds (based on service count)
          const hideDelay = Math.min(10000, Math.max(5000, currentServices.length * 800));
          const hideTimer = setTimeout(() => {
            console.log('✅ Auto-hiding empty state after', hideDelay / 1000, 'seconds');
            setShowEmptyState(false);
          }, hideDelay);
          
          return () => clearTimeout(hideTimer);
        }
      }, 2000);
      return () => clearTimeout(showTimer);
    } else if (servicesWithCoords.length > 0) {
      // If we have coordinates, never show empty state
      console.log('✅ Has coordinates, hiding empty state');
      setShowEmptyState(false);
    }
  }, [selectedCountry, countryServices]);

  // Load community ratings for visible services
  useEffect(() => {
    async function loadCommunityRatings() {
      if (countryServices.length === 0) return;
      
      setLoadingCommunityRatings(true);
      console.log('📊 Loading community ratings for', countryServices.length, 'services...');
      
      const ratingsMap = new Map<string, ServiceRatingAggregate>();
      
      // Load ratings for all services in current country
      await Promise.all(
        countryServices.map(async (service) => {
          const rating = await getServiceRatings(service.id);
          if (rating) {
            ratingsMap.set(service.id, rating);
          }
        })
      );
      
      console.log('✅ Loaded', ratingsMap.size, 'community ratings');
      setCommunityRatings(ratingsMap);
      setLoadingCommunityRatings(false);
    }
    
    loadCommunityRatings();
  }, [countryServices]);
  
  // AI service discovery (hybrid approach)
  const discoverAiServices = async () => {
    if (aiLoading) return;
    
    setAiLoading(true);
    
    try {
      console.log('🔍 Discovering AI services for', selectedCountry);
      
      // Build filter criteria from current filters
      const discoveryFilters = {
        lgbtFriendly: filters.serviceTypes.includes('lgbtqia+'),
        hivTesting: filters.serviceTypes.includes('testing'),
        prepServices: filters.serviceTypes.includes('prep'),
        pepServices: filters.serviceTypes.includes('pep'),
        walkInAvailable: true, // Prefer walk-in
        youthFriendly: true,
        lowCost: true,
      };
      
      // Discover new services via Gemini
      const discovered = await discoverServices(
        selectedCountry as import('@/data/countryGuides').CountryCode,
        discoveryFilters,
        language
      );
      
      console.log(`🤖 AI discovered ${discovered.length} services`);
      
      // Deduplicate against directory
      const unique = deduplicateServices(countryServices, discovered);
      console.log(`✅ ${unique.length} unique AI services after deduplication`);
      
      setAiServices(unique);
      
      console.log('✨ Discovered', unique.length, 'new AI services');
    } catch (error) {
      console.error('AI discovery failed:', error);
      alert(
        language === 'fr'
          ? '❌ Échec de la découverte IA. Affichage des services du répertoire uniquement.'
          : '❌ AI discovery failed. Showing directory services only.'
      );
    } finally {
      setAiLoading(false);
    }
  };

  // Available service types for filtering
  const serviceTypes = [
    { value: 'prep', label: language === 'fr' ? 'PrEP' : 'PrEP' },
    { value: 'pep', label: language === 'fr' ? 'PEP' : 'PEP' },
    { value: 'testing', label: language === 'fr' ? 'Dépistage' : 'Testing' },
    { value: 'treatment', label: language === 'fr' ? 'Traitement' : 'Treatment' },
    { value: 'counseling', label: language === 'fr' ? 'Conseil' : 'Counseling' },
    { value: 'lgbtqia', label: language === 'fr' ? 'Inclusif' : 'Inclusive' },
  ];



  // Handle map clicks to update location
  const handleMapClick = (coordinates: { lat: number; lng: number }) => {
    console.log('🗺️ Map clicked at:', coordinates);
    
    // Don't auto-switch countries on map clicks - this causes confusion
    // Users should explicitly change country via the dropdown selector
    // Just zoom to the clicked location within the current country
    
    setMapCenter({
      lat: coordinates.lat,
      lng: coordinates.lng,
      zoom: 12, // Zoom in on tapped location
    });
  };

  // Available countries
  const countries = Array.from(new Set(servicesDirectory.map((s) => s.country))).sort();

  const toggleServiceType = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(type)
        ? prev.serviceTypes.filter((t) => t !== type)
        : [...prev.serviceTypes, type],
    }));
  };

  const handleCountryChange = (newCountry: string) => {
    console.log('🌍 Country change requested:', selectedCountry, '→', newCountry);
    
    // Prevent no-op changes
    if (newCountry === selectedCountry) {
      console.log('ℹ️ Same country, skipping');
      return;
    }
    
    // Mark as manual selection FIRST to prevent override
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('manualCountrySelection', 'true');
      console.log('✅ Marked as manual selection');
    }
    
    // Update all states atomically
    const newCenter = COUNTRY_CENTERS[newCountry];
    if (!newCenter) {
      console.error('❌ Invalid country code:', newCountry);
      return;
    }
    
    console.log('🎯 New map center:', newCenter);
    setSelectedCountry(newCountry);
    setMapCenter(newCenter);
    
    // Clear selected service and AI services
    setSelectedService(null);
    setAiServices([]);
    
    // Update settings context (global state)
    if (setCountryCode) {
      setCountryCode(newCountry as import('@/data/countryGuides').CountryCode);
    }
    
    // Update URL params (survives refresh)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('country', newCountry);
      window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
      console.log('🔗 Updated URL:', `${window.location.pathname}?${params}`);
    }
    
    // Debug: Log service coordinates
    setTimeout(() => {
      const countryServices = servicesDirectory.filter(s => s.country === newCountry);
      const withCoords = countryServices.filter(s => s.lat && s.lng);
      console.log(`📊 ${newCountry}: ${countryServices.length} total, ${withCoords.length} with coordinates`);
      if (withCoords.length > 0) {
        console.log('Sample:', withCoords.slice(0, 2).map(s => ({ name: s.name, lat: s.lat, lng: s.lng })));
      } else {
        console.warn('⚠️ No services with coordinates in', newCountry);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="bg-white border-b border-[#222222]/10 px-6 py-5 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-[#008080]">
                  {t(strings.navigator.title, language)}
                </h1>
                <p className="text-sm text-[#555555] mt-1">
                  {language === 'fr'
                    ? 'Trouvez des services de santé près de chez vous'
                    : 'Find HIV services near you'}
                </p>
              </div>
              
              {/* View toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMap(true)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${
                    showMap
                      ? 'bg-[#008080] text-white'
                      : 'bg-white border border-[#222222]/20 text-[#555555] hover:border-[#008080]'
                  }`}
                >
                  <span className="hidden sm:inline">
                    {language === 'fr' ? '🗺️ Carte' : '🗺️ Map'}
                  </span>
                  <span className="sm:hidden">🗺️</span>
                </button>
                <button
                  onClick={() => setShowMap(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    !showMap
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <span className="hidden sm:inline">
                    {language === 'fr' ? '📋 Liste' : '📋 List'}
                  </span>
                  <span className="sm:hidden">📋</span>
                </button>
              </div>
            </div>

            {/* Search and filters */}
            <div className="space-y-3">
              {/* Search bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    language === 'fr'
                      ? 'Rechercher des services...'
                      : 'Search for services...'
                  }
                  className="w-full px-4 py-2 pl-10 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Results counter */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">
                  {filteredServices.length === 0 ? (
                    language === 'fr' ? '❌ Aucun service trouvé' : '❌ No services found'
                  ) : (
                    <>
                      {filteredServices.length} {language === 'fr' ? 'service(s) trouvé(s)' : 'service(s) found'}
                      {filters.openNow && (
                        <span className="ml-2 text-green-400">
                          🟢 {language === 'fr' ? 'ouvert(s) maintenant' : 'open now'}
                        </span>
                      )}
                    </>
                  )}
                </span>
                {(filters.serviceTypes.length > 0 || filters.openNow || filters.rating > 0 || filters.communityRating > 0 || filters.judgementFree || searchQuery) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilters({
                        serviceTypes: [],
                        openNow: false,
                        rating: 0,
                        communityRating: 0,
                        judgementFree: false,
                      });
                    }}
                    className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    {language === 'fr' ? 'Réinitialiser' : 'Clear filters'}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Country selector with visual feedback */}
                <div className="relative">
                  <select
                    value={selectedCountry}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-zinc-800 border-2 border-emerald-600 rounded-lg text-sm text-white font-medium focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer hover:bg-zinc-750 transition-colors"
                  >
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none">
                    📍
                  </span>
                </div>

                {/* Service type filters */}
                {serviceTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => toggleServiceType(type.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filters.serviceTypes.includes(type.value)
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}

                {/* Open now filter */}
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, openNow: !prev.openNow }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filters.openNow
                      ? 'bg-green-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {language === 'fr' ? '🟢 Ouvert' : '🟢 Open Now'}
                </button>

                {/* Rating filter (Google) */}
                <select
                  value={filters.rating}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, rating: Number(e.target.value) }))
                  }
                  className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={0}>{language === 'fr' ? 'Note Google' : 'Google Rating'}</option>
                  <option value={4.5}>⭐ 4.5+</option>
                  <option value={4.0}>⭐ 4.0+</option>
                  <option value={3.5}>⭐ 3.5+</option>
                </select>

                {/* Community rating filter */}
                <select
                  value={filters.communityRating}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, communityRating: Number(e.target.value) }))
                  }
                  disabled={loadingCommunityRatings}
                  className="px-3 py-1.5 bg-purple-800 border border-purple-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  <option value={0}>
                    {loadingCommunityRatings 
                      ? (language === 'fr' ? '⏳ Chargement...' : '⏳ Loading...')
                      : (language === 'fr' ? 'Note communauté' : 'Community Rating')
                    }
                  </option>
                  <option value={4.5}>💜 4.5+</option>
                  <option value={4.0}>💜 4.0+</option>
                  <option value={3.5}>💜 3.5+</option>
                  <option value={3.0}>💜 3.0+</option>
                </select>

                {/* Judgement-free filter */}
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, judgementFree: !prev.judgementFree }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filters.judgementFree
                      ? 'bg-amber-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {language === 'fr' ? '🤝 Sans jugement' : '🤝 Non-Judgmental'}
                </button>

                {/* Location button */}
                <button
                  onClick={requestLocation}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  title={language === 'fr' ? 'Utiliser ma position' : 'Use my location'}
                >
                  📍 {language === 'fr' ? 'Ma position' : 'My Location'}
                </button>
                
                {/* AI Discovery button */}
                <button
                  onClick={discoverAiServices}
                  disabled={aiLoading}
                  className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={language === 'fr' ? 'Découvrir nouveaux services' : 'Discover new services'}
                >
                  {aiLoading ? '⏳' : '🔍'} {language === 'fr' ? 'Découvrir' : 'Discover'}
                </button>
              </div>

              {/* Location error */}
              {locationError && (
                <div className="text-sm text-red-400 bg-red-950/50 px-3 py-2 rounded-lg">
                  {locationError}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 overflow-hidden flex">
          {showMap ? (
            /* Map view */
            <div className="flex-1 relative">
              <InteractiveServiceMap
                services={filteredServices}
                userLocation={userLocation}
                selectedService={selectedService}
                onServiceClick={setSelectedService}
                onMapClick={handleMapClick}
                filters={filters}
                language={language}
                mapCenter={mapCenter}
              />

              {/* Service details panel (overlay on mobile, sidebar on desktop) */}
              {selectedService && (
                <div className="absolute top-4 right-4 w-full max-w-md h-[calc(100vh-2rem)] z-10 hidden lg:block">
                  <ServiceDetailsPanel
                    service={selectedService}
                    language={language}
                    onClose={() => setSelectedService(null)}
                    userLocation={userLocation}
                    isLoading={isLoading}
                    isDraggable={true}
                  />
                </div>
              )}

              {/* Mobile details panel (full screen) */}
              {selectedService && (
                <div className="absolute inset-0 bg-black/50 z-20 lg:hidden flex items-end">
                  <div className="w-full h-[85vh] flex flex-col">
                    <ServiceDetailsPanel
                      service={selectedService}
                      language={language}
                      onClose={() => setSelectedService(null)}
                      userLocation={userLocation}
                      isLoading={isLoading}
                    />
                  </div>
                </div>
              )}

              {/* Loading indicator */}
              {isLoading && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg px-4 py-2 text-sm text-zinc-900 z-10">
                  {language === 'fr' ? '⏳ Chargement des données...' : '⏳ Loading live data...'}
                </div>
              )}
              
              {/* Empty state - only show if we have services but none have coordinates to display */}
              {!isLoading && !loadingCommunityRatings && showEmptyState && mergedServices.length > 0 && mergedServices.filter(s => s.lat && s.lng).length === 0 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl px-6 py-4 text-center max-w-md z-10">
                  <div className="text-4xl mb-2">📍</div>
                  <h3 className="font-semibold text-zinc-900 mb-2">
                    {language === 'fr' ? 'Aucune coordonnée disponible' : 'No Coordinates Available'}
                  </h3>
                  <p className="text-sm text-zinc-600 mb-3">
                    {language === 'fr'
                      ? 'Les services trouvés n\'ont pas de coordonnées GPS. Utilisez la vue liste ci-dessous.'
                      : 'Services found have no GPS coordinates. Use the list view below.'}
                  </p>
                  <button
                    onClick={() => setShowMap(false)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                  >
                    {language === 'fr' ? '📋 Voir la liste' : '📋 View List'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* List view */
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-4xl mx-auto space-y-3">
                {isLoading && (
                  <div className="text-center py-8 text-zinc-400">
                    {language === 'fr' ? '⏳ Chargement...' : '⏳ Loading...'}
                  </div>
                )}

                {!isLoading && filteredServices.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-zinc-400 text-lg mb-2">
                      {language === 'fr'
                        ? 'Aucun service trouvé'
                        : 'No services found'}
                    </p>
                    <p className="text-zinc-500 text-sm">
                      {language === 'fr'
                        ? 'Essayez de modifier vos filtres'
                        : 'Try adjusting your filters'}
                    </p>
                  </div>
                )}

                {filteredServices.map((service) => {
                  const communityRating = communityRatings.get(service.id);
                  const avgCommunityRating = communityRating
                    ? (communityRating.avg_friendliness + communityRating.avg_privacy + communityRating.avg_wait_time) / 3
                    : null;
                  
                  return (
                  <div
                    key={service.id}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-emerald-500 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{service.name}</h3>
                        <p className="text-sm text-zinc-400 mb-2">
                          {service.city}, {service.country}
                        </p>
                        <p className="text-sm text-zinc-300 line-clamp-2 mb-3">
                          {language === 'fr' ? service.notesFr : service.notesEn}
                        </p>

                        {/* Status badges */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {service.realTimeStatus?.isOpen !== undefined && (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                service.realTimeStatus.isOpen
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {service.realTimeStatus.isOpen
                                ? (language === 'fr' ? '🟢 Ouvert' : '🟢 Open')
                                : (language === 'fr' ? '🔴 Fermé' : '🔴 Closed')}
                            </span>
                          )}
                          {service.realTimeStatus?.rating && (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400">
                              ⭐ {service.realTimeStatus.rating.toFixed(1)}
                            </span>
                          )}
                          {avgCommunityRating && (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
                              💜 {avgCommunityRating.toFixed(1)} ({communityRating!.total_ratings})
                            </span>
                          )}
                          {communityRating && communityRating.judgement_free_percentage >= 75 && (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
                              🤝 {language === 'fr' ? 'Sans jugement' : 'Judgement-free'}
                            </span>
                          )}
                          {service.realTimeStatus?.distance && (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                              📍 {(service.realTimeStatus.distance / 1000).toFixed(1)} km
                            </span>
                          )}
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex gap-2">
                          {service.phone && (
                            <a
                              href={`tel:${service.phone.replace(/\D/g, '')}`}
                              onClick={(e) => e.stopPropagation()}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1"
                            >
                              📞 {language === 'fr' ? 'Appeler' : 'Call'}
                            </a>
                          )}
                          {service.lat && service.lng && (
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${service.lat},${service.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                            >
                              🗺️ {language === 'fr' ? 'Directions' : 'Directions'}
                            </a>
                          )}
                          <button
                            onClick={() => setSelectedService(service)}
                            className="px-3 py-1.5 bg-zinc-700 text-white rounded-lg text-xs font-medium hover:bg-zinc-600 transition-colors flex items-center gap-1"
                          >
                            ℹ️ {language === 'fr' ? 'Détails' : 'Details'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom action bar (mobile) */}
        <div className="lg:hidden bg-zinc-900 border-t border-zinc-800 p-3">
          <div className="flex gap-2">
            <button
              onClick={() => setShowMap(!showMap)}
              className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              {showMap
                ? (language === 'fr' ? '📋 Voir la liste' : '📋 View List')
                : (language === 'fr' ? '🗺️ Voir la carte' : '🗺️ View Map')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
