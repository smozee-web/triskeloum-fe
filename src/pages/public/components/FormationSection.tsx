import { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useGetLandingPageContentQuery } from '../../../services/api';

const FormationsSection = () => {
  const { lang, t } = useLanguage();
  const [showUsd, setShowUsd] = useState(false);
  const formatPrice = (ghs: any, usd: any) => showUsd ? `$${usd.toLocaleString()}` : `${ghs.toLocaleString()} GHS`;
  const { data: contentData } = useGetLandingPageContentQuery();

    // Get contact section content from API or use hardcoded fallback
  const contactSection = contentData?.payload?.find((section: any) => section.section === 'contact');
  const whatsapp = contactSection?.metadata?.whatsapp || '22890000000';

  const formationsSection = contentData?.payload?.find((section: any) => section.section === 'formations');

  const defaultTopics = [
    { icon: '📿', label: t('Azkaar & Awraad', 'Azkaar & Awraad') },
    { icon: '🕌', label: t('Asraar des Noms Divins', 'Asraar of the Divine Names') },
    { icon: '📖', label: t('Secrets des Versets Coraniques', 'Secrets of the Qur\'anic Verses') },
    { icon: '🌙', label: t("Tazkiyah (Purification de l'âme)", 'Tazkiyah (Purification of the Soul)') },
    { icon: '🌿', label: t('Médecine Prophétique & Plantes', 'Prophetic & Herbal Medicine') },
    { icon: '⭐', label: t('Sciences Sacrées des Lettres', 'Sacred Sciences of the Letters') },
    { icon: '🤲', label: t('Ruqyah & Protection Spirituelle', 'Ruqyah & Spiritual Protection') },
  ];

  const topicsFromApi = (formationsSection?.metadata?.topics || []).map((topic: any) => ({
    icon: topic.icon || '📿',
    label: t(topic.labelFr || topic.label_fr || 'Azkaar & Awraad', topic.labelEn || topic.label_en || 'Azkaar & Awraad'),
  }));

  const topics = topicsFromApi.length ? topicsFromApi : defaultTopics;

  const defaultFormations = [
    {
      id: 'classique',
      titleFr: 'Formation Classique',
      titleEn: 'Classic Training',
      subtitleFr: 'Parcours complet de la science des Asraar',
      subtitleEn: 'Complete path into the science of Asraar',
      ghs: 5200,
      usd: 335,
      periodFr: '/mois',
      periodEn: '/month',
      durationFr: 'Durée indéterminée',
      durationEn: 'Unlimited duration',
      featuresFr: [
        'Fondations de la science des Asraar',
        'Azkaar et awraad : litanies quotidiennes et leurs secrets',
        'Les Noms Divins : significations, propriétés et application',
        'Secrets des versets et sourates coraniques',
        "Tazkiyat an-nafs : purification du cœur et de l'âme",
        'Introduction à la médecine prophétique et aux plantes curatives',
        'Protection spirituelle pour soi et sa famille',
        '2 sessions live/mois (2h)',
      ],
      featuresEn: [
        'Foundations of the science of Asraar',
        'Azkaar and awraad: daily litanies and their secrets',
        'The Divine Names: meanings, properties and application',
        'Secrets of the Qur\'anic verses and chapters',
        'Tazkiyat an-nafs: purification of the heart and soul',
        'Introduction to prophetic medicine and healing plants',
        'Spiritual protection for oneself and one\'s family',
        '2 live sessions/month (2h)',
      ],
      isPremium: false,
    },
    {
      id: 'premium',
      titleFr: 'Formation Premium',
      titleEn: 'Premium Training',
      subtitleFr: 'Accompagnement intensif et personnalisé',
      subtitleEn: 'Intensive personalized support',
      ghs: 27000,
      usd: 1730,
      periodFr: '/mois',
      periodEn: '/month',
      durationFr: 'Engagement 3 ans',
      durationEn: '3-year commitment',
      featuresFr: [
        'Tout le programme Classique',
        'Séances ILLIMITÉES de ruqyah et de guérison',
        'Transmission personnalisée des awraad et ijazah (autorisation)',
        '4 sessions live/mois (2h)',
        'Litanies prescrites individuellement selon votre nature spirituelle',
        'Accompagnement individuel sur-mesure',
        'Accès prioritaire au Cheikh',
        'Purification et fortification complètes du chercheur',
      ],
      featuresEn: [
        'Full Classic program',
        'UNLIMITED ruqyah and healing sessions',
        'Personalized transmission of awraad and ijazah (authorization)',
        '4 live sessions/month (2h)',
        'Individually prescribed litanies for your spiritual nature',
        'Tailored one-on-one guidance',
        'Priority access to the Sheikh',
        'Complete purification and fortification of the seeker',
      ],
      isPremium: true,
    },
  ];

  const formationsFromApi = (formationsSection?.metadata?.packs || []).map((pack: any, idx: number) => {
    const featuresFr = pack.featuresFr || pack.features_fr || [];
    const featuresEn = pack.featuresEn || pack.features_en || [];

    return {
      id: pack.id || `pack-${idx}`,
      titleFr: pack.titleFr || pack.title_fr || '',
      titleEn: pack.titleEn || pack.title_en || '',
      subtitleFr: pack.subtitleFr || pack.subtitle_fr || '',
      subtitleEn: pack.subtitleEn || pack.subtitle_en || '',
      ghs: pack.priceGhs || pack.price_ghs || 0,
      usd: pack.priceUsd || pack.price_usd || 0,
      periodFr: pack.periodFr || pack.period_fr || '/mois',
      periodEn: pack.periodEn || pack.period_en || '/month',
      durationFr: pack.durationFr || pack.duration_fr || '',
      durationEn: pack.durationEn || pack.duration_en || '',
      featuresFr,
      featuresEn,
      isPremium: !!(pack.isPremium ?? pack.is_premium),
    };
  });

  const formations = formationsFromApi.length > 0 ? formationsFromApi : defaultFormations;

  const headerTitle = t(
    formationsSection?.titleFr || formationsSection?.title_fr || "La Science des Asraar",
    formationsSection?.titleEn || formationsSection?.title_en || 'The Science of Asraar'
  );
  const headerSubtitle = t(formationsSection?.subtitleFr || formationsSection?.subtitle_fr || 'FORMATIONS', formationsSection?.subtitleEn || formationsSection?.subtitle_en || 'TRAINING PROGRAMS');
  const headerDescription = t(
    formationsSection?.descriptionFr || formationsSection?.description_fr || "Héritée à travers des chaînes de transmission ininterrompues des savants et saints de l'Islam, la science des Asraar dévoile les secrets des versets coraniques, des Noms Divins et des lettres — guidant l'étudiant vers la connaissance, la protection et la réalisation spirituelle.",
    formationsSection?.descriptionEn || formationsSection?.description_en || "Inherited through unbroken chains of transmission from the scholars and saints of Islam, the science of Asraar unveils the secrets of the Qur'anic verses, the Divine Names, and the letters — guiding the student toward knowledge, protection, and spiritual realization."
  );

  return (
    <section id="formations" className="relative py-24 bg-gradient-to-b from-black via-stone-950 to-black overflow-hidden">
      {/* Sacred Geometry Background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="flowerOfLife" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="26" r="15" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
              <circle cx="15" cy="26" r="15" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
              <circle cx="45" cy="26" r="15" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
              <circle cx="22.5" cy="13" r="15" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
              <circle cx="37.5" cy="13" r="15" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
              <circle cx="22.5" cy="39" r="15" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
              <circle cx="37.5" cy="39" r="15" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#flowerOfLife)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 mb-4 text-xs tracking-[0.3em] text-amber-500 border border-amber-600/30 rounded-full">
            {headerSubtitle}
          </span>
          <h2 className="text-3xl md:text-5xl font-light text-white mb-6">
            {headerTitle}
          </h2>
          <p className="max-w-3xl mx-auto text-gray-400 mb-8">
            {headerDescription}
          </p>

          {/* Topics Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {topics.map((topic, i) => (
              <span
                key={i}
                className="px-4 py-2 bg-amber-900/20 border border-amber-700/30 rounded-full text-sm text-amber-400 hover:bg-amber-800/30 transition-colors cursor-default"
              >
                <span className="mr-2">{topic.icon}</span>
                {topic.label}
              </span>
            ))}
          </div>

          {/* Currency Toggle */}
          <button
            onClick={() => setShowUsd(!showUsd)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-900/20 border border-amber-600/30 rounded-full text-sm text-amber-400 hover:bg-amber-900/30 transition-colors"
          >
            <span className={!showUsd ? 'font-bold' : 'opacity-60'}>GHS</span>
            <div className="w-8 h-4 bg-black/50 rounded-full relative">
              <div className={`absolute top-0.5 w-3 h-3 bg-amber-500 rounded-full transition-all ${showUsd ? 'left-4' : 'left-0.5'}`} />
            </div>
            <span className={showUsd ? 'font-bold' : 'opacity-60'}>USD</span>
          </button>
        </div>

        {/* Formations Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {formations.map((formation) => (
            <div
              key={formation.id}
              className={`relative group rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 ${formation.isPremium
                  ? 'bg-gradient-to-br from-amber-900/30 via-black to-red-950/20'
                  : 'bg-gradient-to-br from-stone-900/50 to-black'
                }`}
            >
              {/* Premium Glow */}
              {formation.isPremium && (
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-red-500/10 animate-pulse" />
              )}

              {/* Border */}
              <div className={`absolute inset-0 rounded-3xl border-2 ${formation.isPremium ? 'border-amber-500/50' : 'border-amber-900/30'
                } group-hover:border-amber-500/70 transition-colors`} />

              {/* Premium Badge */}
              {formation.isPremium && (
                <div className="absolute top-0 right-0 px-6 py-2 bg-gradient-to-r from-amber-500 to-red-600 text-black text-xs font-bold tracking-wider rounded-bl-2xl">
                  PREMIUM
                </div>
              )}

              <div className="relative p-8">
                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-2xl font-medium text-white mb-2">
                    {t(formation.titleFr, formation.titleEn)}
                  </h3>
                  <p className="text-amber-500/80 text-sm">
                    {t(formation.subtitleFr, formation.subtitleEn)}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6 pb-6 border-b border-amber-900/30">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-light ${formation.isPremium ? 'text-amber-400' : 'text-white'}`}>
                      {formatPrice(formation.ghs, formation.usd)}
                    </span>
                    <span className="text-gray-500">{t(formation.periodFr || '/mois', formation.periodEn || '/month')}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{t(formation.durationFr || '', formation.durationEn || '')}</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {Array.from({ length: Math.max(formation.featuresFr?.length || 0, formation.featuresEn?.length || 0) }).map((_, i) => {
                    const fr = formation.featuresFr?.[i] || formation.featuresEn?.[i] || '';
                    const en = formation.featuresEn?.[i] || formation.featuresFr?.[i] || '';
                    return (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${formation.isPremium ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-300">{t(fr, en)}</span>
                    </li>
                  )})}
                </ul>

                {/* CTA */}
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-3 w-full py-4 rounded-full font-medium transition-all duration-300 ${formation.isPremium
                      ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-red-600 text-black hover:shadow-lg hover:shadow-amber-500/30 hover:scale-[1.02]'
                      : 'bg-amber-900/30 text-amber-400 border border-amber-700/50 hover:bg-amber-800/40'
                    }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {t("Rejoindre la formation", "Join the training")}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FormationsSection;
