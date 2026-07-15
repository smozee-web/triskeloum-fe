import { JSX, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useGetLandingServicesQuery, useGetLandingPageContentQuery } from '../../../services/api';

const getServiceIcon = (iconName: string) => {
  const icons: Record<string, JSX.Element> = {
    consultation: (
      <svg viewBox="0 0 60 60" className="w-16 h-16">
        <circle cx="30" cy="30" r="28" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="30" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M30 32 L30 45 M22 38 L30 45 L38 38" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    lecture: (
      <svg viewBox="0 0 60 60" className="w-16 h-16">
        <ellipse cx="30" cy="30" rx="12" ry="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="30" cy="30" r="6" fill="currentColor" opacity="0.3" />
        <circle cx="30" cy="30" r="2" fill="currentColor" />
        <path d="M10 30 Q20 25 30 30 Q40 35 50 30" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
    bilan: (
      <svg viewBox="0 0 60 60" className="w-16 h-16">
        {[12, 18, 24, 30, 36, 42, 48].map((y, i) => (
          <circle key={i} cx="30" cy={y} r="3" fill="currentColor" opacity={0.3 + i * 0.1} />
        ))}
        <path d="M20 10 Q30 5 40 10 M20 50 Q30 55 40 50" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <ellipse cx="30" cy="30" rx="18" ry="25" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
      </svg>
    ),
    livre: (
      <svg viewBox="0 0 60 60" className="w-16 h-16">
        <path d="M15 10 L15 50 Q30 45 45 50 L45 10 Q30 15 15 10 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M30 15 L30 45" stroke="currentColor" strokeWidth="1" />
        <path d="M20 20 L25 20 M35 20 L40 20 M20 28 L25 28 M35 28 L40 28 M20 36 L25 36 M35 36 L40 36" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <circle cx="22" cy="8" r="1" fill="currentColor" />
        <circle cx="38" cy="6" r="1.5" fill="currentColor" />
        <circle cx="48" cy="12" r="1" fill="currentColor" />
      </svg>
    ),
  };
  return icons[iconName] || icons.consultation;
};

const ServicesSection = () => {
  const { lang, t } = useLanguage();
  const [hoveredCard, setHoveredCard] = useState<any>(null);
  const [showUsd, setShowUsd] = useState(false);

  const { data: servicesData, isLoading: servicesLoading } = useGetLandingServicesQuery();
  const { data: contentData } = useGetLandingPageContentQuery();

  // Get WhatsApp number from contact section
  const contactSection = contentData?.payload?.find((section: any) => section.section === 'contact');
  const whatsappNumber = contactSection?.metadata?.whatsapp || '22890000000';

  const formatPrice = (ghs: any, usd: any) => {
    if (showUsd) return `$${usd?.toLocaleString()}`;
    return `${ghs?.toLocaleString()} GHS`;
  };

  // Get services from API or use hardcoded fallback
  const apiServices = servicesData?.payload || [];
  const services = apiServices.length > 0 ? apiServices.map((service: any) => ({
    id: service.id,
    icon: getServiceIcon(service.icon),
    titleFr: service.titleFr,
    titleEn: service.titleEn,
    descFr: service.descriptionFr,
    descEn: service.descriptionEn,
    ghs: service.priceGhs,
    usd: service.priceUsd,
    featured: service.sortOrder === 4, // Last service is featured
  })) : [
    {
      id: 'consultation',
      icon: getServiceIcon('consultation'),
      titleFr: 'Consultation',
      titleEn: 'Consultation',
      descFr: "Une session approfondie avec le Cheikh pour évoquer votre situation, identifier les causes spirituelles de vos difficultés, et recevoir une guidance personnalisée ainsi que des azkaar prescrits.",
      descEn: "An in-depth session with the Sheikh to discuss your situation, identify the spiritual causes behind your difficulties, and receive personalized guidance and prescribed azkaar.",
      ghs: 2500,
      usd: 165,
    },
    {
      id: 'lecture',
      icon: getServiceIcon('lecture'),
      titleFr: "Diagnostic Spirituel",
      titleEn: "Spiritual Diagnosis",
      descFr: "Une évaluation profonde de votre état intérieur : l'état du cœur, les afflictions spirituelles (mauvais œil, envie, nuisances invisibles), et les blocages qui vous retiennent — avec des étapes claires pour la guérison.",
      descEn: "A deep assessment of your inner state: the condition of the heart, spiritual afflictions (evil eye, envy, unseen harm), and the blockages holding you back — with clear steps for healing.",
      ghs: 3800,
      usd: 248,
    },
    {
      id: 'bilan',
      icon: getServiceIcon('bilan'),
      titleFr: 'Séance de Ruqyah & Purification',
      titleEn: 'Ruqyah & Purification Session',
      descFr: "Séance de guérison par la récitation coranique, les Noms Divins et les invocations prescrites, pour purifier et protéger le corps, le foyer et l'âme des influences nuisibles.",
      descEn: "Healing session through Qur'anic recitation, the Divine Names and prescribed supplications, to cleanse and protect the body, home and soul from harmful influences.",
      ghs: 3800,
      usd: 248,
    },
    {
      id: 'livre',
      icon: getServiceIcon('livre'),
      titleFr: 'Livre de Guidance',
      titleEn: 'Book of Guidance',
      descFr: "Un document personnalisé de 20 pages préparé à travers la science des Asraar : votre nature spirituelle, vos forces et épreuves, votre direction de vie, ainsi que les azkaar, versets et pratiques spécifiques prescrits pour votre chemin vers l'harmonie et la réussite.",
      descEn: "A personalized 20-page document prepared through the science of Asraar: your spiritual nature, your strengths and trials, your life direction, and the specific azkaar, verses and practices prescribed for your path to harmony and success.",
      ghs: 7600,
      usd: 496,
      featured: true,
    },
  ];

  // Get section content from API or use hardcoded fallback
  const servicesSection = contentData?.payload?.find((section: any) => section.section === 'services');
  const sectionTitle = servicesSection ? (lang === 'fr' ? servicesSection.titleFr : servicesSection.titleEn) : t('Consultations', 'Consultations');
  const sectionSubtitle = servicesSection ? (lang === 'fr' ? servicesSection.subtitleFr : servicesSection.subtitleEn) : t('NOS SERVICES', 'OUR SERVICES');
  const sectionDescription = servicesSection ? (lang === 'fr' ? servicesSection.descriptionFr : servicesSection.descriptionEn) : t("Un accompagnement spirituel sur-mesure, ancré dans le Coran, la Sunna et les sciences héritées des Asraar.", "Tailored spiritual guidance rooted in the Qur'an, the Sunnah, and the inherited sciences of Asraar.");

  return (
    <section id="services" className="relative py-24 bg-gradient-to-b from-black via-neutral-950 to-black overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-amber-500 to-transparent" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-amber-500 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 mb-4 text-xs tracking-[0.3em] text-amber-500 border border-amber-600/30 rounded-full">
            {sectionSubtitle}
          </span>
          <h2 className="text-3xl md:text-5xl font-light text-white mb-6">
            {sectionTitle}
          </h2>
          <p className="max-w-2xl mx-auto text-gray-400">
            {sectionDescription}
          </p>
          
          {/* Currency Toggle */}
          <button
            onClick={() => setShowUsd(!showUsd)}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-amber-900/20 border border-amber-600/30 rounded-full text-sm text-amber-400 hover:bg-amber-900/30 transition-colors"
          >
            <span className={!showUsd ? 'font-bold' : 'opacity-60'}>GHS</span>
            <div className="w-8 h-4 bg-black/50 rounded-full relative">
              <div className={`absolute top-0.5 w-3 h-3 bg-amber-500 rounded-full transition-all ${showUsd ? 'left-4' : 'left-0.5'}`} />
            </div>
            <span className={showUsd ? 'font-bold' : 'opacity-60'}>USD</span>
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service: { id: Key | null | undefined; featured: any; icon: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; titleFr: string; titleEn: string; descFr: string; descEn: string; ghs: any; usd: any; }, index: number) => (
            <div
              key={service.id}
              onMouseEnter={() => setHoveredCard(service.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`group relative p-6 rounded-2xl border transition-all duration-500 ${
                service.featured 
                  ? 'bg-gradient-to-b from-amber-900/20 to-black border-amber-500/50 lg:col-span-1' 
                  : 'bg-black/50 border-amber-900/30 hover:border-amber-600/50'
              } ${hoveredCard === service.id ? 'transform -translate-y-2 shadow-2xl shadow-amber-900/20' : ''}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Featured Badge */}
              {service.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-700 rounded-full text-xs text-black font-semibold">
                  {t('POPULAIRE', 'POPULAR')}
                </div>
              )}

              {/* Icon */}
              <div className={`mb-6 text-amber-500 transition-transform duration-500 ${hoveredCard === service.id ? 'scale-110' : ''}`}>
                {service.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-medium text-white mb-3 group-hover:text-amber-400 transition-colors">
                {t(service.titleFr, service.titleEn)}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                {t(service.descFr, service.descEn)}
              </p>

              {/* Price */}
              <div className="mb-6">
                <span className="text-2xl font-light text-amber-400">
                  {formatPrice(service.ghs, service.usd)}
                </span>
              </div>

              {/* CTA */}
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  service.featured
                    ? 'bg-gradient-to-r from-amber-500 to-amber-700 text-black hover:from-amber-400 hover:to-amber-600'
                    : 'bg-amber-900/30 text-amber-400 hover:bg-amber-800/50 border border-amber-700/30'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {t('Réserver', 'Book')}
              </a>

              {/* Hover Glow */}
              <div className={`absolute inset-0 rounded-2xl bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;