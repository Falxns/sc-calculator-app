import useLocalStorage from '../../hooks/useLocalStorage';
import type { CalculatorState } from '../../types';
import slastena from '../../assets/slastena.svg';

const PriceCalculator = () => {
  const [calculatorState, setCalculatorState] = useLocalStorage<CalculatorState>(
    'calculatorState',
    {
      price: 0,
      quantity: 0,
      total: 0,
    }
  );

  return (
    <div className="flex justify-center items-center gap-2 bg-gray-700 text-gray-200 p-2 rounded-2xl">
      <img src={slastena} alt="Slastena" className="w-16 h-16" />
      <input
        className="text-base text-black text-center p-2 rounded-md w-24 border-2 border-gray-500 bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
        type="number"
        value={calculatorState.price === 0 ? '' : calculatorState.price}
        placeholder="Price"
        onChange={(e) => {
          const raw = e.target.value;
          if (raw.includes('-') || raw.includes('+') || raw.includes('e') || raw.includes('E')) {
            e.preventDefault();
            return;
          }
          const nextPrice = raw === '' ? 0 : Number(raw);
          setCalculatorState((prev) => ({
            ...prev,
            price: nextPrice,
            total: nextPrice * prev.quantity,
          }));
        }}
        onKeyDown={(e) => {
          if (['-', 'e', 'E', '+'].includes(e.key)) {
            e.preventDefault();
          }
        }}
      />
      <input
        className="text-base text-black text-center p-2 rounded-md w-24 border-2 border-gray-500 bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
        type="number"
        value={calculatorState.quantity === 0 ? '' : calculatorState.quantity}
        placeholder="Quantity"
        onChange={(e) => {
          const raw = e.target.value;
          if (raw.includes('-') || raw.includes('+') || raw.includes('e') || raw.includes('E')) {
            e.preventDefault();
            return;
          }
          const nextQuantity = raw === '' ? 0 : Number(raw);
          setCalculatorState((prev) => ({
            ...prev,
            quantity: nextQuantity,
            total: prev.price * nextQuantity,
          }));
        }}
        onKeyDown={(e) => {
          if (['-', 'e', 'E', '+'].includes(e.key)) {
            e.preventDefault();
          }
        }}
      />
      <p className="text-base font-bold">Total: {calculatorState.total}</p>
      <button
        className="text-base text-black text-center p-2 rounded-md w-20 border-2 border-gray-500 bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => {
          setCalculatorState({
            price: 0,
            quantity: 0,
            total: 0,
          });
        }}
      >
        Clear
      </button>
    </div>
  );
};

export default PriceCalculator;
