import { useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import useToast from '../../hooks/useToast';
import useSortableSensors from '../../hooks/useSortableSensors';
import useLocalStorage from '../../hooks/useLocalStorage';
import { createCalculator, DEFAULT_MATERIALS } from '../../constants/materials';
import {
  sectionWrapperClass,
  sectionSideLeftClass,
  sectionSideRightClass,
  sectionGlassClass,
  sideActionButtonClass,
} from '../../constants/layout';
import type { CalculatorProfile, CalculatorState, Material } from '../../types';
import type { CalculatorViewMode } from '../../types/calculatorView';
import { copyToClipboard } from '../../utils/copyToClipboard';
import CalculatorRow from '../CalculatorRow/CalculatorRow';
import CalculatorGridTile from '../CalculatorGridTile/CalculatorGridTile';
import CalculatorViewToggle from '../CalculatorViewToggle/CalculatorViewToggle';
import ProfileToolbar from '../ProfileToolbar/ProfileToolbar';
import ResetIcon from '../icons/ResetIcon';
import PlusIcon from '../icons/PlusIcon';
import Toast from '../Toast/Toast';

interface PriceCalculatorProps {
  materials: Material[];
  calculatorState: CalculatorState;
  setCalculatorState: React.Dispatch<React.SetStateAction<CalculatorState>>;
  profiles: CalculatorProfile[];
  activeProfileId: string;
  onSwitchProfile: (profileId: string) => void;
  onAddProfile: (name: string) => void;
  onDeleteProfile: (profileId: string) => void;
  suggestProfileName: () => string;
  onMaterialRemovedRef: React.MutableRefObject<
    (materialId: string, remainingMaterials: Material[]) => void
  >;
  onMaterialsImportedRef: React.MutableRefObject<(materials: Material[]) => void>;
  handleMaterialRemoved: (materialId: string, remainingMaterials: Material[]) => void;
  handleMaterialsImported: (materials: Material[]) => void;
}

const PriceCalculator = ({
  materials,
  calculatorState,
  setCalculatorState,
  profiles,
  activeProfileId,
  onSwitchProfile,
  onAddProfile,
  onDeleteProfile,
  suggestProfileName,
  onMaterialRemovedRef,
  onMaterialsImportedRef,
  handleMaterialRemoved,
  handleMaterialsImported,
}: PriceCalculatorProps) => {
  const resolvedMaterials = materials.length ? materials : DEFAULT_MATERIALS;
  const { toast, showToast } = useToast();
  const sensors = useSortableSensors();
  const [viewMode, setViewMode] = useLocalStorage<CalculatorViewMode>(
    'calculatorViewMode',
    'list',
    (parsed) => (parsed === 'grid' ? 'grid' : 'list')
  );

  const total = calculatorState.calculators.reduce(
    (acc, calc) => acc + calc.price * calc.quantity,
    0
  );

  const handleCopy = async (value: number) => {
    try {
      await copyToClipboard(String(value));
      showToast('Copied!', 'success');
    } catch {
      showToast('Failed to copy!', 'error');
    }
  };

  const addRow = () => {
    setCalculatorState((prev) => ({
      ...prev,
      calculators: [...prev.calculators, createCalculator(resolvedMaterials)],
    }));
  };

  const removeRow = (id: string) => {
    setCalculatorState((prev) => ({
      ...prev,
      calculators: prev.calculators.filter((calc) => calc.id !== id),
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setCalculatorState((prev) => {
      const oldIndex = prev.calculators.findIndex((calc) => calc.id === active.id);
      const newIndex = prev.calculators.findIndex((calc) => calc.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;

      return { calculators: arrayMove(prev.calculators, oldIndex, newIndex) };
    });
  };

  const resetAllQuantities = () => {
    setCalculatorState((prev) => ({
      ...prev,
      calculators: prev.calculators.map((calc) => ({ ...calc, quantity: 0 })),
    }));
  };

  useEffect(() => {
    onMaterialRemovedRef.current = handleMaterialRemoved;
    onMaterialsImportedRef.current = handleMaterialsImported;
  });

  return (
    <div className={sectionWrapperClass}>
      <div className={sectionSideLeftClass}>
        <ProfileToolbar
          profiles={profiles}
          activeProfileId={activeProfileId}
          onSwitch={onSwitchProfile}
          onAdd={onAddProfile}
          onDelete={onDeleteProfile}
          suggestProfileName={suggestProfileName}
        />
      </div>

      <section className={sectionGlassClass}>
        <div className="flex justify-end w-full">
          <CalculatorViewToggle value={viewMode} onChange={setViewMode} />
        </div>

        {calculatorState.calculators.length === 0 ? (
          <p className="text-sm text-white/60 text-center py-6">
            No rows yet. Use + to add a calculator row.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={calculatorState.calculators.map((calc) => calc.id)}
              strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
            >
              {viewMode === 'list' ? (
                <div className="w-full divide-y divide-white/10">
                  {calculatorState.calculators.map((calculator) => (
                    <CalculatorRow
                      key={calculator.id}
                      materials={resolvedMaterials}
                      setCalculatorState={setCalculatorState}
                      calculator={calculator}
                      onRemove={removeRow}
                      onCopy={handleCopy}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(5.75rem,1fr))] gap-2 w-full">
                  {calculatorState.calculators.map((calculator) => (
                    <CalculatorGridTile
                      key={calculator.id}
                      materials={resolvedMaterials}
                      setCalculatorState={setCalculatorState}
                      calculator={calculator}
                    />
                  ))}
                </div>
              )}
            </SortableContext>
          </DndContext>
        )}

        <div className="flex items-center justify-center w-full">
          <div className="flex items-center gap-3">
            <span className="text-base text-white/70">Total:</span>
            <button
              type="button"
              className="copyable text-2xl font-bold"
              aria-label={`Copy total ${total}`}
              onClick={() => handleCopy(total)}
            >
              {total.toLocaleString()}
            </button>
          </div>
          <button
            type="button"
            className="btn w-auto p-2 ml-8"
            aria-label="Reset all quantities"
            onClick={resetAllQuantities}
          >
            <ResetIcon className="w-5 h-5" />
          </button>
        </div>

        <Toast toast={toast} />
      </section>

      <div className={sectionSideRightClass}>
        <button
          type="button"
          className={sideActionButtonClass}
          aria-label="Add row"
          onClick={addRow}
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default PriceCalculator;
