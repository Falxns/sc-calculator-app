import { createDefaultCalculators } from '../constants/materials';
import type { Calculator, CalculatorState, Material } from '../types';

/** Migrate legacy calculator rows that used `imgSrc` instead of `materialId`. */
export const migrateCalculators = (raw: unknown, materials: Material[]): Calculator[] => {
  if (!Array.isArray(raw)) return createDefaultCalculators(materials);

  const materialIds = materials.map((m) => m.id);
  const fallbackId = materialIds[0] ?? '';

  return raw.map((item) => {
    const row = item as Record<string, unknown>;
    const legacyId = String(row.materialId ?? row.imgSrc ?? '');
    const materialId = materialIds.includes(legacyId) ? legacyId : fallbackId;
    const material = materials.find((m) => m.id === materialId);

    return {
      id: String(row.id ?? crypto.randomUUID()),
      materialId,
      price: Number(row.price) || material?.defaultPrice || 0,
      quantity: Number(row.quantity) || 0,
    };
  });
};

export const normalizeCalculatorState = (
  calculators: unknown,
  materials: Material[]
): CalculatorState => ({
  calculators: migrateCalculators(calculators, materials),
});
