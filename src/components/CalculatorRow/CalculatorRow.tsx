import React from 'react';
import ResetIcon from '../icons/ResetIcon';
import type { Calculator, CalculatorState } from '../../types';

interface CalculatorRowProps {
  setCalculatorState: React.Dispatch<React.SetStateAction<CalculatorState>>;
  calculator: Calculator;
}

const CalculatorRow = ({ calculator, setCalculatorState }: CalculatorRowProps) => {
  const { id, imgSrc, price, quantity } = calculator;

  const rejectRawInput = (raw: string) =>
    raw.includes('-') || raw.includes('+') || raw.includes('e') || raw.includes('E');

  const excludeSpecialCharacters = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', 'e', 'E', '+'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, key: 'price' | 'quantity') => {
    const raw = e.target.value;
    if (rejectRawInput(raw)) {
      return;
    }
    const nextValue = raw === '' ? 0 : Number(raw);
    setCalculatorState((prev) => ({
      ...prev,
      calculators: prev.calculators.map((calc) =>
        calc.id === id ? { ...calc, [key]: nextValue } : calc
      ),
    }));
  };

  const resetQuantity = () => {
    setCalculatorState((prev) => ({
      ...prev,
      calculators: prev.calculators.map((calc) =>
        calc.id === id ? { ...calc, quantity: 0 } : calc
      ),
    }));
  };

  return (
    <div className="glass-container bg-transparent flex-col sm:flex-row gap-2 w-full p-2">
      <img
        src={`${import.meta.env.BASE_URL}assets/${imgSrc}.png`}
        alt={imgSrc}
        className="w-12 h-12"
      />
      <input
        className="input w-32 text-center"
        type="number"
        value={price === 0 ? '' : price}
        placeholder="Price"
        aria-label={`Price for ${imgSrc}`}
        onChange={(e) => {
          handleChange(e, 'price');
        }}
        onKeyDown={excludeSpecialCharacters}
      />
      <input
        className="input w-32 text-center"
        type="number"
        value={quantity === 0 ? '' : quantity}
        placeholder="Quantity"
        aria-label={`Quantity for ${imgSrc}`}
        onChange={(e) => {
          handleChange(e, 'quantity');
        }}
        onKeyDown={excludeSpecialCharacters}
      />
      <p className="text-base font-bold">Subtotal: {(price * quantity).toLocaleString()}</p>
      <button
        type="button"
        className="btn w-auto p-2"
        aria-label="Reset quantity"
        onClick={resetQuantity}
      >
        <ResetIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default CalculatorRow;
