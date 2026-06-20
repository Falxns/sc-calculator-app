import { useRef, useState } from 'react';
import { useLocale } from '../../context/LocaleContext';
import type { Message } from '../../types';
import type { RowInsertOption } from '../../utils/messageTemplate';
import CopyIcon from '../icons/CopyIcon';
import TrashIcon from '../icons/TrashIcon';
import MessageInsertMenu from '../MessageInsertMenu/MessageInsertMenu';

interface MessageComponentProps {
  message: Message;
  rowOptions: RowInsertOption[];
  handleChangeMessage: (id: string, e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSetMessageContent: (id: string, content: string) => void;
  handleCopyMessage: (content: string) => void;
  handleDeleteMessage: (id: string) => void;
}

const COLLAPSE_CHAR_LIMIT = 60;

const MessageComponent = ({
  message,
  rowOptions,
  handleChangeMessage,
  handleSetMessageContent,
  handleCopyMessage,
  handleDeleteMessage,
}: MessageComponentProps) => {
  const { t } = useLocale();
  const { id, content } = message;
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isMultiline = content.includes('\n') || content.length > COLLAPSE_CHAR_LIMIT;
  const isExpanded = isFocused || isMultiline;

  const insertToken = (token: string) => {
    const el = textareaRef.current;
    if (!el) {
      handleSetMessageContent(id, content + token);
      return;
    }

    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const next = content.slice(0, start) + token + content.slice(end);
    handleSetMessageContent(id, next);

    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  };

  return (
    <div
      className={`flex gap-3 w-full py-2.5 border-b border-white/10 last:border-b-0 ${isExpanded ? 'items-start' : 'items-center'}`}
    >
      <textarea
        ref={textareaRef}
        className={`input flex-1 min-w-0 py-2 px-3 text-base transition-[min-height] duration-200 ${
          isExpanded
            ? 'min-h-[5.5rem] resize-y'
            : 'min-h-[2.75rem] max-h-[2.75rem] overflow-hidden resize-none'
        }`}
        rows={isExpanded ? 3 : 1}
        value={content}
        onChange={(e) => handleChangeMessage(id, e)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={t('messages.placeholder')}
        aria-label={`Message ${id.slice(0, 8)}...`}
      />
      <div className={`flex flex-col gap-1.5 shrink-0 ${isExpanded ? 'pt-1' : ''}`}>
        <MessageInsertMenu rows={rowOptions} onInsert={insertToken} />
        <button
          type="button"
          className="btn w-auto p-2"
          aria-label={t('messages.copyResolved')}
          onClick={() => handleCopyMessage(content)}
        >
          <CopyIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="btn w-auto p-2"
          aria-label={t('messages.delete')}
          onClick={() => handleDeleteMessage(id)}
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MessageComponent;
