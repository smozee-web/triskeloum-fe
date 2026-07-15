import { useLanguage } from '../../../contexts/LanguageContext';
import { useGetLandingPageContentQuery } from '../../../services/api';

const NaturalHealingSection = () => {
  const { t } = useLanguage();
  const { data: contentData } = useGetLandingPageContentQuery();
  const contactSection = contentData?.payload?.find((section: any) => section.section === 'contact');
  const whatsapp = contactSection?.metadata?.whatsapp || '22890000000';


  const benefits = [
    {
      iconPath: "M12 6.253v13M12 6.253C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
      titleFr: "Remèdes à Base de Plantes",
      titleEn: "Herbal Remedies",
      descFr: "Préparations personnalisées à base de plantes pour les maux du corps.",
      descEn: "Personalized plant-based preparations for the ailments of the body.",
    },
    {
      iconPath: "M12 2C9 6 6 9.5 6 13a6 6 0 0012 0c0-3.5-3-7-6-11zM9 13a3 3 0 006 0",
      titleFr: "Médecine Prophétique",
      titleEn: "Prophetic Medicine",
      descFr: "Guérison par la graine noire, le miel, des conseils sur la hijama et les remèdes de la Sunna.",
      descEn: "Healing with black seed, honey, hijama guidance and the remedies of the Sunnah.",
    },
    {
      iconPath: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
      titleFr: "Protection du Foyer",
      titleEn: "Home Protection",
      descFr: "Purification et fortification du foyer contre les nuisances invisibles, l'envie et les perturbations.",
      descEn: "Cleansing and fortifying the home against unseen harm, envy and disturbance.",
    },
    {
      iconPath: "M12 3c-1.5 3-4 5.5-4 9a4 4 0 008 0c0-3.5-2.5-6-4-9z M6 20h12",
      titleFr: "Eau Bénie & Préparations",
      titleEn: "Blessed Water & Preparations",
      descFr: "Versets coraniques récités sur l'eau et les éléments naturels pour la guérison et la protection.",
      descEn: "Qur'anic verses recited over water and natural elements for healing and protection.",
    },
  ];

  return (
    <section id="natural-healing" className="relative py-24 bg-gradient-to-b from-black via-emerald-950/10 to-black overflow-hidden">
      {/* Animated Sacred Geometry Background */}
      <div className="absolute inset-0">
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.03]" viewBox="0 0 400 400">
          <g className="animate-spin-slower origin-center">
            <circle cx="200" cy="200" r="150" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
            <circle cx="200" cy="200" r="100" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
            <circle cx="200" cy="200" r="50" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <line
                key={angle}
                x1="200"
                y1="200"
                x2={200 + 150 * Math.cos(angle * Math.PI / 180)}
                y2={200 + 150 * Math.sin(angle * Math.PI / 180)}
                stroke="#D4AF37"
                strokeWidth="0.5"
              />
            ))}
          </g>
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 mb-4 text-xs tracking-[0.3em] text-amber-500 border border-amber-600/30 rounded-full">
            {t('MÉDECINE PROPHÉTIQUE', 'PROPHETIC MEDICINE')}
          </span>
          <h2 className="text-3xl md:text-5xl font-light text-white mb-6">
            {t('Guérison Naturelle', 'Natural Healing')}
          </h2>
          <p className="max-w-3xl mx-auto text-gray-400">
            {t(
              "S'appuyant sur le Tibb Nabawi (Médecine Prophétique) et des générations de savoir hérité sur les plantes curatives d'Afrique de l'Ouest, le Cheikh prescrit des remèdes naturels qui soignent le corps pendant que les azkaar soignent l'âme.",
              "Drawing on Tibb Nabawi (Prophetic Medicine) and generations of inherited knowledge of West African healing plants, the Sheikh prescribes natural remedies that treat the body while the azkaar treat the soul."
            )}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Visual */}
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto relative">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <defs>
                  <linearGradient id="bgGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D4AF37" />
                    <stop offset="50%" stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#B8860B" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Outer circle */}
                <circle cx="100" cy="100" r="90" fill="none" stroke="url(#bgGold)" strokeWidth="1" opacity="0.3" />

                {/* Inner rotating elements */}
                <g filter="url(#glow)" className="animate-spin-slow origin-center" style={{ transformOrigin: '100px 100px' }}>
                  <circle cx="70" cy="100" r="50" fill="none" stroke="url(#bgGold)" strokeWidth="1.5" />
                  <circle cx="130" cy="100" r="50" fill="none" stroke="url(#bgGold)" strokeWidth="1.5" />
                </g>

                {/* Center elements */}
                <g className="animate-pulse">
                  <circle cx="100" cy="100" r="15" fill="none" stroke="url(#bgGold)" strokeWidth="2" />
                  <circle cx="100" cy="100" r="5" fill="url(#bgGold)" />
                </g>
              </svg>

              {/* Glow effect */}
              <div className="absolute inset-0 bg-amber-500/5 rounded-full blur-3xl" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-r from-amber-900/20 to-transparent border-l-2 border-amber-500 rounded-r-xl">
              <h3 className="text-xl text-amber-400 mb-3">{t("La Sagesse de la Création", "The Wisdom of Creation")}</h3>
              <p className="text-gray-300">
                {t(
                  "Allah a placé un remède dans Sa création pour chaque maladie. De la graine noire et du miel loués dans la Sunna, aux feuilles, racines et écorces connues de nos ancêtres, la médecine traditionnelle par les plantes restaure ce que la vie moderne a affaibli.",
                  "Allah has placed a cure in His creation for every illness. From black seed and honey praised in the Sunnah, to the leaves, roots and barks known to our ancestors, traditional plant medicine restores what modern life has weakened."
                )}
              </p>
            </div>

            <p className="text-gray-400 leading-relaxed">
              {t(
                "Nos environnements et nos régimes modernes nous ont déconnectés de cet héritage naturel. De nombreux maux du corps — fatigue, infertilité, douleurs chroniques, maladies inexpliquées — trouvent des remèdes qui poussent de la terre.",
                "Our modern environments and diets have disconnected us from this natural inheritance. Many ailments of the body — fatigue, infertility, chronic pain, unexplained illness — have remedies that grow from the earth."
              )}
            </p>

            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-900/30 border border-amber-600/50 rounded-full text-amber-400 hover:bg-amber-800/40 transition-all duration-300"
            >
              {t('Demander une consultation de remède', 'Request a remedy consultation')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="group p-6 bg-black/50 border border-amber-900/30 rounded-2xl hover:border-amber-600/50 hover:bg-amber-900/10 transition-all duration-300"
            >
              <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-amber-600/20 to-amber-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={benefit.iconPath} />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-white mb-2">{t(benefit.titleFr, benefit.titleEn)}</h4>
              <p className="text-sm text-gray-400">{t(benefit.descFr, benefit.descEn)}</p>
            </div>
          ))}
        </div>

        {/* Price Note */}
        <div className="mt-12 text-center">
          <p className="inline-flex items-center gap-2 px-6 py-3 bg-amber-900/10 border border-amber-700/30 rounded-full text-amber-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('Remèdes naturels - Prix sur demande', 'Natural remedies - Price on request')}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin-slower { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slower { animation: spin-slower 60s linear infinite; }
        .animate-spin-slow { animation: spin-slower 30s linear infinite; }
      `}</style>
    </section>
  );
};

export default NaturalHealingSection;
