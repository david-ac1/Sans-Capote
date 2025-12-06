import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import { 
  analyzeSentiment, 
  generateAdaptivePrompt, 
  EmotionalJourneyTracker,
  type SentimentAnalysis 
} from '@/lib/sentiment-analysis';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Store emotional journey trackers (in production, use Redis or similar)
const journeyTrackers = new Map<string, EmotionalJourneyTracker>();

// System prompt that sets the context for HIV education
const getSystemPrompt = () => {
  const resources = {
    what_is_hiv: "HIV is a virus that attacks the immune system. With treatment, people living with HIV can stay healthy and live long lives.",
    prevention_methods: ["Consistent condom use", "Pre-Exposure Prophylaxis (PrEP)", "Post-Exposure Prophylaxis (PEP)", "Regular testing"],
    treatment: "Antiretroviral therapy (ART) is the recommended treatment for HIV. It can reduce the viral load to undetectable levels, which means the virus can't be transmitted to others."
  };

  return `You are a helpful, compassionate, and knowledgeable HIV educator named "Sans Capote". Your role is to provide accurate, non-judgmental information about eion, treatment, and resources.

IMPORTANT GUIDELINES:
1. Always be supportive, non-judgmental, and compassionate
2. Provide clear, evidence-based information in simple language
3. Be sensitive to cultural contexts and different backgrounds
4. Maintain a warm, conversational tone
5. If asked about personal medical advice, recommend consulting a healthcare provider
6. Use the provided context when available, but prioritize accuracy
7. Keep responses concise and focused on the user's question
8. If you don't know something, say so and offer to help find the information

RESOURCE CONTEXT:
- HIV is a virus that attacks the immune system. With treatment, people living with HIV can stay healthy and live long lives.
- Prevention methods include consistent condom use, PrEP (Pre-Exposure Prophylaxis), PEP (Post-Exposure Prophylaxis), and regular testing.
- Treatment involves Antiretroviral Therapy (ART) which can reduce the viral load to undetectable levels, preventing transmission to others.
- Regular medical care and adherence to medication are crucial for effective treatment.
- Stigma and discrimination are significant barriers to HIV prevention and treatment.
- Support services are available for people living with HIV, including counseling and peer support groups.

Context:
${JSON.stringify({ resources }, null, 2)}`;
};

export async function POST(req: Request) {
  try {
    const { messages, countryCode: _countryCode, sessionId, language = 'en', voiceMode = false } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    // Analyze sentiment of the latest user message
    const userMessage = messages[messages.length - 1].content;
    const sentiment: SentimentAnalysis = analyzeSentiment(userMessage, language);
    
    // Track emotional journey if session ID provided
    let emotionalTrend: 'improving' | 'worsening' | 'stable' = 'stable';
    if (sessionId) {
      let tracker = journeyTrackers.get(sessionId);
      if (!tracker) {
        tracker = new EmotionalJourneyTracker(sessionId);
        journeyTrackers.set(sessionId, tracker);
      }
      tracker.addState(sentiment, 'user_message');
      emotionalTrend = tracker.getTrend();
    }

    // Generate adaptive system prompt based on emotional state
    const BASE_SYSTEM_PROMPT = getSystemPrompt();
    const voiceModeInstruction = voiceMode 
      ? (language === 'fr' 
        ? '\n\nIMPORTANT: Réponds en 2-3 phrases MAXIMUM. Sois direct et concis pour la lecture audio.' 
        : '\n\nIMPORTANT: Respond in 2-3 sentences MAXIMUM. Be direct and concise for audio playback.')
      : '';
    const SYSTEM_PROMPT = generateAdaptivePrompt(BASE_SYSTEM_PROMPT + voiceModeInstruction, sentiment, language);
    
    // Format messages for Gemini
    const historyMessages = messages.slice(0, -1).map((msg: {role: string, content: string}) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }).startChat({
      history: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [{ text: "I understand. I'm here to provide accurate, compassionate information about HIV prevention, treatment, and resources. How can I assist you today?" }],
        },
        ...historyMessages,
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    // Generate contextual follow-up suggestions based on emotional state
    const suggestions = generateSuggestions(sentiment, emotionalTrend, language);

    // Add crisis intervention if needed
    let crisisNotice = undefined;
    if (sentiment.stressLevel === 'critical' || sentiment.emotionalState === 'distressed') {
      crisisNotice = language === 'fr' 
        ? "Si vous êtes en détresse immédiate, veuillez contacter une ligne d'urgence ou vous rendre aux urgences les plus proches."
        : "If you're in immediate distress, please contact an emergency hotline or go to the nearest emergency room.";
    }

    return NextResponse.json({
      answer: text,
      suggestions,
      safetyNotice: language === 'fr' 
        ? "Cette information est à but éducatif uniquement et ne remplace pas les conseils médicaux professionnels."
        : "This information is for educational purposes only and not a substitute for professional medical advice.",
      sentiment: {
        emotionalState: sentiment.emotionalState,
        stressLevel: sentiment.stressLevel,
        suggestedTone: sentiment.suggestedTone,
        trend: emotionalTrend,
      },
      voiceSettings: sentiment.voiceSettings,
      crisisNotice,
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Error processing your request', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error processing your request' },
      { status: 500 }
    );
  }
}

