import { NextRequest, NextResponse } from "next/server";

// Simple types for the conversation API. We can later extend this when wiring Gemini.

type Role = "user" | "assistant" | "system";

interface ChatMessage {
  role: Role;
  content: string;
}

interface ConversationRequestBody {
  messages: ChatMessage[];
  language?: "en" | "fr";
  countryCode?: string; // e.g. "NG", "KE", "UG", "ZA", "RW", "GH"
  mode?: "general" | "crisis" | "navigator" | "resources";
}

interface ConversationAnswer {
  answer: string;
  suggestions: string[];
  safetyNotice: string;
  meta: {
    language: "en" | "fr";
    countryCode?: string;
    mode: string;
    offlineFallbackUsed: boolean;
  };
}

function buildMockAnswer({
  messages,
  language = "en",
  countryCode,
  mode = "general",
}: ConversationRequestBody): ConversationAnswer {
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");

  const baseSafetyNoticeEn =
    "This information is educational and not a medical diagnosis. If you feel very unwell, have severe pain, heavy bleeding, or trouble breathing, go to the nearest clinic or hospital immediately.";
  const baseSafetyNoticeFr =
    "Ces informations sont éducatives et ne remplacent pas un diagnostic médical. Si vous vous sentez très mal, avez de fortes douleurs, des saignements importants ou des difficultés à respirer, rendez-vous immédiatement dans la clinique ou l'hôpital le plus proche.";

  const isFrench = language === "fr";
  const safetyNotice = isFrench ? baseSafetyNoticeFr : baseSafetyNoticeEn;

  const countryText = countryCode
    ? isFrench
      ? ` en ${countryCode}`
      : ` in ${countryCode}`
    : "";

  const intentHint = (() => {
    const text = lastUserMessage?.content.toLowerCase() ?? "";

    if (text.includes("pep")) {
      return isFrench
        ? "Vous parlez de la PEP. La PEP doit idéalement être commencée dans les 24 heures après une exposition possible au VIH, et au plus tard dans les 72 heures. Allez dès que possible dans une clinique ou un hôpital qui propose la PEP." 
        : "You are asking about PEP. PEP should ideally be started within 24 hours after a possible HIV exposure, and no later than 72 hours. Go as soon as you can to a clinic or hospital that offers PEP.";
    }

    if (text.includes("prep")) {
      return isFrench
        ? "Vous parlez de la PrEP. La PrEP est un médicament que l'on prend régulièrement pour réduire fortement le risque d'attraper le VIH. Vous pouvez demander la PrEP dans certaines cliniques publiques, privées ou auprès d'ONG dans votre pays." 
        : "You are asking about PrEP. PrEP is a medicine you take regularly to strongly reduce the risk of getting HIV. You can ask about PrEP at some public clinics, private clinics, or NGOs in your country.";
    }

    if (text.includes("test") || text.includes("testing")) {
      return isFrench
        ? "Vous posez une question sur le dépistage du VIH. En général, on recommande un test 6 semaines après une exposition possible, puis un autre test 3 mois après pour être sûr."
        : "You are asking about HIV testing. In many guidelines, a test around 6 weeks after a possible exposure is suggested, and another test at 3 months can confirm your status.";
    }

    return isFrench
      ? "Merci d'avoir partagé votre question. Je vais vous donner une explication simple, sans jugement, basée sur ce que nous savons des meilleures pratiques de prévention du VIH et de la santé sexuelle."
      : "Thank you for sharing your question. I will give you a simple, non-judgmental explanation based on current best practices for HIV prevention and sexual health.";
  })();

  const modeHint = (() => {
    if (mode === "crisis") {
      return isFrench
        ? "Si vous pensez avoir eu une exposition récente au VIH, la vitesse est très importante. Dans l'idéal, cherchez une clinique qui propose la PEP dans les 24 heures, et au plus tard dans les 72 heures." 
        : "If you think you had a recent possible HIV exposure, timing is very important. Ideally, find a clinic that offers PEP within 24 hours, and no later than 72 hours.";
    }

    if (mode === "navigator") {
      return isFrench
        ? "Je peux vous guider étape par étape pour la PrEP, la PEP, les préservatifs et le dépistage, en tenant compte des réalités de votre pays." 
        : "I can guide you step by step for PrEP, PEP, condoms, and testing, taking into account the realities of your country.";
    }

    if (mode === "resources") {
      return isFrench
        ? "Je peux aussi vous expliquer les bases du VIH, des IST, de la santé mentale et du consentement en langage simple." 
        : "I can also explain the basics of HIV, STIs, mental health, and consent in simple language.";
    }

    return "";
  })();

  const answer = isFrench
    ? `${intentHint}${countryText ? " " + countryText : ""} ${modeHint}`.trim()
    : `${intentHint}${countryText ? " " + countryText : ""} ${modeHint}`.trim();

  const suggestions = isFrench
    ? [
        "Explique-moi la différence entre la PrEP et la PEP.",
        "Que dois-je faire si je n'ai pas d'argent pour aller à la clinique ?",
        "Quels sont les signes d'une IST sans montrer de photos ?",
      ]
    : [
        "Explain the difference between PrEP and PEP.",
        "What can I do if I don't have money to go to a clinic?",
        "What are signs of an STI without showing pictures?",
      ];

  return {
    answer,
    suggestions,
    safetyNotice,
    meta: {
      language,
      countryCode,
      mode,
      offlineFallbackUsed: false,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ConversationRequestBody;

    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: "Missing messages in request body." },
        { status: 400 }
      );
    }

    const response = buildMockAnswer(body);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("/api/conversation error", error);
    return NextResponse.json(
      {
        error:
          "Unable to process your question right now. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
