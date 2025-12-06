/**
 * AI-powered service discovery using Gemini
 * Discovers services not in our directory and enriches existing ones
 */

import type { CountryCode } from "@/data/countryGuides";

export interface AIServiceMetadata {
  source: 'gemini' | 'directory' | 'hybrid';
  lgbtFriendlyScore?: number; // 0-5
  hivTestingAvailable?: boolean;
  pepAvailable?: boolean;
  prepAvailable?: boolean;
  walkInAccepted?: boolean;
  appointmentRequired?: boolean;
  peerSupportPresent?: boolean;
  communityRating?: number; // 0-5
  accessibilityFeatures?: string[]; // wheelchair, sign language, etc
  stiPanelAvailable?: boolean;
  slidingScalePricing?: boolean;
  telehealthAvailable?: boolean;
  languagesSpoken?: string[];
  youthFriendly?: boolean;
  confidenceScore?: number; // 0-1 (how confident AI is)
  lastVerified?: string; // ISO date
  reasoning?: string; // Why AI recommends this
}

export interface AIDiscoveredService {
  name: string;
  address?: string;
  city?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  website?: string;
  hours?: string;
  metadata: AIServiceMetadata;
}

interface AIDiscoveryFilters {
  lgbtFriendly?: boolean;
  hivTesting?: boolean;
  prepServices?: boolean;
  pepServices?: boolean;
  walkInAvailable?: boolean;
  youthFriendly?: boolean;
  telehealthAvailable?: boolean;
  lowCost?: boolean;
}

/**
 * Prompt engineering for Gemini service discovery
 */
function buildDiscoveryPrompt(country: string, filters: AIDiscoveryFilters, language: 'en' | 'fr'): string {
  const filterDescriptions: string[] = [];
  
  if (filters.lgbtFriendly) filterDescriptions.push("LGBTQIA+ friendly and affirming");
  if (filters.hivTesting) filterDescriptions.push("HIV testing services");
  if (filters.prepServices) filterDescriptions.push("PrEP (pre-exposure prophylaxis) availability");
  if (filters.pepServices) filterDescriptions.push("PEP (post-exposure prophylaxis) availability");
  if (filters.walkInAvailable) filterDescriptions.push("walk-in services (no appointment needed)");
  if (filters.youthFriendly) filterDescriptions.push("youth-friendly services");
  if (filters.telehealthAvailable) filterDescriptions.push("telehealth/virtual consultation options");
  if (filters.lowCost) filterDescriptions.push("low-cost or sliding scale pricing");

  const _criteria = filterDescriptions.length > 0 
    ? `with a focus on: ${filterDescriptions.join(", ")}`
    : "providing comprehensive sexual health services";

  const prompt = language === 'fr' 
    ? `Liste 3-5 centres de santé publics en ${country} avec coordonnées GPS.

Format JSON uniquement:
{
  "services": [
    {
      "name": "Nom",
      "address": "Adresse",
      "city": "Ville",
      "lat": -1.234,
      "lng": 36.567,
      "phone": "+XXX",
      "hours": "Lun-Ven 8h-17h",
      "metadata": {
        "lgbtFriendlyScore": 3,
        "confidenceScore": 0.8,
        "reasoning": "Centre public vérifié"
      }
    }
  ]
}`
    : `List 3-5 public health centers in ${country} with GPS coordinates.

JSON format only:
{
  "services": [
    {
      "name": "Name",
      "address": "Address",
      "city": "City",
      "lat": -1.234,
      "lng": 36.567,
      "phone": "+XXX",
      "hours": "Mon-Fri 8am-5pm",
      "metadata": {
        "lgbtFriendlyScore": 3,
        "confidenceScore": 0.8,
        "reasoning": "Verified public center"
      }
    }
  ]
}`;

  return prompt;
}

/**
 * Discover new services using Gemini AI
 */