/**
 * Generate contextual suggestions based on emotional state
 */
function generateSuggestions(
  sentiment: SentimentAnalysis,
  _trend: 'improving' | 'worsening' | 'stable',
  language: 'en' | 'fr'
): string[] {
  const suggestions = {
    en: {
      distressed: [
        "Where can I get immediate help?",
        "What are emergency resources near me?",
        "I need to talk to someone now",
        "Find crisis hotlines"
      ],
      anxious: [
        "What should I do first?",
        "How soon can I get tested?",
        "What are the symptoms?",
        "Is PEP available near me?"
      ],
      confused: [
        "Explain PrEP in simple terms",
        "What's the difference between PrEP and PEP?",
        "How does HIV testing work?",
        "What are my options?"
      ],
      neutral: [
        "What are the symptoms of HIV?",
        "How can I get tested?",
        "What's the difference between HIV and AIDS?",
        "How effective is PrEP?"
      ],
      hopeful: [
        "Where can I start PrEP?",
        "Tell me about treatment options",
        "How can I stay healthy?",
        "Find support groups"
      ]
    },
    fr: {
      distressed: [
        "Où puis-je obtenir de l'aide immédiate?",
        "Quelles sont les ressources d'urgence près de moi?",
        "J'ai besoin de parler à quelqu'un maintenant",
        "Trouver des lignes d'urgence"
      ],
      anxious: [
        "Que dois-je faire en premier?",
        "Dans combien de temps puis-je me faire tester?",
        "Quels sont les symptômes?",
        "Le TPE est-il disponible près de moi?"
      ],
      confused: [
        "Expliquer la PrEP en termes simples",
        "Quelle est la différence entre PrEP et TPE?",
        "Comment fonctionne le test VIH?",
        "Quelles sont mes options?"
      ],
      neutral: [
        "Quels sont les symptômes du VIH?",
        "Comment puis-je me faire tester?",
        "Quelle est la différence entre VIH et SIDA?",
        "Quelle est l'efficacité de la PrEP?"
      ],
      hopeful: [
        "Où puis-je commencer la PrEP?",
        "Parlez-moi des options de traitement",
        "Comment puis-je rester en bonne santé?",
        "Trouver des groupes de soutien"
      ]
    }
  };
  
  const state = sentiment.emotionalState === 'angry' ? 'anxious' 
    : sentiment.emotionalState === 'calm' ? 'neutral'
    : sentiment.emotionalState in suggestions[language] ? sentiment.emotionalState
    : 'neutral';
  
  return suggestions[language][state as keyof typeof suggestions['en']];
}
