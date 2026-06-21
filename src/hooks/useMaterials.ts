import { useEffect, useRef, useState } from 'react';
import useLocalStorage from './useLocalStorage';
import { DEFAULT_MATERIALS } from '../constants/materials';
import type { MaterialsState } from '../types';
import { migrateIconsFromRawStorage, remapIcons } from '../utils/iconStore';
import { notifyIconMigrationComplete } from '../utils/iconMigration';
import { MATERIAL_ID_REMAP_KEY, normalizeMaterialsState } from '../utils/materialsNormalize';

const useMaterials = () => {
  const [materialsState, setMaterialsState] = useLocalStorage<MaterialsState>(
    'materialsState',
    { materials: DEFAULT_MATERIALS },
    normalizeMaterialsState,
    400
  );
  const [iconsReady, setIconsReady] = useState(false);
  const migrationStarted = useRef(false);

  useEffect(() => {
    if (migrationStarted.current) return;
    migrationStarted.current = true;

    let cancelled = false;

    const migrate = async () => {
      try {
        const { materials, changed } = await migrateIconsFromRawStorage(materialsState.materials);

        try {
          const raw = localStorage.getItem(MATERIAL_ID_REMAP_KEY);
          if (raw) {
            const idMap = JSON.parse(raw) as Record<string, string>;
            await remapIcons(idMap);
            localStorage.removeItem(MATERIAL_ID_REMAP_KEY);
          }
        } catch (err: unknown) {
          console.warn('Could not remap material icons:', err);
        }

        if (!cancelled && changed) {
          setMaterialsState({ materials });
        }
      } finally {
        if (!cancelled) {
          notifyIconMigrationComplete();
          setIconsReady(true);
        }
      }
    };

    void migrate();

    return () => {
      cancelled = true;
    };
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [materialsState, setMaterialsState, iconsReady] as const;
};

export default useMaterials;
