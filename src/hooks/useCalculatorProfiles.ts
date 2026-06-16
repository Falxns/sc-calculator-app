import { useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { createDefaultCalculators, DEFAULT_MATERIALS } from '../constants/materials';
import type { CalculatorProfilesState, CalculatorState, Material } from '../types';
import {
  createDefaultProfile,
  createUniqueProfileName,
  loadProfilesStateFromStorage,
  normalizeProfilesState,
  PROFILES_STORAGE_KEY,
  remapProfilesForMaterials,
} from '../utils/calculatorProfiles';

const useCalculatorProfiles = (materials: Material[]) => {
  const resolvedMaterials = materials.length ? materials : DEFAULT_MATERIALS;

  const [profilesState, setProfilesState] = useLocalStorage<CalculatorProfilesState>(
    PROFILES_STORAGE_KEY,
    loadProfilesStateFromStorage(resolvedMaterials),
    (parsed) => normalizeProfilesState(parsed, resolvedMaterials)
  );

  const activeProfile =
    profilesState.profiles.find((p) => p.id === profilesState.activeProfileId) ??
    profilesState.profiles[0];

  const calculatorState: CalculatorState = {
    calculators: activeProfile?.calculators ?? createDefaultCalculators(resolvedMaterials),
  };

  const setCalculatorState = useCallback(
    (action: React.SetStateAction<CalculatorState>) => {
      setProfilesState((prev) => {
        const activeId = prev.activeProfileId;
        return {
          ...prev,
          profiles: prev.profiles.map((profile) => {
            if (profile.id !== activeId) return profile;
            const current: CalculatorState = { calculators: profile.calculators };
            const next = typeof action === 'function' ? action(current) : action;
            return { ...profile, calculators: next.calculators };
          }),
        };
      });
    },
    [setProfilesState]
  );

  const switchProfile = (profileId: string) => {
    if (!profilesState.profiles.some((p) => p.id === profileId)) return;
    setProfilesState((prev) => ({ ...prev, activeProfileId: profileId }));
  };

  const addProfile = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const profile = createDefaultProfile(resolvedMaterials, trimmedName);
    setProfilesState((prev) => ({
      activeProfileId: profile.id,
      profiles: [...prev.profiles, profile],
    }));
  };

  const deleteProfile = (profileId: string) => {
    if (profilesState.profiles.length <= 1) return;

    setProfilesState((prev) => {
      const remaining = prev.profiles.filter((p) => p.id !== profileId);
      if (!remaining.length) return prev;

      const activeProfileId =
        prev.activeProfileId === profileId ? remaining[0].id : prev.activeProfileId;

      return { activeProfileId, profiles: remaining };
    });
  };

  const handleMaterialRemoved = (materialId: string, remainingMaterials: Material[]) => {
    const fallback = remainingMaterials[0];
    if (!fallback) return;

    setProfilesState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((profile) => ({
        ...profile,
        calculators: profile.calculators.map((calc) =>
          calc.materialId === materialId
            ? { ...calc, materialId: fallback.id, price: fallback.defaultPrice }
            : calc
        ),
      })),
    }));
  };

  const handleMaterialsImported = (newMaterials: Material[]) => {
    setProfilesState((prev) => remapProfilesForMaterials(prev, newMaterials));
  };

  const suggestProfileName = () =>
    createUniqueProfileName(
      'Profile',
      profilesState.profiles.map((p) => p.name)
    );

  return {
    calculatorState,
    setCalculatorState,
    setProfilesState,
    profiles: profilesState.profiles,
    activeProfileId: profilesState.activeProfileId,
    switchProfile,
    addProfile,
    deleteProfile,
    handleMaterialRemoved,
    handleMaterialsImported,
    suggestProfileName,
  };
};

export default useCalculatorProfiles;
