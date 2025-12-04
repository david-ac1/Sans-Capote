/**
 * Monitoring and telemetry for voice flow
 * Tracks events without exposing sensitive health data
 */

export type VoiceFlowEvent = 
  | 'assessment_started'
  | 'question_asked'
  | 'answer_received'
  | 'flow_completed'
  | 'flow_abandoned'
  | 'error_occurred'
  | 'referral_provided'
  | 'tts_played'
  | 'tts_failed'
  | 'recognition_started'
  | 'recognition_failed';

export interface VoiceFlowMetadata {
  sessionId: string;
  questionIndex?: number;
  totalQuestions?: number;
  duration?: number;
  errorType?: string;
  errorMessage?: string;
  language?: string;
  country?: string;
  platform?: string;
  timestamp?: number;
}

class TelemetryService {
  private sessionId: string;
  private startTime: number;
  private events: Array<{ event: VoiceFlowEvent; metadata: VoiceFlowMetadata; timestamp: number }> = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  track(event: VoiceFlowEvent, metadata: Partial<VoiceFlowMetadata> = {}) {
    const enrichedMetadata: VoiceFlowMetadata = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      duration: Date.now() - this.startTime,
      platform: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      ...metadata,
    };

    this.events.push({
      event,
      metadata: enrichedMetadata,
      timestamp: Date.now(),
    });

    // Send to analytics endpoint (non-blocking)
    this.sendToAnalytics(event, enrichedMetadata);

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Telemetry] ${event}`, enrichedMetadata);
    }
  }

  private async sendToAnalytics(event: VoiceFlowEvent, metadata: VoiceFlowMetadata) {
    try {
      // Send to Google Analytics 4
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window !== 'undefined' && (window as any).gtag) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).gtag('event', event, {
          ...metadata,
          non_interaction: true,
        });
      }

      // Send to custom analytics endpoint
      if (typeof window !== 'undefined') {
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event, metadata }),
          keepalive: true, // Ensure it sends even if page closes
        }).catch(() => {
          // Fail silently - analytics should never block UX
        });
      }
    } catch (error) {
      // Never throw from telemetry
      console.warn('Telemetry send failed:', error);
    }
  }

  trackError(error: Error | string, context?: Record<string, unknown>) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorType = typeof error === 'string' ? 'unknown' : error.name;

    this.track('error_occurred', {
      errorType,
      errorMessage: this.sanitizeErrorMessage(errorMessage),
      ...context,
    });

    // Send to error tracking service (Sentry, etc.)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Sentry.captureException(error, {
        extra: context,
      });
    }
  }

  private sanitizeErrorMessage(message: string): string {
    // Remove any potential PII from error messages
    return message
      .replace(/\b\d{10,}\b/g, '[PHONE_REDACTED]')
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]')
      .substring(0, 200); // Limit length
  }

  getSessionSummary() {
    return {
      sessionId: this.sessionId,
      duration: Date.now() - this.startTime,
      eventCount: this.events.length,
      events: this.events.map(e => e.event),
    };
  }

  reset() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.events = [];
  }
}

// Singleton instance
let telemetryInstance: TelemetryService | null = null;

export function getTelemetry(): TelemetryService {
  if (!telemetryInstance) {
    telemetryInstance = new TelemetryService();
  }
  return telemetryInstance;
}

export function trackVoiceFlowEvent(
  event: VoiceFlowEvent,
  metadata?: Partial<VoiceFlowMetadata>
) {
  getTelemetry().track(event, metadata);
}

export function trackError(error: Error | string, context?: Record<string, unknown>) {
  getTelemetry().trackError(error, context);
}
