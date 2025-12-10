/**
 * Sentiment Indicator Component
 * Visual display of user's emotional state and stress level
 */

import type { EmotionalState, StressLevel } from '@/lib/sentiment-analysis';

interface SentimentIndicatorProps {
  emotionalState: EmotionalState;
  stressLevel: StressLevel;
  trend?: 'improving' | 'worsening' | 'stable';
  language?: 'en' | 'fr' | 'sw';
  compact?: boolean;
}

const EMOTION_COLORS: Record<EmotionalState, string> = {
  calm: 'text-green-400 bg-green-950 border-green-800',
  anxious: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  distressed: 'text-red-400 bg-red-950 border-red-800',
  confused: 'text-blue-400 bg-blue-950 border-blue-800',
  angry: 'text-orange-400 bg-orange-950 border-orange-800',
  hopeful: 'text-emerald-400 bg-emerald-950 border-emerald-800',
  neutral: 'text-zinc-400 bg-zinc-900 border-zinc-800',
};

const EMOTION_LABELS = {
  en: {
    calm: 'Calm',
    anxious: 'Anxious',
    distressed: 'Distressed',
    confused: 'Confused',
    angry: 'Upset',
    hopeful: 'Hopeful',
    neutral: 'Neutral',
  },
  fr: {
    calm: 'Calme',
    anxious: 'Anxieux',
    distressed: 'En détresse',
    confused: 'Confus',
    angry: 'Contrarié',
    hopeful: 'Optimiste',
    neutral: 'Neutre',
  },
  sw: {
    calm: 'Tulivu',
    anxious: 'Wasiwasi',
    distressed: 'Msongo wa Mawazo',
    confused: 'Kuchanganyikiwa',
    angry: 'Hasira',
    hopeful: 'Tumaini',
    neutral: 'Wastani',
  },
};

const STRESS_LABELS = {
  en: {
    low: 'Low stress',
    moderate: 'Moderate stress',
    high: 'High stress',
    critical: 'Critical stress',
  },
  fr: {
    low: 'Stress faible',
    moderate: 'Stress modéré',
    high: 'Stress élevé',
    critical: 'Stress critique',
  },
  sw: {
    low: 'Msongo mdogo',
    moderate: 'Msongo wa kati',
    high: 'Msongo mkubwa',
    critical: 'Msongo wa hatari',
  },
};

const TREND_LABELS = {
  en: {
    improving: '↗ Improving',
    stable: '→ Stable',
    worsening: '↘ Needs attention',
  },
  fr: {
    improving: '↗ En amélioration',
    stable: '→ Stable',
    worsening: '↘ Nécessite attention',
  },
  sw: {
    improving: '↗ Inaboreshwa',
    stable: '→ Imara',
    worsening: '↘ Inahitaji umakini',
  },
};

const STRESS_DOTS: Record<StressLevel, number> = {
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4,
};

export default function SentimentIndicator({
  emotionalState,
  stressLevel,
  trend,
  language = 'en',
  compact = false,
}: SentimentIndicatorProps) {
  const colorClass = EMOTION_COLORS[emotionalState];
  const emotionLabel = EMOTION_LABELS[language][emotionalState];
  const stressLabel = STRESS_LABELS[language][stressLevel];
  const trendLabel = trend ? TREND_LABELS[language][trend] : null;
  const dotsCount = STRESS_DOTS[stressLevel];

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <div className={`flex items-center gap-1.5 rounded-md border px-2 py-1 ${colorClass}`}>
          <span>{emotionLabel}</span>
          <div className="flex gap-0.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${
                  i < dotsCount ? 'bg-current' : 'bg-current opacity-20'
                }`}
              />
            ))}
          </div>
        </div>
        {trendLabel && (
          <span className={`text-xs ${trend === 'improving' ? 'text-green-500' : trend === 'worsening' ? 'text-red-500' : 'text-zinc-500'}`}>
            {trendLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`rounded-md border px-2 py-1 text-xs font-medium ${colorClass}`}>
            {emotionLabel}
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${
                  i < dotsCount
                    ? stressLevel === 'critical'
                      ? 'bg-red-500'
                      : stressLevel === 'high'
                      ? 'bg-orange-500'
                      : stressLevel === 'moderate'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                    : 'bg-zinc-700'
                }`}
              />
            ))}
          </div>
        </div>
        {trendLabel && (
          <span
            className={`text-xs font-medium ${
              trend === 'improving'
                ? 'text-green-500'
                : trend === 'worsening'
                ? 'text-red-500'
                : 'text-zinc-500'
            }`}
          >
            {trendLabel}
          </span>
        )}
      </div>
      <p className="text-xs text-zinc-400">{stressLabel}</p>
    </div>
  );
}
