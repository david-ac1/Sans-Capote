import type { CountryCode } from "./countryGuides";

export type ServiceType =
  | "public_clinic"
  | "hospital"
  | "ngo"
  | "youth_clinic"
  | "pharmacy";

export interface ServiceEntry {
  id: string;
  country: CountryCode;
  city: string;
  name: string;
  type: ServiceType;
  services: {
    hivTesting?: boolean;
    pep?: boolean;
    prep?: boolean;
    sti?: boolean;
    mentalHealth?: boolean;
  };
  notesEn: string;
  notesFr: string;
  verifiedAt?: string; // ISO timestamp when availability was last confirmed
  verifiedBy?: "partner" | "staff" | "user"; // who last verified
  phone?: string; // contact phone, if available
  lat?: number; // optional latitude for maps
  lng?: number; // optional longitude for maps
}

export const servicesDirectory: ServiceEntry[] = [
  // ------------------------
  // NIGERIA (8)
  // ------------------------
  {
    id: "ng_ahf_lagos_surulere",
    country: "NG",
    city: "Lagos (Surulere)",
    name: "AHF Nigeria – Lagos Surge Clinic (Surulere)",
    type: "ngo",
    services: { hivTesting: true, pep: true, prep: true, sti: true, mentalHealth: true },
    notesEn:
      "Confidential testing, prevention and treatment services run by AHF Nigeria. Known for outreach and PrEP programming; offers counselling and condom distribution. Ask at reception for 'HIV counselling and post-exposure care'. PEP/PrEP historically provided through AHF programmes. PEP_CERTAINTY: Medium; PrEP_CERTAINTY: High.",
    notesFr:
      "Dépistage confidentiel, prévention et traitement via AHF Nigeria. Service de conseil, distribution de préservatifs et programmes PrEP. Demandez « conseils VIH et soins après exposition ». PEP_CERTAINTY: Moyen; PrEP_CERTAINTY: Élevé.",
  },
  {
    id: "ng_ihvn_national",
    country: "NG",
    city: "Abuja / Nationwide",
    name: "Institute of Human Virology Nigeria (IHVN) – Prevention & Linkage Services",
    type: "ngo",
    services: { hivTesting: true, pep: true, prep: true, sti: true },
    notesEn:
      "IHVN runs national prevention programmes and has explicit PrEP & PEP information on programme pages and hotlines for linkage. Good for referrals and formal PrEP enrollment. PEP_CERTAINTY: High; PrEP_CERTAINTY: High.",
    notesFr:
      "IHVN gère des programmes nationaux de prévention et fournit des informations sur la PEP et la PrEP. Bon pour l’orientation vers les services. PEP_CERTAINTY: Élevé; PrEP_CERTAINTY: Élevé.",
  },
  {
    id: "ng_luth_art_clinic",
    country: "NG",
    city: "Lagos",
    name: "Lagos University Teaching Hospital (LUTH) – HIV / ART Clinic",
    type: "hospital",
    services: { hivTesting: true, pep: true, prep: true, sti: true },
    notesEn:
      "Major tertiary referral ART centre. Staff handle emergency PEP (request 'post-exposure prophylaxis') and PrEP enrolment at dedicated HIV clinic. Arrive early; expect counselling and paperwork. PEP_CERTAINTY: Medium-High; PrEP_CERTAINTY: Medium.",
    notesFr:
      "Centre de référence tertiaire. Prise en charge PEP d'urgence et initiation PrEP en clinique VIH. Arrivez tôt. PEP_CERTAINTY: Moyen-Élevé; PrEP_CERTAINTY: Moyen.",
  },
  {
    id: "ng_lifelink_oss_amuwo",
    country: "NG",
    city: "Lagos (Amuwo Odofin)",
    name: "LifeLink Organisation – One-Stop Shop (OSS), Amuwo",
    type: "ngo",
    services: { hivTesting: true, pep: true, prep: true, sti: true, mentalHealth: true },
    notesEn:
      "Peer-led OSS targeted at key populations and youth; known for discrete services and peer counselling. Website/program pages mention PEP and PrEP activities in OSS sites. Good for confidential access and linkage. PEP_CERTAINTY: Medium-High; PrEP_CERTAINTY: High.",
    notesFr:
      "Centre OSS animé par pairs pour populations clés et jeunes; services discrets. Les pages programme mentionnent PEP/PrEP. PEP_CERTAINTY: Moyen-Élevé; PrEP_CERTAINTY: Élevé.",
  },
  {
    id: "ng_fct_asokoro_art",
    country: "NG",
    city: "Abuja (Asokoro)",
    name: "Asokoro District Hospital – ART & HIV Clinic",
    type: "hospital",
    services: { hivTesting: true, pep: true, prep: true, sti: true },
    notesEn:
      "Public district/teaching hospital with an ART clinic. Offers HIV testing and linkage; PEP commonly available in emergency settings (verify by phone). PEP_CERTAINTY: Medium; PrEP_CERTAINTY: Medium.",
    notesFr:
      "Hôpital de district avec clinique ART. Dépistage et orientation; PEP disponible en situations d’urgence. PEP_CERTAINTY: Moyen; PrEP_CERTAINTY: Moyen.",
  },
  {
    id: "ng_state_ngos_various",
    country: "NG",
    city: "Various states",
    name: "State-level HIV NGO & Community Clinics (Nigeria)",
    type: "ngo",
    services: { hivTesting: true, pep: true, prep: true, sti: true },
    notesEn:
      "Many state-level NGOs and community clinics supported by donors or government run testing and prevention outreach; some offer PEP/PrEP depending on program funding. Check local hotline or call before travel. PEP_CERTAINTY: Medium; PrEP_CERTAINTY: Medium.",
    notesFr:
      "De nombreuses ONG et cliniques communautaires offrent des services de prévention variés selon le financement. Vérifiez à l’avance. PEP_CERTAINTY: Moyen; PrEP_CERTAINTY: Moyen.",
  },
  {
    id: "ng_nnamdi_azikiwe_univ_hospital",
    country: "NG",
    city: "Enugu",
    name: "University of Nigeria Teaching Hospital (UNTH) – HIV Services",
    type: "hospital",
    services: { hivTesting: true, pep: true, prep: true, sti: true },
    notesEn:
      "Large teaching hospital ART clinic. Offers HIV testing, ART follow-up, and prevention counseling. PEP availability commonly arranged via emergency/ART units. PEP_CERTAINTY: Medium; PrEP_CERTAINTY: Medium.",
    notesFr:
      "Grand hôpital universitaire avec clinique ART. Dépistage, suivi ART et counseling prévention. PEP_CERTAINTY: Moyen; PrEP_CERTAINTY: Moyen.",
  },
  {
    id: "ng_nison_hiv_hotline",
    country: "NG",
    city: "National",
    name: "National HIV/Health Hotlines & Referral Services (Nigeria)",
    type: "ngo",
    services: { hivTesting: true },
    notesEn:
      "National hotlines and IHVN/Ministry referral services can verify same-day PEP availability. Use hotlines when in doubt and ask for nearest PEP-capable site. PEP_CERTAINTY: N/A (hotline referral); PrEP_CERTAINTY: N/A.",
    notesFr:
      "Les lignes d’assistance nationales peuvent vérifier la disponibilité de la PEP et orienter vers les sites. PEP_CERTAINTY: N/A; PrEP_CERTAINTY: N/A.",
  },

  // ------------------------
  // GHANA (4)
  // ------------------------
  {
    id: "gh_acts_accra",
    country: "GH",
    city: "Accra",
    name: "ACTS Ghana – Accra Hub",
    type: "ngo",
    services: { hivTesting: true, pep: true, prep: true, sti: true, mentalHealth: true },
    notesEn:
      "ACTS runs a confidential hotline and prevention programs; web pages state testing, prevention, PrEP/PEP linkage, and counselling. Good for youth and key populations. PEP_CERTAINTY: Medium-High; PrEP_CERTAINTY: Medium-High.",
    notesFr:
      "ACTS propose hotline confidentielle, programmes prévention, orientation PrEP/PEP et counseling. PEP_CERTAINTY: Moyen-Élevé; PrEP_CERTAINTY: Moyen-Élevé.",
  },
  {
    id: "gh_ppag_accra",
    country: "GH",
    city: "Accra (various branches)",
    name: "Planned Parenthood Association of Ghana (PPAG) – Community Clinics",
    type: "ngo",
    services: { hivTesting: true, prep: true, sti: true },
    notesEn:
      "PPAG community clinics offer HIV/STI testing, reproductive health services and some PrEP activities in outreach/mobile sites. Check specific branch for PrEP/PEP; youth-friendly. PEP_CERTAINTY: Medium; PrEP_CERTAINTY: Medium.",
    notesFr:
      "Les cliniques PPAG proposent dépistage VIH/IST et services reproductifs; certaines offrent PrEP en outreach. PEP_CERTAINTY: Moyen; PrEP_CERTAINTY: Moyen.",
  },
  {
    id: "gh_marie_stopes_ghana",
    country: "GH",
    city: "Accra / Kumasi",
    name: "MS-Ghana (Marie Stopes / MSI) – SRH Clinics",
    type: "ngo",
    services: { hivTesting: true, sti: true },
    notesEn:
      "Marie Stopes / MSI clinics provide sexual and reproductive health services, testing and counselling; some locations support PrEP referrals and youth-friendly services. PEP_CERTAINTY: Low-Medium; PrEP_CERTAINTY: Medium (branch dependent).",
    notesFr:
      "Clinique MSI offrant santé sexuelle et reproductive et dépistage; certaines branches orientent vers PrEP. PEP_CERTAINTY: Faible-Moyen; PrEP_CERTAINTY: Moyen.",
  },
  {
    id: "gh_regional_hospitals",
    country: "GH",
    city: "Regional centres (e.g., Kumasi, Tamale)",
    name: "Regional / Teaching Hospital HIV Clinics (Ghana)",
    type: "hospital",
    services: { hivTesting: true, pep: true, prep: true, sti: true },
    notesEn:
      "Regional teaching hospitals typically run HIV clinics and follow national guidelines including PEP and PrEP where programmes exist. Call ahead to confirm stock and hours. PEP_CERTAINTY: Medium; PrEP_CERTAINTY: Medium.",
    notesFr:
      "Les hôpitaux régionaux gèrent des cliniques VIH et suivent les directives nationales; vérifiez la disponibilité. PEP_CERTAINTY: Moyen; PrEP_CERTAINTY: Moyen.",
  },

  // ------------------------
  // UGANDA (5)
  // ------------------------
  {
    id: "ug_aic_kampala",
    country: "UG",
    city: "Kampala",
    name: "AIDS Information Centre (AIC) – Kampala",
    type: "ngo",
    services: { hivTesting: true, pep: true, prep: true, sti: true, mentalHealth: true },
    notesEn:
      "AIC provides anonymous testing, PrEP enrollment, PEP within eligible windows, STI care and psychosocial support across multiple centres. Historically reliable for prevention programming. PEP_CERTAINTY: Medium-High; PrEP_CERTAINTY: High.",
    notesFr:
      "AIC offre tests anonymes, initiation PrEP, PEP, soins IST et soutien psychosocial. PEP_CERTAINTY: Moyen-Élevé; PrEP_CERTAINTY: Élevé.",
  },
  {
    id: "ug_ahf_masaka",
    country: "UG",
    city: "Masaka (district clinic)",
    name: "AHF Uganda Cares – Masaka Clinic",
    type: "ngo",
    services: { hivTesting: true, pep: true, prep: true, sti: true },
    notesEn:
      "AHF Uganda Cares runs outreach clinics offering testing, ART linkages, condom distribution and PrEP rollout for priority groups. Local clinics often supply PEP in urgent situations. PEP_CERTAINTY: Medium; PrEP_CERTAINTY: Medium-High.",
    notesFr:
      "AHF Uganda Cares propose tests, ARV, distribution condoms et déploiement PrEP pour groupes prioritaires. PEP_CERTAINTY: Moyen; PrEP_CERTAINTY: Moyen-Élevé.",
  },
  {
    id: "ug_taso_kampala",
    country: "UG",
    city: "Kampala",
    name: "TASO (The AIDS Support Organisation) – Kampala",
    type: "ngo",
    services: { hivTesting: true, pep: true, prep: true, sti: true, mentalHealth: true },
    notesEn:
      "TASO is a longstanding provider of HIV care, counselling, ART and prevention services including referrals for PEP and engagement in PrEP programmes in some sites. PEP_CERTAINTY: Medium; PrEP_CERTAINTY: Medium.",
    notesFr:
      "TASO fournit soins VIH, counseling, ART et orientation PEP; certains sites participent aux programmes PrEP. PEP_CERTAINTY: Moyen; PrEP_CERTAINTY: Moyen.",
  },
  {
    id: "ug_kisenyi_keypop_clinic",
    country: "UG",
    city: "Kampala (Kisenyi / Key population drop-in)",
    name: "Key-population-friendly Drop-In Centre (Kampala)",
    type: "youth_clinic",
    services: { hivTesting: true, pep: true, prep: true, sti: true, mentalHealth: true },
    notesEn:
      "Several Kampala DICs focused on sex workers and MSM provide confidential testing, PrEP linkage and outreach PEP support; privacy and peer support are prioritised. PEP_CERTAINTY: Medium; PrEP_CERTAINTY: Medium-High.",
    notesFr:
      "Des centres DIC offrent dépistage confidentiel, orientation PrEP et soutien PEP; confidentialité assurée. PEP_CERTAINTY: Moyen; PrEP_CERTAINTY: Moyen-Élevé.",
  },
  {
    id: "ug_public_hospital_district",
    country: "UG",
    city: "Regional/district hospitals",
    name: "Regional Public Hospitals – HIV Testing and Post-exposure Care",
    type: "hospital",
    services: { hivTesting: true, pep: true, prep: true, sti: true },
    notesEn:
      "Many regional public hospitals offer HIV testing; some can initiate PEP in emergencies and refer for PrEP enrollment. Availability depends on district supply. PEP_CERTAINTY: Medium; PrEP_CERTAINTY: Medium.",
    notesFr:
      "Les hôpitaux publics régionaux proposent des tests VIH et peuvent initier la PEP en urgence; vérifiez les stocks. PEP_CERTAINTY: Moyen; PrEP_CERTAINTY: Moyen.",
  },

  // ------------------------
  // KENYA (5)
  // ------------------------
  {
    id: "ke_lvct_dropin",
    country: "KE",
    city: "Nairobi",
    name: "LVCT Health – Drop-in & Prevention Services",
    type: "ngo",
    services: { hivTesting: true, pep: true, prep: true, sti: true, mentalHealth: true },
    notesEn:
      "LVCT Health runs DICEs, youth and key-population clinics offering PrEP, same-day PEP in many sites, testing and counselling. Strong reputation for PrEP rollout in Nairobi and Kisumu. PEP_CERTAINTY: High; PrEP_CERTAINTY: High.",
    notesFr:
      "LVCT gère des centres DICE offrant PrEP, PEP le jour même, dépistage et counseling. PEP_CERTAINTY: Élevé; PrEP_CERTAINTY: Élevé.",
  },
  {
    id: "ke_kenyatta_hiv_centre",
    country: "KE",
    city: "Nairobi",
    name: "Kenyatta National Hospital – HIV Comprehensive Care Centre",
    type: "hospital",
    services: { hivTesting: true, pep: true, prep: true, sti: true },
    notesEn:
      "National referral hospital with established emergency PEP pathways and PrEP programs at CCC. Walk-ins for emergency PEP are handled through emergency and HIV clinics. PEP_CERTAINTY: High; PrEP_CERTAINTY: High.",
    notesFr:
      "Hôpital national de référence ; prise en charge PEP d'urgence et programmes PrEP. PEP_CERTAINTY: Élevé; PrEP_CERTAINTY: Élevé.",
  },
  {
    id: "ke_nairobi_dice",
    country: "KE",
    city: "Nairobi",
    name: "Nairobi Drop-in Centre (Key-population friendly DICE)",
    type: "youth_clinic",
    services: { hivTesting: true, pep: true, prep: true, sti: true, mentalHealth: true },
    notesEn:
      "DICE sites focus on MSM, sex workers and youth; provide PrEP, PEP referral and often same-day prevention services when stock is available. PEP_CERTAINTY: Medium-High; PrEP_CERTAINTY: High.",
    notesFr:
      "Centres DICE ciblant MSM, travailleurs du sexe et jeunes; fournissent PrEP et orientent vers la PEP. PEP_CERTAINTY: Moyen-Élevé; PrEP_CERTAINTY: Élevé.",
  },
  {
    id: "ke_nascop_national",
    country: "KE",
    city: "Nairobi (national)",
    name: "NASCOP-linked clinics & public sector PrEP sites (Kenya)",
    type: "public_clinic",
    services: { hivTesting: true, pep: true, prep: true, sti: true },
    notesEn:
      "Kenya’s national programme (NASCOP) has widely supported PrEP rollout to public and private sites; many NASCOP facilities offer PrEP and emergency PEP protocols. PEP_CERTAINTY: High; PrEP_CERTAINTY: High.",
    notesFr:
      "Le programme national NASCOP soutient le déploiement de la PrEP dans de nombreux sites ; disponibilité élevée. PEP_CERTAINTY: Élevé; PrEP_CERTAINTY: Élevé.",
  },
  {
    id: "ke_kisumu_keypop",
    country: "KE",
    city: "Kisumu",
    name: "Kisumu Key-Population-Friendly Clinic (PrEP/PEP services)",
    type: "youth_clinic",
    services: { hivTesting: true, pep: true, prep: true, sti: true },
    notesEn:
      "Kisumu has active PrEP and PEP programs concentrated in both public hospitals and NGO DICE clinics; check the specific clinic for stock. PEP_CERTAINTY: Medium-High; PrEP_CERTAINTY: High.",
    notesFr:
      "Kisumu propose programmes PrEP/PEP via hôpitaux publics et ONG; vérifiez les stocks. PEP_CERTAINTY: Moyen-Élevé; PrEP_CERTAINTY: Élevé.",
  },

  // ------------------------
  // SOUTH AFRICA (5)
  // ------------------------
  {
    id: "za_anova_health_institute",
    country: "ZA",
    city: "Cape Town / National",
    name: "Anova Health Institute – HIV Prevention & Key population services",
    type: "ngo",
    services: { hivTesting: true, pep: true, prep: true, sti: true, mentalHealth: true },
    notesEn:
      "Anova runs key-population and clinic support programmes in South Africa, including PrEP rollouts (Health4Men and other initiatives). They support clinics that provide PrEP and PEP as part of national guidelines. PEP_CERTAINTY: High; PrEP_CERTAINTY: High.",
    notesFr:
      "Anova soutient des programmes pour populations clés et le déploiement de la PrEP (Health4Men). PEP_CERTAINTY: Élevé; PrEP_CERTAINTY: Élevé.",
  },
  {
    id: "za_right_to_care",
    country: "ZA",
    city: "Johannesburg / National",
    name: "Right to Care – Prevention & Primary Care Services",
    type: "ngo",
    services: { hivTesting: true, pep: true, prep: true, sti: true },
    notesEn:
      "Right to Care implements HIV prevention programs including PrEP and PEP awareness and clinic-level services supported by PEPFAR and national programmes. PEP_CERTAINTY: High; PrEP_CERTAINTY: High.",
    notesFr:
      "Right to Care met en œuvre des programmes prévention VIH incluant PrEP et sensibilisation PEP au niveau clinique. PEP_CERTAINTY: Élevé; PrEP_CERTAINTY: Élevé.",
  },
  {
    id: "za_public_clinic_doh",
    country: "ZA",
    city: "Public clinics (various provinces)",
    name: "Public Clinic – Department of Health PrEP/PEP sites (SA)",
    type: "public_clinic",
    services: { hivTesting: true, pep: true, prep: true, sti: true },
    notesEn:
      "South African public clinics in many districts follow national PrEP/PEP guidelines; use national PrEP finders or facility lists to locate nearest site. Availability varies by province. PEP_CERTAINTY: Medium-High; PrEP_CERTAINTY: High.",
    notesFr:
      "Les cliniques publiques sud-africaines appliquent les directives nationales PrEP/PEP ; vérifiez la disponibilité provinciale. PEP_CERTAINTY: Moyen-Élevé; PrEP_CERTAINTY: Élevé.",
  },
  {
    id: "za_prep_finder",
    country: "ZA",
    city: "National",
    name: "South Africa PrEP Finder / MyPrEP (aggregated providers)",
    type: "public_clinic",
    services: { hivTesting: true, pep: true, prep: true, sti: true },
    notesEn:
      "Aggregated directory used in South Africa to find active PrEP delivery sites. Useful to verify PrEP availability before travel. PEP_CERTAINTY: N/A (finder); PrEP_CERTAINTY: High (finder-backed).",
    notesFr:
      "Répertoire agrégé permettant de trouver les sites PrEP actifs ; utile pour vérifier la disponibilité. PEP_CERTAINTY: N/A; PrEP_CERTAINTY: Élevé.",
  },
  {
    id: "za_clinic_keypop_cape",
    country: "ZA",
    city: "Cape Town",
    name: "Key-population-friendly sexual health clinic (Cape Town)",
    type: "youth_clinic",
    services: { hivTesting: true, pep: true, prep: true, sti: true, mentalHealth: true },
    notesEn:
      "Several MSM- and sex-worker-friendly clinics in Cape Town provide same-day PEP and active PrEP services; these are usually run by NGOs or supported by research programmes. PEP_CERTAINTY: Medium-High; PrEP_CERTAINTY: High.",
    notesFr:
      "Des cliniques adaptées aux MSM et travailleurs du sexe à Cape Town fournissent souvent PEP le jour même et PrEP. PEP_CERTAINTY: Moyen-Élevé; PrEP_CERTAINTY: Élevé.",
  },

  // ------------------------
  // RWANDA (2)
  // ------------------------
  {
    id: "rw_rbc_hiv_program",
    country: "RW",
    city: "Kigali / Districts",
    name: "Rwanda Biomedical Centre (RBC) – HIV Programming & Clinics",
    type: "public_clinic",
    services: { hivTesting: true, pep: true, prep: true, sti: true },
    notesEn:
      "RBC coordinates national HIV services; district hospitals and health centres linked to RBC provide testing and prevention. PrEP/PEP policies exist; check district clinic stock. PEP_CERTAINTY: Medium; PrEP_CERTAINTY: Medium.",
    notesFr:
      "Le RBC coordonne les services VIH nationaux ; les hôpitaux de district fournissent dépistage et prévention. PEP_CERTAINTY: Moyen; PrEP_CERTAINTY: Moyen.",
  },
  {
    id: "rw_king_faisal_hospital_hiv",
    country: "RW",
    city: "Kigali",
    name: "King Faisal Hospital – HIV & Infectious Diseases",
    type: "hospital",
    services: { hivTesting: true, pep: true, prep: true, sti: true },
    notesEn:
      "Major referral hospital in Kigali with specialised HIV services and linkage to national programs; can arrange urgent post-exposure care and prevention counselling. PEP_CERTAINTY: Medium; PrEP_CERTAINTY: Medium.",
    notesFr:
      "Hôpital de référence à Kigali offrant services VIH spécialisés et orientation prévention. PEP_CERTAINTY: Moyen; PrEP_CERTAINTY: Moyen.",
  },
];
