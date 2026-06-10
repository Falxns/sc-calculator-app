import type { Material } from '../types';

export const getMaterialImageSrc = (material: Material | undefined): string => {
  if (!material) return '';
  if (material.imageData) return material.imageData;
  if (material.imgSrc) return `${import.meta.env.BASE_URL}assets/${material.imgSrc}.png`;
  return '';
};

export const findMaterial = (materials: Material[], materialId: string) =>
  materials.find((m) => m.id === materialId);
