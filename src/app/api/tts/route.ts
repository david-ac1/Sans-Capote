import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, sanitizeInput } from '../../../middleware/security';

export async function POST(req: NextRequest) {
  // Rate limiting: 100 requests per minute per IP
  const { allowed, remaining } = rateLimit(req, 100, 60000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'Retry-After': '60',
        }
      }
    );
  }
  
  try {
    const { 
      text, 
      language = 'en',
      voiceSettings = null // Accept custom voice settings from sentiment analysis
    } = await req.json();
    
    // Sanitize and limit text length
    const sanitizedText = sanitizeInput(text).slice(0, 5000);
    
    if (!sanitizedText) {
      return NextResponse.json({ error: "Invalid text input" }, { status: 400 });
    }

    // Check if ElevenLabs is configured
    if (!process.env.ELEVENLABS_API_KEY) {
      console.error('TTS Error: ELEVENLABS_API_KEY not configured');
      return NextResponse.json(
        { 
          error: "Text-to-speech service is not configured. Please contact the administrator.",
          details: process.env.NODE_ENV === 'development' ? 'ELEVENLABS_API_KEY missing' : undefined
        },
        { status: 503 }
      );
    }
    
    // Select voice based on language
    const voiceId = language === 'fr' 
      ? process.env.ELEVENLABS_VOICE_ID_FR 
      : process.env.ELEVENLABS_VOICE_ID_EN;

    if (!voiceId) {
      console.error(`TTS Error: Voice ID not configured for language: ${language}`);
      return NextResponse.json(
        { 
          error: "Voice for selected language is not configured.",
          details: process.env.NODE_ENV === 'development' 
            ? `Missing ELEVENLABS_VOICE_ID_${language.toUpperCase()}` 
            : undefined
        },
        { status: 503 }
      );
    }

    // Use sentiment-aware voice settings or defaults
    const finalVoiceSettings = voiceSettings || {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.4, // Added style parameter for emotional expression
    };

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
        },
        body: JSON.stringify({
          text: sanitizedText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: finalVoiceSettings,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs API error:', error);
      throw new Error('Failed to generate speech');
    }

    const audioBlob = await response.blob();
    const audioBuffer = await audioBlob.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    return NextResponse.json({ audio: audioBase64 });
  } catch (error) {
    console.error('Error in TTS API:', error);
    return NextResponse.json(
      { error: 'Error generating speech' },
      { status: 500 }
    );
  }
}
