import { findRecipeProducing } from '../constants/crafts';
import { getMaterialKind } from '../constants/craftMaterials';
import { DEFAULT_ENERGY_RESOURCE } from '../constants/energy';
import type { Material } from '../types';
import type {
  CraftCostBreakdownNode,
  CraftCostSource,
  CraftRecipe,
  CraftSession,
} from '../types/craft';
import { getBuyPrice } from './craftCatalog';

export const craftInputKey = (craftId: string, materialId: string) =>
  `${craftId}:input:${materialId}`;

export const craftOutputKey = (craftId: string, materialId: string) =>
  `${craftId}:output:${materialId}`;

export const craftEnergyKey = () => 'energy:battery';

export interface CraftCostContext {
  recipes: CraftRecipe[];
  materials: Material[];
  session: CraftSession;
  calculatorPrices: Map<string, number>;
  batteryPrice: number;
}

const findRecipe = (recipes: CraftRecipe[], materialId: string) =>
  recipes.find((r) => r.outputs.some((o) => o.materialId === materialId)) ??
  findRecipeProducing(materialId);

export const computeEnergyCost = (
  energyRequired: number,
  efficiencyPercent: number,
  batteryPrice: number,
  energyPerUnit: number = DEFAULT_ENERGY_RESOURCE.energyPerUnit
): { unitsNeeded: number; cost: number; effectiveEnergyPerBattery: number } => {
  const effectiveEnergyPerBattery = energyPerUnit * (efficiencyPercent / 100);
  if (effectiveEnergyPerBattery <= 0) {
    return { unitsNeeded: 0, cost: 0, effectiveEnergyPerBattery: 0 };
  }
  const unitsNeeded = energyRequired / effectiveEnergyPerBattery;
  return { unitsNeeded, cost: unitsNeeded * batteryPrice, effectiveEnergyPerBattery };
};

export const resolveCraftUnitCost = (
  materialId: string,
  ctx: CraftCostContext,
  stack: Set<string> = new Set()
): { unitCost: number | null; breakdown: CraftCostBreakdownNode | null } => {
  if (stack.has(materialId)) {
    return { unitCost: null, breakdown: null };
  }

  const recipe = findRecipe(ctx.recipes, materialId);
  if (!recipe) return { unitCost: null, breakdown: null };

  const output = recipe.outputs.find((o) => o.materialId === materialId);
  if (!output || output.qty <= 0) return { unitCost: null, breakdown: null };

  const nextStack = new Set(stack);
  nextStack.add(materialId);

  let batchCost = 0;
  const inputLines: CraftCostBreakdownNode['inputs'] = [];

  for (const input of recipe.inputs) {
    const { unitCost, source } = resolveInputUnitCostForCraftTree(
      input.materialId,
      ctx,
      nextStack
    );
    const lineCost = unitCost * input.qty;
    batchCost += lineCost;
    inputLines.push({
      materialId: input.materialId,
      qty: input.qty,
      unitCost,
      lineCost,
      source,
    });
  }

  const { cost: energyCost } = computeEnergyCost(
    recipe.energyRequired,
    ctx.session.efficiencyPercent,
    ctx.batteryPrice
  );
  batchCost += energyCost;

  const unitCost = batchCost / output.qty;

  return {
    unitCost,
    breakdown: {
      recipeId: recipe.id,
      materialId,
      outputQty: output.qty,
      batchCost,
      unitCost,
      inputs: inputLines,
      energyCost,
    },
  };
};

const resolveInputUnitCostForCraftTree = (
  materialId: string,
  ctx: CraftCostContext,
  stack: Set<string>
): { unitCost: number; source: CraftCostSource | 'craft-tree' } => {
  const kind = getMaterialKind(materialId);
  if (kind === 'basic') {
    return { unitCost: getBuyPrice(materialId, ctx.materials, ctx.calculatorPrices), source: 'buy' };
  }

  const { unitCost } = resolveCraftUnitCost(materialId, ctx, stack);
  return {
    unitCost: unitCost ?? getBuyPrice(materialId, ctx.materials, ctx.calculatorPrices),
    source: 'craft-tree',
  };
};

export const getDefaultCostSource = (
  materialId: string,
  ctx: CraftCostContext
): CraftCostSource => {
  const kind = getMaterialKind(materialId);
  if (kind === 'basic') return 'buy';
  const buy = getBuyPrice(materialId, ctx.materials, ctx.calculatorPrices);
  return buy > 0 ? 'buy' : 'craft';
};

export const getInputCostSource = (
  craftId: string,
  materialId: string,
  ctx: CraftCostContext
): CraftCostSource => {
  const key = craftInputKey(craftId, materialId);
  return ctx.session.costSourceByInput[key] ?? getDefaultCostSource(materialId, ctx);
};

export const resolveInputUnitCost = (
  craftId: string,
  materialId: string,
  ctx: CraftCostContext
): {
  unitCost: number;
  source: CraftCostSource;
  craftUnitCost: number | null;
  buyPrice: number;
  breakdown: CraftCostBreakdownNode | null;
} => {
  const buyPrice = getBuyPrice(materialId, ctx.materials, ctx.calculatorPrices);
  const { unitCost: craftUnitCost, breakdown } = resolveCraftUnitCost(materialId, ctx);
  const source = getInputCostSource(craftId, materialId, ctx);

  const manualKey = craftInputKey(craftId, materialId);
  if (source === 'manual') {
    const manual = ctx.session.priceOverrides[manualKey];
    return {
      unitCost: manual ?? buyPrice,
      source: 'manual',
      craftUnitCost,
      buyPrice,
      breakdown,
    };
  }

  if (source === 'craft' && craftUnitCost !== null) {
    return { unitCost: craftUnitCost, source: 'craft', craftUnitCost, buyPrice, breakdown };
  }

  return { unitCost: buyPrice, source: 'buy', craftUnitCost, buyPrice, breakdown };
};

export const resolveOutputPrice = (
  craftId: string,
  materialId: string,
  ctx: CraftCostContext
): number => {
  const overrideKey = craftOutputKey(craftId, materialId);
  const override = ctx.session.priceOverrides[overrideKey];
  if (override !== undefined) return override;
  return getBuyPrice(materialId, ctx.materials, ctx.calculatorPrices);
};

export const resolveBatteryPrice = (ctx: CraftCostContext): number => {
  const override = ctx.session.priceOverrides[craftEnergyKey()];
  if (override !== undefined) return override;
  return (
    ctx.batteryPrice ||
    getBuyPrice(DEFAULT_ENERGY_RESOURCE.id, ctx.materials, ctx.calculatorPrices) ||
    DEFAULT_ENERGY_RESOURCE.defaultPrice
  );
};
