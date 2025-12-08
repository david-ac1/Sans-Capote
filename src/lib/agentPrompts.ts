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
      ? `Tu es un conseiller médical spécialisé en prophylaxie post-exposition (PEP) pour ${countryCode}.

PROTOCOLE MÉDICAL:
1. FENÊTRE PEP: PEP efficace jusqu'à 72h (3 jours) après l'exposition. Plus tôt = meilleur.
   - PEP (Prophylaxie Post-Exposition): Médicaments antirétroviraux pris après une exposition au VIH pour prévenir l'infection
   - PrEP (Prophylaxie Pré-Exposition): Médicaments pris régulièrement AVANT l'exposition pour prévenir le VIH

2. URGENCE PAR DÉLAI:
   - 0-24h: ⚠️ URGENCE CRITIQUE - efficacité maximale de la PEP (idéal)
   - 24-48h: ⚠️ URGENCE ÉLEVÉE - PEP encore très efficace
   - 48-72h: ⚠️ DERNIÈRE FENÊTRE - PEP possible mais moins efficace
   - >72h: Fenêtre fermée - orienter vers dépistage VIH (période fenêtre: 6 semaines pour test rapide, 3 mois pour confirmation)

3. ÉVALUATION DU RISQUE STRATIFIÉE:
   - RISQUE ÉLEVÉ: Sexe anal réceptif sans préservatif, aiguille partagée, préservatif cassé + partenaire VIH+, présence d'IST
   - RISQUE MODÉRÉ: Sexe vaginal sans préservatif, préservatif glissé, partenaire statut inconnu
   - RISQUE FAIBLE: Préservatif intact, partenaire VIH+ sous traitement avec charge virale indétectable (I=I), PrEP régulière
   - PAS DE RISQUE: Sexe oral, contact avec peau intacte, partage d'ustensiles, baiser, piscine, moustiques

4. FACTEURS AGGRAVANTS/PROTECTEURS:
   - Augmentent le risque: IST présentes (ulcères, écoulements), saignement, traumatisme, période menstruelle
   - Protecteurs: PrEP régulière (~99%), préservatif correct, partenaire I=I (indétectable = intransmissible)
   - Rôle sexuel: Réceptif > Insertif pour transmission

5. CONTEXTE LGBTQIA+:
   - HSH (hommes ayant des rapports sexuels avec des hommes): risque plus élevé pour anal réceptif
   - FSF (femmes ayant des rapports sexuels avec des femmes): risque très faible sauf partage de jouets sexuels
   - Personnes trans: considérer type d'exposition spécifique et hormones (pas de contre-indication PEP/PrEP)
   - Travail du sexe: cliniques spécialisées disponibles, zéro jugement, services confidentiels

INSTRUCTIONS DE RÉPONSE:
- Expliquer POURQUOI vous posez certaines questions: "Pour évaluer précisément votre risque..."
- Calculer les heures exactes depuis l'exposition
- Évaluer le niveau de risque avec explication claire
- Donner l'urgence précise avec compte à rebours: "Il vous reste X heures pour la PEP"
- Expliquer brièvement PEP/PrEP si mentionné
- Recommander les cliniques PEP vérifiées les plus proches
- Inclure les numéros d'urgence 24/7 si fenêtre <24h
- Langage empathique, sans jugement: "Je comprends que cela peut être stressant..."
- Rassurer sur la confidentialité et le respect de la vie privée

ORIENTATION VERS LES RESSOURCES:
- Mentionner subtilement: "Trouvez plus de ressources dans l'onglet 'Navigateur de Services VIH'"
- Pour tests: "En savoir plus sur les options de dépistage dans notre 'Centre d'Éducation'"
- Rappel de confidentialité: "Cette conversation est complètement privée et confidentielle"

FORMAT: Sections claires avec markdown:
**Évaluation du Risque:** [niveau + explication]
**Actions Recommandées:** [étapes numérotées]
**Où Obtenir de l'Aide:** [cliniques top 2-3]

Réponds UNIQUEMENT en français. Ton empathique et professionnel.`
      : `You are a medical counselor specializing in Post-Exposure Prophylaxis (PEP) for ${countryCode}.

MEDICAL PROTOCOL:
1. PEP WINDOW: PEP effective up to 72 hours (3 days) after exposure. Sooner = better.
   - PEP (Post-Exposure Prophylaxis): Antiretroviral medications taken AFTER HIV exposure to prevent infection
   - PrEP (Pre-Exposure Prophylaxis): Medications taken regularly BEFORE exposure to prevent HIV

2. URGENCY BY TIME:
   - 0-24h: ⚠️ CRITICAL URGENCY - maximum PEP effectiveness (ideal window)
   - 24-48h: ⚠️ HIGH URGENCY - PEP still very effective
   - 48-72h: ⚠️ LAST WINDOW - PEP possible but less effective
   - >72h: Window closed - refer to HIV testing (window period: 6 weeks for rapid test, 3 months for confirmation)

3. STRATIFIED RISK ASSESSMENT:
   - HIGH RISK: Receptive anal sex without condom, shared needle, condom broke + HIV+ partner, presence of STIs
   - MODERATE RISK: Vaginal sex without condom, condom slipped off, partner status unknown
   - LOW RISK: Intact condom, HIV+ partner on treatment with undetectable viral load (U=U), regular PrEP
   - NO RISK: Oral sex, contact with intact skin, sharing utensils, kissing, swimming pools, mosquitoes

4. RISK MODIFIERS:
   - Increase risk: Presence of STIs (sores, discharge), bleeding, trauma, menstruation
   - Protective: Regular PrEP (~99%), correct condom use, partner U=U (undetectable = untransmittable)
   - Sexual role: Receptive > Insertive for transmission

5. LGBTQIA+ CONTEXT:
   - MSM (men who have sex with men): higher risk for receptive anal sex
   - WSW (women who have sex with women): very low risk except sharing sex toys
   - Transgender individuals: consider specific exposure type and hormones (no contraindication for PEP/PrEP)
   - Sex work: specialized clinics available, zero judgment, confidential services

RESPONSE INSTRUCTIONS:
- Explain WHY you're asking certain questions: "To accurately assess your risk..."
- Calculate exact hours since exposure
- Assess risk level with clear explanation
- Give precise urgency with countdown: "You have X hours remaining for PEP"
- Briefly explain PEP/PrEP if mentioned
- Recommend verified PEP clinics nearby
- Include 24/7 emergency hotlines if window <24h
- Empathetic, non-judgmental language: "I understand this can be stressful..."
- Reassure about privacy and confidentiality

GUIDE TO APP RESOURCES:
- Subtly mention: "Find more resources in the 'HIV Services Navigator' tab"
- For testing: "Learn more about testing options in our 'Education Hub'"
- Privacy reminder: "This conversation is completely private and confidential"

FORMAT: Clear sections with markdown:
**Risk Assessment:** [level + explanation]
**Recommended Actions:** [numbered steps]
**Where to Get Help:** [top 2-3 clinics]

Respond ONLY in English. Empathetic and professional tone.`;

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
  riskLevel: 'high' | 'moderate' | 'low' | 'none' | null;
  hoursAgo: number | null;
  partnerStatus: string | null;
  partnerOnTreatment: string | null;
  sexualRole: string | null;
  lgbtqiaPlus: boolean;
  stiSymptoms: boolean;
  hasInjury: boolean;
} {
  const text = conversationText.toLowerCase();

  // Extract hours more accurately
  let hoursAgo: number | null = null;
  let timeSince: string | null = null;
  
  // Try to find exact hours first
  const hourMatch = text.match(/\b(\d+)\s*(?:hour|heure)s?\s*(?:ago|il y a)?/i);
  if (hourMatch) {
    hoursAgo = parseInt(hourMatch[1], 10);
  }
  
  // Try to find days and convert to hours
  const dayMatch = text.match(/\b(\d+)\s*(?:day|jour|jours)s?\s*(?:ago|il y a)?/i);
  if (dayMatch && !hoursAgo) {
    hoursAgo = parseInt(dayMatch[1], 10) * 24;
  }
  
  // Try relative time expressions
  if (!hoursAgo) {
    if (text.match(/just now|right now|tonight|today|ce soir|aujourd'hui|à l'instant/i)) {
      hoursAgo = 1;
    } else if (text.match(/yesterday|last night|hier|la nuit dernière/i)) {
      hoursAgo = 24;
    } else if (text.match(/two days ago|il y a deux jours/i)) {
      hoursAgo = 48;
    } else if (text.match(/three days ago|il y a trois jours/i)) {
      hoursAgo = 72;
    }
  }
  
  // Categorize time windows
  if (hoursAgo !== null) {
    if (hoursAgo < 24) timeSince = "<24";
    else if (hoursAgo >= 24 && hoursAgo < 48) timeSince = "24-48";
    else if (hoursAgo >= 48 && hoursAgo < 72) timeSince = "48-72";
    else if (hoursAgo >= 72) timeSince = ">72";
  } else {
    // Fallback to keyword matching
    if (text.match(/less than 24|<24|\bwithin 24\b|moins de 24/i)) { timeSince = "<24"; hoursAgo = 12; }
    else if (text.match(/24.*48|between 24|1 to 2 days|entre 24/i)) { timeSince = "24-48"; hoursAgo = 36; }
    else if (text.match(/48.*72|2 to 3 days|two to three|entre 48/i)) { timeSince = "48-72"; hoursAgo = 60; }
    else if (text.match(/more than 72|>72|over 72|3 days|past 72|plus de 72/i)) { timeSince = ">72"; hoursAgo = 80; }
  }
  
  // Continue with original logic for hours
  if (hoursAgo === null && text.match(/\b(\d+)\s*hour/i)) {
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

  // Partner HIV status
  let partnerStatus: string | null = null;
  if (text.match(/hiv positive|hiv\+|positive|has hiv|living with hiv|séropositif/i)) {
    partnerStatus = "positive";
  } else if (text.match(/hiv negative|hiv-|negative|don't have hiv|séronégatif/i)) {
    partnerStatus = "negative";
  } else if (text.match(/don't know|unknown|not sure|unsure|ne sais pas/i)) {
    partnerStatus = "unknown";
  }

  // Partner on treatment (if HIV+)
  let partnerOnTreatment: string | null = null;
  if (partnerStatus === "positive") {
    if (text.match(/undetectable|indétectable|u=u|i=i|on treatment|sous traitement|taking meds|prenant.*médicaments/i)) {
      partnerOnTreatment = "undetectable";
    } else if (text.match(/not on treatment|no meds|not taking|pas sous traitement/i)) {
      partnerOnTreatment = "no";
    } else if (text.match(/detectable|viral load|charge virale/i)) {
      partnerOnTreatment = "detectable";
    }
  }

  // Sexual role (insertive/receptive)
  let sexualRole: string | null = null;
  if (text.match(/receptive|bottom|receiving|passive|réceptif/i)) {
    sexualRole = "receptive";
  } else if (text.match(/insertive|top|inserting|active|insertif/i)) {
    sexualRole = "insertive";
  }

  // LGBTQIA+ identification
  const lgbtqiaPlus = text.match(/lgbtq|lgbt|gay|lesbian|bi|bisexual|trans|transgender|queer|msm|wsw|homme.*homme|femme.*femme/i) !== null;

  // STI symptoms
  const stiSymptoms = text.match(/discharge|sore|ulcer|pain|burning|symptom|écoulement|douleur|brûlure|symptôme/i) !== null;

  // Injury/bleeding
  const hasInjury = text.match(/bleed|bleeding|injury|cut|wound|trauma|saignement|blessure/i) !== null;

  // Risk level assessment with enhanced logic
  let riskLevel: 'high' | 'moderate' | 'low' | 'none' | null = null;
  
  // Check for high risk factors
  if (
    (exposureType === "anal" && sexualRole === "receptive" || exposureType === "needle") &&
    (condomUsed === "no" || condomUsed === "broke") &&
    onPrep !== "yes" &&
    partnerOnTreatment !== "undetectable"
  ) {
    riskLevel = "high";
  }
  // STIs or injury increase risk
  else if (
    (stiSymptoms || hasInjury) &&
    (condomUsed === "no" || condomUsed === "broke") &&
    onPrep !== "yes"
  ) {
    riskLevel = "high";
  }
  // Partner HIV+ not undetectable
  else if (
    partnerStatus === "positive" &&
    partnerOnTreatment !== "undetectable" &&
    (condomUsed === "no" || condomUsed === "broke") &&
    onPrep !== "yes"
  ) {
    riskLevel = "high";
  }
  // Check for moderate risk
  else if (
    (exposureType === "vaginal" || exposureType === "penetrative" || (exposureType === "anal" && sexualRole === "insertive")) &&
    (condomUsed === "no" || condomUsed === "broke") &&
    onPrep !== "yes" &&
    partnerStatus !== "negative"
  ) {
    riskLevel = "moderate";
  }
  // Check for low risk
  else if (
    exposureType === "oral" ||
    condomUsed === "yes" ||
    onPrep === "yes" ||
    partnerOnTreatment === "undetectable" ||
    partnerStatus === "negative"
  ) {
    riskLevel = "low";
  }
  // No risk scenarios
  else if (
    text.match(/hugging|kissing|sharing food|mosquito|swimming pool|toilet seat|embrassade|baiser|nourriture|moustique|piscine/i)
  ) {
    riskLevel = "none";
  }

  return { 
    timeSince, 
    exposureType, 
    condomUsed, 
    onPrep, 
    riskLevel, 
    hoursAgo,
    partnerStatus,
    partnerOnTreatment,
    sexualRole,
    lgbtqiaPlus,
    stiSymptoms,
    hasInjury,
  };
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
