import { useState } from 'react';
import { useLocale } from '../../context/LocaleContext';
import type { CalculatorProfile } from '../../types';
import Modal from '../Modal/Modal';
import ProfileManager from '../ProfileManager/ProfileManager';
import SettingsIcon from '../icons/SettingsIcon';
import { sideActionButtonClass } from '../../constants/layout';

interface ProfileSettingsProps {
  profiles: CalculatorProfile[];
  activeProfileId: string;
  onReorder: (profiles: CalculatorProfile[]) => void;
  onRename: (profileId: string, name: string) => void;
  onDuplicate: (profileId: string, name: string) => void;
  onDelete: (profileId: string) => void;
  onAdd: (name: string) => void;
}

const ProfileSettings = ({
  profiles,
  activeProfileId,
  onReorder,
  onRename,
  onDuplicate,
  onDelete,
  onAdd,
}: ProfileSettingsProps) => {
  const { t } = useLocale();
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={sideActionButtonClass}
        aria-label={t('profile.settings')}
        aria-haspopup="dialog"
        aria-expanded={isManagerOpen}
        onClick={() => setIsManagerOpen(true)}
      >
        <SettingsIcon className="w-5 h-5" />
      </button>

      <Modal
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        title={t('profile.manage')}
      >
        <ProfileManager
          profiles={profiles}
          activeProfileId={activeProfileId}
          onReorder={onReorder}
          onRename={onRename}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onAdd={onAdd}
        />
      </Modal>
    </>
  );
};

export default ProfileSettings;
