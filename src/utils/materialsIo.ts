import type { Material } from '../types';

export const EXPORT_VERSION = 1;

export interface MaterialsExport {
  version: typeof EXPORT_VERSION;
  exportedAt: string;
  materials: Material[];
}

const isMaterial = (value: unknown): value is Material => {
  if (!value || typeof value !== 'object') return false;
  const m = value as Record<string, unknown>;
  return (
    typeof m.id === 'string' &&
    m.id.length > 0 &&
    typeof m.label === 'string' &&
    m.label.trim().length > 0 &&
    typeof m.defaultPrice === 'number' &&
    !Number.isNaN(m.defaultPrice) &&
    m.defaultPrice >= 0 &&
    (m.imgSrc === undefined || typeof m.imgSrc === 'string') &&
    (m.imageData === undefined || typeof m.imageData === 'string')
  );
};

export const createMaterialsExport = (materials: Material[]): MaterialsExport => ({
  version: EXPORT_VERSION,
  exportedAt: new Date().toISOString(),
  materials,
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

  return list.map((m) => ({
    id: m.id,
    label: m.label.trim(),
    defaultPrice: m.defaultPrice,
    ...(m.imgSrc ? { imgSrc: m.imgSrc } : {}),
    ...(m.imageData ? { imageData: m.imageData } : {}),
  }));
};

export const downloadMaterialsJson = (materials: Material[]) => {
  const payload = createMaterialsExport(materials);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = payload.exportedAt.slice(0, 10);
  link.href = url;
  link.download = `sc-materials-${date}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const readMaterialsFromFile = (file: File): Promise<Material[]> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(reader.result as string);
        resolve(parseMaterialsImport(parsed));
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Could not parse JSON file.'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsText(file);
  });
