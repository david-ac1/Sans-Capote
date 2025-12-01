export type ResourceCategoryId =
  | "hiv_basics"
  | "sti_basics"
  | "consent"
  | "lgbtq_basics"
  | "mental_health";

export interface ResourceItem {
  id: string;
  title: string;
  summary: string;
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
        summary:
          "HIV is a virus that attacks the immune system. With treatment, people living with HIV can stay healthy and live long lives.",
      },
      {
        id: "how_hiv_spreads",
        title: "How does HIV spread?",
        summary:
          "HIV can be passed through unprotected sex, sharing needles, and from parent to child during pregnancy, birth, or breastfeeding. It is not spread by hugging, sharing toilets, or mosquito bites.",
      },
      {
        id: "uvu_basics",
        title: "What does U=U mean?",
        summary:
          "U=U means Undetectable = Untransmittable. If a person living with HIV takes treatment and their viral load stays undetectable, they do not pass HIV on through sex.",
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
        summary:
          "Common STIs include chlamydia, gonorrhoea, syphilis, HPV, herpes, and others. Many STIs can be treated or managed if found early.",
      },
      {
        id: "symptoms_warning",
        title: "Symptoms – and when there are none",
        summary:
          "Some STIs cause symptoms like discharge, pain when peeing, sores, or itching. Others have no clear signs. Testing is the only way to know for sure.",
      },
      {
        id: "no_photos",
        title: "No pictures needed",
        summary:
          "You never need to send pictures of your body for an STI check. It is better to describe symptoms in words and then get tested in a clinic.",
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
        summary:
          "Consent means a clear, freely given yes to a specific activity. Silence, pressure, or fear are not consent.",
      },
      {
        id: "change_mind",
        title: "You can change your mind",
        summary:
          "You can say yes at first and then change your mind at any time. Your boundaries matter, even in a relationship or marriage.",
      },
      {
        id: "no_is_complete",
        title: "No is complete",
        summary:
          "You do not need to give long explanations for a no. Your safety and comfort come first.",
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
        summary:
          "Sexual orientation is about who you are attracted to. Gender identity is how you understand yourself (for example, man, woman, non-binary). Both are valid and personal.",
      },
      {
        id: "not_abnormal",
        title: "You are not abnormal",
        summary:
          "Being LGBTQ+ is not a sickness. Many people in Africa and around the world are LGBTQ+ and deserve safety, love, and respect.",
      },
      {
        id: "safety_first",
        title: "Safety in hostile environments",
        summary:
          "In places where laws or attitudes are hostile, it is okay to prioritise your safety first and be selective about who you trust.",
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
        summary:
          "Fear of judgement about sex, HIV, or LGBTQ+ identity can cause stress, anxiety, or depression. You are not weak for feeling this weight.",
      },
      {
        id: "talk_to_someone",
        title: "Talking to someone safe",
        summary:
          "If possible, talk to someone you trust – a friend, peer counsellor, or mental health worker. Sharing your worries can reduce their power.",
      },
      {
        id: "crisis_support",
        title: "If you feel like hurting yourself",
        summary:
          "If you feel like you might hurt yourself, seek urgent help at a clinic or hospital if it is safe to do so, or reach out to a trusted person immediately.",
      },
    ],
  },
];
