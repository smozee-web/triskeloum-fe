import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { lang, setLang, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sectionIds = ['home', 'services', 'formations', 'about', 'contact'];
    const observers = sectionIds.map(id => {
      const element = document.getElementById(id);
      if (!element) return null;
      
      return new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { threshold: 0.3 }
      );
    }).filter(Boolean);

    sectionIds.forEach((id, idx) => {
      const element = document.getElementById(id);
      if (element && observers[idx]) {
        observers[idx].observe(element);
      }
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, []);

  const navItems = [
    { fr: 'Accueil', en: 'Home', href: '#home' },
    { fr: 'Services', en: 'Services', href: '#services' },
    { fr: 'Formations', en: 'Training', href: '#formations' },
    { fr: 'À propos', en: 'About', href: '#about' },
    { fr: 'Contact', en: 'Contact', href: '#contact' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-black/95 backdrop-blur-md shadow-lg shadow-amber-900/20' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12">
              {/* Usratul Azkaar Logo */}
              <img
                src="/images/rmvLogoUsratulAzkaar.png"
                alt="USRATUL AZKAAR Logo"
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-light tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600">
                USRATUL AZKAAR
              </span>
              <p className="text-[10px] text-amber-500/60 tracking-widest">
                {t('Pratique spirituelle islamique', 'Islamic Spiritual Practice')}
              </p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item, i) => {
              const sectionId = item.href.slice(1);
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={i}
                  href={item.href}
                  className={`relative text-sm transition-colors duration-300 group ${
                    isActive 
                      ? 'text-amber-400' 
                      : 'text-amber-100/80 hover:text-amber-400'
                  }`}
                >
                  {t(item.fr, item.en)}
                  <span className={`absolute -bottom-1 left-0 h-px bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300 ${
                    isActive 
                      ? 'w-full' 
                      : 'w-0 group-hover:w-full'
                  }`} />
                </a>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              className="relative w-16 h-8 rounded-full bg-black/50 border border-amber-600/30 overflow-hidden group"
            >
              <div 
                className={`absolute top-1 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 transition-all duration-300 flex items-center justify-center text-xs font-bold text-black ${
                  lang === 'fr' ? 'left-1' : 'left-8'
                }`}
              >
                {lang.toUpperCase()}
              </div>
            </button>

            {/* CTA Button */}
            <a
              href="https://wa.me/22890000000"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-black font-medium text-sm rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-amber-600/30 hover:scale-105"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {t('Prendre RDV', 'Book Now')}
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
            >
              <span className={`w-6 h-0.5 bg-amber-400 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`w-6 h-0.5 bg-amber-400 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`w-6 h-0.5 bg-amber-400 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden absolute top-full left-0 right-0 bg-black/98 backdrop-blur-lg border-t border-amber-900/30 transition-all duration-500 overflow-hidden ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <nav className="flex flex-col p-6 gap-4">
          {navItems.map((item, i) => (
            <a
              key={i}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="text-lg text-amber-100/80 hover:text-amber-400 transition-colors py-2 border-b border-amber-900/20"
            >
              {t(item.fr, item.en)}
            </a>
          ))}
          <a
            href="https://wa.me/22890000000"
            className="mt-4 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-600 to-amber-800 text-black font-medium rounded-full"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {t('Prendre RDV', 'Book Now')}
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;