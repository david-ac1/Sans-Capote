"use client";

import { useState } from 'react';
import type { EnrichedServiceEntry } from '@/lib/places-api';

interface ServiceDetailsPanelProps {
  service: EnrichedServiceEntry;
  language: 'en' | 'fr';
  onClose: () => void;
  userLocation?: { lat: number; lng: number } | null;
}

interface UserRating {
  friendliness: number;
  privacy: number;
  waitTime: number;
  judgementFree: boolean;
  comment?: string;
}

// StarRating component defined outside to avoid recreation on each render
const StarRating = ({ 
  value, 
  onChange, 
  label 
}: { 
  value: number; 
  onChange: (v: number) => void; 
  label: string;
}) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-zinc-700">{label}</label>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="text-2xl focus:outline-none transition-transform hover:scale-110"
        >
          {star <= value ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  </div>
);

export default function ServiceDetailsPanel({
  service,
  language,
  onClose,
  userLocation,
}: ServiceDetailsPanelProps) {
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [userRating, setUserRating] = useState<UserRating>({
    friendliness: 0,
    privacy: 0,
    waitTime: 0,
    judgementFree: true,
    comment: '',
  });

  const notes = language === 'fr' ? service.notesFr : service.notesEn;
  const isOpen = service.realTimeStatus?.isOpen;

  // Get directions URL
  const getDirectionsUrl = () => {
    if (!service.lat || !service.lng) return '#';
    
    const destination = `${service.lat},${service.lng}`;
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';
    
    // Google Maps URL
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
  };

  // Format phone number for calling
  const getPhoneUrl = () => {
    if (!service.phone) return '#';
    const cleaned = service.phone.replace(/\D/g, '');
    return `tel:${cleaned}`;
  };

  // Get website URL
  const getWebsiteUrl = () => {
    if (!service.realTimeStatus?.website) return null;
    return service.realTimeStatus.website;
  };

  const handleSubmitRating = () => {
    // TODO: Submit rating to backend/database
    console.log('Submitting rating:', { serviceId: service.id, rating: userRating });
    setShowRatingForm(false);
    // Show success message
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-4 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">{service.name}</h2>
            <p className="text-sm opacity-90">{service.city}, {service.country}</p>
            {service.realTimeStatus?.distance && (
              <p className="text-sm opacity-90 mt-1">📍 {(service.realTimeStatus.distance / 1000).toFixed(1)} km</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status badge */}
        {isOpen !== undefined && (
          <div className="mt-3 inline-block">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isOpen 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {isOpen 
                ? (language === 'fr' ? '🟢 Ouvert maintenant' : '🟢 Open now')
                : (language === 'fr' ? '🔴 Fermé' : '🔴 Closed')
              }
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Google Rating */}
        {service.realTimeStatus?.rating && (
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-200">
            <span className="text-2xl">⭐</span>
            <div>
              <div className="text-lg font-bold text-zinc-900">
                {service.realTimeStatus.rating.toFixed(1)}
              </div>
              <div className="text-xs text-zinc-600">
                {service.realTimeStatus.userRatingsTotal 
                  ? `${service.realTimeStatus.userRatingsTotal} ${language === 'fr' ? 'avis' : 'reviews'}`
                  : language === 'fr' ? 'Avis Google' : 'Google Reviews'
                }
              </div>
            </div>
          </div>
        )}

        {/* Services offered */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-2">
            {language === 'fr' ? 'Services offerts' : 'Services Offered'}
          </h3>
          <p className="text-sm text-zinc-700 leading-relaxed">{notes}</p>
        </div>

        {/* Opening hours */}
        {service.realTimeStatus?.openingHours && Array.isArray(service.realTimeStatus.openingHours) && service.realTimeStatus.openingHours.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-2">
              {language === 'fr' ? 'Horaires d\'ouverture' : 'Opening Hours'}
            </h3>
            <div className="space-y-1 text-sm text-zinc-700">
              {service.realTimeStatus.openingHours.map((text: string, index: number) => (
                <div key={index} className="flex justify-between">
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact information */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-2">
            {language === 'fr' ? 'Contact' : 'Contact'}
          </h3>
          <div className="space-y-2">
            {service.phone && (
              <a
                href={getPhoneUrl()}
                className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {service.phone}
              </a>
            )}
            {service.realTimeStatus?.formattedAddress && (
              <div className="flex items-start gap-2 text-sm text-zinc-700">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{service.realTimeStatus.formattedAddress}</span>
              </div>
            )}
            {getWebsiteUrl() && (
              <a
                href={getWebsiteUrl()!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                {language === 'fr' ? 'Visiter le site web' : 'Visit Website'}
              </a>
            )}
          </div>
        </div>

        {/* User ratings section */}
        <div className="border-t border-zinc-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-900">
              {language === 'fr' ? 'Évaluation communautaire' : 'Community Rating'}
            </h3>
            <button
              onClick={() => setShowRatingForm(!showRatingForm)}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {showRatingForm 
                ? (language === 'fr' ? 'Annuler' : 'Cancel')
                : (language === 'fr' ? '+ Ajouter mon avis' : '+ Add Rating')
              }
            </button>
          </div>

          {showRatingForm ? (
            <div className="bg-zinc-50 rounded-lg p-4 space-y-4">
              <StarRating
                value={userRating.friendliness}
                onChange={(v) => setUserRating({ ...userRating, friendliness: v })}
                label={language === 'fr' ? 'Convivialité du personnel' : 'Staff Friendliness'}
              />
              <StarRating
                value={userRating.privacy}
                onChange={(v) => setUserRating({ ...userRating, privacy: v })}
                label={language === 'fr' ? 'Respect de la vie privée' : 'Privacy Respect'}
              />
              <StarRating
                value={userRating.waitTime}
                onChange={(v) => setUserRating({ ...userRating, waitTime: v })}
                label={language === 'fr' ? 'Temps d\'attente' : 'Wait Time'}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="judgementFree"
                  checked={userRating.judgementFree}
                  onChange={(e) => setUserRating({ ...userRating, judgementFree: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="judgementFree" className="text-sm text-zinc-700">
                  {language === 'fr' ? 'Sans jugement' : 'Judgement-free'}
                </label>
              </div>
              <textarea
                value={userRating.comment}
                onChange={(e) => setUserRating({ ...userRating, comment: e.target.value })}
                placeholder={language === 'fr' ? 'Votre expérience (optionnel)' : 'Your experience (optional)'}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={3}
              />
              <button
                onClick={handleSubmitRating}
                disabled={userRating.friendliness === 0 || userRating.privacy === 0}
                className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors"
              >
                {language === 'fr' ? 'Soumettre l\'évaluation' : 'Submit Rating'}
              </button>
            </div>
          ) : (
            <div className="text-sm text-zinc-600">
              {language === 'fr' 
                ? 'Aidez les autres en partageant votre expérience avec ce service.' 
                : 'Help others by sharing your experience with this service.'}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="border-t border-zinc-200 p-4 bg-zinc-50">
        <div className="grid grid-cols-2 gap-3">
          <a
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            {language === 'fr' ? 'Itinéraire' : 'Directions'}
          </a>
          {service.phone && (
            <a
              href={getPhoneUrl()}
              className="flex items-center justify-center gap-2 bg-white border-2 border-emerald-600 text-emerald-600 py-3 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {language === 'fr' ? 'Appeler' : 'Call'}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
