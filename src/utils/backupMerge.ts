import type {
  CalculatorProfilesState,
  Material,
  MessageBuilderState,
} from '../types';
import { createUniqueProfileName, remapCalculatorsForMaterials } from './calculatorProfiles';
import { createUniqueMessageName } from './messageBuilder';

export type BackupImportMode = 'replace' | 'merge';

export interface AppSnapshot {
  materials: Material[];
  profiles: CalculatorProfilesState;
  messages: MessageBuilderState;
}

export const describeBackup = (backup: AppSnapshot) => ({
  materialCount: backup.materials.length,
  profileCount: backup.profiles.profiles.length,
  messageCount: backup.messages.messages.length,
});

export const mergeMaterials = (current: Material[], imported: Material[]): Material[] => {
  const merged = new Map(current.map((material) => [material.id, material]));
  for (const material of imported) {
    merged.set(material.id, material);
  }
  return Array.from(merged.values());
};

export const mergeProfilesState = (
  current: CalculatorProfilesState,
  imported: CalculatorProfilesState,
  materials: Material[]
): CalculatorProfilesState => {
  const existingNames = current.profiles.map((profile) => profile.name);
  const mergedProfiles = [...current.profiles];

  for (const profile of imported.profiles) {
    const name = createUniqueProfileName(profile.name, [
      ...existingNames,
      ...mergedProfiles.map((item) => item.name),
    ]);
    existingNames.push(name);

    mergedProfiles.push({
      id: crypto.randomUUID(),
      name,
      calculators: remapCalculatorsForMaterials(profile.calculators, materials),
    });
  }

  const activeProfileId = current.profiles.some((profile) => profile.id === current.activeProfileId)
    ? current.activeProfileId
    : current.profiles[0]?.id ?? mergedProfiles[0]?.id ?? '';

  return { activeProfileId, profiles: mergedProfiles };
};

export const mergeMessagesState = (
  current: MessageBuilderState,
  imported: MessageBuilderState
): MessageBuilderState => {
  const existingNames = current.messages.map((message) => message.name);
  const mergedMessages = [...current.messages];

  for (const message of imported.messages) {
    const name = createUniqueMessageName(message.name, [
      ...existingNames,
      ...mergedMessages.map((item) => item.name),
    ]);
    existingNames.push(name);

    mergedMessages.push({
      id: crypto.randomUUID(),
      name,
      content: message.content,
    });
  }

  return { messages: mergedMessages };
};

export const mergeAppSnapshot = (current: AppSnapshot, imported: AppSnapshot): AppSnapshot => {
  const materials = mergeMaterials(current.materials, imported.materials);

  return {
    materials,
    profiles: mergeProfilesState(current.profiles, imported.profiles, materials),
    messages: mergeMessagesState(current.messages, imported.messages),
  };
};
