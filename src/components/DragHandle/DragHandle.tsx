import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { useLocale } from '../../context/LocaleContext';
import GripIcon from '../icons/GripIcon';

interface DragHandleProps {
  label: string;
  disabled?: boolean;
  setActivatorNodeRef: (element: HTMLElement | null) => void;
  listeners: SyntheticListenerMap | undefined;
  attributes: DraggableAttributes;
}

const DragHandle = ({
  label,
  disabled,
  setActivatorNodeRef,
  listeners,
  attributes,
}: DragHandleProps) => {
  const { t } = useLocale();

  return (
    <button
      type="button"
      ref={setActivatorNodeRef}
      className="btn w-7 h-7 min-w-7 p-0 shrink-0 flex items-center justify-center cursor-grab active:cursor-grabbing disabled:opacity-30 disabled:cursor-not-allowed touch-none"
      aria-label={t('drag.reorder', { label })}
      disabled={disabled}
      {...listeners}
      {...attributes}
    >
      <GripIcon className="w-4 h-4 text-white/70" />
    </button>
  );
};

export default DragHandle;
