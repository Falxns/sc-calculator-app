import { useRef } from 'react';
import Header from './components/Header/Header';
import PriceCalculator from './components/PriceCalculator/PriceCalculator';
import MessageBuilder from './components/MessageBuilder/MessageBuilder';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import SideToolbar from './components/SideToolbar/SideToolbar';
import useMaterials from './hooks/useMaterials';
import useCalculatorProfiles from './hooks/useCalculatorProfiles';
import { DEFAULT_MATERIALS } from './constants/materials';
import type { Material } from './types';

const App = () => {
  const [materialsState, setMaterialsState] = useMaterials();
  const materials = materialsState.materials.length ? materialsState.materials : DEFAULT_MATERIALS;
  const onMaterialRemovedRef = useRef<
    (materialId: string, remainingMaterials: Material[]) => void
  >(() => {});
  const onMaterialsImportedRef = useRef<(materials: Material[]) => void>(() => {});

  const {
    calculatorState,
    setCalculatorState,
    profiles,
    activeProfileId,
    switchProfile,
    addProfile,
    deleteProfile,
    handleMaterialRemoved,
    handleMaterialsImported,
    suggestProfileName,
  } = useCalculatorProfiles(materials);

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
            suggestProfileName={suggestProfileName}
            onMaterialRemovedRef={onMaterialRemovedRef}
            onMaterialsImportedRef={onMaterialsImportedRef}
            handleMaterialRemoved={handleMaterialRemoved}
            handleMaterialsImported={handleMaterialsImported}
          />
          <MessageBuilder />
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
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;
