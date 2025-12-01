import { NextRequest, NextResponse } from "next/server";

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
