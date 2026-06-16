import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { CalculatorProfile } from '../../types';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import Modal from '../Modal/Modal';
import PlusIcon from '../icons/PlusIcon';
import TrashIcon from '../icons/TrashIcon';
import { SECTION_SIDE_WIDTH, sideActionButtonClass } from '../../constants/layout';

interface ProfileToolbarProps {
  profiles: CalculatorProfile[];
  activeProfileId: string;
  onSwitch: (profileId: string) => void;
  onAdd: (name: string) => void;
  onDelete: (profileId: string) => void;
  suggestProfileName: () => string;
}

const iconButtonClass = `${sideActionButtonClass} self-end`;

const ProfileToolbar = ({
  profiles,
  activeProfileId,
  onSwitch,
  onAdd,
  onDelete,
  suggestProfileName,
}: ProfileToolbarProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const canDelete = profiles.length > 1;

  const openAddModal = () => {
    setNewProfileName(suggestProfileName());
    setIsAdding(true);
  };

  const closeAddModal = () => {
    setIsAdding(false);
    setNewProfileName('');
  };

  const confirmAdd = () => {
    const trimmedName = newProfileName.trim();
    if (!trimmedName) return;
    onAdd(trimmedName);
    closeAddModal();
  };

  const requestDelete = () => {
    if (!canDelete || !activeProfileId) return;
    setPendingDeleteId(activeProfileId);
  };

  const confirmDelete = () => {
    if (pendingDeleteId) onDelete(pendingDeleteId);
    setPendingDeleteId(null);
  };

  return (
    <>
      <div
        className="flex flex-col gap-1.5 shrink-0 mt-4"
        style={{ width: SECTION_SIDE_WIDTH }}
      >
        <label className="sr-only" htmlFor="calculator-profile">
          Calculator profile
        </label>
        <select
          id="calculator-profile"
          className="input py-2 px-2 text-xs w-full leading-tight truncate cursor-pointer"
          value={activeProfileId}
          title={activeProfile?.name}
          onChange={(e) => onSwitch(e.target.value)}
        >
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={iconButtonClass}
          aria-label="Add profile"
          onClick={openAddModal}
        >
          <PlusIcon className="w-6 h-6" />
        </button>
        <button
          type="button"
          className={iconButtonClass}
          aria-label={`Delete profile ${activeProfile?.name ?? ''}`}
          disabled={!canDelete}
          onClick={requestDelete}
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      <Modal isOpen={isAdding} onClose={closeAddModal} title="New profile">
        <div className="flex flex-col gap-3 w-full">
          <input
            className="input py-2 px-3 text-sm w-full"
            type="text"
            value={newProfileName}
            placeholder="Profile name"
            aria-label="New profile name"
            autoFocus
            onChange={(e) => setNewProfileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmAdd();
            }}
          />
          <div className="flex gap-2">
            <button type="button" className="btn w-auto flex-1 py-2 text-sm" onClick={closeAddModal}>
              Cancel
            </button>
            <button type="button" className="btn w-auto flex-1 py-2 text-sm" onClick={confirmAdd}>
              Save
            </button>
          </div>
        </div>
      </Modal>

      {createPortal(
        <ConfirmModal
          isOpen={pendingDeleteId !== null}
          message={`Delete profile "${profiles.find((p) => p.id === pendingDeleteId)?.name ?? ''}"?`}
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setPendingDeleteId(null)}
        />,
        document.body
      )}
    </>
  );
};

export default ProfileToolbar;
