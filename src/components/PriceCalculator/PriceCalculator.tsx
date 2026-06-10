import { useEffect } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import useToast from '../../hooks/useToast';
import {
  createCalculator,
  createDefaultCalculators,
  DEFAULT_MATERIALS,
} from '../../constants/materials';
import type { Calculator, CalculatorState, Material } from '../../types';
import { copyToClipboard } from '../../utils/copyToClipboard';
import CalculatorRow from '../CalculatorRow/CalculatorRow';
import ResetIcon from '../icons/ResetIcon';
import PlusIcon from '../icons/PlusIcon';
import Toast from '../Toast/Toast';

/** Migrate legacy calculator rows that used `imgSrc` instead of `materialId`. */
const migrateCalculators = (raw: unknown, materials: Material[]): Calculator[] => {
  if (!Array.isArray(raw)) return createDefaultCalculators(materials);

  const materialIds = materials.map((m) => m.id);
  const fallbackId = materialIds[0] ?? '';

  return raw.map((item) => {
    const row = item as Record<string, unknown>;
    const legacyId = String(row.materialId ?? row.imgSrc ?? '');
    const materialId = materialIds.includes(legacyId) ? legacyId : fallbackId;
    const material = materials.find((m) => m.id === materialId);

    return {
      id: String(row.id ?? crypto.randomUUID()),
      materialId,
      price: Number(row.price) || material?.defaultPrice || 0,
      quantity: Number(row.quantity) || 0,
    };
  });
};

const deserializeCalculatorState =
  (materials: Material[]) =>
  (parsed: unknown): CalculatorState => {
    const stored = parsed as Partial<CalculatorState> | null;
    if (!stored?.calculators?.length) {
      return { calculators: createDefaultCalculators(materials) };
    }
    return { calculators: migrateCalculators(stored.calculators, materials) };
  };

interface PriceCalculatorProps {
  materials: Material[];
  onMaterialRemovedRef: React.MutableRefObject<
    (materialId: string, remainingMaterials: Material[]) => void
  >;
  onMaterialsImportedRef: React.MutableRefObject<(materials: Material[]) => void>;
}

const PriceCalculator = ({
  materials,
  onMaterialRemovedRef,
  onMaterialsImportedRef,
}: PriceCalculatorProps) => {
  const resolvedMaterials = materials.length ? materials : DEFAULT_MATERIALS;

  const [calculatorState, setCalculatorState] = useLocalStorage<CalculatorState>(
    'calculatorState',
    { calculators: createDefaultCalculators(resolvedMaterials) },
    deserializeCalculatorState(resolvedMaterials)
  );

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

  const handleMaterialRemoved = (materialId: string, remainingMaterials: Material[]) => {
    const fallback = remainingMaterials[0];
    if (!fallback) return;

    setCalculatorState((prev) => ({
      ...prev,
      calculators: prev.calculators.map((calc) =>
        calc.materialId === materialId
          ? { ...calc, materialId: fallback.id, price: fallback.defaultPrice }
          : calc
      ),
    }));
  };

  const handleMaterialsImported = (newMaterials: Material[]) => {
    const ids = new Set(newMaterials.map((m) => m.id));
    const fallback = newMaterials[0];
    if (!fallback) return;

    setCalculatorState((prev) => ({
      ...prev,
      calculators: prev.calculators.map((calc) =>
        ids.has(calc.materialId)
          ? calc
          : { ...calc, materialId: fallback.id, price: fallback.defaultPrice }
      ),
    }));
  };

  useEffect(() => {
    onMaterialRemovedRef.current = handleMaterialRemoved;
    onMaterialsImportedRef.current = handleMaterialsImported;
  });

  return (
    <div className="flex items-start gap-2 w-full">
      <section className="glass-container flex-col gap-3 flex-1 min-w-0">
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
      <button
        type="button"
        className="btn w-auto p-2.5 shrink-0 mt-4"
        aria-label="Add row"
        onClick={addRow}
      >
        <PlusIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default PriceCalculator;
