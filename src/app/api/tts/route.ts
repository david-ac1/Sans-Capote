import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, language = 'en' } = await req.json();
    
    // Select voice based on language
    const voiceId = language === 'fr' 
      ? process.env.ELEVENLABS_VOICE_ID_FR 
      : process.env.ELEVENLABS_VOICE_ID_EN;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
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
