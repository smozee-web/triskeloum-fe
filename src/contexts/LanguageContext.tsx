import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Language } from '../utils/typeDef';

/** Languages that read right-to-left. Drives dir="rtl" on <html>. */
const RTL_LANGUAGES: Language[] = ['ar'];

const STORAGE_KEY = 'usratul.lang';

export const isRtl = (lang: Language) => RTL_LANGUAGES.includes(lang);

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  /**
   * Arabic is optional so that the ~90 pre-existing two-argument calls keep
   * compiling and working unchanged. Where `ar` is omitted, Arabic readers see
   * English rather than a blank string — the same fallback the DB content
   * helper uses, so untranslated UI degrades consistently instead of
   * disappearing.
   */
  t: (fr: string, en: string, ar?: string) => string;
  /** True while a right-to-left language is active. */
  rtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    // Restore the previous choice. Reading localStorage in the initialiser
    // rather than in an effect avoids a first paint in the wrong language and,
    // for Arabic, a visible left-to-right flash before the dir flips.
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'fr' || saved === 'en' || saved === 'ar') return saved;
    } catch {
      // Private browsing / disabled storage — fall through to the default.
    }
    return 'en';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Non-fatal: the language still applies for this session.
    }

    // Set on <html> rather than a wrapper div so that scrollbar placement,
    // text selection and native form controls flip too — a dir on an inner
    // element leaves those following the document direction.
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl(lang) ? 'rtl' : 'ltr';
  }, [lang]);

  const t = (fr: string, en: string, ar?: string) => {
    if (lang === 'ar') return ar ?? en;
    if (lang === 'fr') return fr;
    return en;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, rtl: isRtl(lang) }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
