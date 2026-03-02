import useLocalStorage from '../../hooks/useLocalStorage';
import type { CalculatorState } from '../../types';
import slastena from '../../assets/slastena.svg';

const PriceCalculator = () => {
  const [calculatorState, setCalculatorState] = useLocalStorage<CalculatorState>(
    'calculatorState',
    {
      price: 0,
      quantity: 0,
    }
  );

  const total = calculatorState.price * calculatorState.quantity;

  return (
    <section className="glass-container gap-4 w-full flex-col sm:flex-row">
      <img src={slastena} alt="Slastena" className="w-16 h-16" />
      <input
        id="price"
        className="input w-32 text-center"
        type="number"
        value={calculatorState.price === 0 ? '' : calculatorState.price}
        placeholder="Price"
        aria-label="Price"
        onChange={(e) => {
          const raw = e.target.value;
          if (raw.includes('-') || raw.includes('+') || raw.includes('e') || raw.includes('E')) {
            return;
          }
          const nextPrice = raw === '' ? 0 : Number(raw);
          setCalculatorState((prev) => ({
            ...prev,
            price: nextPrice,
          }));
        }}
        onKeyDown={(e) => {
          if (['-', 'e', 'E', '+'].includes(e.key)) {
            e.preventDefault();
          }
        }}
      />
      <input
        id="quantity"
        className="input w-32 text-center"
        type="number"
        value={calculatorState.quantity === 0 ? '' : calculatorState.quantity}
        placeholder="Quantity"
        aria-label="Quantity"
        onChange={(e) => {
          const raw = e.target.value;
          if (raw.includes('-') || raw.includes('+') || raw.includes('e') || raw.includes('E')) {
            return;
          }
          const nextQuantity = raw === '' ? 0 : Number(raw);
          setCalculatorState((prev) => ({
            ...prev,
            quantity: nextQuantity,
          }));
        }}
        onKeyDown={(e) => {
          if (['-', 'e', 'E', '+'].includes(e.key)) {
            e.preventDefault();
          }
        }}
      />
      <p className="text-base font-bold">Total: {total.toLocaleString()}</p>
      <button
        type="button"
        className="btn"
        onClick={() => {
          setCalculatorState({
            price: 0,
            quantity: 0,
          });
        }}
      >
        Clear
      </button>
    </section>
  );
};

export default PriceCalculator;
