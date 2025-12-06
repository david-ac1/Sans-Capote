/**
 * Sentiment Analysis Service
 * Uses text analysis to detect emotional state and stress levels
 * Adapts voice tone and response style based on detected emotions
 */

export type EmotionalState = 
  | 'calm' 
  | 'anxious' 
  | 'distressed' 
  | 'confused' 
  | 'angry' 
  | 'hopeful'
  | 'neutral';

export type StressLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface SentimentAnalysis {
  emotionalState: EmotionalState;
  stressLevel: StressLevel;
  confidence: number; // 0-1
  indicators: {
    urgencyWords: number;
    negativeWords: number;
    questionMarks: number;
    exclamationMarks: number;
    capsLockRatio: number;
    repeatWords: number;
  };
  suggestedTone: 'reassuring' | 'urgent' | 'empathetic' | 'professional' | 'encouraging';
  voiceSettings: {
    stability: number;
    similarityBoost: number;
    style: number;
  };
}

interface EmotionalJourney {
  sessionId: string;
  states: Array<{
    timestamp: number;
    state: EmotionalState;
    stressLevel: StressLevel;
    trigger?: string;
  }>;
  trend: 'improving' | 'worsening' | 'stable';
}

// Keyword dictionaries for sentiment detection
const URGENCY_WORDS = [
  'urgent', 'emergency', 'immediately', 'now', 'quick', 'fast', 'asap',
  'urgent', 'urgence', 'immédiatement', 'maintenant', 'rapide', 'vite',
  'help', 'aide', 'scared', 'peur', 'worried', 'inquiet', 'panic', 'panique'
];

const DISTRESS_WORDS = [
  'scared', 'afraid', 'terrified', 'panic', 'worried', 'anxious', 'stressed',
  'peur', 'terrifié', 'panique', 'inquiet', 'anxieux', 'stressé',
  'dying', 'death', 'kill', 'mourir', 'mort', 'tuer',
  'hopeless', 'helpless', 'désespéré', 'impuissant'
];

const NEGATIVE_WORDS = [
  'bad', 'wrong', 'terrible', 'awful', 'horrible', 'worst',
  'mal', 'mauvais', 'terrible', 'horrible', 'pire',
  'sick', 'ill', 'pain', 'hurt', 'bleeding',
  'malade', 'douleur', 'souffrir', 'saigner'
];

const CONFUSION_WORDS = [
  'confused', 'don\'t understand', 'what', 'how', 'why', 'unclear',
  'confus', 'comprends pas', 'quoi', 'comment', 'pourquoi', 'pas clair',
  'lost', 'perdu', 'unsure', 'not sure', 'pas sûr'
];

const POSITIVE_WORDS = [
  'better', 'good', 'okay', 'fine', 'calm', 'safe', 'helped',
  'mieux', 'bien', 'calme', 'sûr', 'aidé',
  'thank', 'merci', 'grateful', 'reconnaissant'
];

/**
 * Analyze text for emotional content and stress indicators
 */
export function analyzeSentiment(text: string, _language: 'en' | 'fr' = 'en'): SentimentAnalysis {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  
  // Count indicators
  const indicators = {
    urgencyWords: countMatches(lowerText, URGENCY_WORDS),
    negativeWords: countMatches(lowerText, NEGATIVE_WORDS) + countMatches(lowerText, DISTRESS_WORDS),
    questionMarks: (text.match(/\?/g) || []).length,
    exclamationMarks: (text.match(/!/g) || []).length,
    capsLockRatio: calculateCapsRatio(text),
    repeatWords: countRepeatedWords(words),
  };
  
  // Calculate stress level
  const stressScore = 
    indicators.urgencyWords * 3 +
    indicators.negativeWords * 2 +
    indicators.exclamationMarks * 2 +
    indicators.capsLockRatio * 5 +
    indicators.repeatWords * 1.5;
    
  const stressLevel: StressLevel = 
    stressScore > 15 ? 'critical' :
    stressScore > 8 ? 'high' :
    stressScore > 3 ? 'moderate' : 'low';
  
  // Detect emotional state
  const emotionalState = detectEmotionalState(lowerText, indicators);
  
  // Calculate confidence based on text length and clarity
  const confidence = Math.min(
    0.5 + (words.length / 50) * 0.3 + (indicators.urgencyWords + indicators.negativeWords) * 0.05,
    0.95
  );
  
  // Determine suggested tone and voice settings
  const { suggestedTone, voiceSettings } = getAdaptiveSettings(emotionalState, stressLevel);
  
  return {
    emotionalState,
    stressLevel,
    confidence,
    indicators,
    suggestedTone,
    voiceSettings,
  };
}

/**
 * Detect primary emotional state from text
 */
