const CYRILLIC_TRANSLIT: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'yo',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
  ї: 'i',
  і: 'i',
  є: 'ye',
  ґ: 'g',
};

export const transliterate = (value: string): string => {
  let result = '';

  for (const char of value.toLowerCase()) {
    result += CYRILLIC_TRANSLIT[char] ?? char;
  }

  return result;
};

export const slugify = (label: string): string =>
  transliterate(label)
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '') || 'material';

export const createUniqueMaterialId = (label: string, existingIds: string[]): string => {
  const base = slugify(label);
  if (!existingIds.includes(base)) return base;

  let suffix = 2;
  while (existingIds.includes(`${base}-${suffix}`)) {
    suffix += 1;
  }

  return `${base}-${suffix}`;
};

export const hasCyrillic = (value: string): boolean => /[а-яёіїєґ]/i.test(value);
