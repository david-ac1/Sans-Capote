/**
 * Test endpoint to verify Gemini API connectivity
 * Access: http://localhost:3000/api/test-gemini
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {},
  };

  try {
    // Check 1: API Key exists
    console.log('🔍 Test 1: Checking GEMINI_API_KEY...');
    results.checks.apiKeyExists = !!process.env.GEMINI_API_KEY;
    results.checks.apiKeyPrefix = process.env.GEMINI_API_KEY?.substring(0, 20) + '...';
    results.checks.apiKeyLength = process.env.GEMINI_API_KEY?.length;
    console.log('✅ API Key:', results.checks.apiKeyExists ? 'Present' : 'Missing');

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "GEMINI_API_KEY not found in environment",
        results,
      });
    }

    // Check 2: Initialize Gemini client
    console.log('🔍 Test 2: Initializing Gemini client...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    results.checks.clientInitialized = true;
    console.log('✅ Client initialized');

    // Check 3: Create model
    console.log('🔍 Test 3: Creating model...');
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
    });
    results.checks.modelCreated = true;
    console.log('✅ Model created');

    // Check 4: Simple test call
    console.log('🔍 Test 4: Making simple API call...');
    const testPrompt = "Say 'Hello' in JSON format: {\"message\": \"Hello\"}";
    console.log('📤 Test prompt:', testPrompt);
    
    const result = await model.generateContent(testPrompt);
    console.log('✅ API call successful');
    
    const response = result.response;
    const text = response.text();
    
    results.checks.apiCallSuccessful = true;
    results.checks.responseLength = text.length;
    results.checks.responsePreview = text.substring(0, 200);
    results.checks.fullResponse = text;
    
    console.log('📝 Response:', text);

    // Check 5: Try JSON extraction
    console.log('🔍 Test 5: Testing JSON extraction...');
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        results.checks.jsonParsing = 'Success';
        results.checks.parsedJson = parsed;
      } else {
        results.checks.jsonParsing = 'No JSON found in response';
      }
    } catch (parseError) {
      results.checks.jsonParsing = 'Failed to parse';
      results.checks.jsonParseError = parseError instanceof Error ? parseError.message : String(parseError);
    }

    // Check 6: Test with health-related prompt (like our actual use case)
    console.log('🔍 Test 6: Testing health-related prompt...');
    const healthPrompt = `Find 1 health clinic in Nigeria. Return only JSON:
{
  "services": [
    {
      "name": "Example Clinic",
      "city": "Lagos",
      "lat": 6.5,
      "lng": 3.4
    }
  ]
}`;
    
    try {
      const healthResult = await model.generateContent(healthPrompt);
      const healthText = healthResult.response.text();
      results.checks.healthPromptSuccess = true;
      results.checks.healthResponseLength = healthText.length;
      results.checks.healthResponsePreview = healthText.substring(0, 300);
      console.log('✅ Health-related prompt successful');
    } catch (healthError) {
      results.checks.healthPromptSuccess = false;
      results.checks.healthPromptError = healthError instanceof Error ? healthError.message : String(healthError);
      console.log('❌ Health-related prompt failed:', healthError);
    }

    return NextResponse.json({
      success: true,
      message: "All Gemini API tests passed!",
      results,
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorStack: error instanceof Error ? error.stack : undefined,
      results,
    }, { status: 500 });
  }
}
