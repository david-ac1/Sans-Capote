import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '../../../middleware/security';

/**
 * Serverless endpoint for Google Places API to keep API key secure
 * Proxies requests to Google Places API from the client
 */

export async function POST(request: NextRequest) {
  // Rate limiting: 50 requests per minute per IP
  const { allowed } = rateLimit(request, 50, 60000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Google Places API not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { type, placeId, query, location, radius } = body;

    if (type === 'details' && placeId) {
      // Place Details API
      const fields = 'opening_hours,formatted_address,formatted_phone_number,website,rating,user_ratings_total,geometry';
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      return NextResponse.json(data);
    } else if (type === 'search' && query && location) {
      // Text Search API
      const encodedQuery = encodeURIComponent(query);
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodedQuery}&location=${location.lat},${location.lng}&radius=${radius || 5000}&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      return NextResponse.json(data);
    } else if (type === 'nearby' && location) {
      // Nearby Search API
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius || 5000}&type=health&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Places API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
