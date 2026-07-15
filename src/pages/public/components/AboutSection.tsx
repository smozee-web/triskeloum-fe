import { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useGetLandingPageContentQuery } from '../../../services/api';

const AboutSection = () => {
  const { lang, t } = useLanguage();
  const { data: contentData } = useGetLandingPageContentQuery();

  // Get about section content from API or use hardcoded fallback
  const aboutSection = contentData?.payload?.find((section: any) => section.section === 'about');
  const title = aboutSection ? (lang === 'fr' ? (aboutSection.titleFr ?? aboutSection.title_fr) : (aboutSection.titleEn ?? aboutSection.title_en)) : t('Le Cheikh', 'The Sheikh');
  const subtitle = aboutSection ? (lang === 'fr' ? (aboutSection.subtitleFr ?? aboutSection.subtitle_fr) : (aboutSection.subtitleEn ?? aboutSection.subtitle_en)) : t('À PROPOS', 'ABOUT');
  const description = aboutSection ? (lang === 'fr' ? (aboutSection.descriptionFr ?? aboutSection.description_fr) : (aboutSection.descriptionEn ?? aboutSection.description_en)) : t("Fondateur de USRATUL AZKAAR, j'accompagne les chercheurs sur le chemin de la purification intérieure et du rapprochement d'Allah, à travers les sciences des Asraar et des Azkaar héritées de mes maîtres, ainsi que les connaissances curatives de la médecine prophétique et traditionnelle.", "Founder of USRATUL AZKAAR, I guide seekers on the path of inner purification and nearness to Allah, through the sciences of Asraar and Azkaar inherited from my teachers, and the healing knowledge of prophetic and traditional medicine.");
  const content = aboutSection ? (lang === 'fr' ? (aboutSection.contentFr ?? aboutSection.content_fr) : (aboutSection.contentEn ?? aboutSection.content_en)) : t("Mon chemin a commencé dès le plus jeune âge, porté par une soif profonde des sciences sacrées. Au fil des années, j'ai reçu la transmission et l'autorisation (ijazah) de maîtres de ces disciplines, ainsi qu'une vie entière d'étude des plantes curatives de nos terres.", "My path began at a young age, driven by a deep thirst for the sacred sciences. Over the years, I received transmission and authorization (ijazah) from masters of these disciplines, alongside a lifetime of study of the healing plants of our lands.");
  const meta = aboutSection?.metadata || {};
  const masterName = meta.master_name ?? meta.masterName ?? 'Sheikh Antar Ayatollah Fofana';
  const masterTitle = aboutSection?.metadata ? (lang === 'fr' ? (meta.master_title_fr ?? meta.masterTitleFr ?? 'Enseignant des Asraar & Guide Spirituel') : (meta.master_title_en ?? meta.masterTitleEn ?? 'Teacher of Asraar & Spiritual Guide')) : t('Enseignant des Asraar & Guide Spirituel', 'Teacher of Asraar & Spiritual Guide');
  const quote = aboutSection?.metadata ? (lang === 'fr' ? (meta.quote_fr ?? meta.quoteFr ?? '') : (meta.quote_en ?? meta.quoteEn ?? '')) : t("Le rappel d'Allah est le polissoir des cœurs.", "Remembrance of Allah is the polish of the heart.");

  const initiationsRaw = aboutSection?.metadata?.initiations || [];
  const initiations = (initiationsRaw.length ? initiationsRaw : [
    { icon: '📿', labelFr: 'Azkaar & Awraad', labelEn: 'Azkaar & Awraad' },
    { icon: '📖', labelFr: 'Asraar des Versets', labelEn: 'Asraar of the Verses' },
    { icon: '🕌', labelFr: 'Les Noms Divins', labelEn: 'The Divine Names' },
    { icon: '🌿', labelFr: 'Médecine Traditionnelle', labelEn: 'Traditional Plant Medicine' },
    { icon: '🤲', labelFr: 'Ruqyah', labelEn: 'Ruqyah' },
  ]).map((init: any) => ({
    icon: init.icon,
    labelFr: init.label_fr ?? init.labelFr ?? '',
    labelEn: init.label_en ?? init.labelEn ?? '',
  }));

  const expertiseRaw = aboutSection?.metadata ? (lang === 'fr' ? (meta.expertise_fr ?? meta.expertiseFr) : (meta.expertise_en ?? meta.expertiseEn)) : null;
  const expertise = expertiseRaw && expertiseRaw.length ? expertiseRaw : [
    t('Science des Asraar', 'Science of Asraar'),
    t('Azkaar & Litanies', 'Azkaar & Litanies'),
    t("Tazkiyah (Purification de l'âme)", 'Tazkiyah (Purification of the Soul)'),
    t('Ruqyah & Protection spirituelle', 'Ruqyah & Spiritual Protection'),
    t('Médecine prophétique', 'Prophetic Medicine'),
    t('Plantes de guérison traditionnelles', 'Traditional Healing Plants'),
    t('Guidance spirituelle', 'Spiritual Guidance'),
  ];

  const teamData = aboutSection?.metadata?.team || [];
  const team = (teamData.length ? teamData.map((member: any) => ({
    name: member.name,
    roleFr: member.role_fr ?? member.roleFr ?? '',
    roleEn: member.role_en ?? member.roleEn ?? '',
  })) : [
    { name: 'Sheikh Antar Ayatollah Fofana', roleFr: 'Fondateur USRATUL AZKAAR - Cheikh', roleEn: 'Founder USRATUL AZKAAR - Sheikh' },
  ]);

  return (
    <section id="about" className="relative py-24 bg-gradient-to-b from-black via-stone-950 to-black overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-amber-900/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-900/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 mb-4 text-xs tracking-[0.3em] text-amber-500 border border-amber-600/30 rounded-full">
            {subtitle}
          </span>
          <h2 className="text-3xl md:text-5xl font-light text-white mb-4">
            {title}
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="relative aspect-[3/4] max-w-md mx-auto">
              {/* Frame */}
              <div className="absolute inset-0 border-2 border-amber-600/30 rounded-3xl transform rotate-3" />
              <div className="absolute inset-0 border-2 border-amber-500/20 rounded-3xl transform -rotate-2" />
              
              {/* Image Container */}
              <div className="relative h-full rounded-3xl overflow-hidden bg-gradient-to-b from-amber-900/20 to-black">
                {/* Placeholder for image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-600/30 to-amber-900/30 flex items-center justify-center">
                      <svg className="w-16 h-16 text-amber-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-amber-600/60 text-sm">{t('Photo du Cheikh', "Sheikh's Photo")}</p>
                  </div>
                </div>

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              </div>

              {/* Name Card */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-8 py-4 bg-black/90 border border-amber-600/30 rounded-2xl backdrop-blur-sm">
                <h3 className="text-xl font-medium text-amber-400 text-center">{masterName}</h3>
                <p className="text-sm text-gray-400 text-center">{masterTitle}</p>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="space-y-6">
            <div className="prose prose-invert">
              <p className="text-lg text-gray-300 leading-relaxed">
                {description}
              </p>
              <p className="text-gray-400 leading-relaxed">
                {content}
              </p>
            </div>

            {/* Initiations */}
            <div className="pt-6">
              <h4 className="text-sm text-amber-500 tracking-wider mb-4">{t('TRANSMISSIONS REÇUES', 'RECEIVED TRANSMISSIONS')}</h4>
              <div className="flex flex-wrap gap-3">
                {initiations.map((init, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-gradient-to-r from-amber-900/30 to-red-900/20 border border-amber-700/30 rounded-full text-sm text-amber-300"
                  >
                    <span className="mr-2">{init.icon}</span>
                    {lang === 'fr' ? init.labelFr : init.labelEn}
                  </span>
                ))}
              </div>
            </div>

            {/* Expertise */}
            <div className="pt-4">
              <h4 className="text-sm text-amber-500 tracking-wider mb-4">{t('DOMAINES D\'EXPERTISE', 'AREAS OF EXPERTISE')}</h4>
              <div className="flex flex-wrap gap-2">
                {expertise.map((exp, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-black/50 border border-amber-900/30 rounded-lg text-xs text-gray-400"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            </div>

            {/* Quote */}
            <blockquote className="relative pt-6 mt-6 border-t border-amber-900/30">
              <svg className="absolute -top-3 left-0 w-8 h-8 text-amber-600/30" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-lg italic text-amber-100/80 pl-10">
                {quote}
              </p>
            </blockquote>
          </div>
        </div>

        {/* Team Section */}
        <div className="mt-24">
          <h3 className="text-2xl font-light text-white text-center mb-12">
            {t('Équipe du Cabinet', 'Our Team')}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {team.map((member, i) => (
              <div
                key={i}
                className="group relative p-6 bg-gradient-to-b from-amber-900/10 to-transparent border border-amber-900/30 rounded-2xl hover:border-amber-600/50 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600/30 to-amber-900/30 flex items-center justify-center border-2 border-amber-600/30 group-hover:border-amber-500/50 transition-colors">
                    <svg className="w-8 h-8 text-amber-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-amber-400">{member.name}</h4>
                    <p className="text-sm text-gray-400">{lang === 'fr' ? member.roleFr : member.roleEn}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
