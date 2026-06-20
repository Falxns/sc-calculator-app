import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../../context/LocaleContext';
import type { RowInsertOption } from '../../utils/messageTemplate';
import { formatRowToken, TOTAL_TOKEN } from '../../utils/messageTemplate';

interface MessageInsertMenuProps {
  rows: RowInsertOption[];
  onInsert: (token: string) => void;
}

const MessageInsertMenu = ({ rows, onInsert }: MessageInsertMenuProps) => {
  const { t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const pick = (token: string) => {
    onInsert(token);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className="btn w-auto p-2 text-xs font-semibold"
        aria-label={t('messages.insertPlaceholder')}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {'{+}'}
      </button>

      {isOpen && (
        <ul
          role="listbox"
          className="absolute right-0 top-full mt-1 z-20 min-w-[11rem] max-h-52 overflow-y-auto blur-effect py-1 shadow-lg"
        >
          {rows.length === 0 ? (
            <li className="px-3 py-2 text-xs text-white/50">{t('messages.noRows')}</li>
          ) : (
            rows.map((row) => (
              <li key={row.rowIndex}>
                <button
                  type="button"
                  role="option"
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-white/10 transition-colors"
                  onClick={() => pick(formatRowToken(row.rowIndex))}
                >
                  {row.rowIndex} — {row.label}{' '}
                  <span className="text-white/50">({row.price.toLocaleString()})</span>
                </button>
              </li>
            ))
          )}
          <li className="border-t border-white/10 mt-1 pt-1">
            <button
              type="button"
              role="option"
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-white/10 transition-colors"
              onClick={() => pick(TOTAL_TOKEN)}
            >
              {t('messages.total')}
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default MessageInsertMenu;