function detectEmotionalState(text: string, indicators: SentimentAnalysis['indicators']): EmotionalState {
  const hasDistress = countMatches(text, DISTRESS_WORDS) > 0;
  const hasUrgency = indicators.urgencyWords > 2;
  const hasConfusion = countMatches(text, CONFUSION_WORDS) > 1;
  const hasPositive = countMatches(text, POSITIVE_WORDS) > 0;
  const hasNegative = indicators.negativeWords > 2;
  
  if (hasDistress && hasUrgency) return 'distressed';
  if (hasDistress) return 'anxious';
  if (hasUrgency && hasNegative) return 'anxious';
  if (hasConfusion && indicators.questionMarks > 2) return 'confused';
  if (hasNegative && !hasPositive) return 'anxious';
  if (hasPositive) return 'hopeful';
  if (indicators.exclamationMarks > 3) return 'angry';
  
  return 'neutral';
}

/**
 * Get adaptive response tone and voice settings based on emotion
 */
function getAdaptiveSettings(
  emotion: EmotionalState,
  stress: StressLevel
): { suggestedTone: SentimentAnalysis['suggestedTone']; voiceSettings: SentimentAnalysis['voiceSettings'] } {
  switch (emotion) {
    case 'distressed':
      return {
        suggestedTone: 'reassuring',
        voiceSettings: {
          stability: 0.85, // Very stable, calming
          similarityBoost: 0.80,
          style: 0.3, // Gentle, soft
        },
      };
    
    case 'anxious':
      return {
        suggestedTone: 'empathetic',
        voiceSettings: {
          stability: 0.80,
          similarityBoost: 0.75,
          style: 0.4, // Warm, understanding
        },
      };
    
    case 'confused':
      return {
        suggestedTone: 'professional',
        voiceSettings: {
          stability: 0.75,
          similarityBoost: 0.80,
          style: 0.2, // Clear, explanatory
        },
      };
    
    case 'angry':
      return {
        suggestedTone: 'reassuring',
        voiceSettings: {
          stability: 0.85,
          similarityBoost: 0.70,
          style: 0.3, // Calm, non-confrontational
        },
      };
    
    case 'hopeful':
      return {
        suggestedTone: 'encouraging',
        voiceSettings: {
          stability: 0.70,
          similarityBoost: 0.75,
          style: 0.5, // Upbeat, positive
        },
      };
    
    default: // calm or neutral
      return {
        suggestedTone: stress === 'high' || stress === 'critical' ? 'urgent' : 'professional',
        voiceSettings: {
          stability: 0.75,
          similarityBoost: 0.75,
          style: 0.4,
        },
      };
  }
}

/**
 * Count keyword matches in text
 */
function countMatches(text: string, keywords: string[]): number {
  return keywords.reduce((count, keyword) => {
    return count + (text.includes(keyword) ? 1 : 0);
  }, 0);
}

/**
 * Calculate ratio of uppercase letters
 */
function calculateCapsRatio(text: string): number {
  const letters = text.replace(/[^a-zA-Z]/g, '');
  if (letters.length === 0) return 0;
  const upperCount = letters.replace(/[^A-Z]/g, '').length;
  return upperCount / letters.length;
}

/**
 * Count repeated words (indicating stress or emphasis)
 */
