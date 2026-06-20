import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Calculator, CalculatorState, Material } from '../../types';
import { findMaterial, getMaterialImageSrc } from '../../utils/materialImage';

interface CalculatorGridTileProps {
  materials: Material[];
  calculator: Calculator;
  setCalculatorState: React.Dispatch<React.SetStateAction<CalculatorState>>;
}

const CalculatorGridTile = ({
  materials,
  calculator,
  setCalculatorState,
}: CalculatorGridTileProps) => {
  const { id, materialId, price, quantity } = calculator;
  const material = findMaterial(materials, materialId);
  const imageSrc = getMaterialImageSrc(material);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
    opacity: isDragging ? 0.85 : undefined,
  };

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      title={material?.label ?? materialId}
      className={`glass-effect flex flex-col items-center gap-1.5 p-2 min-w-0 ${
        isDragging ? 'relative' : ''
      }`}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        className="cursor-grab active:cursor-grabbing touch-none p-0.5 rounded-lg hover:bg-white/10"
        aria-label={`Drag to reorder ${material?.label ?? materialId}`}
        {...listeners}
        {...attributes}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={material?.label ?? materialId}
            className="w-10 h-10 object-contain pointer-events-none"
          />
        ) : (
          <span className="w-10 h-10 rounded-lg bg-white/10 block" aria-hidden />
        )}
      </button>
      <input
        className="input py-1 px-1 text-xs text-center w-full min-w-0"
        type="number"
        value={price === 0 ? '' : price}
        placeholder="Price"
        aria-label={`Price for ${material?.label ?? materialId}`}
        onChange={(e) => handleChange(e, 'price')}
        onKeyDown={excludeSpecialCharacters}
      />
      <input
        className="input py-1 px-1 text-xs text-center w-full min-w-0"
        type="number"
        value={quantity === 0 ? '' : quantity}
        placeholder="Qty"
        aria-label={`Quantity for ${material?.label ?? materialId}`}
        onChange={(e) => handleChange(e, 'quantity')}
        onKeyDown={excludeSpecialCharacters}
      />
    </div>
  );
};

export default CalculatorGridTile;
