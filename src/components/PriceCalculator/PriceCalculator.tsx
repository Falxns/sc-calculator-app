import useLocalStorage from '../../hooks/useLocalStorage';
import type { CalculatorState } from '../../types';
import CalculatorRow from '../CalculatorRow/CalculatorRow';
import ResetIcon from '../icons/ResetIcon';

const PriceCalculator = () => {
  const [calculatorState, setCalculatorState] = useLocalStorage<CalculatorState>(
    'calculatorState',
    {
      calculators: [
        { id: crypto.randomUUID(), imgSrc: 'slastena', price: 9000, quantity: 0 },
        { id: crypto.randomUUID(), imgSrc: 'solevik', price: 2000, quantity: 0 },
        { id: crypto.randomUUID(), imgSrc: 'kub', price: 2000, quantity: 0 },
        { id: crypto.randomUUID(), imgSrc: 'limonnik', price: 2000, quantity: 0 },
        { id: crypto.randomUUID(), imgSrc: 'spirten', price: 400, quantity: 0 },
        { id: crypto.randomUUID(), imgSrc: 'myatnoplod', price: 150, quantity: 0 },
      ],
    }
  );

  const total = calculatorState.calculators.reduce(
    (acc, calc) => acc + calc.price * calc.quantity,
    0
  );

  const resetAllQuantities = () => {
    setCalculatorState((prev) => ({
      ...prev,
      calculators: prev.calculators.map((calc) => ({ ...calc, quantity: 0 })),
    }));
  };

  return (
    <section className="glass-container gap-4 w-full flex-col">
      {calculatorState.calculators.map((calculator) => (
        <CalculatorRow
          key={calculator.id}
          setCalculatorState={setCalculatorState}
          calculator={calculator}
        />
      ))}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full p-2">
        <p className="text-2xl font-bold">Total: {total.toLocaleString()}</p>
        <button
          type="button"
          className="btn w-auto p-2"
          aria-label="Reset all quantities"
          onClick={resetAllQuantities}
        >
          <ResetIcon className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};

export default PriceCalculator;
