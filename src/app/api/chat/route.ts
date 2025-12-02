import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// System prompt that sets the context for HIV education
const getSystemPrompt = () => {
  const resources = {
    what_is_hiv: "HIV is a virus that attacks the immune system. With treatment, people living with HIV can stay healthy and live long lives.",
    prevention_methods: ["Consistent condom use", "Pre-Exposure Prophylaxis (PrEP)", "Post-Exposure Prophylaxis (PEP)", "Regular testing"],
    treatment: "Antiretroviral therapy (ART) is the recommended treatment for HIV. It can reduce the viral load to undetectable levels, which means the virus can't be transmitted to others."
  };

  return `You are a helpful, compassionate, and knowledgeable HIV educator named "Sans Capote". Your role is to provide accurate, non-judgmental information about HIV prevention, treatment, and resources.

IMPORTANT GUIDELINES:
1. Always be supportive, non-judgmental, and compassionate
2. Provide clear, evidence-based information in simple language
3. Be sensitive to cultural contexts and different backgrounds
4. Maintain a warm, conversational tone
5. If asked about personal medical advice, recommend consulting a healthcare provider
6. Use the provided context when available, but prioritize accuracy
7. Keep responses concise and focused on the user's question
8. If you don't know something, say so and offer to help find the information

RESOURCE CONTEXT:
- HIV is a virus that attacks the immune system. With treatment, people living with HIV can stay healthy and live long lives.
- Prevention methods include consistent condom use, PrEP (Pre-Exposure Prophylaxis), PEP (Post-Exposure Prophylaxis), and regular testing.
- Treatment involves Antiretroviral Therapy (ART) which can reduce the viral load to undetectable levels, preventing transmission to others.
- Regular medical care and adherence to medication are crucial for effective treatment.
- Stigma and discrimination are significant barriers to HIV prevention and treatment.
- Support services are available for people living with HIV, including counseling and peer support groups.

Context:
${JSON.stringify({ resources }, null, 2)}`;
};

export async function POST(req: Request) {
  try {
    const { messages, countryCode } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    const SYSTEM_PROMPT = getSystemPrompt();
    
    // Format messages for Gemini
    const historyMessages = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = genAI.getGenerativeModel({ model: "gemini-pro" }).startChat({
      history: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [{ text: "I understand. I'm here to provide accurate, compassionate information about HIV prevention, treatment, and resources. How can I assist you today?" }],
        },
        ...historyMessages,
      ],
    });

    const userMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    // Generate contextual follow-up suggestions based on the conversation
    const suggestions = [
      "What are the symptoms of HIV?",
      "How can I get tested?",
      "What's the difference between HIV and AIDS?",
      "How effective is PrEP?"
    ];

    return NextResponse.json({
      answer: text,
      suggestions,
      safetyNotice: "This information is for educational purposes only and not a substitute for professional medical advice."
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Error processing your request', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error processing your request' },
      { status: 500 }
    );
  }
}