import { CRAFT_CHAIN_MATERIALS } from '../constants/craftMaterials';
import type { Material } from '../types';
import { getMaterialKind } from '../constants/craftMaterials';

export { getMaterialKind };

export const mergeCraftMaterials = (materials: Material[]): Material[] => {
  const byId = new Map(materials.map((m) => [m.id, m]));
  for (const craftMat of CRAFT_CHAIN_MATERIALS) {
    if (!byId.has(craftMat.id)) {
      byId.set(craftMat.id, {
        id: craftMat.id,
        label: craftMat.label,
        defaultPrice: craftMat.defaultPrice,
      });
    }
  }
  return Array.from(byId.values());
};

export const buildCalculatorPriceMap = (
  calculators: { materialId: string; price: number }[]
): Map<string, number> => {
  const map = new Map<string, number>();
  for (const row of calculators) {
    if (row.price > 0) map.set(row.materialId, row.price);
  }
  return map;
};

export const getBuyPrice = (
  materialId: string,
  materials: Material[],
  calculatorPrices: Map<string, number>
): number => {
  const fromCalc = calculatorPrices.get(materialId);
  if (fromCalc !== undefined && fromCalc > 0) return fromCalc;
  const material = materials.find((m) => m.id === materialId);
  return material?.defaultPrice ?? 0;
};
