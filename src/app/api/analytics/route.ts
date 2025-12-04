import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { event, metadata } = await req.json();

    // In production, send to BigQuery or analytics service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with Google BigQuery or Analytics
      // await bigQueryClient.insert('voice_analytics', { event, metadata, timestamp: new Date() });
    }

    // Log for now
    console.log('[Analytics]', event, metadata);

    return NextResponse.json({ success: true });
  } catch (error) {
    // Never fail analytics requests
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
