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
