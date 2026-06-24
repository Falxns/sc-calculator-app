import { useEffect, useState } from 'react';
import type { Material } from '../types';
import { getIconMigrationRevision, subscribeIconMigration } from '../utils/iconMigration';
import { getIconUrl } from '../utils/iconStore';
import { getBuiltinImageSrc, materialUsesCustomIcon } from '../utils/materialImage';

type LegacyMaterial = Material & { imageData?: string };

export const useMaterialIcon = (material: Material | undefined): string => {
  const [src, setSrc] = useState(() => getBuiltinImageSrc(material));
  const [migrationRevision, setMigrationRevision] = useState(getIconMigrationRevision);

  useEffect(() => subscribeIconMigration(() => setMigrationRevision(getIconMigrationRevision())), []);

  useEffect(() => {
    if (!material) {
      setSrc('');
      return;
    }

    const legacy = (material as LegacyMaterial).imageData;
    if (legacy) {
      setSrc(legacy);
      return;
    }

    const builtin = getBuiltinImageSrc(material);
    if (!materialUsesCustomIcon(material)) {
      setSrc(builtin);
      return;
    }

    let cancelled = false;

    getIconUrl(material.id).then((url) => {
      if (!cancelled) setSrc(url || builtin);
    });

    return () => {
      cancelled = true;
    };
  }, [material, material?.id, material?.customIcon, material?.imgSrc, migrationRevision]);

  return src;
};
