import { NextRequest, NextResponse } from 'next/server';

// Africa's Talking SDK (supports all African countries)
const AfricasTalking = require('africastalking');

// Rate limiting: Track SMS sends per phone number
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const MAX_SMS_PER_HOUR = 3;

// Initialize Africa's Talking client
function getATClient() {
  const username = process.env.AFRICASTALKING_USERNAME || 'sandbox';
  const apiKey = process.env.AFRICASTALKING_API_KEY;

  if (!apiKey) {
    throw new Error('AFRICASTALKING_API_KEY is not configured');
  }

  return AfricasTalking({
    apiKey,
    username,
  });
}

// Format service info for SMS (160 chars max per segment)
function formatServiceSMS(service: {
  name: string;
  address?: string;
  phone?: string;
  services: string[];
  hours?: string;
  rating?: number;
}) {
  let message = `${service.name}\n`;

  if (service.address) {
    message += `📍 ${service.address}\n`;
  }

  if (service.phone) {
    message += `📞 ${service.phone}\n`;
  }

  // Add top 3 services
  const topServices = service.services.slice(0, 3).join(', ');
  message += `Services: ${topServices}\n`;

  if (service.hours) {
    message += `⏰ ${service.hours}\n`;
  }

  if (service.rating) {
    message += `⭐ ${service.rating.toFixed(1)}/5\n`;
  }

  message += '\n🔗 sans-capote.vercel.app';

  return message;
}

// Check rate limit for phone number
function checkRateLimit(phoneNumber: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(phoneNumber);

  if (!limit || now > limit.resetAt) {
    // Reset or create new limit
    rateLimits.set(phoneNumber, {
      count: 1,
      resetAt: now + 60 * 60 * 1000, // 1 hour from now
    });
    return true;
  }

  if (limit.count >= MAX_SMS_PER_HOUR) {
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneNumber, service } = body;

    // Validate inputs
    if (!phoneNumber || !service) {
      return NextResponse.json(
        { error: 'Phone number and service details are required' },
        { status: 400 }
      );
    }

    // Validate phone number format (E.164: +234XXXXXXXXXX)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use E.164: +234XXXXXXXXXX' },
        { status: 400 }
      );
    }

    // Check rate limit
    if (!checkRateLimit(phoneNumber)) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Maximum ${MAX_SMS_PER_HOUR} SMS per hour.` },
        { status: 429 }
      );
    }

    // Format message
    const message = formatServiceSMS(service);

    // Send SMS via Africa's Talking
    const client = getATClient();
    const sms = client.SMS;

    const result = await sms.send({
      to: [phoneNumber],
      message,
      from: process.env.AFRICASTALKING_SENDER_ID || 'SANSCP', // Sender ID (max 11 chars)
    });

    console.log('📱 SMS sent:', result);

    // Check if SMS was sent successfully
    const recipient = result.SMSMessageData.Recipients[0];
    if (recipient.status !== 'Success') {
      throw new Error(recipient.status);
    }

    return NextResponse.json({
      success: true,
      message: 'SMS sent successfully',
      cost: recipient.cost,
      messageId: recipient.messageId,
    });
  } catch (error: any) {
    console.error('❌ SMS send error:', error);

    // Handle specific errors
    if (error.message?.includes('API_KEY')) {
      return NextResponse.json(
        { error: 'SMS service not configured. Contact support.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send SMS. Please try again.' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const isConfigured = !!(
      process.env.AFRICASTALKING_API_KEY && process.env.AFRICASTALKING_USERNAME
    );

    return NextResponse.json({
      status: isConfigured ? 'configured' : 'not_configured',
      service: 'Africa\'s Talking SMS',
      countries: ['NG', 'KE', 'UG', 'TZ', 'ZA', 'GH', 'RW', 'ET', 'MW', 'ZM'],
    });
  } catch (error) {
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
