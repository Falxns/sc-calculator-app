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
import CopyIcon from '../icons/CopyIcon';
import TrashIcon from '../icons/TrashIcon';
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

const COLLAPSE_CHAR_LIMIT = 60;

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

  const isMultiline = content.includes('\n') || content.length > COLLAPSE_CHAR_LIMIT;
  const isExpanded = isFocused || isMultiline || Boolean(name.trim());

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-2 w-full py-2.5 border-b border-white/10 last:border-b-0 ${
        isDragging ? 'relative' : ''
      } ${isExpanded ? 'items-start' : 'items-center'}`}
    >
      <DragHandle
        label={dragLabel}
        setActivatorNodeRef={setActivatorNodeRef}
        listeners={listeners}
        attributes={attributes}
        className={isExpanded ? 'mt-1' : ''}
      />

      <div className="flex-1 min-w-0">
        <input
          className="input py-1 px-2 text-xs w-full mb-2"
          type="text"
          value={name}
          placeholder={t('messages.namePlaceholder')}
          aria-label={t('messages.nameLabel', { name: name || t('messages.suggestedName') })}
          onChange={(e) => onNameChange(id, e.target.value)}
        />

        <textarea
          ref={textareaRef}
          className={`input w-full min-w-0 py-2 px-3 text-base transition-[min-height] duration-200 ${
            isExpanded
              ? 'min-h-[5.5rem] resize-y'
              : 'min-h-[2.75rem] max-h-[2.75rem] overflow-hidden resize-none'
          }`}
          rows={isExpanded ? 3 : 1}
          value={content}
          onChange={(e) => onContentChange(id, e)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={t('messages.placeholder')}
          aria-label={t('messages.templateFor', { name: name || t('messages.suggestedName') })}
        />

        <div className="mt-2 px-3 py-2 rounded-lg bg-black/25 border border-white/10">
          <p className="text-xs text-white/50 mb-1">{t('messages.preview')}</p>
          <p className="text-sm text-white/85 whitespace-pre-wrap break-words min-h-[1.25rem]">
            {content.trim() ? resolvedText : t('messages.previewEmpty')}
          </p>
          {warnings.length > 0 && (
            <p className="mt-1.5 text-xs text-amber-300/90">
              {formatTemplateWarning(warnings[0], t)}
            </p>
          )}
        </div>
      </div>

      <div className={`flex flex-col gap-1.5 shrink-0 ${isExpanded ? 'pt-1' : ''}`}>
        <MessageInsertMenu rows={rowOptions} onInsert={insertToken} />
        <button
          type="button"
          className="btn w-auto p-2"
          aria-label={t('messages.copyResolved')}
          onClick={() => onCopy(content)}
        >
          <CopyIcon className="w-4 h-4" />
        </button>
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
