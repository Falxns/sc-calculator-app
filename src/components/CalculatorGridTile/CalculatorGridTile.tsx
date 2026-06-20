import React, { useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLocale } from '../../context/LocaleContext';
import EditIcon from '../icons/EditIcon';
import TrashIcon from '../icons/TrashIcon';
import type { Calculator, CalculatorState, Material } from '../../types';
import { findMaterial, getMaterialImageSrc } from '../../utils/materialImage';

interface CalculatorGridTileProps {
  materials: Material[];
  calculator: Calculator;
  setCalculatorState: React.Dispatch<React.SetStateAction<CalculatorState>>;
  onRemove: (id: string) => void;
}

const tileActionClass =
  'btn w-6 h-6 min-w-6 p-0 flex items-center justify-center opacity-70 hover:opacity-100';

const CalculatorGridTile = ({
  materials,
  calculator,
  setCalculatorState,
  onRemove,
}: CalculatorGridTileProps) => {
  const { t } = useLocale();
  const materialSelectRef = useRef<HTMLSelectElement>(null);
  const { id, materialId, price, quantity } = calculator;
  const material = findMaterial(materials, materialId);
  const materialName = material?.label ?? materialId;
  const imageSrc = getMaterialImageSrc(material);
  const hasQuantity = quantity > 0;

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
    zIndex: isDragging ? 2 : undefined,
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

  const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextMaterial = findMaterial(materials, e.target.value);
    if (!nextMaterial) return;

    setCalculatorState((prev) => ({
      ...prev,
      calculators: prev.calculators.map((calc) =>
        calc.id === id
          ? { ...calc, materialId: nextMaterial.id, price: nextMaterial.defaultPrice }
          : calc
      ),
    }));
  };

  const openMaterialPicker = () => {
    const el = materialSelectRef.current;
    if (!el) return;
    if ('showPicker' in el && typeof el.showPicker === 'function') {
      el.showPicker();
    } else {
      el.click();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      title={materialName}
      className={`glass-effect relative flex flex-col items-stretch gap-1 p-2 pt-1.5 min-w-0 ${
        isDragging ? 'relative shadow-lg' : ''
      } ${hasQuantity ? 'ring-1 ring-white/25' : ''}`}
    >
      <div className="absolute top-1 inset-x-1 z-10 flex justify-between pointer-events-none">
        <button
          type="button"
          className={`${tileActionClass} pointer-events-auto`}
          aria-label={t('calc.changeMaterial')}
          onClick={openMaterialPicker}
        >
          <EditIcon className="w-3 h-3" />
        </button>
        <button
          type="button"
          className={`${tileActionClass} pointer-events-auto`}
          aria-label={t('calc.removeRow')}
          onClick={() => onRemove(id)}
        >
          <TrashIcon className="w-3 h-3" />
        </button>
      </div>

      <select
        ref={materialSelectRef}
        className="sr-only"
        value={materialId}
        tabIndex={-1}
        aria-label={t('calc.materialFor', { name: materialName })}
        onChange={handleMaterialChange}
      >
        {materials.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        ref={setActivatorNodeRef}
        className="cursor-grab active:cursor-grabbing touch-none self-center p-0.5 rounded-lg hover:bg-white/10 mt-4"
        aria-label={t('drag.reorder', { label: materialName })}
        {...listeners}
        {...attributes}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt=""
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
        placeholder={t('common.price')}
        aria-label={t('calc.priceFor', { name: materialName })}
        onChange={(e) => handleChange(e, 'price')}
        onKeyDown={excludeSpecialCharacters}
      />
      <input
        className={`input py-1 px-1 text-xs text-center w-full min-w-0 ${
          hasQuantity ? 'ring-1 ring-white/30' : ''
        }`}
        type="number"
        value={quantity === 0 ? '' : quantity}
        placeholder={t('common.qty')}
        aria-label={t('calc.quantityFor', { name: materialName })}
        onChange={(e) => handleChange(e, 'quantity')}
        onKeyDown={excludeSpecialCharacters}
      />
    </div>
  );
};

export default CalculatorGridTile;
