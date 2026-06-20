import { useLocale } from '../../context/LocaleContext';
import type { Locale } from '../../i18n';

const locales: { id: Locale; label: string }[] = [
  { id: 'en', label: 'Eng' },
  { id: 'ru', label: 'Ru' },
];

const LanguageToggle = () => {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      className="flex flex-col gap-0.5 rounded-xl border border-white/20 bg-white/5 p-0.5 w-11"
      role="group"
      aria-label={t('side.language')}
    >
      {locales.map(({ id, label }) => {
        const active = locale === id;
        return (
          <button
            key={id}
            type="button"
            className={`rounded-lg py-1.5 text-xs font-medium w-full transition-colors ${
              active
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            aria-label={id === 'en' ? 'English' : 'Русский'}
            aria-pressed={active}
            onClick={() => setLocale(id)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageToggle;
