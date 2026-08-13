import { useLanguage } from "../contexts/LanguageContext";
import { useGetLandingPageContentQuery } from "../services/api";
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Github } from "lucide-react";

const Footer = () => {
    const { lang, t } = useLanguage();
    const { data: contentData } = useGetLandingPageContentQuery();

    const socialSection = contentData?.payload?.find((s: any) => s.section === 'social');
    const socials = socialSection?.metadata || {};
    const socialLinks = [
        { key: 'facebook', icon: Facebook, url: socials.facebook },
        { key: 'instagram', icon: Instagram, url: socials.instagram },
        { key: 'twitter', icon: Twitter, url: socials.twitter },
        { key: 'linkedin', icon: Linkedin, url: socials.linkedin },
        { key: 'youtube', icon: Youtube, url: socials.youtube },
        { key: 'github', icon: Github, url: socials.github },
    ].filter(s => !!s.url);

    const links = {
        services: [
            { fr: 'Consultation', en: 'Consultation', ar: 'استشارة', href: '#services' },
            { fr: 'Diagnostic Spirituel', en: 'Spiritual Diagnosis', ar: 'التشخيص الروحي', href: '#services' },
            { fr: 'Ruqyah & Purification', en: 'Ruqyah & Purification', ar: 'الرقية والتطهير', href: '#services' },
            { fr: 'Livre de Guidance', en: 'Book of Guidance', ar: 'كتاب الإرشاد', href: '#services' },
        ],
        formations: [
            { fr: 'Formation Classique', en: 'Classic Training', ar: 'الدورة الأساسية', href: '#formations' },
            { fr: 'Formation Premium', en: 'Premium Training', ar: 'الدورة المتقدمة', href: '#formations' },
            { fr: 'Guérison Naturelle', en: 'Natural Healing', ar: 'الشفاء الطبيعي', href: '#natural-healing' },
        ],
        about: [
            { fr: 'Le Cheikh', en: 'The Sheikh', ar: 'الشيخ', href: '#about' },
            { fr: 'Transmissions', en: 'Transmissions', ar: 'الإجازات', href: '#about' },
            { fr: 'Nous contacter', en: 'Contact Us', ar: 'اتصل بنا', href: '#contact' },
        ],
    };

    return (
        <footer className="relative bg-black border-t border-amber-900/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            {/* Usratul Azkaar Logo */}
                            <img
                                src="/images/rmvLogoUsratulAzkaar.png"
                                alt="USRATUL AZKAAR Logo"
                                className="w-10 h-10 object-contain"
                            />
                            <span className="force-ltr text-xl font-light tracking-[0.2em] text-amber-400">USRATUL AZKAAR</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm">
                            {t(
                                "Pratique spirituelle islamique digitale. Guérir les cœurs à travers les sciences des Asraar et des Azkaar, et guider chaque chercheur sur le chemin de la connaissance de soi et du rapprochement d'Allah.",
                                "Digital Islamic spiritual practice. Healing hearts through the sciences of Asraar and Azkaar, and guiding each seeker on the path of self-knowledge and nearness to Allah.", 'ممارسة روحانية إسلامية رقمية. شفاء القلوب من خلال علوم الأسرار والأذكار، وإرشاد كل سالك في طريق معرفة النفس والقرب من الله.')}
                        </p>
                        {socialLinks.length > 0 && (
                            <div className="flex gap-4">
                                {socialLinks.map(({ key, icon: Icon, url }) => (
                                    <a
                                        key={key}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-full bg-amber-900/20 border border-amber-700/30 flex items-center justify-center text-amber-500 hover:bg-amber-800/30 hover:border-amber-600/50 transition-colors"
                                    >
                                        <Icon className="w-5 h-5" />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-amber-400 font-medium mb-4">{t('Services', 'Services', 'الخدمات')}</h4>
                        <ul className="space-y-2">
                            {links.services.map((link, i) => (
                                <li key={i}>
                                    <a href={link.href} className="text-gray-500 hover:text-amber-400 text-sm transition-colors">
                                        {t(link.fr, link.en, link.ar)}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Formations */}
                    <div>
                        <h4 className="text-amber-400 font-medium mb-4">{t('Formations', 'Training', 'الدورات')}</h4>
                        <ul className="space-y-2">
                            {links.formations.map((link, i) => (
                                <li key={i}>
                                    <a href={link.href} className="text-gray-500 hover:text-amber-400 text-sm transition-colors">
                                        {t(link.fr, link.en, link.ar)}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* About */}
                    <div>
                        <h4 className="text-amber-400 font-medium mb-4">{t('À propos', 'About', 'من نحن')}</h4>
                        <ul className="space-y-2">
                            {links.about.map((link, i) => (
                                <li key={i}>
                                    <a href={link.href} className="text-gray-500 hover:text-amber-400 text-sm transition-colors">
                                        {t(link.fr, link.en, link.ar)}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 border-t border-amber-900/20 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-600 text-sm">
                        © {new Date().getFullYear()} Usratul Azkaar. {t('Tous droits réservés.', 'All rights reserved.', 'جميع الحقوق محفوظة.')}
                    </p>
                    <p className="text-gray-600 text-sm italic">
                        "{t("C'est par le rappel d'Allah que les cœurs se tranquillisent", "Verily, in the remembrance of Allah do hearts find rest", 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ')}" — {t('Coran 13:28', "Qur'an 13:28", 'القرآن ١٣:٢٨')}
                    </p>
                </div>
            </div>

            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-24 h-24 border-l border-t border-amber-900/20" />
            <div className="absolute top-0 right-0 w-24 h-24 border-r border-t border-amber-900/20" />
        </footer>
    );
};

export default Footer;
