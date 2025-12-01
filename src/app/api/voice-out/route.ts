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
    if (trimmedText.length > MAX_TTS_LENGTH) {
      return NextResponse.json(
        {
          error:
            "Text is too long to read out in a single request. Please shorten your question or answer.",
        },
        { status: 400 }
      );
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
        text: trimmedText,
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
