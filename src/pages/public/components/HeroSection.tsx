import { useEffect, useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useGetLandingPageContentQuery } from '../../../services/api';

const HeroSection = () => {
    const { lang, t } = useLanguage();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const { data: contentData } = useGetLandingPageContentQuery();

    useEffect(() => {
        const handleMouseMove = (e: any) => {
            setMousePos({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20,
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Get home section content from API or use hardcoded fallback
    const homeSection = contentData?.payload?.find((section: any) => section.section === 'home');
    const title = homeSection ? (lang === 'fr' ? homeSection.titleFr : homeSection.titleEn) : 'USRATUL AZKAAR';
    const subtitle = homeSection ? (lang === 'fr' ? homeSection.subtitleFr : homeSection.subtitleEn) : t('Cabinet digital de développement spirituel', 'Digital Spiritual Development Practice');
    const description = homeSection ? (lang === 'fr' ? homeSection.descriptionFr : homeSection.descriptionEn) : t("Guérir les maux de l'âme et accompagner chacun dans un voyage profond de connaissance de soi.", "Healing the wounds of the soul and guiding each person on a deep journey of self-discovery.");
    const ctaText = homeSection ? (lang === 'fr' ? homeSection.ctaTextFr : homeSection.ctaTextEn) : t('Commencer le voyage', 'Begin the journey');
    const ctaSecondaryText = homeSection?.metadata?.cta_secondary_text_fr || homeSection?.metadata?.cta_secondary_text_en ? (lang === 'fr' ? homeSection.metadata.cta_secondary_text_fr : homeSection.metadata.cta_secondary_text_en) : t('Découvrir nos services', 'Discover our services');
    const ctaSecondaryLink = homeSection?.metadata?.cta_secondary_link || '#services';
    const contactSection = contentData?.payload?.find((section: any) => section.section === 'contact');
    const whatsapp = contactSection?.metadata?.whatsapp || '22890000000';

    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div
                    className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-900/20 blur-3xl animate-pulse"
                    style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
                />
                <div
                    className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-red-900/10 blur-3xl animate-pulse"
                    style={{ animationDelay: '1s', transform: `translate(${-mousePos.x}px, ${-mousePos.y}px)` }}
                />

                {/* Floating Particles */}
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-amber-400/40 rounded-full"
                        style={{
                            left: `${10 + (i * 6)}%`,
                            top: `${15 + (i * 5)}%`,
                            animation: `float ${5 + i % 3}s ease-in-out infinite`,
                            animationDelay: `${i * 0.3}s`,
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
                {/* Animated Logo */}
                <div className="mb-8 flex justify-center">
                    <div className="relative w-40 h-40 md:w-48 md:h-48">
                        <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 200 200">
                            <defs>
                                <linearGradient id="heroGold" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#D4AF37" />
                                    <stop offset="50%" stopColor="#FFD700" />
                                    <stop offset="100%" stopColor="#B8860B" />
                                </linearGradient>
                            </defs>
                            <circle cx="100" cy="100" r="95" fill="none" stroke="url(#heroGold)" strokeWidth="1" strokeDasharray="10 5" />
                        </svg>

                        <svg className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)]" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="url(#heroGold)" strokeWidth="2" />
                            <g>
                                {[0, 90, 180, 270].map((rotation, i) => (
                                    <path
                                        key={i}
                                        d="M50 50 Q50 35 40 28 Q28 20 25 32 Q22 45 38 50"
                                        fill="none"
                                        stroke="url(#heroGold)"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        transform={`rotate(${rotation} 50 50)`}
                                        className="animate-pulse"
                                        style={{ animationDelay: `${i * 0.25}s` }}
                                    />
                                ))}
                            </g>
                            <path d="M50 42 L58 50 L50 58 L42 50 Z" fill="url(#heroGold)" className="animate-pulse" />
                        </svg>

                        <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-2xl animate-pulse" />
                    </div>
                </div>

                {/* Title - USRATUL AZKAAR */}
                <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-light tracking-[0.3em] md:tracking-[0.4em] text-center">
                    <span className="title-text">{title}</span>
                </h1>

                <p className="text-amber-500/80 text-sm md:text-base tracking-[0.25em] uppercase mb-8">
                    {subtitle}
                </p>

                <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300/90 font-light leading-relaxed mb-12">
                    {description}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a
                        href={`https://wa.me/${whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-700 rounded-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/30 hover:scale-105"
                    >
                        <span className="relative z-10 flex items-center gap-3 text-black font-semibold">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            {ctaText}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </a>

                    <a
                        href={ctaSecondaryLink}
                        className="group px-8 py-4 border border-amber-600/50 rounded-full text-amber-400 hover:bg-amber-900/20 transition-all duration-300 hover:border-amber-500"
                    >
                        <span className="flex items-center gap-2">
                            {ctaSecondaryText}
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </span>
                    </a>
                </div>
            </div>

            {/* Scroll Indicator */}
            <a
                href="#services"
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-amber-500/60 hover:text-amber-400 transition-colors cursor-pointer group"
            >
                <span className="text-xs tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                    {t('Défiler', 'Scroll')}
                </span>
                <div className="relative w-6 h-10 border-2 border-amber-500/40 rounded-full group-hover:border-amber-500/60 transition-colors">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full animate-scroll-dot" />
                </div>
                <svg
                    className="w-4 h-4 animate-bounce-slow"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </a>

            {/* Decorative corners */}
            <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-amber-600/30" />
            <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-amber-600/30" />
            <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-amber-600/30" />
            <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-amber-600/30" />

            <style>{`
                @keyframes spin-slow { 
                    from { transform: rotate(0deg); } 
                    to { transform: rotate(360deg); } 
                }
                @keyframes float { 
                    0%, 100% { transform: translateY(0); opacity: 0.4; } 
                    50% { transform: translateY(-20px); opacity: 0.8; } 
                }
                @keyframes scroll-dot {
                    0% { 
                        transform: translateX(-50%) translateY(0); 
                        opacity: 1; 
                    }
                    100% { 
                        transform: translateX(-50%) translateY(16px); 
                        opacity: 0; 
                    }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(4px); }
                }
                .animate-spin-slow { animation: spin-slow 30s linear infinite; }
                .animate-scroll-dot { animation: scroll-dot 1.5s ease-in-out infinite; }
                .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
                
                .title-text {
                    background: linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #B8860B 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
            `}</style>
        </section>
    );
};

export default HeroSection;