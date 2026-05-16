import { createContext, useContext, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'zh';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (en: string, zh: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (en) => en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const t = (en: string, zh: string) => (lang === 'zh' ? zh : en);
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
