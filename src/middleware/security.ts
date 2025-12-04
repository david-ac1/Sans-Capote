import { NextRequest, NextResponse } from 'next/server';

// Rate limiting store (in-memory, should use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function applySecurityHeaders(response: NextResponse): NextResponse {
  // Already set in next.config.ts, but reinforce here
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Strict CSP for production
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://generativelanguage.googleapis.com https://api.elevenlabs.io https://www.google-analytics.com",
    "media-src 'self' blob: https://api.elevenlabs.io",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  return response;
}

export function rateLimit(request: NextRequest, maxRequests = 100, windowMs = 60000): { allowed: boolean; remaining: number } {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  const now = Date.now();
  
  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

export function sanitizeInput(input: string): string {
  // Remove potential XSS vectors
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, 10000); // Max length 10k chars
}

export function anonymizeData(data: Record<string, unknown>): Record<string, unknown> {
  const anonymized = { ...data };
  
  // Remove PII fields
  const piiFields = ['name', 'email', 'phone', 'address', 'location', 'ip'];
  piiFields.forEach(field => {
    if (field in anonymized) {
      delete anonymized[field];
    }
  });
  
  // Hash sensitive values
  if (anonymized.userId && typeof anonymized.userId === 'string') {
    anonymized.userId = hashString(anonymized.userId);
  }
  
  return anonymized;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `hash_${Math.abs(hash).toString(36)}`;
}

// Cleanup old rate limit entries periodically
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000); // Clean up every minute
}
