import en from './en';
import ru from './ru';
import type { Locale, TranslationKey } from './types';

export type { Locale, TranslationKey } from './types';

const dictionaries: Record<Locale, typeof en> = { en, ru };

export const interpolate = (
  template: string,
  vars: Record<string, string | number>
): string =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(vars[key] ?? ''));

export const translate = (
  locale: Locale,
  key: TranslationKey,
  vars?: Record<string, string | number>
): string => {
  const template = dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
  return vars ? interpolate(template, vars) : template;
};

export const isLocale = (value: unknown): value is Locale => value === 'en' || value === 'ru';
