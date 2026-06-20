import { useEffect, useId, useRef, useState } from 'react';
import { useLocale } from '../../context/LocaleContext';
import type { CalculatorProfile } from '../../types';

interface ProfileSelectorProps {
  profiles: CalculatorProfile[];
  activeProfileId: string;
  onSwitch: (profileId: string) => void;
}

const ProfileSelector = ({ profiles, activeProfileId, onSwitch }: ProfileSelectorProps) => {
  const { t } = useLocale();
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const activeName = activeProfile?.name ?? '';

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const pick = (profileId: string) => {
    onSwitch(profileId);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block max-w-[30%] min-w-0 shrink-0 align-top">
      <button
        type="button"
        id="calculator-profile"
        className="input profile-select-trigger block w-max max-w-full text-left"
        aria-label={t('profile.label')}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        title={activeName}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="block truncate">{activeName}</span>
      </button>

      {isOpen && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t('profile.label')}
          className="absolute left-0 top-full mt-1 z-20 min-w-full w-max max-w-[min(100vw,20rem)] max-h-52 overflow-y-auto dropdown-panel py-1"
        >
          {profiles.map((profile) => (
            <li key={profile.id}>
              <button
                type="button"
                role="option"
                aria-selected={profile.id === activeProfileId}
                className={`w-full text-left px-3 py-1.5 text-sm whitespace-nowrap hover:bg-white/10 transition-colors ${
                  profile.id === activeProfileId ? 'bg-white/10' : ''
                }`}
                onClick={() => pick(profile.id)}
              >
                {profile.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProfileSelector;
