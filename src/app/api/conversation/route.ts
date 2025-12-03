import { NextRequest, NextResponse } from "next/server";
import { countryGuides } from "../../../data/countryGuides";
import { resources } from "../../../data/resources";
import { servicesDirectory } from "../../../data/servicesDirectory";
import { logConversationMetric } from "../../../lib/metrics";

// Simple types for the conversation API. We can later extend this when wiring Gemini.

type Role = "user" | "assistant" | "system";

interface ChatMessage {
  role: Role;
  content: string;
}

interface CrisisContext {
  timeSince?: "<24" | "24-48" | "48-72" | ">72";
  exposureType?: "vaginal" | "anal" | "oral" | "needle" | "blood";
  condomUsed?: "no" | "broke" | "yes";
  onPrep?: "no" | "sometimes" | "yes";
}

interface ConversationRequestBody {
  messages: ChatMessage[];
  language?: "en" | "fr";
  countryCode?: string; // e.g. "NG", "KE", "UG", "ZA", "RW", "GH"
  mode?: "general" | "crisis" | "navigator" | "resources";
  crisisContext?: CrisisContext;
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
  // fullAnswer contains the unmodified AI output; shortAnswer is a bite-sized
  // summary for phone screens and faster TTS. Clients can show a "read full"
  // option when fullAnswer is present and longer than shortAnswer.
  fullAnswer?: string;
  shortAnswer?: string;
}

