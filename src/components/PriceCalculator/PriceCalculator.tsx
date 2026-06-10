import useLocalStorage from '../../hooks/useLocalStorage';
import useToast from '../../hooks/useToast';
import { createCalculator, createDefaultCalculators } from '../../constants/materials';
import type { CalculatorState } from '../../types';
import { copyToClipboard } from '../../utils/copyToClipboard';
import CalculatorRow from '../CalculatorRow/CalculatorRow';
import ResetIcon from '../icons/ResetIcon';
import PlusIcon from '../icons/PlusIcon';
import Toast from '../Toast/Toast';

const PriceCalculator = () => {
  const [calculatorState, setCalculatorState] = useLocalStorage<CalculatorState>(
    'calculatorState',
    { calculators: createDefaultCalculators() }
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
      calculators: [...prev.calculators, createCalculator()],
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

  return (
    <div className="flex items-start gap-2 w-full">
      <section className="glass-container flex-col gap-3 flex-1 min-w-0">
        {calculatorState.calculators.length === 0 ? (
          <p className="text-sm text-white/60 text-center py-6">
            No materials yet. Click &quot;Add row&quot; to get started.
          </p>
        ) : (
          <div className="w-full">
            {calculatorState.calculators.map((calculator) => (
              <CalculatorRow
                key={calculator.id}
                setCalculatorState={setCalculatorState}
                calculator={calculator}
                onRemove={removeRow}
                onCopy={handleCopy}
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 w-full pt-3 border-t border-white/10">
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