function countRepeatedWords(words: string[]): number {
  const wordCounts = new Map<string, number>();
  words.forEach(word => {
    if (word.length > 3) { // Ignore short words
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
  });
  
  let repeats = 0;
  wordCounts.forEach(count => {
    if (count > 1) repeats += count - 1;
  });
  
  return repeats;
}

/**
 * Track emotional journey throughout a session
 */
export class EmotionalJourneyTracker {
  private journey: EmotionalJourney;
  
  constructor(sessionId: string) {
    this.journey = {
      sessionId,
      states: [],
      trend: 'stable',
    };
  }
  
  addState(analysis: SentimentAnalysis, trigger?: string) {
    this.journey.states.push({
      timestamp: Date.now(),
      state: analysis.emotionalState,
      stressLevel: analysis.stressLevel,
      trigger,
    });
    
    this.updateTrend();
  }
  
  private updateTrend() {
    if (this.journey.states.length < 3) {
      this.journey.trend = 'stable';
      return;
    }
    
    const recent = this.journey.states.slice(-3);
    const stressLevels = recent.map(s => this.stressToNumber(s.stressLevel));
    
    const isImproving = stressLevels[0] > stressLevels[1] && stressLevels[1] > stressLevels[2];
    const isWorsening = stressLevels[0] < stressLevels[1] && stressLevels[1] < stressLevels[2];
    
    this.journey.trend = isImproving ? 'improving' : isWorsening ? 'worsening' : 'stable';
  }
  
  private stressToNumber(level: StressLevel): number {
    switch (level) {
      case 'low': return 1;
      case 'moderate': return 2;
      case 'high': return 3;
      case 'critical': return 4;
    }
  }
  
  getJourney(): EmotionalJourney {
    return { ...this.journey };
  }
  
  getCurrentState(): EmotionalState | null {
    if (this.journey.states.length === 0) return null;
    return this.journey.states[this.journey.states.length - 1].state;
  }
  
  getTrend(): EmotionalJourney['trend'] {
    return this.journey.trend;
  }
}

/**
 * Generate adaptive system prompt based on emotional state
 */
export function generateAdaptivePrompt(
  basePrompt: string,
  analysis: SentimentAnalysis,
  language: 'en' | 'fr' = 'en'
): string {
  const toneInstructions = getToneInstructions(analysis.suggestedTone, language);
  const stressAdjustment = getStressAdjustment(analysis.stressLevel, language);
  
  return `${basePrompt}

EMOTIONAL CONTEXT:
- User's emotional state: ${analysis.emotionalState}
- Stress level: ${analysis.stressLevel}
- Suggested tone: ${analysis.suggestedTone}

ADAPTATION INSTRUCTIONS:
${toneInstructions}
${stressAdjustment}

Remember: The user may be in a vulnerable state. Prioritize clarity, compassion, and actionable guidance.`;
}

function getToneInstructions(tone: SentimentAnalysis['suggestedTone'], language: 'en' | 'fr'): string {
  const instructions = {
    reassuring: {
      en: '- Use calm, reassuring language\n- Emphasize that help is available\n- Normalize their feelings\n- Provide clear, simple steps',
      fr: '- Utilisez un langage calme et rassurant\n- Soulignez que de l\'aide est disponible\n- Normalisez leurs sentiments\n- Fournissez des étapes claires et simples',
    },
    empathetic: {
      en: '- Acknowledge their concerns with empathy\n- Validate their emotions\n- Show understanding without judgment\n- Offer supportive guidance',
      fr: '- Reconnaissez leurs préoccupations avec empathie\n- Validez leurs émotions\n- Montrez de la compréhension sans jugement\n- Offrez des conseils de soutien',
    },
    professional: {
      en: '- Maintain a clear, professional tone\n- Focus on facts and actionable information\n- Be direct and organized\n- Provide structured guidance',
      fr: '- Maintenez un ton clair et professionnel\n- Concentrez-vous sur les faits et les informations exploitables\n- Soyez direct et organisé\n- Fournissez des conseils structurés',
    },
    urgent: {
      en: '- Convey appropriate urgency without panic\n- Prioritize immediate actionable steps\n- Be concise and direct\n- Emphasize time-sensitive actions',
      fr: '- Transmettez l\'urgence appropriée sans panique\n- Priorisez les étapes immédiates et exploitables\n- Soyez concis et direct\n- Mettez l\'accent sur les actions urgentes',
    },
    encouraging: {
      en: '- Use positive, encouraging language\n- Celebrate their proactive approach\n- Build confidence\n- Provide motivating guidance',
      fr: '- Utilisez un langage positif et encourageant\n- Célébrez leur approche proactive\n- Renforcez la confiance\n- Fournissez des conseils motivants',
    },
  };
  
  return instructions[tone][language];
}

function getStressAdjustment(stress: StressLevel, language: 'en' | 'fr'): string {
  const adjustments = {
    critical: {
      en: '- User is in critical distress - prioritize immediate safety\n- Keep responses SHORT and ACTION-ORIENTED\n- Direct them to emergency resources FIRST',
      fr: '- L\'utilisateur est en détresse critique - priorisez la sécurité immédiate\n- Gardez les réponses COURTES et ORIENTÉES ACTION\n- Dirigez-les vers les ressources d\'urgence EN PREMIER',
    },
    high: {
      en: '- User is highly stressed - be extra clear and supportive\n- Break down information into small, manageable steps\n- Offer immediate next actions',
      fr: '- L\'utilisateur est très stressé - soyez très clair et solidaire\n- Décomposez les informations en petites étapes gérables\n- Proposez des actions immédiates',
    },
    moderate: {
      en: '- User is somewhat stressed - balance information with reassurance\n- Provide thorough but clear explanations',
      fr: '- L\'utilisateur est quelque peu stressé - équilibrez information et réconfort\n- Fournissez des explications complètes mais claires',
    },
    low: {
      en: '- User is relatively calm - can provide more detailed information\n- Focus on comprehensive guidance',
      fr: '- L\'utilisateur est relativement calme - peut fournir des informations plus détaillées\n- Concentrez-vous sur des conseils complets',
    },
  };
  
  return adjustments[stress][language];
}