async function tryGeminiAnswer(
  body: ConversationRequestBody
): Promise<ConversationAnswer | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const {
    messages,
    language = "en",
    countryCode,
    mode = "general",
    crisisContext,
  } = body;

  const isFrench = language === "fr";

  const baseSafetyNoticeEn =
    "This information is educational and not a medical diagnosis. If you feel very unwell, have severe pain, heavy bleeding, or trouble breathing, go to the nearest clinic or hospital immediately.";
  const baseSafetyNoticeFr =
    "Ces informations sont éducatives et ne remplacent pas un diagnostic médical. Si vous vous sentez très mal, avez de fortes douleurs, des saignements importants ou des difficultés à respirer, rendez-vous immédiatement dans la clinique ou l'hôpital le plus proche.";

  const safetyNotice = isFrench ? baseSafetyNoticeFr : baseSafetyNoticeEn;

  const guide = countryCode
    ? countryGuides.find((c) => c.code === countryCode)
    : undefined;

  const countryGuideSnippet = guide
    ? guide.prep.steps
        .slice(0, 2)
        .map((s) => `- ${s.title}: ${s.detail}`)
        .join("\n")
    : "";

  const resourcesSnippet = resources
    .slice(0, 3)
    .map((cat) => {
      const item = cat.items[0];
      if (!item) return "";
      const summary = language === "fr" ? item.summaryFr : item.summaryEn;
      return `- ${item.title}: ${summary}`;
    })
    .filter(Boolean)
    .join("\n");

  const crisisSnippet = crisisContext
    ? `Crisis context: timeSince=${crisisContext.timeSince}, exposureType=${crisisContext.exposureType}, condomUsed=${crisisContext.condomUsed}, onPrep=${crisisContext.onPrep}.`
    : "";

  const localServicesSnippet = countryCode
    ? servicesDirectory
        .filter((s) => s.country === countryCode)
        .slice(0, 5)
        .map((s) => {
          const notes = language === "fr" ? s.notesFr : s.notesEn;
          const phone = s.phone ? ` | phone: ${s.phone}` : "";
          const verified = s.verifiedAt
            ? language === "fr"
              ? ` | vérifié le ${s.verifiedAt} (${s.verifiedBy ?? "inconnu"})`
              : ` | verified at ${s.verifiedAt} (${s.verifiedBy ?? "unknown"})`
            : "";
          return `- ${s.name} (${s.city}): ${notes}${phone}${verified}`;
        })
        .join("\n")
    : "";

  const lastUserMessage = [...messages]
    .slice(-20) // cap conversation length for safety
    .reverse()
    .find((m) => m.role === "user");

  // Truncate very long user content to avoid sending excessive context to Gemini
  const rawUserContent = lastUserMessage?.content ?? "";
  const userContent =
    rawUserContent.length > 2000
      ? `${rawUserContent.slice(0, 2000)}…`
      : rawUserContent;

  const systemPrompt = isFrench
    ? `Tu es Sans Capote, un assistant numérique en santé sexuelle et prévention du VIH pour des personnes vivant en Afrique. Tu dois :
- Utiliser un langage simple, chaleureux, sans jugement, adapté à des personnes sans formation médicale.
- Parler comme une vraie personne : naturel, conversationnel, avec empathie.
- Garder les réponses courtes (max 400 mots) pour une lecture vocale fluide.
- Utiliser des phrases courtes (< 15 mots) pour que l'audio soit facile à suivre.
- Fournir des explications claires sur le VIH, la PrEP, la PEP, le dépistage, les IST et la santé sexuelle.
- Ne pas poser de diagnostic et ne pas promettre de résultat de test.
- Rappeler que les informations ne remplacent pas une consultation médicale.
- Respecter la confidentialité, éviter les termes stigmatisants.

FORMAT DE RÉPONSE :
- Réponds en AU PLUS 4 à 5 courtes sections adaptées à un écran de téléphone.
- Commence chaque section par un titre court en gras.
- Ajoute des pauses naturelles (sauts de ligne) où le lecteur peut respirer.
- Va droit au but sur ce que la personne peut faire MAINTENANT.

Contexte pays (si disponible) :
${countryGuideSnippet || "(aucun contexte pays spécifique)"}

Ressources éducatives internes (résumés) :
${resourcesSnippet}

${crisisSnippet}

Services locaux (à privilégier) :
${localServicesSnippet || "(pas encore de services locaux listés)"}

Réponds UNIQUEMENT en français.`
    : `You are Sans Capote, a warm and empathetic AI sexual health and HIV prevention guide for people in African countries. You must:
- Use simple, non-judgmental language suitable for non-medical users.
- Speak naturally and conversationally, like a real person with genuine empathy.
- Keep answers short and scannable (max 400 words) for natural voice delivery.
- Use short sentences (< 15 words each) so audio is easy to follow.
- Give clear explanations about HIV, PrEP, PEP, testing, STIs, consent, and mental health.
- Not give a medical diagnosis and not promise any specific test result.
- Remind users that this does not replace seeing a clinician, and encourage local care.
- Respect privacy, avoid stigmatizing language, and avoid any graphic descriptions.

ANSWER FORMAT:
- Reply in NO MORE THAN 4 to 5 short sections suitable for a phone screen.
- Start each section with a short, clear heading.
- Add natural pauses (line breaks) where the listener might want to reflect.
- Focus on what the person can do NOW, in their country and context.

Country context (if available):
${countryGuideSnippet || "(no specific country context)"}

Internal educational resources (summaries):
${resourcesSnippet}

${crisisSnippet}

Local services (prefer mentioning these when relevant):
${localServicesSnippet || "(no specific local services listed yet)"}

Reply ONLY in English.`;

  const modelName = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: systemPrompt },
          {
            text: `User question and context (mode=${mode}, language=${language}, countryCode=${countryCode ?? "unknown"}):\n${userContent}`,
          },
        ],
      },
    ],
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("Gemini API error", await res.text());
      return null;
    }

    const data = (await res.json()) as any;
    const candidate = data.candidates?.[0];
    const text =
      candidate?.content?.parts
        ?.map((p: any) => p.text)
        .filter(Boolean)
        .join(" ") ?? "";

    if (!text) {
      return null;
    }

    // Create a short, bite-sized version for mobile screens and faster TTS
    const makeShort = (src: string) => {
      const MAX_CHARS = 600;
      const MAX_SENTENCES = 4;
      if (src.length <= MAX_CHARS) return src;
      const sentences = src.match(/[^.!?]+[.!?]*[.!?]?/g) || [];
      const candidate = sentences.slice(0, MAX_SENTENCES).join(' ').trim();
      if (candidate.length >= 80) return candidate + (candidate.length < src.length ? '…' : '');
      // Fallback to truncating characters
      return src.slice(0, Math.min(MAX_CHARS, src.length)).trim() + '…';
    };

    const short = makeShort(text);

    const suggestions = isFrench
      ? [
          "Explique-moi une autre option de prévention adaptée à ma situation.",
          "Aide-moi à préparer ce que je peux dire à la clinique.",
          "Dis-moi quand refaire un test de dépistage après cette situation.",
        ]
      : [
          "Suggest another HIV prevention option that could fit my situation.",
          "Help me practice what to say when I get to the clinic.",
          "Tell me when I should plan follow-up HIV tests after this.",
        ];

    console.log("[conversation] Using Gemini answer", {
      language,
      countryCode,
      mode,
    });

    return {
      answer: short,
      fullAnswer: text,
      shortAnswer: short,
      suggestions,
      safetyNotice,
      meta: {
        language,
        countryCode,
        mode,
        offlineFallbackUsed: false,
      },
    };
  } catch (error) {
    console.error("Gemini call failed", error);
    return null;
  }
}

