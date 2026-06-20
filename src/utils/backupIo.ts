import { DEFAULT_MATERIALS } from '../constants/materials';
import type {
  CalculatorProfilesState,
  Material,
  MessageBuilderState,
} from '../types';
import { normalizeProfilesState, PROFILES_STORAGE_KEY } from './calculatorProfiles';
import { normalizeMessagesState } from './messageBuilder';
import { parseMaterialsImport } from './materialsIo';

export const BACKUP_VERSION = 1;
export const MATERIALS_STORAGE_KEY = 'materialsState';
export const MESSAGES_STORAGE_KEY = 'messageBuilderState';

export interface AppBackup {
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  materials: Material[];
  profiles: CalculatorProfilesState;
  messages: MessageBuilderState;
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

export const createFullBackupFromStorage = (): AppBackup => {
  const materialsRaw = readJson(MATERIALS_STORAGE_KEY) as { materials?: unknown } | null;

  let materials = DEFAULT_MATERIALS;
  try {
    materials = parseMaterialsImport(materialsRaw?.materials ?? materialsRaw ?? DEFAULT_MATERIALS);
  } catch {
    materials = DEFAULT_MATERIALS;
  }

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    materials,
    profiles: normalizeProfilesState(readJson(PROFILES_STORAGE_KEY), materials),
    messages: parseMessages(readJson(MESSAGES_STORAGE_KEY)),
  };
};

export const isFullBackup = (raw: unknown): raw is AppBackup => {
  if (!raw || typeof raw !== 'object') return false;
  const data = raw as Record<string, unknown>;
  return (
    data.version === BACKUP_VERSION &&
    Array.isArray(data.materials) &&
    typeof data.profiles === 'object' &&
    data.profiles !== null &&
    typeof data.messages === 'object' &&
    data.messages !== null
  );
};

export type BackupImportResult =
  | { type: 'full'; backup: AppBackup }
  | { type: 'materials'; materials: Material[] };

export const parseBackupImport = (raw: unknown): BackupImportResult => {
  if (isFullBackup(raw)) {
    const materials = parseMaterialsImport(raw.materials);
    return {
      type: 'full',
      backup: {
        version: BACKUP_VERSION,
        exportedAt: raw.exportedAt ?? new Date().toISOString(),
        materials,
        profiles: normalizeProfilesState(raw.profiles, materials),
        messages: parseMessages(raw.messages),
      },
    };
  }

  return { type: 'materials', materials: parseMaterialsImport(raw) };
};

export const downloadFullBackupJson = () => {
  const payload = createFullBackupFromStorage();
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
