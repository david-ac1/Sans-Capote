/**
 * Enhanced TTS service with caching, retry logic, and advanced voice settings
 */

interface TTSOptions {
  text: string;
  language: string;
  voiceId?: string;
  discreetMode?: boolean;
  emotionalContext?: 'calm' | 'urgent' | 'empathetic';
}

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

class TTSCache {
  private cache = new Map<string, Blob>();
  private maxCacheSize = 50; // Limit cache size

  getCacheKey(options: TTSOptions): string {
    return `${options.text}-${options.language}-${options.voiceId || 'default'}`;
  }

  get(options: TTSOptions): Blob | null {
    const key = this.getCacheKey(options);
    return this.cache.get(key) || null;
  }

  set(options: TTSOptions, blob: Blob): void {
    const key = this.getCacheKey(options);
    
    // Prevent cache overflow
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, blob);
  }

  clear(): void {
    this.cache.clear();
  }
}

const ttsCache = new TTSCache();

export function getVoiceSettings(emotionalContext?: 'calm' | 'urgent' | 'empathetic'): VoiceSettings {
  switch (emotionalContext) {
    case 'calm':
      return {
        stability: 0.85,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true,
      };
    case 'urgent':
      return {
        stability: 0.65,
        similarity_boost: 0.80,
        style: 0.6,
        use_speaker_boost: true,
      };
    case 'empathetic':
      return {
        stability: 0.75,
        similarity_boost: 0.70,
        style: 0.5,
        use_speaker_boost: true,
      };
    default:
      return {
        stability: 0.75,
        similarity_boost: 0.75,
      };
  }
}

export async function fetchTTSWithRetry(
  options: TTSOptions,
  maxRetries = 3
): Promise<Blob> {
  // Check cache first
  const cached = ttsCache.get(options);
  if (cached) {
    return cached;
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const voiceSettings = getVoiceSettings(options.emotionalContext);
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: options.text,
          language: options.language,
          voiceId: options.voiceId || (
            options.language === 'fr' 
              ? process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_FR 
              : process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_EN
          ),
          discreetMode: options.discreetMode,
          voiceSettings,
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const blob = await response.blob();
      
      if (!blob || blob.size === 0) {
        throw new Error('Empty audio blob received');
      }

      // Cache successful response
      ttsCache.set(options, blob);
      
      return blob;
    } catch (error) {
      lastError = error as Error;
      console.warn(`TTS attempt ${attempt}/${maxRetries} failed:`, error);
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
      }
    }
  }

  throw lastError || new Error('TTS failed after all retries');
}

export function clearTTSCache(): void {
  ttsCache.clear();
}

export async function preloadCommonPhrases(language: string): Promise<void> {
  const commonPhrases = [
    language === 'fr' 
      ? 'Merci pour votre réponse.' 
      : 'Thank you for your answer.',
    language === 'fr'
      ? 'Pouvez-vous répéter?'
      : 'Could you repeat that?',
    language === 'fr'
      ? 'Je comprends.'
      : 'I understand.',
  ];

  // Preload in background
  Promise.all(
    commonPhrases.map(text =>
      fetchTTSWithRetry({ text, language }).catch(() => {
        // Fail silently for preload
      })
    )
  );
}
