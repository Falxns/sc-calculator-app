import { useLocale } from '../../context/LocaleContext';
import type { CalculatorProfile } from '../../types';
import DropdownMenu from '../DropdownMenu/DropdownMenu';

interface ProfileSelectorProps {
  profiles: CalculatorProfile[];
  activeProfileId: string;
  onSwitch: (profileId: string) => void;
}

const ProfileSelector = ({ profiles, activeProfileId, onSwitch }: ProfileSelectorProps) => {
  const { t } = useLocale();
  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const activeName = activeProfile?.name ?? '';

  return (
    <DropdownMenu
      className="inline-block max-w-[30%] min-w-0 shrink-0 align-top"
      ariaLabel={t('profile.label')}
      trigger={({ isOpen, toggle, listId }) => (
        <button
          type="button"
          id="calculator-profile"
          className="input profile-select-trigger block w-max max-w-full text-left"
          aria-label={t('profile.label')}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listId}
          title={activeName}
          onClick={toggle}
        >
          <span className="block truncate">{activeName}</span>
        </button>
      )}
    >
      {({ close }) =>
        profiles.map((profile) => (
          <li key={profile.id}>
            <button
              type="button"
              role="option"
              aria-selected={profile.id === activeProfileId}
              className={`w-full text-left px-3 py-1.5 text-sm whitespace-nowrap hover:bg-white/10 transition-colors ${
                profile.id === activeProfileId ? 'bg-white/10' : ''
              }`}
              onClick={() => {
                onSwitch(profile.id);
                close();
              }}
            >
              {profile.name}
            </button>
          </li>
        ))
      }
    </DropdownMenu>
  );
};

export default ProfileSelector;
