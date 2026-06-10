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

  const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextImgSrc = e.target.value;
    const material = MATERIALS.find((m) => m.imgSrc === nextImgSrc);
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

  const handleCopySubtotal = () => {
    onCopy(subtotal);
  };

  return (
    <div className="glass-effect flex flex-col gap-2 p-2 w-full">
      <div className="flex items-center gap-2">
        <img
          src={`${import.meta.env.BASE_URL}assets/${imgSrc}.png`}
          alt={imgSrc}
          className="w-8 h-8 shrink-0"
        />
        <select
          className="input flex-1 min-w-0 py-1.5 text-sm"
          value={imgSrc}
          aria-label={`Material for row ${imgSrc}`}
          onChange={handleMaterialChange}
        >
          {MATERIALS.map((material) => (
            <option key={material.imgSrc} value={material.imgSrc}>
              {material.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          className="input w-full min-w-0 py-1.5 text-sm text-center"
          type="number"
          value={price === 0 ? '' : price}
          placeholder="Price"
          aria-label={`Price for ${imgSrc}`}
          onChange={(e) => handleChange(e, 'price')}
          onKeyDown={excludeSpecialCharacters}
        />
        <input
          className="input w-full min-w-0 py-1.5 text-sm text-center"
          type="number"
          value={quantity === 0 ? '' : quantity}
          placeholder="Qty"
          aria-label={`Quantity for ${imgSrc}`}
          onChange={(e) => handleChange(e, 'quantity')}
          onKeyDown={excludeSpecialCharacters}
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className="copyable text-sm font-bold hover:text-white/80 transition-colors"
          aria-label={`Copy subtotal ${subtotal}`}
          onClick={handleCopySubtotal}
        >
          {subtotal.toLocaleString()}
        </button>
        <div className="flex items-center gap-1">
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
    </div>
  );
};

export default CalculatorRow;
