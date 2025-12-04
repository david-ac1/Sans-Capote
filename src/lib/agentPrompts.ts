/**
 * ElevenLabs Conversational Agent system prompts and utilities.
 * Provides persona-specific guidance for Crisis and Guide pages.
 */

export type AgentPersona = "crisis_counselor" | "health_guide";
export type AgentLanguage = "en" | "fr";

interface AgentPromptConfig {
  systemPrompt: string;
  language: AgentLanguage;
  persona: AgentPersona;
}

/**
 * Crisis Counselor Persona — Empathetic, urgent, action-oriented.
 * Gathers exposure info quickly and recommends PEP access.
 */
export function getCrisisCounselorPrompt(
  language: AgentLanguage,
  countryCode: string
): AgentPromptConfig {
  const systemPrompt =
    language === "fr"
      ? `Tu es un conseiller en santé sexuelle empathique et urgent pour ${countryCode}. 
Tu dois:
1. Accueillir l'utilisateur avec chaleur: "Bonjour, je suis là pour vous aider."
2. Poser des questions claires sur l'exposition (délai, type, préservatif, PrEP).
3. Extraire précisément: délai en heures (ex: 24), type (ex: rapports anaux), usage du préservatif (oui/non), PrEP (oui/non).
4. Dire l'urgence: "Vous avez [N] heures pour la PEP—c'est urgent" ou "La fenêtre PEP a fermé".
5. Recommander les 3 cliniques PEP les plus proches avec détails de contact.
6. Rester non-jugeant, calme et rassurant même dans l'urgence.
Réponds UNIQUEMENT en français. Sois bref et direct.`
      : `You are a warm, empathetic, and urgent sexual health counselor for ${countryCode}.
You must:
1. Greet the user warmly: "Hi, I'm here to help. Tell me what happened."
2. Ask clear questions about exposure (time, type, condom, PrEP).
3. Extract precisely: time in hours (e.g., 24), type (e.g., anal sex), condom use (yes/no), PrEP status (yes/no).
4. State urgency: "You have [N] hours for PEP—this is urgent" or "The PEP window has closed."
5. Recommend the 3 nearest PEP clinics with contact details.
6. Remain non-judgmental, calm, and reassuring even in crisis.
Respond ONLY in English. Be brief and direct.`;

  return { systemPrompt, language, persona: "crisis_counselor" };
}

/**
 * Health Guide Persona — Informative, non-judgmental, culturally sensitive.
 * Answers sexual health, STI, PrEP, consent, and mental health questions.
 */
export function getHealthGuidePrompt(
  language: AgentLanguage,
  countryCode: string
): AgentPromptConfig {
  const systemPrompt =
    language === "fr"
      ? `Tu es un guide de santé sexuelle bienveillant et sans jugement pour le contexte africain (${countryCode}).
Tu dois:
1. Accueillir l'utilisateur: "Bienvenue. Vous pouvez me poser n'importe quelle question sur la santé sexuelle."
2. Répondre aux questions sur: VIH, IST, PrEP, PEP, préservatifs, consentement, santé mentale, LGBTQIA+.
3. Utiliser un langage simple et clair, adapté au contexte culturel.
4. Rester non-jugeant, inclusif et rassurant.
5. Recommander les ressources locales ou cliniques si approprié.
6. Encourager les questions de suivi: "Avez-vous d'autres questions?"
Réponds UNIQUEMENT en français. Sois empathique et accessible.`
      : `You are a warm, non-judgmental sexual health guide for African contexts (${countryCode}).
You must:
1. Welcome the user: "Welcome. You can ask me anything about sexual health."
2. Answer questions on: HIV, STIs, PrEP, PEP, condoms, consent, mental health, LGBTQIA+.
3. Use simple, clear language adapted to cultural context.
4. Remain non-judgmental, inclusive, and reassuring.
5. Recommend local resources or clinics when appropriate.
6. Encourage follow-up: "Do you have any other questions?"
Respond ONLY in English. Be empathetic and accessible.`;

  return { systemPrompt, language, persona: "health_guide" };
}

/**
 * Extract triage data from crisis conversation.
 * Looks for patterns like "24 hours", "anal sex", "no condom", "not on PrEP".
 */
export function extractTriageData(conversationText: string): {
  timeSince: string | null;
  exposureType: string | null;
  condomUsed: string | null;
  onPrep: string | null;
} {
  const text = conversationText.toLowerCase();

  // Time since exposure (hours)
  let timeSince: string | null = null;
  if (text.match(/less than 24|<24|\bwithin 24\b/i)) timeSince = "<24";
  else if (text.match(/24.*48|between 24|1 to 2 days/i)) timeSince = "24-48";
  else if (text.match(/48.*72|2 to 3 days|two to three/i)) timeSince = "48-72";
  else if (text.match(/more than 72|>72|over 72|3 days|past 72/i)) timeSince = ">72";
  else if (text.match(/\b(\d+)\s*hour/i)) {
    const match = text.match(/\b(\d+)\s*hour/i);
    if (match) {
      const hours = parseInt(match[1], 10);
      if (hours < 24) timeSince = "<24";
      else if (hours < 48) timeSince = "24-48";
      else if (hours < 72) timeSince = "48-72";
      else timeSince = ">72";
    }
  }

  // Exposure type
  let exposureType: string | null = null;
  if (text.match(/anal|butt|ass/i)) exposureType = "anal";
  else if (text.match(/vaginal|pussy|vagina/i)) exposureType = "vaginal";
  else if (text.match(/oral|mouth|blow|head/i)) exposureType = "oral";
  else if (text.match(/needle|injection|sharing|drug|blood/i)) exposureType = "needle";
  else if (text.match(/penetrative|sex/i)) exposureType = "penetrative";

  // Condom use
  let condomUsed: string | null = null;
  if (text.match(/no condom|without|bare|raw|unprotected/i)) condomUsed = "no";
  else if (text.match(/condom broke|broke|slipped|ripped|tore/i)) condomUsed = "broke";
  else if (text.match(/yes.*condom|with condom|protected|condom.*used/i)) condomUsed = "yes";

  // PrEP status
  let onPrep: string | null = null;
  if (text.match(/\bon prep\b|\bprep\b.*yes|taking prep|on my prep/i)) onPrep = "yes";
  else if (text.match(/not on prep|no prep|don't.*prep|never.*prep/i)) onPrep = "no";
  else if (text.match(/sometimes|missed|inconsistent|forgot|skip/i)) onPrep = "sometimes";

  return { timeSince, exposureType, condomUsed, onPrep };
}

/**
 * Get discreet mode system prompt variation (neutral, minimal language).
 */
export function getDiscreetModePrompt(
  basePrompt: string,
  language: AgentLanguage
): string {
  const discreetNote =
    language === "fr"
      ? "\n[MODE DISCRET: Utilisez un langage neutre, évitez les mots explicites. Parlez bas.]"
      : "\n[DISCREET MODE: Use neutral language, avoid explicit terms. Speak quietly.]";
  return basePrompt + discreetNote;
}
