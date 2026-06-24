import { getCraftRecipe } from '../constants/crafts';
import type { CraftProfitResult, CraftRecipe } from '../types/craft';
import {
  computeEnergyCost,
  type CraftCostContext,
  resolveBatteryPrice,
  resolveInputUnitCost,
  resolveOutputPrice,
} from './craftCost';

export const computeCraftProfit = (
  recipe: CraftRecipe,
  ctx: CraftCostContext
): CraftProfitResult => {
  const runs = Math.max(1, ctx.session.runs || 1);
  const batteryPrice = resolveBatteryPrice(ctx);

  let totalInputCost = 0;
  for (const input of recipe.inputs) {
    const { unitCost } = resolveInputUnitCost(recipe.id, input.materialId, ctx);
    totalInputCost += input.qty * unitCost * runs;
  }

  const { cost: energyPerBatch } = computeEnergyCost(
    recipe.energyRequired,
    ctx.session.efficiencyPercent,
    batteryPrice
  );
  const totalEnergyCost = energyPerBatch * runs;

  let totalOutputValue = 0;
  for (const output of recipe.outputs) {
    const price = resolveOutputPrice(recipe.id, output.materialId, ctx);
    totalOutputValue += output.qty * price * runs;
  }

  const profit = totalOutputValue - totalInputCost - totalEnergyCost;
  const margin = totalOutputValue > 0 ? profit / totalOutputValue : null;
  const sellInputsInstead = totalInputCost + totalEnergyCost;

  return {
    totalInputCost,
    totalEnergyCost,
    totalOutputValue,
    profit,
    margin,
    sellInputsInstead,
  };
};

export const computeCraftProfitById = (craftId: string, ctx: CraftCostContext): CraftProfitResult | null => {
  const recipe = getCraftRecipe(craftId);
  if (!recipe) return null;
  return computeCraftProfit(recipe, ctx);
};

export const formatCraftMoney = (value: number): string =>
  Number.isFinite(value) ? Math.round(value).toLocaleString() : '—';

export const formatCraftPercent = (value: number | null): string =>
  value === null ? '—' : `${(value * 100).toFixed(1)}%`;
