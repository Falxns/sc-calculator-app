import type { CraftRecipe } from '../types/craft';

export const CRAFT_RECIPES: CraftRecipe[] = [
  {
    id: 'craft-polimery',
    nameKey: 'craft.polimery',
    popular: true,
    energyRequired: 100,
    inputs: [{ materialId: 'kopoto-silnogo-kabana', qty: 5 }],
    outputs: [{ materialId: 'polimery', qty: 19 }],
  },
  {
    id: 'craft-plastikovaya-butylka',
    nameKey: 'craft.plastikovayaButylka',
    popular: true,
    energyRequired: 100,
    inputs: [{ materialId: 'polimery', qty: 1 }],
    outputs: [{ materialId: 'plastikovaya-butylka', qty: 4 }],
  },
  {
    id: 'craft-butylka-chistoy-vody',
    nameKey: 'craft.butylkaChistoyVody',
    popular: true,
    energyRequired: 200,
    inputs: [{ materialId: 'plastikovaya-butylka', qty: 1 }],
    outputs: [{ materialId: 'butylka-chistoy-vody', qty: 1 }],
  },
];

export const DEFAULT_CRAFT_ID = CRAFT_RECIPES[0]?.id ?? 'craft-polimery';

export const getCraftRecipe = (id: string) => CRAFT_RECIPES.find((r) => r.id === id);

export const getPopularCrafts = () => CRAFT_RECIPES.filter((r) => r.popular);

export const findRecipeProducing = (materialId: string): CraftRecipe | undefined =>
  CRAFT_RECIPES.find((r) => r.outputs.some((o) => o.materialId === materialId));
