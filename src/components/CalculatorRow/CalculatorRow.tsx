import React from 'react';
import { MATERIALS } from '../../constants/materials';
import ResetIcon from '../icons/ResetIcon';
import TrashIcon from '../icons/TrashIcon';
import type { Calculator, CalculatorState } from '../../types';

interface CalculatorRowProps {
  setCalculatorState: React.Dispatch<React.SetStateAction<CalculatorState>>;
  calculator: Calculator;
  onRemove: (id: string) => void;
  onCopy: (value: number) => void;
}

const CalculatorRow = ({
  calculator,
  setCalculatorState,
  onRemove,
  onCopy,
}: CalculatorRowProps) => {
  const { id, imgSrc, price, quantity } = calculator;
  const subtotal = price * quantity;

  const rejectRawInput = (raw: string) =>
    raw.includes('-') || raw.includes('+') || raw.includes('e') || raw.includes('E');

  const excludeSpecialCharacters = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', 'e', 'E', '+'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, key: 'price' | 'quantity') => {
    const raw = e.target.value;
    if (rejectRawInput(raw)) return;

    const nextValue = raw === '' ? 0 : Number(raw);
    setCalculatorState((prev) => ({
      ...prev,
      calculators: prev.calculators.map((calc) =>
        calc.id === id ? { ...calc, [key]: nextValue } : calc
      ),
    }));
  };

  const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const material = MATERIALS.find((m) => m.imgSrc === e.target.value);
    if (!material) return;

    setCalculatorState((prev) => ({
      ...prev,
      calculators: prev.calculators.map((calc) =>
        calc.id === id
          ? { ...calc, imgSrc: material.imgSrc, price: material.defaultPrice }
          : calc
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
    <div className="flex flex-wrap items-center gap-2 py-2.5 border-b border-white/10 last:border-b-0 w-full sm:grid sm:grid-cols-[auto_minmax(7rem,1.2fr)_minmax(5rem,1fr)_minmax(4rem,0.8fr)_minmax(6rem,1.2fr)_auto] sm:gap-x-3 sm:gap-y-0">
      <img
        src={`${import.meta.env.BASE_URL}assets/${imgSrc}.png`}
        alt={imgSrc}
        className="w-9 h-9 shrink-0"
      />
      <select
        className="input py-2 px-2 text-sm w-full min-w-[7rem] flex-1 sm:flex-none sm:min-w-0"
        value={imgSrc}
        aria-label={`Material for ${imgSrc}`}
        onChange={handleMaterialChange}
      >
        {MATERIALS.map((material) => (
          <option key={material.imgSrc} value={material.imgSrc}>
            {material.label}
          </option>
        ))}
      </select>
      <input
        className="input py-2 text-base text-center w-full min-w-[5rem] flex-1 sm:flex-none sm:min-w-0"
        type="number"
        value={price === 0 ? '' : price}
        placeholder="Price"
        aria-label={`Price for ${imgSrc}`}
        onChange={(e) => handleChange(e, 'price')}
        onKeyDown={excludeSpecialCharacters}
      />
      <input
        className="input py-2 text-base text-center w-full min-w-[4rem] flex-1 sm:flex-none sm:min-w-0"
        type="number"
        value={quantity === 0 ? '' : quantity}
        placeholder="Qty"
        aria-label={`Quantity for ${imgSrc}`}
        onChange={(e) => handleChange(e, 'quantity')}
        onKeyDown={excludeSpecialCharacters}
      />
      <button
        type="button"
        className="copyable text-base font-semibold text-center w-full min-w-[5rem] flex-1 sm:flex-none sm:min-w-0 py-2"
        aria-label={`Copy subtotal ${subtotal}`}
        onClick={() => onCopy(subtotal)}
      >
        {subtotal.toLocaleString()}
      </button>
      <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
        <button
          type="button"
          className="btn w-auto p-1.5"
          aria-label="Reset quantity"
          onClick={resetQuantity}
        >
          <ResetIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="btn w-auto p-1.5"
          aria-label="Remove row"
          onClick={() => onRemove(id)}
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CalculatorRow;
