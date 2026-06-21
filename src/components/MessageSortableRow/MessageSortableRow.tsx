import { useMemo, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLocale } from '../../context/LocaleContext';
import type { Calculator, Material, Message } from '../../types';
import { formatTemplateWarning } from '../../utils/formatTemplateWarning';
import {
  resolveMessageTemplate,
  type RowInsertOption,
} from '../../utils/messageTemplate';
import TrashIcon from '../icons/TrashIcon';
import ChevronIcon from '../icons/ChevronIcon';
import DragHandle from '../DragHandle/DragHandle';
import MessageInsertMenu from '../MessageInsertMenu/MessageInsertMenu';

interface MessageSortableRowProps {
  message: Message;
  calculatorRows: Calculator[];
  materials: Material[];
  calculatorTotal: number;
  rowOptions: RowInsertOption[];
  onNameChange: (id: string, name: string) => void;
  onContentChange: (id: string, e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSetContent: (id: string, content: string) => void;
  onCopy: (content: string) => void;
  onDelete: (id: string) => void;
}

const MessageSortableRow = ({
  message,
  calculatorRows,
  materials,
  calculatorTotal,
  rowOptions,
  onNameChange,
  onContentChange,
  onSetContent,
  onCopy,
  onDelete,
}: MessageSortableRowProps) => {
  const { t } = useLocale();
  const { id, name, content } = message;
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
    opacity: isDragging ? 0.85 : undefined,
  };

  const { text: resolvedText, warnings } = useMemo(
    () => resolveMessageTemplate(content, calculatorRows, materials, calculatorTotal),
    [content, calculatorRows, materials, calculatorTotal]
  );

  const insertToken = (token: string) => {
    const el = textareaRef.current;
    if (!el) {
      onSetContent(id, content + token);
      return;
    }

    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const next = content.slice(0, start) + token + content.slice(end);
    onSetContent(id, next);

    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const dragLabel = name.trim() || content.trim() || t('messages.suggestedName');
  const displayName = name.trim() || t('messages.suggestedName');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-2 w-full py-2.5 border-b border-white/10 last:border-b-0 ${
        isDragging ? 'relative' : ''
      } items-start`}
    >
      <DragHandle
        label={dragLabel}
        setActivatorNodeRef={setActivatorNodeRef}
        listeners={listeners}
        attributes={attributes}
        className="mt-1"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            className="btn w-7 h-7 min-w-7 p-0 shrink-0 flex items-center justify-center"
            aria-label={isCollapsed ? t('messages.expand') : t('messages.collapse')}
            aria-expanded={!isCollapsed}
            onClick={() => setIsCollapsed((collapsed) => !collapsed)}
          >
            <ChevronIcon className="w-4 h-4" expanded={!isCollapsed} />
          </button>
          <input
            className="input py-1 px-2 text-xs flex-1 min-w-0"
            type="text"
            value={name}
            placeholder={t('messages.namePlaceholder')}
            aria-label={t('messages.nameLabel', { name: displayName })}
            onChange={(e) => onNameChange(id, e.target.value)}
          />
        </div>

        {!isCollapsed && (
          <textarea
            ref={textareaRef}
            className="input w-full min-w-0 py-2 px-3 text-base min-h-[5.5rem] resize-y"
            rows={3}
            value={content}
            onChange={(e) => onContentChange(id, e)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={t('messages.placeholder')}
            aria-label={t('messages.templateFor', { name: displayName })}
          />
        )}

        <button
          type="button"
          disabled={!content.trim()}
          className={`mt-2 w-full text-left px-3 py-2 rounded-lg border transition-colors ${
            content.trim()
              ? 'copyable bg-black/25 border-white/10 hover:bg-black/40 hover:border-white/25 cursor-pointer'
              : 'bg-black/20 border-white/10 cursor-default opacity-80'
          } ${isFocused && !isCollapsed ? 'ring-1 ring-white/15' : ''}`}
          aria-label={t('messages.copyPreview')}
          onClick={() => onCopy(content)}
        >
          <p className="text-xs text-white/50 mb-1 pointer-events-none">{t('messages.preview')}</p>
          <p
            className={`text-sm text-white/85 whitespace-pre-wrap break-words min-h-[1.25rem] pointer-events-none ${
              isCollapsed ? 'line-clamp-2' : ''
            }`}
          >
            {content.trim() ? resolvedText : t('messages.previewEmpty')}
          </p>
          {warnings.length > 0 && (
            <p className="mt-1.5 text-xs text-amber-300/90 pointer-events-none">
              {formatTemplateWarning(warnings[0], t)}
            </p>
          )}
        </button>
      </div>

      <div className="flex flex-col gap-1.5 shrink-0 pt-1">
        {!isCollapsed && <MessageInsertMenu rows={rowOptions} onInsert={insertToken} />}
        <button
          type="button"
          className="btn w-auto p-2"
          aria-label={t('messages.delete')}
          onClick={() => onDelete(id)}
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MessageSortableRow;
