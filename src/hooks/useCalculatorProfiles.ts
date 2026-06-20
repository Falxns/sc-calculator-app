import { useCallback, useMemo } from 'react';
import useLocalStorage from './useLocalStorage';
import { createDefaultCalculators, DEFAULT_MATERIALS } from '../constants/materials';
import type { CalculatorProfile, CalculatorProfilesState, CalculatorState, Material } from '../types';
import {
  cloneProfile,
  createDefaultProfile,
  loadProfilesStateFromStorage,
  normalizeProfilesState,
  PROFILES_STORAGE_KEY,
  readMaterialIdRemap,
  remapProfilesForMaterials,
  remapProfilesMaterialIds,
} from '../utils/calculatorProfiles';

const useCalculatorProfiles = (materials: Material[]) => {
  const resolvedMaterials = materials.length ? materials : DEFAULT_MATERIALS;

  const [profilesState, setProfilesState] = useLocalStorage<CalculatorProfilesState>(
    PROFILES_STORAGE_KEY,
    loadProfilesStateFromStorage(resolvedMaterials),
    (parsed) => {
      const idMap = readMaterialIdRemap();
      const normalized = normalizeProfilesState(parsed, resolvedMaterials);
      return remapProfilesMaterialIds(normalized, idMap, resolvedMaterials);
    },
    400
  );

  const activeProfile =
    profilesState.profiles.find((p) => p.id === profilesState.activeProfileId) ??
    profilesState.profiles[0];

  const calculatorState = useMemo<CalculatorState>(
    () => ({
      calculators: activeProfile?.calculators ?? createDefaultCalculators(resolvedMaterials),
    }),
    [activeProfile]
  );

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

  const renameProfile = (profileId: string, name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setProfilesState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((profile) =>
        profile.id === profileId ? { ...profile, name: trimmedName } : profile
      ),
    }));
  };

  const duplicateProfile = (profileId: string, name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setProfilesState((prev) => {
      const source = prev.profiles.find((p) => p.id === profileId);
      if (!source) return prev;

      const copy = cloneProfile(source, trimmedName);
      return {
        activeProfileId: copy.id,
        profiles: [...prev.profiles, copy],
      };
    });
  };

  const reorderProfiles = (profiles: CalculatorProfile[]) => {
    setProfilesState((prev) => {
      if (profiles.length !== prev.profiles.length) return prev;
      const ids = new Set(profiles.map((p) => p.id));
      if (prev.profiles.some((p) => !ids.has(p.id))) return prev;
      return { ...prev, profiles };
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

  return {
    calculatorState,
    setCalculatorState,
    setProfilesState,
    profiles: profilesState.profiles,
    activeProfileId: profilesState.activeProfileId,
    switchProfile,
    addProfile,
    deleteProfile,
    renameProfile,
    duplicateProfile,
    reorderProfiles,
    handleMaterialRemoved,
    handleMaterialsImported,
  };
};

export default useCalculatorProfiles;
