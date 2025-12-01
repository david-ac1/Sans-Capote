export type ResourceCategoryId =
  | "hiv_basics"
  | "sti_basics"
  | "consent"
  | "lgbtq_basics"
  | "mental_health";

export interface ResourceItem {
  id: string;
  title: string;
  summaryEn: string;
  summaryFr: string;
}

export interface ResourceCategory {
  id: ResourceCategoryId;
  title: string;
  description: string;
  items: ResourceItem[];
}

export const resources: ResourceCategory[] = [
  {
    id: "hiv_basics",
    title: "HIV basics",
    description:
      "Simple explanations about what HIV is, how it is transmitted, and what U=U means.",
    items: [
      {
        id: "what_is_hiv",
        title: "What is HIV?",
        summaryEn:
          "HIV is a virus that attacks the immune system. With treatment, people living with HIV can stay healthy and live long lives.",
        summaryFr:
          "Le VIH est un virus qui attaque le système immunitaire. Avec un traitement, les personnes vivant avec le VIH peuvent rester en bonne santé et vivre longtemps.",
      },
      {
        id: "how_hiv_spreads",
        title: "How does HIV spread?",
        summaryEn:
          "HIV can be passed through unprotected sex, sharing needles, and from parent to child during pregnancy, birth, or breastfeeding. It is not spread by hugging, sharing toilets, or mosquito bites.",
        summaryFr:
          "Le VIH peut se transmettre lors de rapports sexuels non protégés, par le partage d'aiguilles ou de seringues, et de la mère à l'enfant pendant la grossesse, l'accouchement ou l'allaitement. Il ne se transmet pas par les câlins, les toilettes partagées ou les piqûres de moustiques.",
      },
      {
        id: "uvu_basics",
        title: "What does U=U mean?",
        summaryEn:
          "U=U means Undetectable = Untransmittable. If a person living with HIV takes treatment and their viral load stays undetectable, they do not pass HIV on through sex.",
        summaryFr:
          "U=U signifie Indétectable = Intransmissible. Si une personne vivant avec le VIH prend son traitement et que sa charge virale reste indétectable, elle ne transmet pas le VIH lors de rapports sexuels.",
      },
    ],
  },
  {
    id: "sti_basics",
    title: "STI basics",
    description:
      "Information about common sexually transmitted infections and why testing matters.",
    items: [
      {
        id: "common_stis",
        title: "Common STIs",
        summaryEn:
          "Common STIs include chlamydia, gonorrhoea, syphilis, HPV, herpes, and others. Many STIs can be treated or managed if found early.",
        summaryFr:
          "Parmi les IST fréquentes, on trouve la chlamydia, la gonorrhée, la syphilis, le HPV, l'herpès et d'autres. Beaucoup d'IST peuvent être traitées ou bien contrôlées si elles sont détectées tôt.",
      },
      {
        id: "symptoms_warning",
        title: "Symptoms – and when there are none",
        summaryEn:
          "Some STIs cause symptoms like discharge, pain when peeing, sores, or itching. Others have no clear signs. Testing is the only way to know for sure.",
        summaryFr:
          "Certaines IST provoquent des symptômes comme des pertes, des douleurs en urinant, des plaies ou des démangeaisons. D'autres ne donnent presque aucun signe. Le dépistage est le seul moyen de savoir.",
      },
      {
        id: "no_photos",
        title: "No pictures needed",
        summaryEn:
          "You never need to send pictures of your body for an STI check. It is better to describe symptoms in words and then get tested in a clinic.",
        summaryFr:
          "Vous n'avez jamais besoin d'envoyer des photos de votre corps pour parler d'une IST. Il vaut mieux décrire les symptômes avec des mots puis faire un test en clinique.",
      },
    ],
  },
  {
    id: "consent",
    title: "Consent",
    description:
      "Understanding clear, enthusiastic consent and your right to say yes or no.",
    items: [
      {
        id: "what_is_consent",
        title: "What is consent?",
        summaryEn:
          "Consent means a clear, freely given yes to a specific activity. Silence, pressure, or fear are not consent.",
        summaryFr:
          "Le consentement, c'est un oui clair et libre pour une activité précise. Le silence, la pression ou la peur ne sont pas du consentement.",
      },
      {
        id: "change_mind",
        title: "You can change your mind",
        summaryEn:
          "You can say yes at first and then change your mind at any time. Your boundaries matter, even in a relationship or marriage.",
        summaryFr:
          "Vous pouvez dire oui au début puis changer d'avis à tout moment. Vos limites comptent, même dans une relation ou un mariage.",
      },
      {
        id: "no_is_complete",
        title: "No is complete",
        summaryEn:
          "You do not need to give long explanations for a no. Your safety and comfort come first.",
        summaryFr:
          "Vous n'avez pas besoin de longues explications pour dire non. Votre sécurité et votre confort passent avant tout.",
      },
    ],
  },
  {
    id: "lgbtq_basics",
    title: "LGBTQ+ basics",
    description:
      "Affirming information about sexual orientation and gender, with a focus on safety and mental health.",
    items: [
      {
        id: "orientation_gender",
        title: "Sexual orientation and gender",
        summaryEn:
          "Sexual orientation is about who you are attracted to. Gender identity is how you understand yourself (for example, man, woman, non-binary). Both are valid and personal.",
        summaryFr:
          "L'orientation sexuelle concerne les personnes qui vous attirent. L'identité de genre est la façon dont vous vous comprenez vous-même (par exemple homme, femme, non binaire). Les deux sont personnels et valides.",
      },
      {
        id: "not_abnormal",
        title: "You are not abnormal",
        summaryEn:
          "Being LGBTQ+ is not a sickness. Many people in Africa and around the world are LGBTQ+ and deserve safety, love, and respect.",
        summaryFr:
          "Être LGBTQ+ n'est pas une maladie. De nombreuses personnes en Afrique et dans le monde sont LGBTQ+ et méritent sécurité, amour et respect.",
      },
      {
        id: "safety_first",
        title: "Safety in hostile environments",
        summaryEn:
          "In places where laws or attitudes are hostile, it is okay to prioritise your safety first and be selective about who you trust.",
        summaryFr:
          "Dans les endroits où les lois ou les attitudes sont hostiles, il est normal de mettre votre sécurité en premier et de choisir avec soin les personnes à qui vous faites confiance.",
      },
    ],
  },
  {
    id: "mental_health",
    title: "Mental health & stigma",
    description:
      "How stigma, fear, and stress can affect your mind – and small steps to protect your mental health.",
    items: [
      {
        id: "stigma_weight",
        title: "Stigma is heavy",
        summaryEn:
          "Fear of judgement about sex, HIV, or LGBTQ+ identity can cause stress, anxiety, or depression. You are not weak for feeling this weight.",
        summaryFr:
          "La peur du jugement lié au sexe, au VIH ou à l'identité LGBTQ+ peut provoquer du stress, de l'anxiété ou de la dépression. Vous n'êtes pas faible parce que vous ressentez ce poids.",
      },
      {
        id: "talk_to_someone",
        title: "Talking to someone safe",
        summaryEn:
          "If possible, talk to someone you trust – a friend, peer counsellor, or mental health worker. Sharing your worries can reduce their power.",
        summaryFr:
          "Si possible, parlez à quelqu'un en qui vous avez confiance – un ami, un pair conseiller ou un professionnel de santé mentale. Partager vos inquiétudes peut en diminuer le poids.",
      },
      {
        id: "crisis_support",
        title: "If you feel like hurting yourself",
        summaryEn:
          "If you feel like you might hurt yourself, seek urgent help at a clinic or hospital if it is safe to do so, or reach out to a trusted person immediately.",
        summaryFr:
          "Si vous avez l'impression que vous pourriez vous faire du mal, cherchez une aide urgente dans une clinique ou un hôpital si c'est possible en sécurité, ou contactez immédiatement une personne de confiance.",
      },
    ],
  },
];
