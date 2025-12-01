export type CountryCode = "NG" | "KE" | "UG" | "ZA" | "RW" | "GH";

export interface Step {
  title: string;
  detail: string;
}

export interface Section {
  title: string;
  steps: Step[];
}

export interface CountryGuide {
  code: CountryCode;
  name: string;
  prep: Section;
  pep: Section;
  testing: Section;
}

export const countryGuides: CountryGuide[] = [
  {
    code: "NG",
    name: "Nigeria",
    prep: {
      title: "PrEP in Nigeria",
      steps: [
        {
          title: "Start with government or NGO clinics",
          detail:
            "Look for HIV clinics in public hospitals, teaching hospitals, or NGOs working on HIV prevention. Ask specifically if they offer PrEP (pre-exposure prophylaxis).",
        },
        {
          title: "Ask about free or subsidised PrEP",
          detail:
            "In many parts of Nigeria, PrEP may be free or low-cost through donor-funded programmes. If you are asked to pay high fees, ask if there is a cheaper or subsidised option.",
        },
        {
          title: "Explain your risk clearly, without shame",
          detail:
            "You can say you have multiple partners, your partner's HIV status is unknown, or you have had condomless sex. This helps the provider understand why PrEP is useful for you.",
        },
      ],
    },
    pep: {
      title: "PEP in Nigeria",
      steps: [
        {
          title: "Go as soon as possible (within 24 hours if you can)",
          detail:
            "PEP works best when started quickly. Try to reach a clinic, emergency unit, or HIV treatment centre within 24 hours. It may still be offered up to 72 hours after exposure.",
        },
        {
          title: "Use emergency units if clinics are closed",
          detail:
            "If it is night or a weekend, go to the emergency department of a big government hospital and say clearly that you had a possible HIV exposure and need PEP.",
        },
        {
          title: "If PEP is not available",
          detail:
            "If one facility does not have PEP, ask if they know another centre that does. You can also contact HIV hotlines or NGOs in your state for directions.",
        },
      ],
    },
    testing: {
      title: "HIV testing in Nigeria",
      steps: [
        {
          title: "Free testing days and community outreaches",
          detail:
            "Many states have free HIV testing during community outreaches or at primary health centres. Ask at your local clinic or pharmacy about free testing schedules.",
        },
        {
          title: "Repeat testing after a window period",
          detail:
            "If you test soon after an exposure, you may need to repeat the test after the window period (around 6 weeks and again at 3 months) for a confirmed result.",
        },
        {
          title: "Keep your result private if you wish",
          detail:
            "You do not need to explain why you want a test. You can simply say you would like to know your HIV status.",
        },
      ],
    },
  },
  {
    code: "KE",
    name: "Kenya",
    prep: {
      title: "PrEP in Kenya",
      steps: [
        {
          title: "Visit public hospitals and youth-friendly clinics",
          detail:
            "Many public facilities and youth-friendly clinics in Kenya offer PrEP, especially in larger towns and cities.",
        },
        {
          title: "Ask if PrEP is free or subsidised",
          detail:
            "In several county programmes, PrEP may be available at no cost. Ask staff directly if PrEP is part of their HIV prevention services.",
        },
      ],
    },
    pep: {
      title: "PEP in Kenya",
      steps: [
        {
          title: "Go urgently within 72 hours",
          detail:
            "Try to visit a facility within 24 hours. If that is not possible, go as soon as you can within 72 hours after exposure.",
        },
        {
          title: "Emergency departments and HIV clinics",
          detail:
            "If the nearest clinic does not have PEP, ask them where you can be referred quickly. Larger hospitals and HIV clinics are more likely to have stock.",
        },
      ],
    },
    testing: {
      title: "HIV testing in Kenya",
      steps: [
        {
          title: "Government clinics and VCT centres",
          detail:
            "Voluntary Counselling and Testing (VCT) centres and government clinics often provide HIV testing at low or no cost.",
        },
        {
          title: "Consider HIV self-test kits",
          detail:
            "In some pharmacies and programmes, HIV self-test kits are available. Follow the instructions carefully and confirm a positive result at a clinic.",
        },
      ],
    },
  },
  {
    code: "ZA",
    name: "South Africa",
    prep: {
      title: "PrEP in South Africa",
      steps: [
        {
          title: "Public sector PrEP services",
          detail:
            "Many public clinics offer PrEP as part of standard HIV prevention. Ask at the clinic reception if they have a PrEP programme.",
        },
      ],
    },
    pep: {
      title: "PEP in South Africa",
      steps: [
        {
          title: "Emergency PEP from casualty departments",
          detail:
            "If you had a high-risk exposure, go to the casualty/emergency department and state that you need PEP for a possible HIV exposure.",
        },
      ],
    },
    testing: {
      title: "HIV testing in South Africa",
      steps: [
        {
          title: "Free testing in public clinics",
          detail:
            "Public clinics routinely offer free HIV testing. You can ask for a test during normal clinic hours.",
        },
      ],
    },
  },
];
