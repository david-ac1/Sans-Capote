/**
 * AI Service Discovery API
 * Uses Gemini to discover and enrich sexual health services
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Cache for AI responses (24 hour TTL)
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(req: NextRequest) {
  try {
    const { prompt, country, language, mode = 'discover' } = await req.json();

    if (!prompt || !country) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not configured');
      return NextResponse.json(
        { error: "AI service not configured", services: [] },
        { status: 503 }
      );
    }

    // Check cache first
    const cacheKey = `${mode}_${country}_${language}`;
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('✅ Returning cached AI discovery for', country);
      return NextResponse.json(cached.data);
    }

    // Call Gemini
    console.log('🤖 AI discovering services in', country);
    console.log('📝 Prompt length:', prompt.length, 'chars');
    console.log('🔑 API Key present:', !!process.env.GEMINI_API_KEY);
    console.log('🔑 API Key prefix:', process.env.GEMINI_API_KEY?.substring(0, 20) + '...');
    
    try {
      console.log('⏳ Step 1: Creating Gemini model...');
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 16384, // Increased from 2048 to allow complete JSON responses
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
      });
      console.log('✅ Step 1: Model created with safety settings disabled');

      console.log('⏳ Step 2: Calling generateContent...');
      console.log('📤 Sending prompt:', prompt.substring(0, 200) + '...');
      
      const result = await model.generateContent(prompt);
      console.log('✅ Step 2: Gemini responded');
      
      console.log('⏳ Step 3: Extracting response...');
      const response = result.response;
      console.log('✅ Step 3: Response object obtained');
      
      console.log('⏳ Step 4: Getting text...');
      const text = response.text();
      console.log('✅ Step 4: Text extracted');
      
      console.log('📝 Response length:', text.length, 'chars');
      console.log('📄 Full response text:');
      console.log('====== START RESPONSE ======');
      console.log(text);
      console.log('====== END RESPONSE ======');
      
      // Check if response is blocked by safety
      const candidates = result.response.candidates;
      if (candidates && candidates.length > 0) {
        const candidate = candidates[0];
        console.log('🔍 Finish reason:', candidate.finishReason);
        console.log('🔍 Safety ratings:', JSON.stringify(candidate.safetyRatings, null, 2));
      }

      // Parse JSON from response
      let jsonData;
      try {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || 
                         text.match(/```\n?([\s\S]*?)\n?```/) ||
                         [null, text];
        
        const jsonText = jsonMatch[1] || text;
        jsonData = JSON.parse(jsonText.trim());
      } catch {
        console.error('Failed to parse Gemini JSON, attempting fallback...');
        
        // Fallback: try to extract any JSON object
        const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
        if (jsonObjectMatch) {
          try {
            jsonData = JSON.parse(jsonObjectMatch[0]);
          } catch {
            console.error('❌ JSON parse failed:', text.substring(0, 500));
            return NextResponse.json(
              { error: "Failed to parse AI response", rawText: text.substring(0, 500), services: [] },
              { status: 500 }
            );
          }
        } else {
          console.error('❌ No JSON found in response:', text.substring(0, 500));
          return NextResponse.json(
            { error: "No valid JSON found in response", rawText: text.substring(0, 500), services: [] },
            { status: 500 }
          );
        }
      }
      
      // Ensure services array exists
      if (!jsonData.services || !Array.isArray(jsonData.services)) {
        console.error('❌ Invalid response structure:', jsonData);
        return NextResponse.json(
          { error: "Invalid response structure", services: [] },
          { status: 500 }
        );
      }
      
      console.log(`✅ Parsed ${jsonData.services.length} services from AI`);

      // Cache the response
      responseCache.set(cacheKey, {
        data: jsonData,
        timestamp: Date.now(),
      });

      // Clean old cache entries
      if (responseCache.size > 100) {
        const now = Date.now();
        for (const [key, value] of responseCache.entries()) {
          if (now - value.timestamp > CACHE_TTL) {
            responseCache.delete(key);
          }
        }
      }

      return NextResponse.json(jsonData);
    } catch (geminiError) {
      console.error('❌ ========== GEMINI ERROR DETAILS ==========');
      console.error('Error type:', geminiError instanceof Error ? geminiError.constructor.name : typeof geminiError);
      console.error('Error message:', geminiError instanceof Error ? geminiError.message : String(geminiError));
      console.error('Error stack:', geminiError instanceof Error ? geminiError.stack : 'N/A');
      
      // Log the full error object
      if (typeof geminiError === 'object' && geminiError !== null) {
        console.error('Error object keys:', Object.keys(geminiError));
        console.error('Full error object:', JSON.stringify(geminiError, null, 2));
      }
      
      console.error('❌ ==========================================');
      
      return NextResponse.json(
        { 
          error: "Gemini API failed", 
          errorType: geminiError instanceof Error ? geminiError.constructor.name : typeof geminiError,
          details: geminiError instanceof Error ? geminiError.message : String(geminiError),
          stack: geminiError instanceof Error ? geminiError.stack : undefined,
          services: [] 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("❌ ========== OUTER ERROR DETAILS ==========");
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'N/A');
    console.error("❌ ==========================================");
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Internal server error", 
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        services: [] 
      },
      { status: 500 }
    );
  }
}

// Clear cache endpoint (optional, for testing)
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get('country');
  
  if (country) {
    // Clear specific country cache
    const keys = Array.from(responseCache.keys()).filter(k => k.includes(country));
    keys.forEach(k => responseCache.delete(k));
    return NextResponse.json({ cleared: keys.length });
  } else {
    // Clear all cache
    const size = responseCache.size;
    responseCache.clear();
    return NextResponse.json({ cleared: size });
  }
}
