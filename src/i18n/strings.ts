export type Lang = "en" | "fr";

export const strings = {
  app: {
    brand: {
      en: "Sans Capote",
      fr: "Sans Capote",
    },
    settingsTitle: {
      en: "Settings & Privacy",
      fr: "Paramètres & confidentialité",
    },
  },
  home: {
    subtitle: {
      en: "Private sexual health & HIV support.",
      fr: "Un soutien privé pour la santé sexuelle et le VIH.",
    },
    description: {
      en: "Designed for African contexts. Low data. Stigma-free. Works even with weak or no network.",
      fr: "Pensé pour les contextes africains. Peu de données. Sans jugement. Fonctionne même avec un réseau faible ou coupé.",
    },
    cards: {
      guide: {
        title: {
          en: "AI Sexual Health Guide",
          fr: "Guide IA de santé sexuelle",
        },
        body: {
          en: "Ask questions in private. Get clear, non-judgmental answers.",
          fr: "Posez vos questions en privé. Recevez des réponses claires, sans jugement.",
        },
      },
      navigator: {
        title: {
          en: "HIV Prevention Navigator",
          fr: "Navigateur de prévention du VIH",
        },
        body: {
          en: "Learn about PrEP, PEP, condoms, and testing in your country.",
          fr: "Comprenez la PrEP, la PEP, les préservatifs et le dépistage dans votre pays.",
        },
      },
      resources: {
        title: {
          en: "Education Hub",
          fr: "Centre d'information",
        },
        body: {
          en: "Simple guides on HIV, STIs, consent, LGBTQ+ health, and stigma.",
          fr: "Guides simples sur le VIH, les IST, le consentement, la santé LGBTQ+ et la stigmatisation.",
        },
      },
      crisis: {
        title: {
          en: "I was just exposed",
          fr: "Je viens peut-être d'être exposé·e",
        },
        body: {
          en: "Step-by-step guidance on PEP, timing, and where to go now.",
          fr: "Des étapes claires sur la PEP, les délais et où aller maintenant.",
        },
      },
      settings: {
        title: {
          en: "Settings & Privacy",
          fr: "Paramètres & confidentialité",
        },
        body: {
          en: "Choose language, country, and discreet mode. No account needed.",
          fr: "Choisissez la langue, le pays et le mode discret. Aucun compte requis.",
        },
      },
    },
    footerNotice: {
      en: "This tool does not replace a doctor. In an emergency, go to the nearest clinic or hospital.",
      fr: "Cet outil ne remplace pas un médecin. En cas d'urgence, allez à la clinique ou à l'hôpital le plus proche.",
    },
  },
  nav: {
    home: { en: "Home", fr: "Accueil" },
    guide: { en: "Guide", fr: "Guide" },
    navigator: { en: "Navigator", fr: "Navigation" },
    resources: { en: "Resources", fr: "Ressources" },
    crisis: { en: "Crisis", fr: "Urgence" },
    settings: { en: "Settings", fr: "Paramètres" },
    sectionTitle: {
      home: { en: "Home", fr: "Accueil" },
      guide: { en: "AI Guide", fr: "Guide IA" },
      navigator: { en: "Navigator", fr: "Navigation" },
      resources: { en: "Resources", fr: "Ressources" },
      crisis: { en: "Crisis", fr: "Urgence" },
      settings: { en: "Settings", fr: "Paramètres" },
    },
  },
  settings: {
    intro: {
      en: "Choose your language, country, and discreet mode. No login or account is required.",
      fr: "Choisissez votre langue, votre pays et le mode discret. Aucun compte n'est nécessaire.",
    },
    languageLabel: { en: "Language", fr: "Langue" },
    countryLabel: { en: "Country", fr: "Pays" },
    discreetLabel: { en: "Discreet mode", fr: "Mode discret" },
    discreetHelp: {
      en: "Use a neutral app name and hide explicit sexual health wording where possible.",
      fr: "Utiliser un nom d'application neutre et cacher les mots trop explicites quand c'est possible.",
    },
    playbackRateLabel: { en: "Playback speed", fr: "Vitesse de lecture" },
    playbackRateHelp: {
      en: "Adjust how quickly assistant replies are read aloud (1.0x–2.0x).",
      fr: "Ajustez la vitesse de lecture des réponses (1.0x–2.0x).",
    },
    voicePrefLabel: { en: "Preferred input", fr: "Méthode préférée" },
    voicePrefHelp: {
      en: "Choose whether you prefer voice or text input as the default.",
      fr: "Choisissez si vous préférez la saisie vocale ou texte par défaut.",
    },
  },
  guide: {
    title: { en: "AI Sexual Health Guide", fr: "Guide IA de santé sexuelle" },
    intro: {
      en: "Ask your questions in private. This space is stigma-free and does not store your messages.",
      fr: "Posez vos questions en privé. Cet espace est sans jugement et ne stocke pas vos messages.",
    },
    examplesTitle: {
      en: "Examples you can ask:",
      fr: "Exemples de questions :",
    },
  },
  crisis: {
    title: { en: "I was just exposed", fr: "Je viens peut-être d'être exposé·e" },
    subtitle: {
      en: "A rapid, step-by-step guide for what to do after a possible HIV exposure.",
      fr: "Un guide rapide, étape par étape, après une possible exposition au VIH.",
    },
    step1: {
      en: "Step 1: Tell us what happened",
      fr: "Étape 1 : Expliquez ce qui s'est passé",
    },
    step2: {
      en: "Step 2: What this means",
      fr: "Étape 2 : Ce que cela signifie",
    },
    timeSince: { en: "Time since exposure", fr: "Temps depuis l'exposition" },
    exposureType: { en: "Type of exposure", fr: "Type d'exposition" },
    condomUsed: { en: "Condom used?", fr: "Préservatif utilisé ?" },
    onPrep: { en: "On PrEP?", fr: "Sous PrEP ?" },
    submit: {
      en: "Get urgent guidance",
      fr: "Obtenir un avis urgent",
    },
    submitting: {
      en: "Checking timing…",
      fr: "Analyse du délai…",
    },
  },
  navigator: {
    title: { en: "HIV Prevention Navigator", fr: "Navigateur de prévention du VIH" },
    subtitle: {
      en: "Learn about PrEP, PEP, condoms, and HIV testing with guidance tailored to your country.",
      fr: "Comprenez la PrEP, la PEP, les préservatifs et le dépistage avec des conseils adaptés à votre pays.",
    },
    disclaimer: {
      en: "This information is educational and does not replace medical advice. In an emergency, go to the nearest clinic or hospital.",
      fr: "Ces informations sont à titre éducatif et ne remplacent pas les conseils médicaux. En cas d'urgence, allez à la clinique ou à l'hôpital le plus proche.",
    },
    exposureForm: {
      en: "Check PEP Eligibility",
      fr: "Vérifier l'éligibilité à la PEP",
    },
    timeSinceExposure: { en: "Time since exposure (hours)", fr: "Temps depuis l'exposition (heures)" },
    exposureTypeLabel: { en: "Type of exposure", fr: "Type d'exposition" },
    condomUsedLabel: { en: "Was a condom used?", fr: "Un préservatif a-t-il été utilisé ?" },
    submit: { en: "Check PEP Timing", fr: "Vérifier la fenêtre PEP" },
    pepUrgent: {
      en: "🚨 URGENT: PEP must be started within 72 hours. Go to a clinic NOW.",
      fr: "🚨 URGENT : La PEP doit être commencée dans les 72 heures. Allez à la clinique MAINTENANT.",
    },
    pepWindow: {
      en: "⏰ PEP WINDOW OPEN: You are still within the 72-hour window. Go to a clinic as soon as possible.",
      fr: "⏰ FENÊTRE PEP OUVERTE : Vous êtes dans la fenêtre de 72 heures. Allez à une clinique dès que possible.",
    },
    pepClosed: {
      en: "❌ PEP window has closed (>72 hours). Focus on getting tested and learning about PrEP for future protection.",
      fr: "❌ La fenêtre PEP a fermé (>72 heures). Concentrez-vous sur le dépistage et la PrEP pour l'avenir.",
    },
    nearestClinics: { en: "Nearest clinics & services", fr: "Cliniques et services les plus proches" },
    mapViewToggle: { en: "Show on map", fr: "Afficher sur la carte" },
    listViewToggle: { en: "List view", fr: "Vue liste" },
    lgbtqiaRating: { en: "LGBTQIA+ friendly", fr: "Accueil LGBTQIA+" },
    pepAvailability: { en: "PEP availability", fr: "Disponibilité PEP" },
    prepAvailability: { en: "PrEP availability", fr: "Disponibilité PrEP" },
    call: { en: "Call", fr: "Appeler" },
    directions: { en: "Directions", fr: "Itinéraire" },
    shareClinic: { en: "Share", fr: "Partager" },
    geoConsentTitle: {
      en: "Share your location?",
      fr: "Partager votre localisation ?",
    },
    geoConsentBody: {
      en: "We can find clinics nearest to you. Your location is used locally only and is never stored.",
      fr: "Nous pouvons trouver les cliniques les plus proches de vous. Votre localisation est utilisée localement uniquement.",
    },
    geoAllow: { en: "Allow location", fr: "Autoriser la localisation" },
    geoDeny: { en: "Use manual search", fr: "Recherche manuelle" },
    offlineNotice: {
      en: "Offline: Showing cached clinic data.",
      fr: "Hors ligne : Affichage des données de clinique en cache.",
    },
  },
  resources: {
    title: { en: "Education Hub", fr: "Centre d'information" },
    subtitle: {
      en: "Short, simple explanations about HIV, STIs, LGBTQ+ health, consent, and mental health.",
      fr: "Des explications courtes et simples sur le VIH, les IST, la santé LGBTQ+, le consentement et la santé mentale.",
    },
  },
};

export function t(dict: { en: string; fr: string }, lang: Lang) {
  return dict[lang];
}