export async function discoverServices(
  country: CountryCode,
  filters: AIDiscoveryFilters = {},
  language: 'en' | 'fr' = 'en'
): Promise<AIDiscoveredService[]> {
  try {
    const prompt = buildDiscoveryPrompt(country, filters, language);
    
    const response = await fetch('/api/ai-discovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, country, language }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('AI discovery failed:', response.status, data.error || data);
      
      // Return empty array with helpful message
      if (response.status === 503) {
        console.warn('⚠️ AI service not configured (missing GEMINI_API_KEY)');
      }
      
      return [];
    }

    // Parse Gemini response
    if (data.services && Array.isArray(data.services)) {
      const services = data.services.map((service: { name: string; address?: string; city?: string; lat?: number; lng?: number; phone?: string; website?: string; hours?: string; metadata: AIServiceMetadata }) => ({
        ...service,
        metadata: {
          ...service.metadata,
          source: 'gemini' as const,
          lastVerified: new Date().toISOString(),
        }
      }));
      
      console.log(`✅ Successfully parsed ${services.length} AI services`);
      return services;
    }

    console.warn('⚠️ No services array in response:', data);
    return [];
  } catch (error) {
    console.error('AI service discovery error:', error);
    return [];
  }
}

/**
 * Enrich existing service with AI metadata
 */
export async function enrichServiceMetadata(
  serviceName: string,
  serviceAddress: string,
  country: CountryCode,
  language: 'en' | 'fr' = 'en'
): Promise<AIServiceMetadata | null> {
  try {
    const prompt = language === 'fr'
      ? `Fournis des métadonnées sur ce service de santé:
Nom: ${serviceName}
Adresse: ${serviceAddress}, ${country}

Retourne JSON avec: lgbtFriendlyScore, hivTestingAvailable, pepAvailable, prepAvailable, walkInAccepted, youthFriendly, confidenceScore, reasoning.`
      : `Provide metadata about this health service:
Name: ${serviceName}
Address: ${serviceAddress}, ${country}

Return JSON with: lgbtFriendlyScore, hivTestingAvailable, pepAvailable, prepAvailable, walkInAccepted, youthFriendly, confidenceScore, reasoning.`;

    const response = await fetch('/api/ai-discovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, country, language, mode: 'enrich' }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      ...data.metadata,
      source: 'gemini',
      lastVerified: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Metadata enrichment error:', error);
    return null;
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Deduplicate services by name and location proximity
 */
export function deduplicateServices(
  directoryServices: any[],
  aiServices: AIDiscoveredService[]
): AIDiscoveredService[] {
  const duplicateThreshold = 0.5; // km - if closer than this, likely same service
  
  return aiServices.filter(aiService => {
    // Check if AI service is duplicate of directory service
    const isDuplicate = directoryServices.some(dirService => {
      // Name similarity check
      const aiName = aiService.name.toLowerCase().trim();
      const dirName = dirService.name.toLowerCase().trim();
      const nameMatch = aiName.includes(dirName) || dirName.includes(aiName);
      
      // Location proximity check
      if (aiService.lat && aiService.lng && dirService.lat && dirService.lng) {
        const distance = calculateDistance(
          aiService.lat,
          aiService.lng,
          dirService.lat,
          dirService.lng
        );
        
        return nameMatch && distance < duplicateThreshold;
      }
      
      return nameMatch;
    });
    
    return !isDuplicate;
  });
}

/**
 * Score service relevance based on filters and metadata
 */
export function scoreServiceRelevance(
  service: { aiMetadata?: AIServiceMetadata },
  filters: AIDiscoveryFilters
): number {
  let score = 0;
  const metadata = service.aiMetadata;
  
  if (!metadata) return 0;
  
  // Base confidence score
  score += (metadata.confidenceScore || 0.5) * 30;
  
  // Filter matching bonuses
  if (filters.lgbtFriendly && metadata.lgbtFriendlyScore) {
    score += metadata.lgbtFriendlyScore * 10;
  }
  if (filters.hivTesting && metadata.hivTestingAvailable) {
    score += 15;
  }
  if (filters.prepServices && metadata.prepAvailable) {
    score += 15;
  }
  if (filters.pepServices && metadata.pepAvailable) {
    score += 15;
  }
  if (filters.walkInAvailable && metadata.walkInAccepted) {
    score += 10;
  }
  if (filters.youthFriendly && metadata.youthFriendly) {
    score += 10;
  }
  if (filters.lowCost && metadata.slidingScalePricing) {
    score += 10;
  }
  if (filters.telehealthAvailable && metadata.telehealthAvailable) {
    score += 10;
  }
  
  // Community rating bonus
  if (metadata.communityRating) {
    score += metadata.communityRating * 5;
  }
  
  return Math.min(score, 100);
}
