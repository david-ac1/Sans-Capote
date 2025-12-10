"use client";

import { useState, useEffect, useRef } from 'react';
import type { EnrichedServiceEntry } from '@/lib/places-api';
import { submitServiceRating, getServiceRatings, getServiceRatingComments, type ServiceRatingAggregate } from '@/lib/supabase';

interface ServiceDetailsPanelProps {
  service: EnrichedServiceEntry;
  language: 'en' | 'fr';
  onClose: () => void;
  userLocation?: { lat: number; lng: number } | null;
  isLoading?: boolean;
  isDraggable?: boolean;
}

interface UserRating {
  friendliness: number;
  privacy: number;
  waitTime: number;
  judgementFree: boolean;
  inclusiveCare: number; // Safe alternative to "LGBTQIA+ friendly"
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
    <label className="text-sm font-bold text-zinc-900">{label}</label>
    <div className="flex gap-2 bg-white p-2 rounded-lg border-2 border-zinc-300">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="text-4xl focus:outline-none transition-transform hover:scale-125 focus:ring-2 focus:ring-emerald-500 rounded"
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          style={{ filter: star <= value ? 'none' : 'grayscale(100%) brightness(0.4)' }}
        >
          {star <= value ? '⭐' : '⭐'}
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
  isLoading = false,
  isDraggable = false,
}: ServiceDetailsPanelProps) {
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [userRating, setUserRating] = useState<UserRating>({
    friendliness: 0,
    privacy: 0,
    waitTime: 0,
    judgementFree: true,
    inclusiveCare: 0,
    comment: '',
  });
  const [communityRatings, setCommunityRatings] = useState<ServiceRatingAggregate | null>(null);
  const [ratingComments, setRatingComments] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // SMS feature states
  const [showSmsForm, setShowSmsForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+234'); // Default to Nigeria
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [smsSuccess, setSmsSuccess] = useState(false);
  const [smsError, setSmsError] = useState<string | null>(null);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0, mouseX: 0, mouseY: 0 });

  // Load community ratings when service changes
  useEffect(() => {
    async function loadRatings() {
      // AI services can also have ratings (stored by their generated id)
      const ratings = await getServiceRatings(service.id);
      setCommunityRatings(ratings);
      
      // Load comments
      const comments = await getServiceRatingComments(service.id);
      setRatingComments(comments);
    }
    loadRatings();
  }, [service.id]);

  // Handle drag events
  useEffect(() => {
    if (!isDraggable) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startPosRef.current.mouseX;
      const deltaY = e.clientY - startPosRef.current.mouseY;
      
      setPosition({
        x: startPosRef.current.x + deltaX,
        y: startPosRef.current.y + deltaY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isDraggable]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDraggable) return;
    
    // Only allow dragging from header
    const target = e.target as HTMLElement;
    if (!target.closest('[data-drag-handle]')) return;
    
    setIsDragging(true);
    startPosRef.current = {
      x: position.x,
      y: position.y,
      mouseX: e.clientX,
      mouseY: e.clientY,
    };
  };

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

  const handleSubmitRating = async () => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    
    // AI services can also receive ratings
    const result = await submitServiceRating({
      service_id: service.id,
      friendliness: userRating.friendliness,
      privacy: userRating.privacy,
      wait_time: userRating.waitTime,
      inclusive_care: userRating.inclusiveCare,
      judgement_free: userRating.judgementFree,
      comment: userRating.comment || undefined,
    });
    
    setIsSubmitting(false);
    
    if (result.success) {
      setSubmitSuccess(true);
      setShowRatingForm(false);
      
      // Reload community ratings
      const updatedRatings = await getServiceRatings(service.id);
      setCommunityRatings(updatedRatings);
      
      // Reload comments
      const updatedComments = await getServiceRatingComments(service.id);
      setRatingComments(updatedComments);
      
      // Reset form
      setUserRating({
        friendliness: 0,
        privacy: 0,
        waitTime: 0,
        inclusiveCare: 0,
        judgementFree: true,
        comment: '',
      });
      
      // Show success message briefly
      setTimeout(() => setSubmitSuccess(false), 3000);
    } else {
      alert(language === 'fr' 
        ? `Erreur lors de l'envoi: ${result.error}`
        : `Failed to submit: ${result.error}`
      );
    }
  };

  // Send SMS with service details
  const handleSendSms = async () => {
    if (!phoneNumber.trim()) {
      setSmsError(language === 'fr' ? 'Veuillez entrer un numéro' : 'Please enter a phone number');
      return;
    }

    setIsSendingSms(true);
    setSmsError(null);

    try {
      const fullPhoneNumber = `${countryCode}${phoneNumber.replace(/^0+/, '')}`;
      
      const response = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: fullPhoneNumber,
          service: {
            name: service.name,
            address: service.realTimeStatus?.formattedAddress || `${service.city}, ${service.country}`,
            phone: service.phone || service.realTimeStatus?.formattedPhoneNumber,
            services: Object.entries(service.services)
              .filter(([_, enabled]) => enabled)
              .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim())
              .slice(0, 3),
            hours: service.realTimeStatus?.openingHours?.[0] || service.hours,
            rating: communityRatings?.avg_friendliness,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send SMS');
      }

      setSmsSuccess(true);
      setShowSmsForm(false);
      setPhoneNumber('');
      setTimeout(() => setSmsSuccess(false), 5000);
    } catch (error: any) {
      console.error('SMS error:', error);
      setSmsError(error.message || (language === 'fr' ? 'Échec de l\'envoi' : 'Failed to send SMS'));
    } finally {
      setIsSendingSms(false);
    }
  };

  // Country codes for African countries
  const countryCodes = [
    { code: '+234', country: 'NG', flag: '🇳🇬' },
    { code: '+27', country: 'ZA', flag: '🇿🇦' },
    { code: '+254', country: 'KE', flag: '🇰🇪' },
    { code: '+256', country: 'UG', flag: '🇺🇬' },
    { code: '+250', country: 'RW', flag: '🇷🇼' },
    { code: '+233', country: 'GH', flag: '🇬🇭' },
  ];

  return (
    <div 
      ref={dragRef}
      className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col h-full"
      style={isDraggable ? {
        position: 'relative',
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'auto',
        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
      } : undefined}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div 
        data-drag-handle
        className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-4 text-white flex-shrink-0"
        style={{ cursor: isDraggable ? 'grab' : 'default' }}
      >
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
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drag indicator */}
        {isDraggable && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-50">
            <div className="w-8 h-1 bg-white rounded-full"></div>
          </div>
        )}

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

      {/* Content - with explicit flex-1 and overflow with custom scrollbar */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-visible" 
        style={{ 
          minHeight: 0,
          scrollbarWidth: 'thin',
          scrollbarColor: '#10b981 #f1f5f9'
        }}
      >
        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-zinc-200 rounded w-3/4"></div>
            <div className="h-4 bg-zinc-200 rounded w-full"></div>
            <div className="h-4 bg-zinc-200 rounded w-5/6"></div>
            <div className="space-y-2 mt-4">
              <div className="h-3 bg-zinc-200 rounded w-full"></div>
              <div className="h-3 bg-zinc-200 rounded w-full"></div>
              <div className="h-3 bg-zinc-200 rounded w-4/5"></div>
            </div>
            <div className="flex gap-2 mt-4">
              <div className="h-8 bg-zinc-200 rounded w-24"></div>
              <div className="h-8 bg-zinc-200 rounded w-24"></div>
            </div>
          </div>
        )}
        
        {/* Actual content - hidden while loading */}
        {!isLoading && (
        <>
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

        {/* AI Metadata - if present */}
        {service.aiMetadata && (
          <div className="border-t border-zinc-200 pt-4">
            <h3 className="text-sm font-semibold text-zinc-900 mb-2 flex items-center gap-2">
              <span className="text-lg">✨</span>
              {language === 'fr' ? 'Informations IA' : 'AI Insights'}
            </h3>
            <div className="space-y-2 text-sm">
              {service.aiMetadata.lgbtFriendlyScore !== undefined && (
                <div className="flex items-center justify-between py-2 px-3 bg-purple-50 rounded-lg">
                  <span className="text-zinc-700">
                    {language === 'fr' ? '🏳️‍🌈 LGBT-Friendly' : '🏳️‍🌈 LGBT-Friendly'}
                  </span>
                  <span className="font-semibold text-purple-700">
                    {service.aiMetadata.lgbtFriendlyScore}/5
                  </span>
                </div>
              )}
              {service.aiMetadata.hivTestingAvailable && (
                <div className="py-2 px-3 bg-emerald-50 rounded-lg text-emerald-700">
                  ✅ {language === 'fr' ? 'Dépistage VIH disponible' : 'HIV Testing Available'}
                </div>
              )}
              {service.aiMetadata.prepAvailable && (
                <div className="py-2 px-3 bg-blue-50 rounded-lg text-blue-700">
                  💊 {language === 'fr' ? 'PrEP disponible' : 'PrEP Available'}
                </div>
              )}
              {service.aiMetadata.pepAvailable && (
                <div className="py-2 px-3 bg-orange-50 rounded-lg text-orange-700">
                  🚨 {language === 'fr' ? 'PEP disponible' : 'PEP Available'}
                </div>
              )}
              {service.aiMetadata.walkInAccepted && (
                <div className="py-2 px-3 bg-zinc-50 rounded-lg text-zinc-700">
                  🚶 {language === 'fr' ? 'Accueil sans rendez-vous' : 'Walk-in Accepted'}
                </div>
              )}
              {service.aiMetadata.youthFriendly && (
                <div className="py-2 px-3 bg-indigo-50 rounded-lg text-indigo-700">
                  👥 {language === 'fr' ? 'Service jeunesse' : 'Youth-Friendly'}
                </div>
              )}
              {service.aiMetadata.reasoning && (
                <div className="mt-3 p-3 bg-zinc-50 rounded-lg">
                  <p className="text-xs text-zinc-600 italic">
                    "{service.aiMetadata.reasoning}"
                  </p>
                </div>
              )}
              {service.aiMetadata.confidenceScore !== undefined && (
                <div className="mt-2 text-xs text-zinc-500">
                  {language === 'fr' ? 'Confiance' : 'Confidence'}: {Math.round(service.aiMetadata.confidenceScore * 100)}%
                </div>
              )}
            </div>
          </div>
        )}
        
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

          {/* Success message */}
          {submitSuccess && (
            <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              ✅ {language === 'fr' ? 'Merci pour votre avis!' : 'Thank you for your feedback!'}
            </div>
          )}

          {/* Community ratings summary */}
          {communityRatings && communityRatings.total_ratings > 0 && (
            <div className="mb-4 p-3 bg-zinc-50 rounded-lg space-y-2">
              <div className="text-xs text-zinc-500 mb-2">
                {language === 'fr' 
                  ? `Basé sur ${communityRatings.total_ratings} avis`
                  : `Based on ${communityRatings.total_ratings} rating${communityRatings.total_ratings > 1 ? 's' : ''}`
                }
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-700">{language === 'fr' ? 'Convivialité' : 'Friendliness'}</span>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-zinc-900">{communityRatings.avg_friendliness.toFixed(1)}</span>
                  <span className="text-xs text-zinc-500">/5</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-700">{language === 'fr' ? 'Confidentialité' : 'Privacy'}</span>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-zinc-900">{communityRatings.avg_privacy.toFixed(1)}</span>
                  <span className="text-xs text-zinc-500">/5</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-700">{language === 'fr' ? 'Temps d\'attente' : 'Wait Time'}</span>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-zinc-900">{communityRatings.avg_wait_time.toFixed(1)}</span>
                  <span className="text-xs text-zinc-500">/5</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-700">{language === 'fr' ? 'Soins inclusifs' : 'Inclusive Care'}</span>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-zinc-900">{communityRatings.avg_inclusive_care.toFixed(1)}</span>
                  <span className="text-xs text-zinc-500">/5</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-zinc-200">
                <span className="text-zinc-700">{language === 'fr' ? 'Sans jugement' : 'Judgement-free'}</span>
                <span className="font-semibold text-emerald-600">
                  {communityRatings.judgement_free_percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          )}

          {/* Comments section */}
          {ratingComments.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-zinc-900 mb-2">
                {language === 'fr' ? '💬 Commentaires' : '💬 Comments'}
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {ratingComments.map((comment, index) => (
                  <div key={index} className="bg-zinc-50 rounded-lg p-3 border border-zinc-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1 text-xs text-zinc-600">
                        <span>⭐ {comment.friendliness}</span>
                        <span className="text-zinc-400">•</span>
                        <span>🔒 {comment.privacy}</span>
                        <span className="text-zinc-400">•</span>
                        <span>⏱️ {comment.wait_time}</span>
                      </div>
                      {comment.judgement_free && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          🤝 {language === 'fr' ? 'Sans jugement' : 'Judgement-free'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-700 leading-relaxed">{comment.comment}</p>
                    <div className="text-xs text-zinc-400 mt-1">
                      {new Date(comment.created_at).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showRatingForm ? (
            <div className="bg-gradient-to-br from-blue-50 via-emerald-50 to-white border-4 border-emerald-400 rounded-xl p-5 space-y-5 shadow-lg">
              <h3 className="text-lg font-bold text-zinc-900 mb-3">
                ⭐ {language === 'fr' ? 'Évaluez ce service' : 'Rate This Service'}
              </h3>
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
              <StarRating
                value={userRating.inclusiveCare}
                onChange={(v) => setUserRating({ ...userRating, inclusiveCare: v })}
                label={language === 'fr' ? 'Soins inclusifs' : 'Inclusive Care'}
              />
              <div className="bg-white p-3 rounded-lg border-2 border-zinc-300">
                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-800 cursor-pointer">
                  <input
                    type="checkbox"
                    id="judgementFree"
                    checked={userRating.judgementFree}
                    onChange={(e) => setUserRating({ ...userRating, judgementFree: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                  />
                  <span>🤝 {language === 'fr' ? 'Service sans jugement' : 'Judgement-free service'}</span>
                </label>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-900 block">
                  💬 {language === 'fr' ? 'Commentaire (optionnel)' : 'Comment (optional)'}
                </label>
                <textarea
                  value={userRating.comment}
                  onChange={(e) => setUserRating({ ...userRating, comment: e.target.value })}
                  placeholder={language === 'fr' ? 'Partagez votre expérience...' : 'Share your experience...'}
                  className="w-full px-4 py-3 border-2 border-zinc-400 rounded-lg text-base resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-zinc-900 placeholder-zinc-400"
                  style={{ color: '#18181b', fontWeight: '500' }}
                  rows={3}
                  maxLength={500}
                />
              </div>
              <button
                onClick={handleSubmitRating}
                disabled={userRating.friendliness === 0 || userRating.privacy === 0 || userRating.waitTime === 0 || userRating.inclusiveCare === 0 || isSubmitting}
                className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting 
                  ? (language === 'fr' ? '⏳ Envoi...' : '⏳ Submitting...')
                  : (language === 'fr' ? 'Soumettre l\'évaluation' : 'Submit Rating')
                }
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
        </>
        )}
      </div>

      {/* SMS Feature - above action buttons */}
      <div className="border-t border-zinc-200 p-4 bg-zinc-50 flex-shrink-0">
        {/* Success message */}
        {smsSuccess && (
          <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
            ✅ {language === 'fr' ? 'SMS envoyé avec succès!' : 'SMS sent successfully!'}
          </div>
        )}

        {!showSmsForm ? (
          <button
            onClick={() => setShowSmsForm(true)}
            className="w-full flex items-center justify-center gap-2 bg-white border-2 border-emerald-600 text-emerald-600 py-2.5 rounded-lg font-medium hover:bg-emerald-50 transition-colors mb-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {language === 'fr' ? '📱 Envoyer par SMS' : '📱 Send to My Phone'}
          </button>
        ) : (
          <div className="mb-3 p-3 bg-white border border-zinc-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-zinc-900">
                {language === 'fr' ? 'Recevoir par SMS' : 'Receive via SMS'}
              </h4>
              <button
                onClick={() => {
                  setShowSmsForm(false);
                  setSmsError(null);
                }}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            {/* Country code selector + phone input */}
            <div className="flex gap-2 mb-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-24 px-2 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {countryCodes.map(({ code, country, flag }) => (
                  <option key={code} value={code}>
                    {flag} {code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder={language === 'fr' ? '8012345678' : '8012345678'}
                className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                maxLength={15}
              />
            </div>

            {/* Error message */}
            {smsError && (
              <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                {smsError}
              </div>
            )}

            {/* Send button */}
            <button
              onClick={handleSendSms}
              disabled={isSendingSms || !phoneNumber.trim()}
              className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isSendingSms 
                ? (language === 'fr' ? '⏳ Envoi...' : '⏳ Sending...')
                : (language === 'fr' ? 'Envoyer' : 'Send SMS')
              }
            </button>

            <p className="text-xs text-zinc-500 mt-2">
              {language === 'fr' 
                ? 'Vous recevrez le nom, l\'adresse, le téléphone et les heures d\'ouverture.'
                : 'You\'ll receive the name, address, phone, and hours.'}
            </p>
          </div>
        )}
      </div>

      {/* Action buttons - always visible */}
      <div className="border-t border-zinc-200 p-4 bg-zinc-50 flex-shrink-0">
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
