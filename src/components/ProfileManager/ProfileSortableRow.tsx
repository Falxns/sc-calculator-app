import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLocale } from '../../context/LocaleContext';
import type { CalculatorProfile } from '../../types';
import DragHandle from '../DragHandle/DragHandle';
import CopyIcon from '../icons/CopyIcon';
import EditIcon from '../icons/EditIcon';
import TrashIcon from '../icons/TrashIcon';

const squareBtnClass =
  'btn w-7 h-7 min-w-7 p-0 shrink-0 flex items-center justify-center';

interface ProfileSortableRowProps {
  profile: CalculatorProfile;
  isActive: boolean;
  dragDisabled: boolean;
  canRemove: boolean;
  onEdit: (profile: CalculatorProfile) => void;
  onDuplicate: (profile: CalculatorProfile) => void;
  onRemove: (profileId: string) => void;
}

const ProfileSortableRow = ({
  profile,
  isActive,
  dragDisabled,
  canRemove,
  onEdit,
  onDuplicate,
  onRemove,
}: ProfileSortableRowProps) => {
  const { t } = useLocale();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: profile.id, disabled: dragDisabled });

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
          label={profile.name}
          disabled={dragDisabled}
          setActivatorNodeRef={setActivatorNodeRef}
          listeners={listeners}
          attributes={attributes}
        />
        <div className="flex-1 min-w-0">
          <span className="block truncate">{profile.name}</span>
          <span className="text-xs text-white/50">
            {t('profile.rowCount', { count: profile.calculators.length })}
            {isActive ? ` · ${t('profile.active')}` : ''}
          </span>
        </div>
        <button
          type="button"
          className={squareBtnClass}
          aria-label={t('profile.rename', { name: profile.name })}
          onClick={() => onEdit(profile)}
        >
          <EditIcon className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          className={squareBtnClass}
          aria-label={t('profile.duplicate', { name: profile.name })}
          onClick={() => onDuplicate(profile)}
        >
          <CopyIcon className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          className={squareBtnClass}
          aria-label={t('profile.delete', { name: profile.name })}
          disabled={!canRemove}
          onClick={() => onRemove(profile.id)}
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </li>
  );
};

export default ProfileSortableRow;
