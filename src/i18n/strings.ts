export type Lang = "en" | "fr" | "sw";

export const strings = {
  app: {
    brand: {
      en: "Sans Capote",
      fr: "Sans Capote",
      sw: "Sans Capote",
    },
    settingsTitle: {
      en: "Settings & Privacy",
      fr: "Paramètres & confidentialité",
      sw: "Mipangilio & Faragha",
    },
  },
  home: {
    subtitle: {
      en: "Private sexual health & HIV support.",
      fr: "Un soutien privé pour la santé sexuelle et le VIH.",
      sw: "Msaada wa faragha wa afya ya kingono na UKIMWI.",
    },
    description: {
      en: "Designed for African contexts. Low data. Stigma-free. Works even with weak or no network.",
      fr: "Pensé pour les contextes africains. Peu de données. Sans jugement. Fonctionne même avec un réseau faible ou coupé.",
      sw: "Imeundwa kwa muktadha wa Kiafrika. Data kidogo. Bila ubaguzi. Inafanya kazi hata bila mtandao.",
    },
    cards: {
      guide: {
        title: {
          en: "AI Sexual Health Guide",
          fr: "Guide IA de santé sexuelle",
          sw: "Mwongozo wa AI wa Afya ya Kingono",
        },
        body: {
          en: "Ask questions in private. Get clear, non-judgmental answers.",
          fr: "Posez vos questions en privé. Recevez des réponses claires, sans jugement.",
          sw: "Uliza maswali kwa faragha. Pata majibu wazi, bila ubaguzi.",
        },
      },
      navigator: {
        title: {
          en: "HIV Services Navigator",
          fr: "Navigateur de services du VIH",
          sw: "Kiongozi cha Huduma za UKIMWI",
        },
        body: {
          en: "Learn about PrEP, PEP, condoms, and testing in your country.",
          fr: "Comprenez la PrEP, la PEP, les préservatifs et le dépistage dans votre pays.",
          sw: "Jifunze kuhusu PrEP, PEP, kondomu, na upimaji katika nchi yako.",
        },
      },
      resources: {
        title: {
          en: "Education Hub",
          fr: "Centre d'information",
          sw: "Kituo cha Elimu",
        },
        body: {
          en: "Simple guides on HIV, STIs, consent, LGBTQ+ health, and stigma.",
          fr: "Guides simples sur le VIH, les IST, le consentement, la santé LGBTQ+ et la stigmatisation.",
          sw: "Mwongozo rahisi kuhusu UKIMWI, magonjwa ya zinaa, ridhaa, afya ya LGBTQ+, na ubaguzi.",
        },
      },
      crisis: {
        title: {
          en: "I was just exposed",
          fr: "Je viens peut-être d'être exposé·e",
          sw: "Nimekutana na hatari",
        },
        body: {
          en: "Step-by-step guidance on PEP, timing, and where to go now.",
          fr: "Des étapes claires sur la PEP, les délais et où aller maintenant.",
          sw: "Mwongozo wa hatua kwa hatua wa PEP, muda, na wapi kwenda sasa.",
        },
      },
      settings: {
        title: {
          en: "Settings & Privacy",
          fr: "Paramètres & confidentialité",
          sw: "Mipangilio & Faragha",
        },
        body: {
          en: "Choose language, country, and discreet mode. No account needed.",
          fr: "Choisissez la langue, le pays et le mode discret. Aucun compte requis.",
          sw: "Chagua lugha, nchi, na hali ya siri. Hakuna akaunti inayohitajika.",
        },
      },
    },
    footerNotice: {
      en: "This tool does not replace a doctor. In an emergency, go to the nearest clinic or hospital.",
      fr: "Cet outil ne remplace pas un médecin. En cas d'urgence, allez à la clinique ou à l'hôpital le plus proche.",
      sw: "Chombo hiki hakibadilishi daktari. Katika dharura, nenda kliniki au hospitali iliyo karibu.",
    },
  },
  nav: {
    home: { en: "Home", fr: "Accueil", sw: "Nyumbani" },
    guide: { en: "Guide", fr: "Guide", sw: "Mwongozo" },
    navigator: { en: "Navigator", fr: "Navigation", sw: "Kiongozi" },
    resources: { en: "Resources", fr: "Ressources", sw: "Rasilimali" },
    crisis: { en: "Crisis", fr: "Urgence", sw: "Dharura" },
    settings: { en: "Settings", fr: "Paramètres", sw: "Mipangilio" },
    sectionTitle: {
      home: { en: "Home", fr: "Accueil", sw: "Nyumbani" },
      guide: { en: "AI Guide", fr: "Guide IA", sw: "Mwongozo wa AI" },
      navigator: { en: "Navigator", fr: "Navigation", sw: "Kiongozi" },
      resources: { en: "Resources", fr: "Ressources", sw: "Rasilimali" },
      crisis: { en: "Crisis", fr: "Urgence", sw: "Dharura" },
      settings: { en: "Settings", fr: "Paramètres", sw: "Mipangilio" },
    },
  },
  settings: {
    intro: {
      en: "Choose your language, country, and discreet mode. No login or account is required.",
      fr: "Choisissez votre langue, votre pays et le mode discret. Aucun compte n'est nécessaire.",
      sw: "Chagua lugha yako, nchi, na hali ya siri. Hakuna kuingia au akaunti inayohitajika.",
    },
    languageLabel: { en: "Language", fr: "Langue", sw: "Lugha" },
    countryLabel: { en: "Country", fr: "Pays", sw: "Nchi" },
    discreetLabel: { en: "Discreet mode", fr: "Mode discret", sw: "Hali ya siri" },
    discreetHelp: {
      en: "Use a neutral app name and hide explicit sexual health wording where possible.",
      fr: "Utiliser un nom d'application neutre et cacher les mots trop explicites quand c'est possible.",
      sw: "Tumia jina la programu la wastani na ficha maneno ya wazi ya afya ya kingono inapowezekana.",
    },
    playbackRateLabel: { en: "Playback speed", fr: "Vitesse de lecture", sw: "Kasi ya kucheza" },
    playbackRateHelp: {
      en: "Adjust how quickly assistant replies are read aloud (1.0x–2.0x).",
      fr: "Ajustez la vitesse de lecture des réponses (1.0x–2.0x).",
      sw: "Rekebisha jinsi majibu yanasomwa kwa sauti haraka (1.0x–2.0x).",
    },
    voicePrefLabel: { en: "Preferred input", fr: "Méthode préférée", sw: "Ingizo unalopendelea" },
    voicePrefHelp: {
      en: "Choose whether you prefer voice or text input as the default.",
      fr: "Choisissez si vous préférez la saisie vocale ou texte par défaut.",
      sw: "Chagua kama unapendelea sauti au maandishi kama chaguo-msingi.",
    },
  },
  guide: {
    title: { en: "AI Sexual Health Guide", fr: "Guide IA de santé sexuelle", sw: "Mwongozo wa AI wa Afya ya Kingono" },
    intro: {
      en: "Ask your questions in private. This space is stigma-free and does not store your messages.",
      fr: "Posez vos questions en privé. Cet espace est sans jugement et ne stocke pas vos messages.",
      sw: "Uliza maswali yako kwa faragha. Eneo hili halina ubaguzi na halisimamii ujumbe wako.",
    },
    examplesTitle: {
      en: "Examples you can ask:",
      fr: "Exemples de questions :",
      sw: "Mifano ya maswali unayoweza kuuliza:",
    },
  },
  crisis: {
    title: { en: "I was just exposed", fr: "Je viens peut-être d'être exposé·e", sw: "Nimekutana na hatari" },
    subtitle: {
      en: "A rapid, step-by-step guide for what to do after a possible HIV exposure.",
      fr: "Un guide rapide, étape par étape, après une possible exposition au VIH.",
      sw: "Mwongozo wa haraka, hatua kwa hatua, wa kufanya baada ya hatari ya UKIMWI.",
    },
    step1: {
      en: "Step 1: Tell us what happened",
      fr: "Étape 1 : Expliquez ce qui s'est passé",
      sw: "Hatua 1: Tuambie kilichotokea",
    },
    step2: {
      en: "Step 2: What this means",
      fr: "Étape 2 : Ce que cela signifie",
      sw: "Hatua 2: Hii inamaanisha nini",
    },
    timeSince: { en: "Time since exposure", fr: "Temps depuis l'exposition", sw: "Muda tangu hatari" },
    exposureType: { en: "Type of exposure", fr: "Type d'exposition", sw: "Aina ya hatari" },
    condomUsed: { en: "Condom used?", fr: "Préservatif utilisé ?", sw: "Kondomu ilitumika?" },
    onPrep: { en: "On PrEP?", fr: "Sous PrEP ?", sw: "Uko kwenye PrEP?" },
    submit: {
      en: "Get urgent guidance",
      fr: "Obtenir un avis urgent",
      sw: "Pata mwongozo wa haraka",
    },
    submitting: {
      en: "Checking timing…",
      fr: "Analyse du délai…",
      sw: "Inakagua muda…",
    },
  },
  navigator: {
    title: { en: "HIV Services Navigator", fr: "Navigateur de services du VIH", sw: "Kiongozi cha Huduma za UKIMWI" },
    subtitle: {
      en: "Learn about PrEP, PEP, condoms, and HIV testing with guidance tailored to your country.",
      fr: "Comprenez la PrEP, la PEP, les préservatifs et le dépistage avec des conseils adaptés à votre pays.",
      sw: "Jifunze kuhusu PrEP, PEP, kondomu, na upimaji wa UKIMWI na mwongozo ulioratibiwa kwa nchi yako.",
    },
    disclaimer: {
      en: "This information is educational and does not replace medical advice. In an emergency, go to the nearest clinic or hospital.",
      fr: "Ces informations sont à titre éducatif et ne remplacent pas les conseils médicaux. En cas d'urgence, allez à la clinique ou à l'hôpital le plus proche.",
      sw: "Habari hii ni ya kielimu na haibadilishi ushauri wa kimatibabu. Katika dharura, nenda kliniki au hospitali iliyo karibu.",
    },
    exposureForm: {
      en: "Check PEP Eligibility",
      fr: "Vérifier l'éligibilité à la PEP",
      sw: "Angalia Ustahiki wa PEP",
    },
    timeSinceExposure: { en: "Time since exposure (hours)", fr: "Temps depuis l'exposition (heures)", sw: "Muda tangu hatari (masaa)" },
    exposureTypeLabel: { en: "Type of exposure", fr: "Type d'exposition", sw: "Aina ya hatari" },
    condomUsedLabel: { en: "Was a condom used?", fr: "Un préservatif a-t-il été utilisé ?", sw: "Kondomu ilitumika?" },
    submit: { en: "Check PEP Timing", fr: "Vérifier la fenêtre PEP", sw: "Angalia Muda wa PEP" },
    pepUrgent: {
      en: "🚨 URGENT: PEP must be started within 72 hours. Go to a clinic NOW.",
      fr: "🚨 URGENT : La PEP doit être commencée dans les 72 heures. Allez à la clinique MAINTENANT.",
      sw: "🚨 DHARURA: PEP lazima ianzishwe ndani ya masaa 72. Nenda kliniki SASA.",
    },
    pepWindow: {
      en: "⏰ PEP WINDOW OPEN: You are still within the 72-hour window. Go to a clinic as soon as possible.",
      fr: "⏰ FENÊTRE PEP OUVERTE : Vous êtes dans la fenêtre de 72 heures. Allez à une clinique dès que possible.",
      sw: "⏰ DIRISHA LA PEP LIMEFUNGULIWA: Bado uko ndani ya dirisha la masaa 72. Nenda kliniki haraka iwezekanavyo.",
    },
    pepClosed: {
      en: "❌ PEP window has closed (>72 hours). Focus on getting tested and learning about PrEP for future protection.",
      fr: "❌ La fenêtre PEP a fermé (>72 heures). Concentrez-vous sur le dépistage et la PrEP pour l'avenir.",
      sw: "❌ Dirisha la PEP limefungwa (>masaa 72). Zingatia kupimwa na kujifunza kuhusu PrEP kwa ulinzi wa baadaye.",
    },
    nearestClinics: { en: "Nearest clinics & services", fr: "Cliniques et services les plus proches", sw: "Kliniki na huduma za karibu" },
    mapViewToggle: { en: "Show on map", fr: "Afficher sur la carte", sw: "Onyesha kwenye ramani" },
    listViewToggle: { en: "List view", fr: "Vue liste", sw: "Mtazamo wa orodha" },
    lgbtqiaRating: { en: "LGBTQIA+ friendly", fr: "Accueil LGBTQIA+", sw: "Rafiki wa LGBTQIA+" },
    pepAvailability: { en: "PEP availability", fr: "Disponibilité PEP", sw: "Upatikanaji wa PEP" },
    prepAvailability: { en: "PrEP availability", fr: "Disponibilité PrEP", sw: "Upatikanaji wa PrEP" },
    call: { en: "Call", fr: "Appeler", sw: "Piga simu" },
    directions: { en: "Directions", fr: "Itinéraire", sw: "Maelekezo" },
    shareClinic: { en: "Share", fr: "Partager", sw: "Shiriki" },
    geoConsentTitle: {
      en: "Share your location?",
      fr: "Partager votre localisation ?",
      sw: "Shiriki eneo lako?",
    },
    geoConsentBody: {
      en: "We can find clinics nearest to you. Your location is used locally only and is never stored.",
      fr: "Nous pouvons trouver les cliniques les plus proches de vous. Votre localisation est utilisée localement uniquement.",
      sw: "Tunaweza kupata kliniki zilizo karibu nawe. Eneo lako linatumiwa kienyeji tu na halisimamiwi kamwe.",
    },
    geoAllow: { en: "Allow location", fr: "Autoriser la localisation", sw: "Ruhusu eneo" },
    geoDeny: { en: "Use manual search", fr: "Recherche manuelle", sw: "Tumia utafutaji wa mkono" },
    offlineNotice: {
      en: "Offline: Showing cached clinic data.",
      fr: "Hors ligne : Affichage des données de clinique en cache.",
      sw: "Bila mtandao: Inaonyesha data ya kliniki iliyohifadhiwa.",
    },
  },
  resources: {
    title: { en: "Education Hub", fr: "Centre d'information", sw: "Kituo cha Elimu" },
    subtitle: {
      en: "Short, simple explanations about HIV, STIs, LGBTQ+ health, consent, and mental health.",
      fr: "Des explications courtes et simples sur le VIH, les IST, la santé LGBTQ+, le consentement et la santé mentale.",
      sw: "Maelezo mafupi na rahisi kuhusu UKIMWI, magonjwa ya zinaa, afya ya LGBTQ+, ridhaa, na afya ya akili.",
    },
  },
};

export function t(dict: { en: string; fr: string; sw: string }, lang: Lang) {
  return dict[lang];
}
