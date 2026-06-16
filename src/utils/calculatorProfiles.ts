import { createDefaultCalculators } from '../constants/materials';
import type { Calculator, CalculatorProfile, CalculatorProfilesState, Material } from '../types';
import { migrateCalculators, normalizeCalculatorState } from './calculatorMigration';

export const PROFILES_STORAGE_KEY = 'calculatorProfilesState';
export const LEGACY_CALCULATOR_STORAGE_KEY = 'calculatorState';

export const createDefaultProfile = (
  materials: Material[],
  name = 'Default'
): CalculatorProfile => ({
  id: crypto.randomUUID(),
  name,
  calculators: createDefaultCalculators(materials),
});

export const createDefaultProfilesState = (materials: Material[]): CalculatorProfilesState => {
  const profile = createDefaultProfile(materials);
  return { activeProfileId: profile.id, profiles: [profile] };
};

const isCalculatorProfile = (value: unknown): value is CalculatorProfile => {
  if (!value || typeof value !== 'object') return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    p.name.trim().length > 0 &&
    Array.isArray(p.calculators)
  );
};

export const normalizeProfilesState = (
  raw: unknown,
  materials: Material[]
): CalculatorProfilesState => {
  const data = raw as Partial<CalculatorProfilesState> | null;

  if (data?.profiles?.length && typeof data.activeProfileId === 'string') {
    const profiles = data.profiles.filter(isCalculatorProfile).map((profile) => ({
      id: profile.id,
      name: profile.name.trim(),
      calculators: migrateCalculators(profile.calculators, materials),
    }));

    if (profiles.length) {
      const activeProfileId = profiles.some((p) => p.id === data.activeProfileId)
        ? data.activeProfileId
        : profiles[0].id;
      return { activeProfileId, profiles };
    }
  }

  if (data && Array.isArray((data as { calculators?: unknown }).calculators)) {
    const { calculators } = normalizeCalculatorState(
      (data as { calculators: unknown }).calculators,
      materials
    );
    const profile = createDefaultProfile(materials);
    return {
      activeProfileId: profile.id,
      profiles: [{ ...profile, calculators }],
    };
  }

  return createDefaultProfilesState(materials);
};

export const createUniqueProfileName = (baseName: string, existingNames: string[]) => {
  const trimmed = baseName.trim() || 'Profile';
  if (!existingNames.includes(trimmed)) return trimmed;
  let i = 2;
  while (existingNames.includes(`${trimmed} ${i}`)) i++;
  return `${trimmed} ${i}`;
};

export const remapCalculatorsForMaterials = (
  calculators: Calculator[],
  newMaterials: Material[]
): Calculator[] => {
  const ids = new Set(newMaterials.map((m) => m.id));
  const fallback = newMaterials[0];
  if (!fallback) return calculators;

  return calculators.map((calc) =>
    ids.has(calc.materialId)
      ? calc
      : { ...calc, materialId: fallback.id, price: fallback.defaultPrice }
  );
};

export const remapProfilesForMaterials = (
  state: CalculatorProfilesState,
  newMaterials: Material[]
): CalculatorProfilesState => ({
  ...state,
  profiles: state.profiles.map((profile) => ({
    ...profile,
    calculators: remapCalculatorsForMaterials(profile.calculators, newMaterials),
  })),
});

export const loadProfilesStateFromStorage = (materials: Material[]): CalculatorProfilesState => {
  try {
    const profilesItem = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (profilesItem) {
      return normalizeProfilesState(JSON.parse(profilesItem), materials);
    }

    const legacyItem = localStorage.getItem(LEGACY_CALCULATOR_STORAGE_KEY);
    if (legacyItem) {
      return normalizeProfilesState(JSON.parse(legacyItem), materials);
    }
  } catch (err: unknown) {
    console.warn('Error loading calculator profiles from localStorage:', err);
  }

  return createDefaultProfilesState(materials);
};
