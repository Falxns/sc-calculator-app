import type { Material } from '../types';

const DB_NAME = 'sc-calculator-icons';
const STORE_NAME = 'icons';
const DB_VERSION = 1;

type LegacyMaterial = Material & { imageData?: string };

let dbPromise: Promise<IDBDatabase> | null = null;
const urlCache = new Map<string, string>();

const openDb = (): Promise<IDBDatabase> => {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
    });
  }
  return dbPromise;
};

const runTransaction = <T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> =>
  openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const request = action(tx.objectStore(STORE_NAME));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
        tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed'));
      })
  );

export const revokeIconUrl = (materialId: string): void => {
  const url = urlCache.get(materialId);
  if (url) {
    URL.revokeObjectURL(url);
    urlCache.delete(materialId);
  }
};

export const putIcon = async (materialId: string, blob: Blob): Promise<void> => {
  await runTransaction('readwrite', (store) => store.put(blob, materialId));
  revokeIconUrl(materialId);
};

export const putIconFromFile = async (materialId: string, file: File): Promise<void> =>
  putIcon(materialId, file);

export const deleteIcon = async (materialId: string): Promise<void> => {
  revokeIconUrl(materialId);
  await runTransaction('readwrite', (store) => store.delete(materialId));
};

export const getIconBlob = async (materialId: string): Promise<Blob | null> => {
  const result = await runTransaction<Blob | undefined>('readonly', (store) => store.get(materialId));
  return result ?? null;
};

export const getIconUrl = async (materialId: string): Promise<string> => {
  const cached = urlCache.get(materialId);
  if (cached) return cached;

  const blob = await getIconBlob(materialId);
  if (!blob) return '';

  const url = URL.createObjectURL(blob);
  urlCache.set(materialId, url);
  return url;
};

export const hasIcon = async (materialId: string): Promise<boolean> =>
  (await getIconBlob(materialId)) !== null;

export const remapIcon = async (oldId: string, newId: string): Promise<void> => {
  if (oldId === newId) return;
  const blob = await getIconBlob(oldId);
  if (!blob) return;
  await putIcon(newId, blob);
  await deleteIcon(oldId);
};

export const remapIcons = async (idMap: Record<string, string>): Promise<void> => {
  await Promise.all(Object.entries(idMap).map(([oldId, newId]) => remapIcon(oldId, newId)));
};

export const dataUrlToBlob = (dataUrl: string): Blob => {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
};

export const importIconFromDataUrl = async (materialId: string, dataUrl: string): Promise<void> =>
  putIcon(materialId, dataUrlToBlob(dataUrl));

export const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('Could not read icon blob'));
    reader.readAsDataURL(blob);
  });

export const exportIconsAsDataUrls = async (
  materials: Material[]
): Promise<Record<string, string>> => {
  const icons: Record<string, string> = {};
  const customIds = materials.filter((m) => m.customIcon).map((m) => m.id);

  await Promise.all(
    customIds.map(async (id) => {
      const blob = await getIconBlob(id);
      if (blob) icons[id] = await blobToDataUrl(blob);
    })
  );

  return icons;
};

export const importIconsFromBackup = async (icons: Record<string, string>): Promise<void> => {
  await Promise.all(
    Object.entries(icons).map(([materialId, dataUrl]) => importIconFromDataUrl(materialId, dataUrl))
  );
};

export const sanitizeMaterialForStorage = (material: Material): Material => {
  const legacy = material as LegacyMaterial;
  const { imageData, ...rest } = legacy;
  return imageData ? { ...rest, customIcon: true } : rest;
};

const readRawMaterialsFromStorage = (): LegacyMaterial[] => {
  try {
    const item = localStorage.getItem('materialsState');
    if (!item) return [];
    const parsed = JSON.parse(item) as { materials?: unknown };
    return Array.isArray(parsed.materials) ? (parsed.materials as LegacyMaterial[]) : [];
  } catch {
    return [];
  }
};

/** Migrate legacy base64 imageData from raw localStorage into IndexedDB. */
export const migrateIconsFromRawStorage = async (
  currentMaterials: Material[]
): Promise<{ materials: Material[]; changed: boolean }> => {
  const rawMaterials = readRawMaterialsFromStorage();
  const rawById = new Map(rawMaterials.map((material) => [material.id, material]));

  let changed = false;
  const next: Material[] = [];

  for (const material of currentMaterials) {
    const raw = rawById.get(material.id);
    const imageData = raw?.imageData ?? (material as LegacyMaterial).imageData;

    if (imageData) {
      await importIconFromDataUrl(material.id, imageData);
      const updated = { ...sanitizeMaterialForStorage(material), customIcon: true };
      next.push(updated);
      changed = true;
      continue;
    }

    if (await hasIcon(material.id)) {
      if (!material.customIcon) changed = true;
      next.push(material.customIcon ? material : { ...material, customIcon: true });
      continue;
    }

    next.push(material);
  }

  return { materials: changed ? next : currentMaterials, changed };
};

export const migrateLegacyMaterialIcons = async (materials: Material[]): Promise<Material[]> => {
  const { materials: migrated, changed } = await migrateIconsFromRawStorage(materials);
  return changed ? migrated : materials;
};

export const applyImportedMaterialsIcons = async (
  materials: Material[],
  icons?: Record<string, string>
): Promise<Material[]> => {
  const legacyMaterials = materials.filter((m) => (m as LegacyMaterial).imageData);

  if (icons && Object.keys(icons).length) {
    await importIconsFromBackup(icons);
  }

  for (const material of legacyMaterials) {
    const dataUrl = (material as LegacyMaterial).imageData;
    if (dataUrl) await importIconFromDataUrl(material.id, dataUrl);
  }

  return materials.map((material) => {
    const legacy = (material as LegacyMaterial).imageData;
    const hasCustom = material.customIcon || legacy || icons?.[material.id];
    const cleaned = sanitizeMaterialForStorage(material);
    return hasCustom ? { ...cleaned, customIcon: true } : cleaned;
  });
};