function buildMockAnswer({
  messages,
  language = "en",
  countryCode,
  mode = "general",
  crisisContext,
}: ConversationRequestBody): ConversationAnswer {
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");

  const baseSafetyNoticeEn =
    "This information is educational and not a medical diagnosis. If you feel very unwell, have severe pain, heavy bleeding, or trouble breathing, go to the nearest clinic or hospital immediately.";
  const baseSafetyNoticeFr =
    "Ces informations sont éducatives et ne remplacent pas un diagnostic médical. Si vous vous sentez très mal, avez de fortes douleurs, des saignements importants ou des difficultés à respirer, rendez-vous immédiatement dans la clinique ou l'hôpital le plus proche.";

  const isFrench = language === "fr";
  const safetyNotice = isFrench ? baseSafetyNoticeFr : baseSafetyNoticeEn;

  const makeShort = (src: string) => {
    const MAX_CHARS = 600;
    const MAX_SENTENCES = 4;
    if (src.length <= MAX_CHARS) return src;
    const sentences = src.match(/[^.!?]+[.!?]*[.!?]?/g) || [];
    const candidate = sentences.slice(0, MAX_SENTENCES).join(' ').trim();
    if (candidate.length >= 80) return candidate + (candidate.length < src.length ? '…' : '');
    return src.slice(0, Math.min(MAX_CHARS, src.length)).trim() + '…';
  };

  // Specialised crisis logic using structured fields from the Crisis page
  if (mode === "crisis" && crisisContext) {
    const { timeSince, exposureType, condomUsed, onPrep } = crisisContext;

    const pepWindowEn = (() => {
      if (!timeSince) return "";
      if (timeSince === "<24") {
        return "You are still within the ideal PEP window. Go as soon as you can to a clinic or hospital that offers PEP — today if possible.";
      }
      if (timeSince === "24-48") {
        return "You are still within the usual 72-hour PEP window. It is important to go as soon as possible — do not wait for symptoms.";
      }
      if (timeSince === "48-72") {
        return "You are near the end of the usual 72-hour PEP window. Go urgently to a clinic or hospital that offers PEP and explain exactly when the exposure happened.";
      }
      return "You are likely outside the usual 72-hour PEP window. PEP may no longer be recommended, but you should still speak to a clinician about testing and follow-up.";
    })();

    const pepWindowFr = (() => {
      if (!timeSince) return "";
      if (timeSince === "<24") {
        return "Vous êtes encore dans la période idéale pour la PEP. Allez dès que possible dans une clinique ou un hôpital qui propose la PEP — aujourd'hui si possible.";
      }
      if (timeSince === "24-48") {
        return "Vous êtes encore dans la fenêtre habituelle de 72 heures pour la PEP. Il est important d'y aller le plus vite possible — n'attendez pas l'apparition de symptômes.";
      }
      if (timeSince === "48-72") {
        return "Vous êtes proche de la fin de la fenêtre habituelle de 72 heures pour la PEP. Rendez-vous en urgence dans une clinique ou un hôpital qui propose la PEP et expliquez exactement quand l'exposition a eu lieu.";
      }
      return "Vous êtes probablement en dehors de la fenêtre habituelle de 72 heures pour la PEP. La PEP peut ne plus être recommandée, mais vous devriez quand même parler à un soignant du dépistage et du suivi.";
    })();

    const riskLineEn = (() => {
      if (!exposureType) return "";
      const highRisk = exposureType === "vaginal" || exposureType === "anal";
      const protectionUsed = condomUsed === "yes" || onPrep === "yes";

      if (highRisk && !protectionUsed) {
        return "Vaginal or anal sex without reliable protection (no condom or broken condom, and no regular PrEP) can carry a meaningful risk for HIV. This is why acting quickly for PEP and follow-up testing is important.";
      }
      if (highRisk && protectionUsed) {
        return "Because this was vaginal or anal sex but you used some protection (a condom that mostly stayed on or regular PrEP), the risk is lower, but it is still reasonable to seek medical advice and testing.";
      }
      if (exposureType === "oral") {
        return "Oral sex generally carries a much lower risk for HIV than vaginal or anal sex, especially if there were no visible sores or bleeding. Even so, testing and a conversation with a clinician can help you feel more secure.";
      }
      if (exposureType === "needle" || exposureType === "blood") {
        return "Sharing needles or direct contact with blood can carry a higher risk for HIV. You should seek care as soon as possible for PEP assessment and follow-up testing.";
      }
      return "";
    })();

    const riskLineFr = (() => {
      if (!exposureType) return "";
      const highRisk = exposureType === "vaginal" || exposureType === "anal";
      const protectionUsed = condomUsed === "yes" || onPrep === "yes";

      if (highRisk && !protectionUsed) {
        return "Un rapport vaginal ou anal sans protection fiable (pas de préservatif ou préservatif cassé, et sans PrEP régulière) peut comporter un risque important pour le VIH. C'est pour cela qu'il est important d'agir vite pour la PEP et le dépistage.";
      }
      if (highRisk && protectionUsed) {
        return "Comme il s'agissait d'un rapport vaginal ou anal mais avec une certaine protection (préservatif qui a globalement tenu ou PrEP prise régulièrement), le risque est plus faible, mais il reste pertinent de consulter et de faire un test.";
      }
      if (exposureType === "oral") {
        return "Le sexe oral comporte en général un risque beaucoup plus faible pour le VIH que les rapports vaginaux ou anaux, surtout s'il n'y avait pas de plaies visibles ou de saignements. Malgré tout, un dépistage et un échange avec un soignant peuvent vous rassurer.";
      }
      if (exposureType === "needle" || exposureType === "blood") {
        return "Le partage de seringues ou le contact direct avec du sang peut comporter un risque plus élevé pour le VIH. Vous devriez consulter dès que possible pour une évaluation PEP et un suivi de dépistage.";
      }
      return "";
    })();

    const testingPlanEn =
      "Even if PEP is not started or not available, HIV testing is still important. Many guidelines suggest an initial test soon after the exposure, a repeat test around 6 weeks, and another test at about 3 months for a final confirmation.";
    const testingPlanFr =
      "Même si la PEP n'est pas commencée ou n'est pas disponible, le dépistage du VIH reste important. De nombreuses recommandations proposent un premier test peu après l'exposition, un autre vers 6 semaines, puis un dernier vers 3 mois pour confirmer la situation.";

    const countryLineEn = countryCode
      ? `If you can, go to a public clinic, hospital, or HIV service in ${countryCode}. If one place refuses to help you or makes you feel judged, you have the right to seek another clinic or an NGO that offers HIV services.`
      : "If you can, go to a public clinic, hospital, or HIV service near you. If one place refuses to help you or makes you feel judged, you have the right to look for another clinic or an NGO that offers HIV services.";

    const countryLineFr = countryCode
      ? `Si possible, allez dans une clinique publique, un hôpital ou un service VIH en ${countryCode}. Si un lieu refuse de vous aider ou vous juge, vous avez le droit de chercher une autre clinique ou une ONG qui propose des services VIH.`
      : "Si possible, allez dans une clinique publique, un hôpital ou un service VIH près de chez vous. Si un endroit refuse de vous aider ou vous juge, vous avez le droit de chercher une autre clinique ou une ONG qui propose des services VIH.";

    const answer = isFrench
      ? [pepWindowFr, riskLineFr, testingPlanFr, countryLineFr]
          .filter(Boolean)
          .join(" \n\n")
      : [pepWindowEn, riskLineEn, testingPlanEn, countryLineEn]
          .filter(Boolean)
          .join(" \n\n");

    const suggestions = isFrench
      ? [
          "Explique-moi plus en détail comment fonctionne la PEP.",
          "Aide-moi à préparer ce que je peux dire au personnel de la clinique.",
          "Quels autres risques dois-je surveiller après cette exposition ?",
        ]
      : [
          "Explain in simple words how PEP works and the usual side effects.",
          "Help me practice what I can say to the clinic staff when I arrive.",
          "What other health risks should I watch for after this exposure?",
        ];

    const answerShort = makeShort(answer);
    return {
      answer: answerShort,
      fullAnswer: answer,
      shortAnswer: answerShort,
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

  const countryText = countryCode
    ? isFrench
      ? ` en ${countryCode}`
      : ` in ${countryCode}`
    : "";

  const intentHint = (() => {
    const text = lastUserMessage?.content.toLowerCase() ?? "";

    if (text.includes("hiv")) {
      return isFrench
        ? "Vous posez une question sur le VIH. Le VIH est un virus qui attaque progressivement le système immunitaire. Sans traitement, il peut évoluer vers le sida, mais avec un traitement antirétroviral pris régulièrement, de nombreuses personnes vivent longtemps et en bonne santé, avec une charge virale indétectable et un risque très faible de transmettre le virus. Le VIH se transmet surtout par des rapports sexuels sans protection, le partage de seringues et certaines expositions au sang. Il ne se transmet pas par les câlins, les poignées de main, la nourriture ou les moustiques."
        : "You are asking about HIV. HIV is a virus that gradually attacks the immune system. Without treatment it can lead to AIDS, but with regular antiretroviral treatment many people live long, healthy lives, often with an undetectable viral load and a very low risk of passing on the virus. HIV is mainly passed on through unprotected sex, sharing needles, and certain blood exposures. It is not spread by hugging, handshakes, food, or mosquito bites.";
    }

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

  const answerShort = makeShort(answer);
  return {
    answer: answerShort,
    fullAnswer: answer,
    shortAnswer: answerShort,
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
  const startTime = Date.now();
  let body: ConversationRequestBody | null = null;

  try {
    body = (await request.json()) as ConversationRequestBody;

    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      logConversationMetric({
        timestamp: new Date().toISOString(),
        type: 'conversation_error',
        durationMs: Date.now() - startTime,
        language: body?.language ?? 'unknown',
        countryCode: body?.countryCode,
        mode: body?.mode ?? 'unknown',
        modelUsed: 'none',
        error: 'Missing messages in request body',
        errorType: 'validation',
      });
      return NextResponse.json({ error: "Missing messages in request body." }, { status: 400 });
    }
    // Basic safety: cap conversation length and individual message sizes
    const MAX_MESSAGES = 30;
    const MAX_MESSAGE_LENGTH = 4000;

    if (body.messages.length > MAX_MESSAGES) {
      body.messages = body.messages.slice(-MAX_MESSAGES);
    }

    body.messages = body.messages.map((m) => ({
      ...m,
      content:
        m.content.length > MAX_MESSAGE_LENGTH
          ? `${m.content.slice(0, MAX_MESSAGE_LENGTH)}…`
          : m.content,
    }));

    // Normalise language and mode values
    if (body.language !== "en" && body.language !== "fr") {
      body.language = "en";
    }

    const allowedModes: ConversationRequestBody["mode"][] = [
      "general",
      "crisis",
      "navigator",
      "resources",
    ];
    if (!allowedModes.includes(body.mode ?? "general")) {
      body.mode = "general";
    }
    const geminiAnswer = await Promise.resolve().then(() => tryGeminiAnswer(body!));
    const response = geminiAnswer ?? buildMockAnswer(body!);
    
    logConversationMetric({
      timestamp: new Date().toISOString(),
      type: 'conversation_response',
      durationMs: Date.now() - startTime,
      language: body!.language ?? 'en',
      countryCode: body!.countryCode,
      mode: body!.mode ?? 'general',
      requestLength: body!.messages.reduce((sum, m) => sum + m.content.length, 0),
      responseLength: response.answer.length,
      modelUsed: 'gemini-2.5-flash',
    });
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorType = error instanceof Error ? error.constructor.name : 'unknown';
    
    console.error("/api/conversation error", errorMsg, error);
    
    logConversationMetric({
      timestamp: new Date().toISOString(),
      type: 'conversation_error',
      durationMs: Date.now() - startTime,
      language: body?.language ?? 'unknown',
      countryCode: body?.countryCode,
      mode: body?.mode ?? 'unknown',
      modelUsed: 'gemini-2.5-flash',
      error: errorMsg,
      errorType,
    });

    return NextResponse.json(
      {
        error:
          "Unable to process your question right now. Please try again in a moment.",
        details: process.env.NODE_ENV === 'development' ? errorMsg : undefined,
      },
      { status: 500 }
    );
  }
}
