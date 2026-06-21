import { useDeferredValue, useRef } from 'react';
import Header from './components/Header/Header';
import PriceCalculator from './components/PriceCalculator/PriceCalculator';
import MessageBuilder from './components/MessageBuilder/MessageBuilder';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import SideToolbar from './components/SideToolbar/SideToolbar';
import InstallAppBanner from './components/InstallAppBanner/InstallAppBanner';
import useMaterials from './hooks/useMaterials';
import useCalculatorProfiles from './hooks/useCalculatorProfiles';
import { DEFAULT_MATERIALS } from './constants/materials';
import type { Material, MessageBuilderState } from './types';
import {
  createFullBackupFromStorage,
  type AppBackup,
} from './utils/backupIo';
import { normalizeProfilesState } from './utils/calculatorProfiles';
import { applyImportedMaterialsIcons } from './utils/iconStore';
import { mergeAppSnapshot, type BackupImportMode } from './utils/backupMerge';

const App = () => {
  const [materialsState, setMaterialsState] = useMaterials();
  const materials = materialsState.materials.length ? materialsState.materials : DEFAULT_MATERIALS;
  const onMaterialRemovedRef = useRef<
    (materialId: string, remainingMaterials: Material[]) => void
  >(() => {});
  const onMaterialsImportedRef = useRef<(materials: Material[]) => void>(() => {});
  const onMessagesImportRef = useRef<(state: MessageBuilderState) => void>(() => {});

  const {
    calculatorState,
    setCalculatorState,
    setProfilesState,
    profiles,
    activeProfileId,
    switchProfile,
    addProfile,
    deleteProfile,
    renameProfile,
    duplicateProfile,
    reorderProfiles,
    handleMaterialRemoved,
    handleMaterialsImported,
  } = useCalculatorProfiles(materials);

  const applyBackup = async (snapshot: {
    materials: Material[];
    profiles: AppBackup['profiles'];
    messages: MessageBuilderState;
    icons?: Record<string, string>;
  }) => {
    const materials = await applyImportedMaterialsIcons(snapshot.materials, snapshot.icons);
    setMaterialsState({ materials });
    setProfilesState(normalizeProfilesState(snapshot.profiles, materials));
    onMessagesImportRef.current(snapshot.messages);
    handleMaterialsImported(materials);
  };

  const handleFullBackupImport = async (backup: AppBackup, mode: BackupImportMode) => {
    if (mode === 'replace') {
      await applyBackup(backup);
      return;
    }

    const current = await createFullBackupFromStorage();
    const merged = mergeAppSnapshot(current, backup);
    const mergedIcons = {
      ...(current.icons ?? {}),
      ...(backup.icons ?? {}),
    };
    await applyBackup({ ...merged, icons: mergedIcons });
  };

  const calculatorTotal = calculatorState.calculators.reduce(
    (acc, calc) => acc + calc.price * calc.quantity,
    0
  );

  const deferredCalculatorRows = useDeferredValue(calculatorState.calculators);
  const deferredCalculatorTotal = useDeferredValue(calculatorTotal);

  return (
    <ErrorBoundary>
      <div className="flex flex-col gap-4">
        <Header />
        <main className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
          <PriceCalculator
            materials={materials}
            calculatorState={calculatorState}
            setCalculatorState={setCalculatorState}
            profiles={profiles}
            activeProfileId={activeProfileId}
            onSwitchProfile={switchProfile}
            onAddProfile={addProfile}
            onDeleteProfile={deleteProfile}
            onRenameProfile={renameProfile}
            onDuplicateProfile={duplicateProfile}
            onReorderProfiles={reorderProfiles}
            onMaterialRemovedRef={onMaterialRemovedRef}
            onMaterialsImportedRef={onMaterialsImportedRef}
            handleMaterialRemoved={handleMaterialRemoved}
            handleMaterialsImported={handleMaterialsImported}
          />
          <MessageBuilder
            onImportRef={onMessagesImportRef}
            calculatorRows={deferredCalculatorRows}
            materials={materials}
            calculatorTotal={deferredCalculatorTotal}
          />
        </main>
        <SideToolbar
          materials={materials}
          setMaterials={setMaterialsState}
          onMaterialRemoved={(materialId, remainingMaterials) =>
            onMaterialRemovedRef.current(materialId, remainingMaterials)
          }
          onMaterialsImported={(importedMaterials) =>
            onMaterialsImportedRef.current(importedMaterials)
          }
          onFullBackupImport={handleFullBackupImport}
        />
        <InstallAppBanner />
      </div>
    </ErrorBoundary>
  );
};

export default App;
