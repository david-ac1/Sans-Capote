"use client";

import React from 'react';
import { EnrichedServiceEntry } from '../lib/places-api';
import { formatDistance, getStatusText } from '../lib/places-api';

interface ServiceStatusBadgeProps {
  service: EnrichedServiceEntry;
  language?: 'en' | 'fr' | 'sw';
  showDistance?: boolean;
  showRating?: boolean;
}

export function ServiceStatusBadge({ 
  service, 
  language = 'en',
  showDistance = true,
  showRating = true,
}: ServiceStatusBadgeProps) {
  const status = service.realTimeStatus;

  if (!status) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center text-xs">
      {/* Open/Closed Status */}
      {status.currentStatus && (
        <span 
          className={`inline-flex items-center px-2 py-1 rounded-full font-medium ${
            status.currentStatus === 'OPEN'
              ? 'bg-green-900/30 text-green-400 border border-green-700'
              : status.currentStatus === 'CLOSED'
              ? 'bg-red-900/30 text-red-400 border border-red-700'
              : 'bg-gray-800/30 text-gray-400 border border-gray-700'
          }`}
        >
          {getStatusText(status.currentStatus, language)}
        </span>
      )}

      {/* Distance */}
      {showDistance && status.distance !== undefined && (
        <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-900/30 text-blue-400 border border-blue-700 font-medium">
          📍 {formatDistance(status.distance)}
        </span>
      )}

      {/* Rating */}
      {showRating && status.rating !== undefined && status.rating > 0 && (
        <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-900/30 text-yellow-400 border border-yellow-700 font-medium">
          ⭐ {status.rating.toFixed(1)}
          {status.userRatingsTotal && status.userRatingsTotal > 0 && (
            <span className="ml-1 text-yellow-500/70">
              ({status.userRatingsTotal})
            </span>
          )}
        </span>
      )}
    </div>
  );
}

interface OpeningHoursDisplayProps {
  service: EnrichedServiceEntry;
  language?: 'en' | 'fr' | 'sw';
}

export function OpeningHoursDisplay({ 
  service, 
  language = 'en' 
}: OpeningHoursDisplayProps) {
  const hours = service.realTimeStatus?.openingHours;

  if (!hours || hours.length === 0) {
    return (
      <div className="text-sm text-gray-400">
        {language === 'fr' 
          ? 'Horaires non disponibles' 
          : language === 'sw'
          ? 'Masaa hayapatikani'
          : 'Hours not available'}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <h4 className="text-sm font-semibold text-gray-300">
        {language === 'fr' ? 'Horaires d\'ouverture' : language === 'sw' ? 'Masaa ya Kufungua' : 'Opening Hours'}
      </h4>
      <ul className="text-xs text-gray-400 space-y-0.5">
        {hours.map((hour: string, index: number) => (
          <li key={index}>{hour}</li>
        ))}
      </ul>
    </div>
  );
}

interface ServiceContactInfoProps {
  service: EnrichedServiceEntry;
  language?: 'en' | 'fr' | 'sw';
}

export function ServiceContactInfo({ 
  service, 
  language = 'en' 
}: ServiceContactInfoProps) {
  const status = service.realTimeStatus;
  
  // Use real-time data if available, fallback to service data
  const phone = status?.formattedPhoneNumber || service.phone;
  const website = status?.website || service.website;
  const address = status?.formattedAddress;

  if (!phone && !website && !address) return null;

  return (
    <div className="space-y-2 text-xs">
      {address && (
        <div className="flex items-start gap-2">
          <span className="text-gray-500">📍</span>
          <span className="text-gray-300">{address}</span>
        </div>
      )}
      
      {phone && (
        <div className="flex items-center gap-2">
          <span className="text-gray-500">📞</span>
          <a 
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="text-blue-400 hover:text-blue-300 hover:underline"
          >
            {phone}
          </a>
        </div>
      )}
      
      {website && (
        <div className="flex items-center gap-2">
          <span className="text-gray-500">🌐</span>
          <a 
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 hover:underline truncate"
          >
            {language === 'fr' ? 'Visiter le site' : language === 'sw' ? 'Tembelea tovuti' : 'Visit website'}
          </a>
        </div>
      )}
    </div>
  );
}
