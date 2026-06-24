import { sanitizeMaterialForStorage } from './iconStore';
import { normalizeMaterials } from './materialsNormalize';
import type { Material } from '../types';

export const EXPORT_VERSION = 2;

type LegacyMaterial = Material & { imageData?: string };

export interface MaterialsExport {
  version: typeof EXPORT_VERSION;
  exportedAt: string;
  materials: Material[];
  /** Custom icon data URLs keyed by material id (backup only, not stored in localStorage) */
  icons?: Record<string, string>;
}

const isMaterial = (value: unknown): value is LegacyMaterial => {
  if (!value || typeof value !== 'object') return false;
  const m = value as Record<string, unknown>;
  return (
    typeof m.id === 'string' &&
    m.id.length > 0 &&
    typeof m.label === 'string' &&
    m.label.trim().length > 0 &&
    typeof m.defaultPrice === 'number' &&
    !Number.isNaN(m.defaultPrice) &&
    m.defaultPrice >= 0
  );
};

export const createMaterialsExport = (
  materials: Material[],
  icons?: Record<string, string>
): MaterialsExport => ({
  version: EXPORT_VERSION,
  exportedAt: new Date().toISOString(),
  materials: materials.map(sanitizeMaterialForStorage),
  ...(icons && Object.keys(icons).length ? { icons } : {}),
});

export const parseMaterialsImport = (raw: unknown): Material[] => {
  const data = raw as Partial<MaterialsExport> | Material[] | null;

  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.materials)
      ? data.materials
      : null;

  if (!list?.length) {
    throw new Error('File must contain at least one material.');
  }

  if (!list.every(isMaterial)) {
    throw new Error('Invalid material format in file.');
  }

  const ids = new Set<string>();
  for (const material of list) {
    if (ids.has(material.id)) {
      throw new Error(`Duplicate material id: ${material.id}`);
    }
    ids.add(material.id);
  }

  return normalizeMaterials(
    list.map((m) => {
      const hasCustom = m.customIcon || m.imageData;
      return {
        id: m.id,
        label: m.label.trim(),
        defaultPrice: m.defaultPrice,
        ...(m.imgSrc ? { imgSrc: m.imgSrc } : {}),
        ...(hasCustom ? { customIcon: true } : {}),
      };
    })
  ).materials;
};

export const parseMaterialsIconsFromImport = (raw: unknown): Record<string, string> | undefined => {
  const data = raw as Partial<MaterialsExport> | null;
  if (!data?.icons || typeof data.icons !== 'object') return undefined;

  const icons: Record<string, string> = {};
  for (const [id, value] of Object.entries(data.icons)) {
    if (typeof value === 'string' && value.startsWith('data:')) {
      icons[id] = value;
    }
  }
  return Object.keys(icons).length ? icons : undefined;
};

export const downloadMaterialsJson = async (materials: Material[]) => {
  const { exportIconsAsDataUrls } = await import('./iconStore');
  const icons = await exportIconsAsDataUrls(materials);
  const payload = createMaterialsExport(materials, icons);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = payload.exportedAt.slice(0, 10);
  link.href = url;
  link.download = `sc-materials-${date}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const readMaterialsFromFile = (file: File): Promise<{ materials: Material[]; icons?: Record<string, string> }> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(reader.result as string);
        resolve({
          materials: parseMaterialsImport(parsed),
          icons: parseMaterialsIconsFromImport(parsed),
        });
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Could not parse JSON file.'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsText(file);
  });
