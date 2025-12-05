/**
 * Standalone Gemini API Test
 * Run with: node test-gemini-standalone.mjs
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Your API key from .env.local
const GEMINI_API_KEY = "AIzaSyCgGmideQC0gm7hKWmqSdy31G6EerEi10I";

async function testGemini() {
  console.log('🔍 Starting Gemini API Test...\n');

  try {
    // Test 1: Initialize client
    console.log('Test 1: Initializing Gemini client...');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log('✅ Client initialized\n');

    // Test 2: Create model
    console.log('Test 2: Creating model...');
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
    });
    console.log('✅ Model created\n');

    // Test 3: Simple test
    console.log('Test 3: Making simple API call...');
    const simplePrompt = "Say hello in JSON: {\"message\": \"Hello\"}";
    console.log('📤 Prompt:', simplePrompt);
    
    const result1 = await model.generateContent(simplePrompt);
    const text1 = result1.response.text();
    console.log('✅ Response:', text1);
    console.log('');

    // Test 4: Health-related prompt (actual use case)
    console.log('Test 4: Testing health clinic prompt...');
    const healthPrompt = `Find 2 sexual health services in Nigeria.

Return ONLY this JSON:
{
  "services": [
    {
      "name": "Clinic Name",
      "city": "Lagos",
      "lat": 6.5,
      "lng": 3.4,
      "metadata": {
        "hivTestingAvailable": true,
        "confidenceScore": 0.8
      }
    }
  ]
}`;
    
    console.log('📤 Prompt:', healthPrompt.substring(0, 100) + '...');
    
    const result2 = await model.generateContent(healthPrompt);
    const text2 = result2.response.text();
    console.log('✅ Response length:', text2.length, 'chars');
    console.log('📝 Full response:\n', text2);
    console.log('');

    // Test 5: Extract JSON
    console.log('Test 5: Extracting JSON...');
    const jsonMatch = text2.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ JSON parsed successfully:');
        console.log(JSON.stringify(parsed, null, 2));
      } catch (parseError) {
        console.log('❌ JSON parse failed:', parseError.message);
      }
    } else {
      console.log('❌ No JSON found in response');
    }

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check for specific Gemini errors
    if (error.message?.includes('API_KEY_INVALID')) {
      console.error('\n⚠️  API key is invalid. Generate a new one at: https://aistudio.google.com/apikey');
    } else if (error.message?.includes('quota')) {
      console.error('\n⚠️  Quota exceeded. Check limits at: https://aistudio.google.com/');
    } else if (error.message?.includes('SAFETY')) {
      console.error('\n⚠️  Response blocked by safety filters');
    }
  }
}

testGemini();
