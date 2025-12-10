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
        const contentType = response.headers.get('content-type');
        
        // If it's JSON, it's an error response with details
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          
          // Handle rate limiting specifically
          if (response.status === 429) {
            console.warn('⚠️ TTS rate limit reached. Falling back to text display.');
            console.warn('Fallback message:', errorData.fallbackMessage);
            
            // Don't retry on rate limit - fail gracefully
            throw new Error('RATE_LIMIT_EXCEEDED');
          }
          
          throw new Error(`TTS API error: ${JSON.stringify(errorData)}`);
        }
        
        // Non-JSON error response
        const errorText = await response.text();
        console.error('TTS API error:', response.status, errorText);
        throw new Error(`TTS request failed: ${response.status} - ${errorText}`);
      }

      // Check content type before parsing
      const contentType = response.headers.get('content-type');
      console.log('TTS response content-type:', contentType);
      
      if (contentType && contentType.includes('application/json')) {
        // API returned JSON when we expected audio
        const errorData = await response.json();
        throw new Error(`TTS API returned error: ${JSON.stringify(errorData)}`);
      }

      const blob = await response.blob();
      
      console.log('TTS blob received:', {
        size: blob.size,
        type: blob.type,
        isValid: blob.size > 0 && blob.type.includes('audio')
      });
      
      if (!blob || blob.size === 0) {
        throw new Error('Empty audio blob received');
      }
      
      // Verify blob is audio
      if (!blob.type.includes('audio')) {
        console.warn('Unexpected blob type:', blob.type);
        // Try to create proper audio blob
        const properBlob = new Blob([blob], { type: 'audio/mpeg' });
        ttsCache.set(options, properBlob);
        return properBlob;
      }

      // Cache successful response
      ttsCache.set(options, blob);
      
      return blob;
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on rate limit errors - fail fast
      if (lastError.message === 'RATE_LIMIT_EXCEEDED') {
        console.warn('⚠️ TTS rate limit - not retrying');
        throw lastError;
      }
      
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
