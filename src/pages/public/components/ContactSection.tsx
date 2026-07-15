import { useLanguage } from '../../../contexts/LanguageContext';
import { useGetLandingPageContentQuery } from '../../../services/api';

const ContactSection = () => {
  const { lang, t } = useLanguage();
  const { data: contentData } = useGetLandingPageContentQuery();

  // Get contact section content from API or use hardcoded fallback
  const contactSection = contentData?.payload?.find((section: any) => section.section === 'contact');
  const title = contactSection ? (lang === 'fr' ? contactSection.titleFr : contactSection.titleEn) : t('Commencez votre voyage', 'Begin Your Journey');
  const subtitle = contactSection ? (lang === 'fr' ? contactSection.subtitleFr : contactSection.subtitleEn) : t('CONTACT', 'CONTACT');
  const description = contactSection ? (lang === 'fr' ? contactSection.descriptionFr : contactSection.descriptionEn) : t("Prêt à entreprendre votre transformation intérieure ? Contactez-nous directement sur WhatsApp pour une première consultation.", "Ready to begin your inner transformation? Contact us directly on WhatsApp for an initial consultation.");
  const whatsapp = contactSection?.metadata?.whatsapp || '22890000000';
  const email = contactSection?.metadata?.email || 'contact@usratulazkaar.com';
  const meta = contactSection?.metadata || {};
  const location = contactSection
    ? (lang === 'fr' ? (meta.locationFr ?? meta.location_fr ?? '') : (meta.locationEn ?? meta.location_en ?? ''))
    : t('Cabinet Digital - Monde entier', 'Digital Practice - Worldwide');

  return (
    <section id="contact" className="relative py-24 bg-gradient-to-b from-black to-stone-950 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-amber-500 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-amber-500 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border border-amber-500 rounded-full" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Header */}
        <span className="inline-block px-4 py-1 mb-4 text-xs tracking-[0.3em] text-amber-500 border border-amber-600/30 rounded-full">
          {subtitle}
        </span>
        <h2 className="text-3xl md:text-5xl font-light text-white mb-6">
          {title}
        </h2>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          {description}
        </p>

        {/* WhatsApp CTA */}
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-full transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/30 hover:scale-105"
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <div className="text-center">
            <span className="block text-white font-semibold text-lg">{t('Écrivez-nous sur WhatsApp', 'Message us on WhatsApp')}</span>
            <span className="text-green-200/80 text-sm">{t('Réponse sous 24h', 'Response within 24h')}</span>
          </div>
         
        </a>

        {/* Alternative contact */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{email}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{location}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
