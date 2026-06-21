import type { Material } from '../types';

export { createUniqueMaterialId, slugify } from '../utils/slugify';

export const DEFAULT_MATERIALS: Material[] = [
  { id: 'slastena', label: 'Мякоть сластены', defaultPrice: 8000, imgSrc: 'slastena' },
  { id: 'solevik', label: 'Мякоть солевика', defaultPrice: 1500, imgSrc: 'solevik' },
  { id: 'limonnik', label: 'Мякоть лимонника', defaultPrice: 1000, imgSrc: 'limonnik' },
  { id: 'kub', label: 'Мякоть куборбуза', defaultPrice: 580, imgSrc: 'kub' },
  { id: 'spirten', label: 'Мякоть спиртня', defaultPrice: 280, imgSrc: 'spirten' },
  { id: 'myatnoplod', label: 'Мякоть мятноплода', defaultPrice: 75, imgSrc: 'myatnoplod' },
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
