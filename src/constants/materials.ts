import type { Material } from '../types';

export const DEFAULT_MATERIALS: Material[] = [
  { id: 'slastena', label: 'Сластена', defaultPrice: 9000, imgSrc: 'slastena' },
  { id: 'solevik', label: 'Солевик', defaultPrice: 2000, imgSrc: 'solevik' },
  { id: 'kub', label: 'Куборбуз', defaultPrice: 2000, imgSrc: 'kub' },
  { id: 'limonnik', label: 'Лимонник', defaultPrice: 2000, imgSrc: 'limonnik' },
  { id: 'spirten', label: 'Спиртень', defaultPrice: 400, imgSrc: 'spirten' },
  { id: 'myatnoplod', label: 'Мятноплод', defaultPrice: 150, imgSrc: 'myatnoplod' },
];

export const createCalculator = (materials: Material[], materialId?: string) => {
  const material = materials.find((m) => m.id === materialId) ?? materials[0];
  if (!material) {
    return { id: crypto.randomUUID(), materialId: '', price: 0, quantity: 0 };
  }
  return {
    id: crypto.randomUUID(),
    materialId: material.id,
    price: material.defaultPrice,
    quantity: 0,
  };
};

export const createDefaultCalculators = (materials: Material[]) =>
  materials.map((material) => createCalculator(materials, material.id));

export const slugify = (label: string) =>
  label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'material';

export const createUniqueMaterialId = (label: string, existingIds: string[]) => {
  const base = slugify(label);
  if (!existingIds.includes(base)) return base;
  let i = 2;
  while (existingIds.includes(`${base}-${i}`)) i++;
  return `${base}-${i}`;
};
