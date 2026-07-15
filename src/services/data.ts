import { Formation, Service, TeamMember } from "../utils/typeDef";

export const services: Service[] = [
    {
        id: 'consultation',
        titleFr: 'Consultation',
        titleEn: 'Consultation',
        descriptionFr: 'Une session avec le Cheikh pour identifier vos besoins et recevoir une guidance personnalisée.',
        descriptionEn: 'A session with the Sheikh to identify your needs and receive personalized guidance.',
        priceEur: 153,
        priceXof: 100000,
        icon: '📿',
    },
    {
        id: 'diagnostic-spirituel',
        titleFr: 'Diagnostic Spirituel',
        titleEn: 'Spiritual Diagnosis',
        descriptionFr: 'Évaluation de votre état intérieur pour révéler afflictions, blocages et clés de guérison.',
        descriptionEn: 'Assessment of your inner state to reveal afflictions, blockages, and keys to healing.',
        priceEur: 230,
        priceXof: 150000,
        icon: '👁️',
    },
    {
        id: 'ruqyah-purification',
        titleFr: 'Séance de Ruqyah & Purification',
        titleEn: 'Ruqyah & Purification Session',
        descriptionFr: 'Guérison par la récitation coranique et les invocations pour purifier corps, foyer et âme.',
        descriptionEn: 'Healing through Qur\'anic recitation and supplications to purify the body, home and soul.',
        priceEur: 230,
        priceXof: 150000,
        icon: '🤲',
    },
    {
        id: 'livre-de-guidance',
        titleFr: 'Livre de Guidance',
        titleEn: 'Book of Guidance',
        descriptionFr: 'Document personnalisé révélant votre nature spirituelle et vos azkaar prescrits.',
        descriptionEn: 'Personalized document revealing your spiritual nature and prescribed azkaar.',
        priceEur: 460,
        priceXof: 300000,
        icon: '📜',
    },
];

export const formations: Formation[] = [
    {
        id: 'classique',
        titleFr: 'Formation Classique',
        titleEn: 'Classic Training',
        descriptionFr: 'Parcours complet structuré autour de la science des Asraar.',
        descriptionEn: 'Complete path structured around the science of Asraar.',
        priceEur: 310,
        priceXof: 203000,
        duration: 'Indéterminée',
        features: [
            { fr: 'Azkaar & Awraad', en: 'Azkaar & Awraad' },
            { fr: 'Les Noms Divins', en: 'The Divine Names' },
            { fr: "Tazkiyah (Purification de l'âme)", en: 'Tazkiyah (Purification of the Soul)' },
            { fr: 'Médecine prophétique', en: 'Prophetic Medicine' },
            { fr: '2 sessions/mois (2h)', en: '2 sessions/month (2h)' },
        ],
    },
    {
        id: 'premium',
        titleFr: 'Formation Premium',
        titleEn: 'Premium Training',
        descriptionFr: 'Accompagnement intensif et personnalisé avec séances de ruqyah illimitées.',
        descriptionEn: 'Intensive personalized support with unlimited ruqyah sessions.',
        priceEur: 1600,
        priceXof: 1050000,
        duration: '3 ans',
        isPremium: true,
        features: [
            { fr: 'Tout le programme Classique', en: 'Full Classic program' },
            { fr: 'Ruqyah illimitée', en: 'Unlimited ruqyah' },
            { fr: 'Ijazah (autorisation) personnalisée', en: 'Personalized ijazah (authorization)' },
            { fr: '4 sessions/mois (2h)', en: '4 sessions/month (2h)' },
            { fr: 'Accompagnement sur-mesure', en: 'Tailored support' },
        ],
    },
];

export const team: TeamMember[] = [
    {
        id: 'antar',
        name: 'Sheikh Antar Ayatollah Fofana',
        roleFr: 'Fondateur USRATUL AZKAAR - Cheikh',
        roleEn: 'Founder USRATUL AZKAAR - Sheikh',
        image: '/placeholder-antar.jpg',
    },
];