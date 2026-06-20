import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useLocale } from '../../context/LocaleContext';
import useSortableSensors from '../../hooks/useSortableSensors';
import type { CalculatorProfile } from '../../types';
import { createUniqueProfileName } from '../../utils/calculatorProfiles';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import ProfileSortableRow from './ProfileSortableRow';
import PlusIcon from '../icons/PlusIcon';

interface ProfileManagerProps {
  profiles: CalculatorProfile[];
  activeProfileId: string;
  onReorder: (profiles: CalculatorProfile[]) => void;
  onRename: (profileId: string, name: string) => void;
  onDuplicate: (profileId: string, name: string) => void;
  onDelete: (profileId: string) => void;
  onAdd: (name: string) => void;
}

const ProfileManager = ({
  profiles,
  activeProfileId,
  onReorder,
  onRename,
  onDuplicate,
  onDelete,
  onAdd,
}: ProfileManagerProps) => {
  const { t } = useLocale();
  const sensors = useSortableSensors();

  const [label, setLabel] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const resetAddForm = () => setLabel('');

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel('');
  };

  const startEdit = (profile: CalculatorProfile) => {
    setEditingId(profile.id);
    setEditLabel(profile.name);
  };

  const handleAddProfile = () => {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) return;
    onAdd(trimmedLabel);
    resetAddForm();
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const trimmedLabel = editLabel.trim();
    if (!trimmedLabel) return;
    onRename(editingId, trimmedLabel);
    cancelEdit();
  };

  const handleDuplicate = (profile: CalculatorProfile) => {
    const name = createUniqueProfileName(
      `${profile.name} ${t('profile.copySuffix')}`,
      profiles.map((p) => p.name)
    );
    onDuplicate(profile.id, name);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || editingId) return;

    const oldIndex = profiles.findIndex((p) => p.id === active.id);
    const newIndex = profiles.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(arrayMove(profiles, oldIndex, newIndex));
  };

  const confirmDelete = () => {
    if (pendingDeleteId) onDelete(pendingDeleteId);
    setPendingDeleteId(null);
  };

  const pendingDeleteName = profiles.find((p) => p.id === pendingDeleteId)?.name ?? '';
  const profileIds = profiles.map((p) => p.id);
  const dragDisabled = editingId !== null;

  return (
    <div className="flex flex-col gap-3 w-full">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={profileIds} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col divide-y divide-white/10">
            {profiles.map((profile) =>
              editingId === profile.id ? (
                <li key={profile.id} className="py-2 first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-2">
                    <input
                      className="input py-1.5 px-2 text-sm w-full"
                      type="text"
                      value={editLabel}
                      aria-label={t('profile.namePlaceholder')}
                      autoFocus
                      onChange={(e) => setEditLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                      }}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        className="btn w-auto py-1.5 px-3 text-sm"
                        onClick={cancelEdit}
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        type="button"
                        className="btn w-auto py-1.5 px-3 text-sm"
                        onClick={handleSaveEdit}
                      >
                        {t('common.save')}
                      </button>
                    </div>
                  </div>
                </li>
              ) : (
                <ProfileSortableRow
                  key={profile.id}
                  profile={profile}
                  isActive={profile.id === activeProfileId}
                  dragDisabled={dragDisabled}
                  canRemove={profiles.length > 1}
                  onEdit={startEdit}
                  onDuplicate={handleDuplicate}
                  onRemove={setPendingDeleteId}
                />
              )
            )}
            <li className="pt-2">
              <div className="flex items-end gap-2">
                <input
                  className="input py-1.5 px-2 text-sm flex-1 min-w-0"
                  type="text"
                  placeholder={t('profile.namePlaceholder')}
                  value={label}
                  aria-label={t('profile.namePlaceholder')}
                  onChange={(e) => setLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddProfile();
                  }}
                />
                <button
                  type="button"
                  className="btn w-9 h-9 min-w-9 p-0 shrink-0 flex items-center justify-center"
                  aria-label={t('profile.add')}
                  onClick={handleAddProfile}
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
            </li>
          </ul>
        </SortableContext>
      </DndContext>

      {createPortal(
        <ConfirmModal
          isOpen={pendingDeleteId !== null}
          message={t('profile.deleteConfirm', { name: pendingDeleteName })}
          confirmLabel={t('common.delete')}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDeleteId(null)}
        />,
        document.body
      )}
    </div>
  );
};

export default ProfileManager;
