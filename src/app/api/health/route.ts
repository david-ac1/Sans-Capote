import { NextResponse } from 'next/server';

/**
 * Health check endpoint - verifies environment configuration
 * Access: /api/health
 */
export async function GET() {
  const envCheck = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    apiKeys: {
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
      elevenlabsVoiceEn: !!process.env.ELEVENLABS_VOICE_ID_EN,
      elevenlabsVoiceFr: !!process.env.ELEVENLABS_VOICE_ID_FR,
      gemini: !!process.env.GEMINI_API_KEY,
      googlePlaces: !!process.env.GOOGLE_PLACES_API_KEY,
    },
    voiceIds: {
      en: process.env.ELEVENLABS_VOICE_ID_EN ? 'configured' : 'missing',
      fr: process.env.ELEVENLABS_VOICE_ID_FR ? 'configured' : 'missing',
    },
    status: 'ok',
  };

  // Check if any critical keys are missing
  const missingKeys = Object.entries(envCheck.apiKeys)
    .filter(([_, exists]) => !exists)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    return NextResponse.json(
      {
        ...envCheck,
        status: 'degraded',
        warning: `Missing environment variables: ${missingKeys.join(', ')}`,
      },
      { status: 200 }
    );
  }

  return NextResponse.json(envCheck);
}
