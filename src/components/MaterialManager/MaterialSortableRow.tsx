import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Material } from '../../types';
import { getMaterialImageSrc } from '../../utils/materialImage';
import DragHandle from '../DragHandle/DragHandle';
import EditIcon from '../icons/EditIcon';

const squareBtnClass =
  'btn w-7 h-7 min-w-7 p-0 shrink-0 flex items-center justify-center';

interface MaterialSortableRowProps {
  material: Material;
  dragDisabled: boolean;
  canRemove: boolean;
  onEdit: (material: Material) => void;
  onRemove: (materialId: string) => void;
}

const MaterialSortableRow = ({
  material,
  dragDisabled,
  canRemove,
  onEdit,
  onRemove,
}: MaterialSortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: material.id, disabled: dragDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
    opacity: isDragging ? 0.85 : undefined,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`py-2 first:pt-0 last:pb-0 ${isDragging ? 'relative' : ''}`}
    >
      <div className="flex items-center gap-2 text-sm">
        <DragHandle
          label={material.label}
          disabled={dragDisabled}
          setActivatorNodeRef={setActivatorNodeRef}
          listeners={listeners}
          attributes={attributes}
        />
        {getMaterialImageSrc(material) ? (
          <img src={getMaterialImageSrc(material)} alt="" className="w-6 h-6 shrink-0" />
        ) : (
          <span className="w-6 h-6 shrink-0 rounded bg-white/10" />
        )}
        <span className="flex-1 min-w-0 truncate">{material.label}</span>
        <span className="text-white/60 shrink-0">
          {material.defaultPrice.toLocaleString()}
        </span>
        <button
          type="button"
          className={squareBtnClass}
          aria-label={`Edit ${material.label}`}
          onClick={() => onEdit(material)}
        >
          <EditIcon className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          className={`${squareBtnClass} text-base leading-none`}
          aria-label={`Remove ${material.label}`}
          disabled={!canRemove}
          onClick={() => onRemove(material.id)}
        >
          ×
        </button>
      </div>
    </li>
  );
};

export default MaterialSortableRow;
