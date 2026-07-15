import { Formation, Service, TeamMember } from "../utils/typeDef";

export const services: Service[] = [
    {
        id: 'consultation',
        titleFr: 'Consultation',
        titleEn: 'Consultation',
        descriptionFr: 'Un échange pour identifier vos besoins et recevoir des conseils personnalisés.',
        descriptionEn: 'A conversation to identify your needs and receive personalized guidance.',
        priceEur: 153,
        priceXof: 100000,
        icon: '🔮',
    },
    {
        id: 'lecture-ame',
        titleFr: 'Lecture de l\'Âme',
        titleEn: 'Soul Reading',
        descriptionFr: 'Connexion à votre être intérieur pour révéler blessures, blocages et clés d\'évolution.',
        descriptionEn: 'Connection to your inner being to reveal wounds, blockages, and keys to evolution.',
        priceEur: 230,
        priceXof: 150000,
        icon: '👁️',
    },
    {
        id: 'bilan-energetique',
        titleFr: 'Bilan Énergétique',
        titleEn: 'Energy Assessment',
        descriptionFr: 'Analyse complète de votre profil vibratoire : chakras, aura, méridiens et blocages.',
        descriptionEn: 'Complete analysis of your vibrational profile: chakras, aura, meridians and blockages.',
        priceEur: 230,
        priceXof: 150000,
        icon: '⚡',
    },
    {
        id: 'livre-de-vie',
        titleFr: 'Livre de Vie',
        titleEn: 'Book of Life',
        descriptionFr: 'Document personnalisé révélant votre parcours d\'âme et vos clés de transformation.',
        descriptionEn: 'Personalized document revealing your soul journey and transformation keys.',
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
        descriptionFr: 'Parcours initiatique structuré autour des grands piliers de la tradition ésotérique.',
        descriptionEn: 'Structured initiatory path around the great pillars of esoteric tradition.',
        priceEur: 310,
        priceXof: 203000,
        duration: 'Indéterminée',
        features: [
            { fr: 'Hermétisme & Kabbale', en: 'Hermeticism & Kabbalah' },
            { fr: 'Magie opérative', en: 'Operative Magic' },
            { fr: 'Méditation avancée', en: 'Advanced Meditation' },
            { fr: 'Alchimie spirituelle', en: 'Spiritual Alchemy' },
            { fr: '2 sessions/mois (2h)', en: '2 sessions/month (2h)' },
        ],
    },
    {
        id: 'premium',
        titleFr: 'Formation Premium',
        titleEn: 'Premium Training',
        descriptionFr: 'Accompagnement intensif et personnalisé avec soins énergétiques illimités.',
        descriptionEn: 'Intensive personalized support with unlimited energy treatments.',
        priceEur: 1600,
        priceXof: 1050000,
        duration: '3 ans',
        isPremium: true,
        features: [
            { fr: 'Tout le programme Classique', en: 'Full Classic program' },
            { fr: 'Soins énergétiques illimités', en: 'Unlimited energy treatments' },
            { fr: 'Initiations personnalisées', en: 'Personalized initiations' },
            { fr: '4 sessions/mois (2h)', en: '4 sessions/month (2h)' },
            { fr: 'Accompagnement sur-mesure', en: 'Tailored support' },
        ],
    },
];

export const team: TeamMember[] = [
    {
        id: 'taj',
        name: 'Taj Rasmoon',
        roleFr: 'PDG USRATUL AZKAAR - Maître spirituel',
        roleEn: 'CEO USRATUL AZKAAR - Spiritual Master',
        image: '/placeholder-taj.jpg',
    },
    {
        id: 'sali',
        name: 'Sali Mondor',
        roleFr: 'Consultante | Sophrologue | Soins',
        roleEn: 'Consultant | Sophrologist | Healing',
        image: '/placeholder-sali.jpg',
    },
];