import type { TemplateWarning } from '../utils/messageTemplate';
import type { TranslationKey } from '../i18n';

export const formatTemplateWarning = (
  warning: TemplateWarning,
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
): string => {
  if (warning.type === 'invalidPlaceholder') {
    return t('template.invalidPlaceholder', { match: warning.match });
  }
  return t('template.rowNotFound', { rowIndex: warning.rowIndex });
};
