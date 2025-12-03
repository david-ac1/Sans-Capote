/**
 * Simple metrics logging for observability.
 * Logs to server console and can be extended for external monitoring (Datadog, etc).
 */

export interface ConversationMetric {
  timestamp: string;
  type: 'conversation_request' | 'conversation_response' | 'conversation_error';
  durationMs: number;
  language: string;
  countryCode?: string;
  mode: string;
  requestLength?: number;
  responseLength?: number;
  modelUsed: string;
  error?: string;
  errorType?: string;
}

export interface VoiceMetric {
  timestamp: string;
  type: 'tts_request' | 'tts_success' | 'tts_error';
  durationMs: number;
  language: string;
  textLength: number;
  audioSizeBytes?: number;
  error?: string;
  voiceId?: string;
}

export function logConversationMetric(metric: ConversationMetric): void {
  // Log to console (visible in server logs / Vercel/Cloud logs)
  console.log('[METRICS:CONVERSATION]', JSON.stringify(metric));

  // TODO: Send to Datadog, LogRocket, or custom monitoring service
  // Example: await fetch('your-monitoring-endpoint', { method: 'POST', body: JSON.stringify(metric) })
}

export function logVoiceMetric(metric: VoiceMetric): void {
  console.log('[METRICS:VOICE]', JSON.stringify(metric));

  // TODO: Send to external monitoring
}

/**
 * Helper to time async functions and log metrics.
 * Usage: const result = await timeAsync(() => myAsyncFunction(), (duration) => logConversationMetric({...}))
 */
export async function timeAsync<T>(
  fn: () => Promise<T>,
  onComplete: (durationMs: number) => void
): Promise<T> {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;
  onComplete(duration);
  return result;
}
