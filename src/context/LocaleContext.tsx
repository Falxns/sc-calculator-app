import { createContext, useContext, useEffect, type ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { isLocale, translate, type Locale, type TranslationKey } from '../i18n';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useLocalStorage<Locale>('appLocale', 'en', (parsed) =>
    isLocale(parsed) ? parsed : 'en'
  );

  const t = (key: TranslationKey, vars?: Record<string, string | number>) =>
    translate(locale, key, vars);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = translate(locale, 'app.documentTitle');
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
};
