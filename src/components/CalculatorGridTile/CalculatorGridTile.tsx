import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLocale } from '../../context/LocaleContext';
import EditIcon from '../icons/EditIcon';
import TrashIcon from '../icons/TrashIcon';
import MaterialSelect from '../MaterialSelect/MaterialSelect';
import type { Calculator, Material } from '../../types';
import { findMaterial, getMaterialImageSrc } from '../../utils/materialImage';

interface CalculatorGridTileProps {
  materials: Material[];
  calculator: Calculator;
  onFieldChange: (id: string, key: 'price' | 'quantity', value: number) => void;
  onMaterialChange: (id: string, materialId: string) => void;
  onRemove: (id: string) => void;
}

const tileActionClass =
  'calc-btn w-6 h-6 min-w-6 p-0 flex items-center justify-center opacity-70 hover:opacity-100';

const CalculatorGridTile = ({
  materials,
  calculator,
  onFieldChange,
  onMaterialChange,
  onRemove,
}: CalculatorGridTileProps) => {
  const { t } = useLocale();
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
    onFieldChange(id, key, raw === '' ? 0 : Number(raw));
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      title={materialName}
      className={`calc-tile relative flex flex-col items-stretch gap-1 p-2 pt-1.5 min-w-0 ${
        isDragging ? 'relative shadow-lg' : ''
      } ${hasQuantity ? 'ring-1 ring-white/25' : ''}`}
    >
      <div className="absolute top-1 inset-x-1 z-10 flex justify-between pointer-events-none">
        <MaterialSelect
          materials={materials}
          value={materialId}
          ariaLabel={t('calc.materialFor', { name: materialName })}
          className="pointer-events-auto"
          onChange={(nextMaterialId) => onMaterialChange(id, nextMaterialId)}
          renderTrigger={({ isOpen, toggle }) => (
            <button
              type="button"
              className={tileActionClass}
              aria-label={t('calc.changeMaterial')}
              aria-haspopup="listbox"
              aria-expanded={isOpen}
              onClick={toggle}
            >
              <EditIcon className="w-3 h-3" />
            </button>
          )}
        />
        <button
          type="button"
          className={`${tileActionClass} pointer-events-auto`}
          aria-label={t('calc.removeRow')}
          onClick={() => onRemove(id)}
        >
          <TrashIcon className="w-3 h-3" />
        </button>
      </div>

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
        className="calc-control py-1 px-1 text-xs text-center w-full min-w-0"
        type="number"
        value={price === 0 ? '' : price}
        placeholder={t('common.price')}
        aria-label={t('calc.priceFor', { name: materialName })}
        onChange={(e) => handleChange(e, 'price')}
        onKeyDown={excludeSpecialCharacters}
      />
      <input
        className={`calc-control py-1 px-1 text-xs text-center w-full min-w-0 ${
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

export default memo(CalculatorGridTile);
