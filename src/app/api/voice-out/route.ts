import { NextRequest, NextResponse } from "next/server";

interface VoiceOutRequestBody {
  text: string;
  language?: "en" | "fr";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as VoiceOutRequestBody;

    if (!body?.text || !body.text.trim()) {
      return NextResponse.json(
        { error: "Missing text field in request body." },
        { status: 400 }
      );
    }

    const MAX_TTS_LENGTH = 800; // keep TTS requests short and responsive
    const trimmedText = body.text.trim();

    // If the text is very long, truncate it to keep TTS requests
    // reliable and avoid failing the whole request. We prioritise
    // returning playable audio for the start of the message rather
    // than returning an error. Log a warning so this can be tracked.
    let textToSpeak = trimmedText;
    if (trimmedText.length > MAX_TTS_LENGTH) {
      // Try to cut at the last sentence/space boundary under the limit
      const snippet = trimmedText.slice(0, MAX_TTS_LENGTH);
      const lastBoundary = Math.max(
        snippet.lastIndexOf('.'),
        snippet.lastIndexOf('!'),
        snippet.lastIndexOf('?'),
        snippet.lastIndexOf(' ')
      );
      const cutAt = lastBoundary > Math.floor(MAX_TTS_LENGTH * 0.5) ? lastBoundary : Math.floor(MAX_TTS_LENGTH - 1);
      textToSpeak = `${trimmedText.slice(0, cutAt).trim()}…`;
      console.warn('/api/voice-out: input text truncated for TTS (original length:', trimmedText.length, ')');
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ELEVENLABS_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const isFrench = body.language === "fr";
    const voiceId = isFrench
      ? process.env.ELEVENLABS_VOICE_ID_FR || process.env.ELEVENLABS_VOICE_ID_EN
      : process.env.ELEVENLABS_VOICE_ID_EN;

    if (!voiceId) {
      return NextResponse.json(
        {
          error:
            "No ElevenLabs voice ID configured. Please set ELEVENLABS_VOICE_ID_EN (and optionally ELEVENLABS_VOICE_ID_FR).",
        },
        { status: 500 }
      );
    }

    // See ElevenLabs docs for the latest TTS URL and parameters.
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    

    const elevenResponse = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: textToSpeak,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.8,
        },
      }),
    });

    if (!elevenResponse.ok) {
      const errorText = await elevenResponse.text();
      console.error("ElevenLabs TTS error", elevenResponse.status, errorText);
      return NextResponse.json(
        { error: "Failed to generate audio from ElevenLabs." },
        { status: 502 },
      );
    }

    const audioBuffer = Buffer.from(await elevenResponse.arrayBuffer());

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("/api/voice-out error", error);
    return NextResponse.json(
      {
        error:
          "Unable to generate audio right now. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
  
}
