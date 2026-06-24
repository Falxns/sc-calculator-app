import type { Material } from '../types';

type LegacyMaterial = Material & { imageData?: string };

export const getBuiltinImageSrc = (material: Material | undefined): string => {
  if (!material?.imgSrc) return '';
  return `${import.meta.env.BASE_URL}assets/${material.imgSrc}.png`;
};

export const materialUsesCustomIcon = (material: Material | undefined): boolean => {
  if (!material) return false;
  if (material.customIcon) return true;
  return Boolean((material as LegacyMaterial).imageData);
};

/** @deprecated Use useMaterialIcon for display; sync builtin-only lookup */
export const getMaterialImageSrc = (material: Material | undefined): string => {
  if (!material) return '';
  const legacy = (material as LegacyMaterial).imageData;
  if (legacy) return legacy;
  return getBuiltinImageSrc(material);
};

export const findMaterial = (materials: Material[], materialId: string) =>
  materials.find((m) => m.id === materialId);
