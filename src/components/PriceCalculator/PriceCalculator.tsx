import { useEffect } from 'react';
import useToast from '../../hooks/useToast';
import { createCalculator, DEFAULT_MATERIALS } from '../../constants/materials';
import { sectionGridClass, sectionGlassClass, sideActionButtonClass } from '../../constants/layout';
import type { CalculatorProfile, CalculatorState, Material } from '../../types';
import { copyToClipboard } from '../../utils/copyToClipboard';
import CalculatorRow from '../CalculatorRow/CalculatorRow';
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
    <div className={sectionGridClass}>
      <ProfileToolbar
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSwitch={onSwitchProfile}
        onAdd={onAddProfile}
        onDelete={onDeleteProfile}
        suggestProfileName={suggestProfileName}
      />

      <section className={sectionGlassClass}>
        {calculatorState.calculators.length === 0 ? (
          <p className="text-sm text-white/60 text-center py-6">
            No rows yet. Use + to add a calculator row.
          </p>
        ) : (
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
        )}

        <div className="flex items-center justify-center gap-3 w-full">
          <span className="text-base text-white/70">Total:</span>
          <button
            type="button"
            className="copyable text-2xl font-bold"
            aria-label={`Copy total ${total}`}
            onClick={() => handleCopy(total)}
          >
            {total.toLocaleString()}
          </button>
          <button
            type="button"
            className="btn w-auto p-2"
            aria-label="Reset all quantities"
            onClick={resetAllQuantities}
          >
            <ResetIcon className="w-5 h-5" />
          </button>
        </div>

        <Toast toast={toast} />
      </section>

      <div className="flex flex-col items-start mt-4">
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
