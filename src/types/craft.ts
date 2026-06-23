import type { TranslationKey } from '../i18n/types';

export type MaterialKind = 'basic' | 'craftable';

export type CraftCostSource = 'buy' | 'craft' | 'manual';

export interface CraftMaterialMeta {
  id: string;
  kind: MaterialKind;
}

export interface EnergyResource {
  id: string;
  label: string;
  energyPerUnit: number;
  defaultPrice: number;
}

export interface CraftRecipeLine {
  materialId: string;
  qty: number;
}

export interface CraftRecipe {
  id: string;
  nameKey: TranslationKey;
  popular?: boolean;
  inputs: CraftRecipeLine[];
  energyRequired: number;
  outputs: CraftRecipeLine[];
}

export interface CraftSession {
  selectedCraftId: string;
  runs: number;
  efficiencyPercent: number;
  priceOverrides: Record<string, number>;
  costSourceByInput: Record<string, CraftCostSource>;
}

export interface CraftCostBreakdownNode {
  recipeId: string;
  materialId: string;
  outputQty: number;
  batchCost: number;
  unitCost: number;
  inputs: CraftCostBreakdownLine[];
  energyCost: number;
}

export interface CraftCostBreakdownLine {
  materialId: string;
  qty: number;
  unitCost: number;
  lineCost: number;
  source: CraftCostSource | 'craft-tree';
}

export interface CraftProfitResult {
  totalInputCost: number;
  totalEnergyCost: number;
  totalOutputValue: number;
  profit: number;
  margin: number | null;
  sellInputsInstead: number;
}
