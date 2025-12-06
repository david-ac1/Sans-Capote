// Emergency HIV/AIDS Hotlines across Africa
// 24/7 support for testing, counseling, and crisis intervention

export interface EmergencyHotline {
  country: string;
  countryCode: string;
  flag: string;
  hotlines: Array<{
    number: string;
    name: string;
    nameEn: string;
    nameFr: string;
    description: string;
    descriptionEn: string;
    descriptionFr: string;
    available: string;
    availableEn: string;
    availableFr: string;
  }>;
}

export const emergencyHotlines: EmergencyHotline[] = [
  {
    country: 'Nigeria',
    countryCode: 'NG',
    flag: '🇳🇬',
    hotlines: [
      {
        number: '6222',
        name: 'National AIDS Hotline',
        nameEn: 'National AIDS Hotline',
        nameFr: 'Ligne d\'assistance nationale SIDA',
        description: 'Free HIV testing information, counseling, and referrals',
        descriptionEn: 'Free HIV testing information, counseling, and referrals',
        descriptionFr: 'Information gratuite sur les tests VIH, conseil et références',
        available: '24/7',
        availableEn: '24/7',
        availableFr: '24h/24',
      },
      {
        number: '0800-100-4444',
        name: 'NACA HIV Counseling',
        nameEn: 'NACA HIV Counseling',
        nameFr: 'Conseil VIH NACA',
        description: 'National Agency for Control of AIDS support line',
        descriptionEn: 'National Agency for Control of AIDS support line',
        descriptionFr: 'Ligne de soutien de l\'Agence nationale de lutte contre le SIDA',
        available: 'Mon-Fri 8am-6pm',
        availableEn: 'Mon-Fri 8am-6pm',
        availableFr: 'Lun-Ven 8h-18h',
      },
    ],
  },
  {
    country: 'South Africa',
    countryCode: 'ZA',
    flag: '🇿🇦',
    hotlines: [
      {
        number: '0800 012 322',
        name: 'AIDS Helpline',
        nameEn: 'AIDS Helpline',
        nameFr: 'Ligne d\'assistance SIDA',
        description: 'Free confidential HIV/AIDS counseling and support',
        descriptionEn: 'Free confidential HIV/AIDS counseling and support',
        descriptionFr: 'Conseil et soutien VIH/SIDA gratuit et confidentiel',
        available: '24/7',
        availableEn: '24/7',
        availableFr: '24h/24',
      },
      {
        number: '*134*832#',
        name: 'HIV Self-Test USSD',
        nameEn: 'HIV Self-Test USSD',
        nameFr: 'Auto-test VIH USSD',
        description: 'Dial for free HIV self-test kit delivery',
        descriptionEn: 'Dial for free HIV self-test kit delivery',
        descriptionFr: 'Composez pour la livraison gratuite de kit d\'auto-test VIH',
        available: '24/7',
        availableEn: '24/7',
        availableFr: '24h/24',
      },
    ],
  },
  {
    country: 'Kenya',
    countryCode: 'KE',
    flag: '🇰🇪',
    hotlines: [
      {
        number: '1190',
        name: 'AIDS Hotline Kenya',
        nameEn: 'AIDS Hotline Kenya',
        nameFr: 'Ligne d\'assistance SIDA Kenya',
        description: 'Free HIV testing locations, PrEP/PEP info, counseling',
        descriptionEn: 'Free HIV testing locations, PrEP/PEP info, counseling',
        descriptionFr: 'Lieux de dépistage VIH gratuits, info PrEP/PEP, conseil',
        available: '24/7',
        availableEn: '24/7',
        availableFr: '24h/24',
      },
      {
        number: '1199',
        name: 'NASCOP HIV Support',
        nameEn: 'NASCOP HIV Support',
        nameFr: 'Soutien VIH NASCOP',
        description: 'National AIDS Control Program support and referrals',
        descriptionEn: 'National AIDS Control Program support and referrals',
        descriptionFr: 'Soutien et références du Programme national de lutte contre le SIDA',
        available: 'Mon-Fri 8am-5pm',
        availableEn: 'Mon-Fri 8am-5pm',
        availableFr: 'Lun-Ven 8h-17h',
      },
    ],
  },
  {
    country: 'Uganda',
    countryCode: 'UG',
    flag: '🇺🇬',
    hotlines: [
      {
        number: '0800-100-066',
        name: 'Uganda AIDS Hotline',
        nameEn: 'Uganda AIDS Hotline',
        nameFr: 'Ligne d\'assistance SIDA Ouganda',
        description: 'Free HIV counseling, testing info, and treatment support',
        descriptionEn: 'Free HIV counseling, testing info, and treatment support',
        descriptionFr: 'Conseil VIH gratuit, info sur les tests et soutien au traitement',
        available: '24/7',
        availableEn: '24/7',
        availableFr: '24h/24',
      },
      {
        number: '0417-711-200',
        name: 'The AIDS Support Organization (TASO)',
        nameEn: 'The AIDS Support Organization (TASO)',
        nameFr: 'Organisation de soutien au SIDA (TASO)',
        description: 'Peer counseling, support groups, and HIV care',
        descriptionEn: 'Peer counseling, support groups, and HIV care',
        descriptionFr: 'Conseil par les pairs, groupes de soutien et soins VIH',
        available: 'Mon-Fri 8am-5pm',
        availableEn: 'Mon-Fri 8am-5pm',
        availableFr: 'Lun-Ven 8h-17h',
      },
    ],
  },
  {
    country: 'Ghana',
    countryCode: 'GH',
    flag: '🇬🇭',
    hotlines: [
      {
        number: '0800-100-100',
        name: 'Ghana AIDS Hotline',
        nameEn: 'Ghana AIDS Hotline',
        nameFr: 'Ligne d\'assistance SIDA Ghana',
        description: 'HIV testing centers, counseling, and treatment info',
        descriptionEn: 'HIV testing centers, counseling, and treatment info',
        descriptionFr: 'Centres de dépistage VIH, conseil et info sur les traitements',
        available: '24/7',
        availableEn: '24/7',
        availableFr: '24h/24',
      },
      {
        number: '0302-305-261',
        name: 'Ghana AIDS Commission',
        nameEn: 'Ghana AIDS Commission',
        nameFr: 'Commission SIDA Ghana',
        description: 'National HIV/AIDS program information and support',
        descriptionEn: 'National HIV/AIDS program information and support',
        descriptionFr: 'Information et soutien du programme national VIH/SIDA',
        available: 'Mon-Fri 8am-5pm',
        availableEn: 'Mon-Fri 8am-5pm',
        availableFr: 'Lun-Ven 8h-17h',
      },
    ],
  },
  {
    country: 'Rwanda',
    countryCode: 'RW',
    flag: '🇷🇼',
    hotlines: [
      {
        number: '114',
        name: 'Rwanda Health Hotline',
        nameEn: 'Rwanda Health Hotline',
        nameFr: 'Ligne d\'assistance santé Rwanda',
        description: 'HIV testing, PrEP access, and emergency support',
        descriptionEn: 'HIV testing, PrEP access, and emergency support',
        descriptionFr: 'Dépistage VIH, accès à la PrEP et soutien d\'urgence',
        available: '24/7',
        availableEn: '24/7',
        availableFr: '24h/24',
      },
      {
        number: '0788-385-000',
        name: 'RBC HIV Services',
        nameEn: 'RBC HIV Services',
        nameFr: 'Services VIH RBC',
        description: 'Rwanda Biomedical Center HIV/AIDS services',
        descriptionEn: 'Rwanda Biomedical Center HIV/AIDS services',
        descriptionFr: 'Services VIH/SIDA du Centre biomédical du Rwanda',
        available: 'Mon-Fri 7:30am-5pm',
        availableEn: 'Mon-Fri 7:30am-5pm',
        availableFr: 'Lun-Ven 7h30-17h',
      },
    ],
  },
];
