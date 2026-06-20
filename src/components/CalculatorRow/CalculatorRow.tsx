import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLocale } from '../../context/LocaleContext';
import ResetIcon from '../icons/ResetIcon';
import TrashIcon from '../icons/TrashIcon';
import DragHandle from '../DragHandle/DragHandle';
import MaterialSelect from '../MaterialSelect/MaterialSelect';
import type { Calculator, CalculatorState, Material } from '../../types';
import { findMaterial, getMaterialImageSrc } from '../../utils/materialImage';

interface CalculatorRowProps {
  materials: Material[];
  setCalculatorState: React.Dispatch<React.SetStateAction<CalculatorState>>;
  calculator: Calculator;
  onRemove: (id: string) => void;
  onCopy: (value: number) => void;
}

const CalculatorRow = ({
  materials,
  calculator,
  setCalculatorState,
  onRemove,
  onCopy,
}: CalculatorRowProps) => {
  const { t } = useLocale();
  const { id, materialId, price, quantity } = calculator;
  const material = findMaterial(materials, materialId);
  const materialName = material?.label ?? materialId;
  const subtotal = price * quantity;
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

  const handleMaterialChange = (nextMaterialId: string) => {
    const nextMaterial = findMaterial(materials, nextMaterialId);
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

  const resetQuantity = () => {
    setCalculatorState((prev) => ({
      ...prev,
      calculators: prev.calculators.map((calc) =>
        calc.id === id ? { ...calc, quantity: 0 } : calc
      ),
    }));
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-wrap items-center gap-2 py-2 first:pt-0 last:pb-0 w-full sm:grid sm:grid-cols-[auto_auto_minmax(7rem,1.2fr)_minmax(5rem,1fr)_minmax(4rem,0.8fr)_minmax(6rem,1.2fr)_auto] sm:gap-x-3 sm:gap-y-0 ${
        isDragging ? 'relative' : ''
      }`}
    >
      <DragHandle
        label={materialName}
        setActivatorNodeRef={setActivatorNodeRef}
        listeners={listeners}
        attributes={attributes}
      />
      {imageSrc ? (
        <img src={imageSrc} alt={materialName} className="w-9 h-9 shrink-0" />
      ) : (
        <span className="w-9 h-9 shrink-0 rounded-lg bg-white/10" aria-hidden />
      )}
      <MaterialSelect
        materials={materials}
        value={materialId}
        ariaLabel={t('calc.materialFor', { name: materialName })}
        className="w-full min-w-[7rem] flex-1 sm:flex-none sm:min-w-0"
        onChange={handleMaterialChange}
      />
      <input
        className="input py-2 text-base text-center w-full min-w-[5rem] flex-1 sm:flex-none sm:min-w-0"
        type="number"
        value={price === 0 ? '' : price}
        placeholder={t('common.price')}
        aria-label={t('calc.priceFor', { name: materialName })}
        onChange={(e) => handleChange(e, 'price')}
        onKeyDown={excludeSpecialCharacters}
      />
      <input
        className="input py-2 text-base text-center w-full min-w-[4rem] flex-1 sm:flex-none sm:min-w-0"
        type="number"
        value={quantity === 0 ? '' : quantity}
        placeholder={t('common.qty')}
        aria-label={t('calc.quantityFor', { name: materialName })}
        onChange={(e) => handleChange(e, 'quantity')}
        onKeyDown={excludeSpecialCharacters}
      />
      <button
        type="button"
        className="copyable text-base font-semibold text-center w-full min-w-[5rem] flex-1 sm:flex-none sm:min-w-0 py-2"
        aria-label={t('calc.copySubtotal', { subtotal })}
        onClick={() => onCopy(subtotal)}
      >
        {subtotal.toLocaleString()}
      </button>
      <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
        <button
          type="button"
          className="btn w-auto p-1.5"
          aria-label={t('calc.resetQuantity')}
          onClick={resetQuantity}
        >
          <ResetIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="btn w-auto p-1.5"
          aria-label={t('calc.removeRow')}
          onClick={() => onRemove(id)}
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CalculatorRow;
