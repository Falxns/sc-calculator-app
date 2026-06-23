import { DEFAULT_CRAFT_ID } from '../constants/crafts';
import type { CraftSession } from '../types/craft';

export const CRAFT_SESSION_STORAGE_KEY = 'craftSession';

export const createDefaultCraftSession = (): CraftSession => ({
  selectedCraftId: DEFAULT_CRAFT_ID,
  runs: 1,
  efficiencyPercent: 100,
  priceOverrides: {},
  costSourceByInput: {},
});

export const normalizeCraftSession = (raw: unknown): CraftSession => {
  const defaults = createDefaultCraftSession();
  if (!raw || typeof raw !== 'object') return defaults;

  const data = raw as Partial<CraftSession>;
  const efficiencyPercent =
    typeof data.efficiencyPercent === 'number' &&
    !Number.isNaN(data.efficiencyPercent) &&
    data.efficiencyPercent > 0
      ? data.efficiencyPercent
      : defaults.efficiencyPercent;

  const runs =
    typeof data.runs === 'number' && !Number.isNaN(data.runs) && data.runs >= 1
      ? Math.floor(data.runs)
      : defaults.runs;

  return {
    selectedCraftId:
      typeof data.selectedCraftId === 'string' && data.selectedCraftId.length
        ? data.selectedCraftId
        : defaults.selectedCraftId,
    runs,
    efficiencyPercent,
    priceOverrides:
      data.priceOverrides && typeof data.priceOverrides === 'object'
        ? (data.priceOverrides as Record<string, number>)
        : {},
    costSourceByInput:
      data.costSourceByInput && typeof data.costSourceByInput === 'object'
        ? (data.costSourceByInput as CraftSession['costSourceByInput'])
        : {},
  };
};
