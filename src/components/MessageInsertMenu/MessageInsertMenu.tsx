import { useLocale } from '../../context/LocaleContext';
import type { RowInsertOption } from '../../utils/messageTemplate';
import { formatRowToken, TOTAL_TOKEN } from '../../utils/messageTemplate';
import DropdownMenu from '../DropdownMenu/DropdownMenu';

interface MessageInsertMenuProps {
  rows: RowInsertOption[];
  onInsert: (token: string) => void;
}

const MessageInsertMenu = ({ rows, onInsert }: MessageInsertMenuProps) => {
  const { t } = useLocale();

  return (
    <DropdownMenu
      ariaLabel={t('messages.insertPlaceholder')}
      menuAlign="right"
      menuClassName="min-w-[11rem]"
      trigger={({ isOpen, toggle }) => (
        <button
          type="button"
          className="btn w-auto p-2 text-xs font-semibold"
          aria-label={t('messages.insertPlaceholder')}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={toggle}
        >
          {'{+}'}
        </button>
      )}
    >
      {({ close }) => (
        <>
          {rows.length === 0 ? (
            <li className="px-3 py-2 text-xs text-white/50">{t('messages.noRows')}</li>
          ) : (
            rows.map((row) => (
              <li key={row.rowIndex}>
                <button
                  type="button"
                  role="option"
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-white/10 transition-colors"
                  onClick={() => {
                    onInsert(formatRowToken(row.rowIndex));
                    close();
                  }}
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
              onClick={() => {
                onInsert(TOTAL_TOKEN);
                close();
              }}
            >
              {t('messages.total')}
            </button>
          </li>
        </>
      )}
    </DropdownMenu>
  );
};

export default MessageInsertMenu;
