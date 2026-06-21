import type { Material, MaterialsState } from '../types';
import { DEFAULT_MATERIALS } from '../constants/materials';
import { createUniqueMaterialId, hasCyrillic, slugify } from './slugify';

export const MATERIAL_ID_REMAP_KEY = 'materialIdRemap';

const isGenericMaterialId = (id: string) => id === 'material' || /^material-\d+$/.test(id);

const shouldRemapMaterialId = (material: Material): boolean => {
  if (hasCyrillic(material.id)) return true;

  const labelSlug = slugify(material.label);
  return isGenericMaterialId(material.id) && labelSlug !== 'material';
};

export const normalizeMaterials = (
  materials: Material[]
): { materials: Material[]; idMap: Record<string, string> } => {
  const usedIds = new Set<string>();
  const idMap: Record<string, string> = {};
  const normalized: Material[] = [];

  for (const material of materials) {
    let nextId = material.id;

    if (shouldRemapMaterialId(material) || usedIds.has(material.id)) {
      nextId = createUniqueMaterialId(material.label, [...usedIds]);
    }

    if (nextId !== material.id) {
      idMap[material.id] = nextId;
    }

    usedIds.add(nextId);
    normalized.push(nextId === material.id ? material : { ...material, id: nextId });
  }

  return { materials: normalized, idMap };
};

const isMaterial = (value: unknown): value is Material => {
  if (!value || typeof value !== 'object') return false;
  const material = value as Record<string, unknown>;
  return (
    typeof material.id === 'string' &&
    material.id.length > 0 &&
    typeof material.label === 'string' &&
    material.label.trim().length > 0 &&
    typeof material.defaultPrice === 'number' &&
    !Number.isNaN(material.defaultPrice) &&
    material.defaultPrice >= 0
  );
};

export const normalizeMaterialsState = (raw: unknown): MaterialsState => {
  const data = raw as Partial<MaterialsState> | null;
  if (!Array.isArray(data?.materials) || !data.materials.length) {
    return { materials: DEFAULT_MATERIALS };
  }

  const validMaterials = data.materials.filter(isMaterial);
  if (!validMaterials.length) {
    return { materials: DEFAULT_MATERIALS };
  }

  const { materials, idMap } = normalizeMaterials(validMaterials);

  if (Object.keys(idMap).length) {
    try {
      localStorage.setItem(MATERIAL_ID_REMAP_KEY, JSON.stringify(idMap));
    } catch (err: unknown) {
      console.warn('Could not persist material id remap map:', err);
    }
  }

  return { materials };
};
