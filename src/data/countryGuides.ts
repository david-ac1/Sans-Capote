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
        {
          title: "Explain your situation simply",
          detail:
            "You do not need to share every detail of your private life. You can say you have partners whose HIV status you do not know, or that condoms are not always used, and you want extra protection.",
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
        {
          title: "Bring basic details of the exposure",
          detail:
            "If you feel comfortable, note roughly when the exposure happened, the type of sex or contact, and whether a condom was used. This helps providers decide if PEP is suitable.",
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
        {
          title: "Plan follow-up tests after a risk",
          detail:
            "If you had a recent risk, a single negative test may not be final. Ask when to repeat the test, often around 6 weeks and again at 3 months.",
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
        {
          title: "NGOs and youth-friendly services",
          detail:
            "Some NGOs and youth clinics also provide PrEP, sometimes with more privacy and flexible hours. Ask local HIV organisations if they offer PrEP.",
        },
        {
          title: "Discuss side effects and follow-up",
          detail:
            "If you start PrEP, ask about common side effects and when to come back for check-ups and lab tests.",
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
        {
          title: "PEP after sexual violence or needle injuries",
          detail:
            "If the exposure was related to sexual violence or an injury at work, tell staff so they can follow the correct protocol and support services.",
        },
        {
          title: "Complete the full PEP course",
          detail:
            "PEP usually lasts 28 days. Try to take the tablets as prescribed and attend any follow-up visits for tests and support.",
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
        {
          title: "Community testing campaigns",
          detail:
            "Mobile clinics and community campaigns often provide HIV testing in townships and public spaces. These can be convenient if you want quick, nearby testing.",
        },
        {
          title: "Link to care if the test is positive",
          detail:
            "If you test positive, ask to be linked to an HIV clinic immediately so that treatment can be started early and kept private.",
        },
      ],
    },
  },
  {
    code: "UG",
    name: "Uganda",
    prep: {
      title: "PrEP in Uganda",
      steps: [
        {
          title: "Start at government health centres and hospitals",
          detail:
            "Many public health centres and hospitals in Uganda offer PrEP, especially in urban areas and high-prevalence regions.",
        },
        {
          title: "Ask about PrEP in HIV clinics",
          detail:
            "If there is an HIV clinic at the facility, ask if they can assess you for PrEP and explain how it works.",
        },
        {
          title: "Check for NGO programmes",
          detail:
            "Some NGOs run prevention projects that include PrEP. They may offer more discreet or youth-friendly services.",
        },
      ],
    },
    pep: {
      title: "PEP in Uganda",
      steps: [
        {
          title: "Go quickly to a clinic or hospital",
          detail:
            "Try to reach a health facility within 24 hours of a possible HIV exposure. PEP may still be started up to 72 hours after exposure.",
        },
        {
          title: "Use emergency units if needed",
          detail:
            "If normal clinic hours are over, go to the emergency or casualty department of a large hospital and clearly say you need PEP.",
        },
        {
          title: "Ask where PEP is available if turned away",
          detail:
            "If one facility cannot provide PEP, ask them to direct you to another clinic or HIV service that has PEP in stock.",
        },
      ],
    },
    testing: {
      title: "HIV testing in Uganda",
      steps: [
        {
          title: "Public clinics and outreach services",
          detail:
            "HIV testing is often available at public clinics and during outreach activities in communities and workplaces.",
        },
        {
          title: "Respect for privacy and consent",
          detail:
            "You have the right to receive testing without being judged. You can ask to speak in a private space if you feel uncomfortable.",
        },
        {
          title: "Plan repeat tests after a recent risk",
          detail:
            "If your exposure was recent, ask when to repeat testing so that the window period is fully covered.",
        },
      ],
    },
  },
  {
    code: "RW",
    name: "Rwanda",
    prep: {
      title: "PrEP in Rwanda",
      steps: [
        {
          title: "Ask at public health centres",
          detail:
            "Public health centres and district hospitals may offer PrEP for people at higher risk of HIV.",
        },
        {
          title: "Talk to HIV programmes and NGOs",
          detail:
            "Some HIV programmes and NGOs can guide you to facilities that provide PrEP and other prevention services.",
        },
        {
          title: "Share the basics of your risk",
          detail:
            "You can explain that you have partners with unknown status or other risks without going into details that make you uncomfortable.",
        },
      ],
    },
    pep: {
      title: "PEP in Rwanda",
      steps: [
        {
          title: "Seek PEP within 72 hours",
          detail:
            "Try to get to a facility within 24 hours if you can, and do not delay beyond 72 hours after a possible HIV exposure.",
        },
        {
          title: "Use emergency and referral hospitals",
          detail:
            "If the nearest clinic does not provide PEP, ask if a district or referral hospital can see you urgently.",
        },
        {
          title: "Ask for clear instructions",
          detail:
            "If PEP is started, ask how and when to take the tablets and when to return for follow-up tests.",
        },
      ],
    },
    testing: {
      title: "HIV testing in Rwanda",
      steps: [
        {
          title: "Routine testing at health centres",
          detail:
            "HIV tests are often available at health centres and hospitals, sometimes as part of routine services.",
        },
        {
          title: "Community and workplace testing",
          detail:
            "Look out for community or workplace testing campaigns if you prefer a more local option.",
        },
        {
          title: "Confirm results and link to care",
          detail:
            "Any positive self-test or initial test should be confirmed at a clinic, where you can also be linked to treatment.",
        },
      ],
    },
  },
  {
    code: "GH",
    name: "Ghana",
    prep: {
      title: "PrEP in Ghana",
      steps: [
        {
          title: "Check major hospitals and HIV clinics",
          detail:
            "Larger hospitals and HIV clinics are more likely to offer PrEP services, especially in cities.",
        },
        {
          title: "Ask about prevention projects",
          detail:
            "Some prevention projects and NGOs in Ghana provide PrEP for groups at higher risk. Ask local HIV organisations or hotlines where to go.",
        },
        {
          title: "Discuss if PrEP fits your situation",
          detail:
            "With a healthcare worker, talk about your sexual health needs and whether PrEP is a good option for you.",
        },
      ],
    },
    pep: {
      title: "PEP in Ghana",
      steps: [
        {
          title: "Go promptly after exposure",
          detail:
            "PEP should be started as soon as possible, ideally within 24 hours and not later than 72 hours after a possible HIV exposure.",
        },
        {
          title: "Emergency rooms and HIV treatment centres",
          detail:
            "If local clinics do not have PEP, emergency rooms or HIV treatment centres in bigger hospitals may be able to help.",
        },
        {
          title: "Do not wait for symptoms",
          detail:
            "HIV infection does not always cause clear early symptoms. Go for assessment even if you feel physically well.",
        },
      ],
    },
    testing: {
      title: "HIV testing in Ghana",
      steps: [
        {
          title: "Public and private testing sites",
          detail:
            "HIV testing is available in many public clinics and some private facilities. Costs may vary, so ask in advance if you are worried about fees.",
        },
        {
          title: "Community outreach and mobile testing",
          detail:
            "Outreach teams and mobile testing units sometimes visit communities and markets, which can be convenient and discreet.",
        },
        {
          title: "Repeat testing after a recent risk",
          detail:
            "If you had a recent risk, ask when to come back for follow-up tests so that the window period is covered.",
        },
      ],
    },
  },
];
