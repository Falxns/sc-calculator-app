import useLocalStorage from '../../hooks/useLocalStorage';
import useToast from '../../hooks/useToast';
import { createCalculator, createDefaultCalculators } from '../../constants/materials';
import type { CalculatorState } from '../../types';
import { copyToClipboard } from '../../utils/copyToClipboard';
import CalculatorRow from '../CalculatorRow/CalculatorRow';
import ResetIcon from '../icons/ResetIcon';
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
    <section className="glass-container flex-col gap-4 w-full">
      <div className="flex items-center justify-between w-full gap-2">
        <h2 className="text-lg font-semibold">Calculator</h2>
        <button type="button" className="btn w-auto text-sm" onClick={addRow}>
          Add row
        </button>
      </div>

      {calculatorState.calculators.length === 0 ? (
        <p className="text-base font-medium text-white/70 text-center py-4">
          No materials yet. Click &quot;Add row&quot; to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
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

      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full pt-2 border-t border-white/10">
        <span className="text-sm text-white/70">Total:</span>
        <button
          type="button"
          className="copyable text-xl font-bold hover:text-white/80 transition-colors"
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
  );
};

export default PriceCalculator;
