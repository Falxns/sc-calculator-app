import { DEFAULT_MATERIALS } from '../constants/materials';
import type {
  CalculatorProfilesState,
  Material,
  MessageBuilderState,
} from '../types';
import type { CraftSession } from '../types/craft';
import {
  applyImportedMaterialsIcons,
  exportIconsAsDataUrls,
  importIconsFromBackup,
} from './iconStore';
import { normalizeProfilesState, PROFILES_STORAGE_KEY } from './calculatorProfiles';
import { normalizeMessagesState } from './messageBuilder';
import {
  CRAFT_SESSION_STORAGE_KEY,
  normalizeCraftSession,
} from './craftSession';
import {
  parseMaterialsIconsFromImport,
  parseMaterialsImport,
} from './materialsIo';

export const BACKUP_VERSION = 3;
export const BACKUP_VERSION_V2 = 2;
export const LEGACY_BACKUP_VERSION = 1;
export const MATERIALS_STORAGE_KEY = 'materialsState';
export const MESSAGES_STORAGE_KEY = 'messageBuilderState';

export interface AppBackup {
  version:
    | typeof BACKUP_VERSION
    | typeof BACKUP_VERSION_V2
    | typeof LEGACY_BACKUP_VERSION;
  exportedAt: string;
  materials: Material[];
  profiles: CalculatorProfilesState;
  messages: MessageBuilderState;
  /** Custom icon data URLs keyed by material id */
  icons?: Record<string, string>;
  /** Craft profitability session (v3+) */
  craftSession?: CraftSession;
}

const parseMessages = (raw: unknown): MessageBuilderState => normalizeMessagesState(raw);

const readJson = (key: string): unknown => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

export const createFullBackupFromStorage = async (): Promise<AppBackup> => {
  const materialsRaw = readJson(MATERIALS_STORAGE_KEY) as { materials?: unknown } | null;

  let materials = DEFAULT_MATERIALS;
  try {
    materials = parseMaterialsImport(materialsRaw?.materials ?? materialsRaw ?? DEFAULT_MATERIALS);
  } catch {
    materials = DEFAULT_MATERIALS;
  }

  const icons = await exportIconsAsDataUrls(materials);
  const craftSessionRaw = readJson(CRAFT_SESSION_STORAGE_KEY);
  const craftSession =
    craftSessionRaw !== null ? normalizeCraftSession(craftSessionRaw) : undefined;

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    materials,
    profiles: normalizeProfilesState(readJson(PROFILES_STORAGE_KEY), materials),
    messages: parseMessages(readJson(MESSAGES_STORAGE_KEY)),
    ...(Object.keys(icons).length ? { icons } : {}),
    ...(craftSession ? { craftSession } : {}),
  };
};

export const isFullBackup = (raw: unknown): raw is AppBackup => {
  if (!raw || typeof raw !== 'object') return false;
  const data = raw as Record<string, unknown>;
  return (
    (data.version === BACKUP_VERSION ||
      data.version === BACKUP_VERSION_V2 ||
      data.version === LEGACY_BACKUP_VERSION) &&
    Array.isArray(data.materials) &&
    typeof data.profiles === 'object' &&
    data.profiles !== null &&
    typeof data.messages === 'object' &&
    data.messages !== null
  );
};

export type BackupImportResult =
  | { type: 'full'; backup: AppBackup }
  | { type: 'materials'; materials: Material[]; icons?: Record<string, string> };

export const parseBackupImport = (raw: unknown): BackupImportResult => {
  if (isFullBackup(raw)) {
    const materials = parseMaterialsImport(raw.materials);
    const icons = raw.icons ?? parseMaterialsIconsFromImport(raw);
    return {
      type: 'full',
      backup: {
        version: raw.version === BACKUP_VERSION ? BACKUP_VERSION : BACKUP_VERSION_V2,
        exportedAt: raw.exportedAt ?? new Date().toISOString(),
        materials,
        profiles: normalizeProfilesState(raw.profiles, materials),
        messages: parseMessages(raw.messages),
        icons,
        ...(raw.craftSession ? { craftSession: normalizeCraftSession(raw.craftSession) } : {}),
      },
    };
  }

  const icons = parseMaterialsIconsFromImport(raw);
  return { type: 'materials', materials: parseMaterialsImport(raw), icons };
};

export const downloadFullBackupJson = async () => {
  const payload = await createFullBackupFromStorage();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = payload.exportedAt.slice(0, 10);
  link.href = url;
  link.download = `sc-calculator-backup-${date}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const readBackupFromFile = (file: File): Promise<BackupImportResult> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(parseBackupImport(JSON.parse(reader.result as string)));
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Could not parse JSON file.'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsText(file);
  });

export const importBackupIcons = async (backup: AppBackup): Promise<Material[]> =>
  applyImportedMaterialsIcons(backup.materials, backup.icons);

export const mergeBackupIcons = async (
  current: Record<string, string>,
  imported: Record<string, string> | undefined
): Promise<void> => {
  if (!imported || !Object.keys(imported).length) return;
  await importIconsFromBackup({ ...current, ...imported });
};
