import { useEffect, useMemo, useState } from 'react';
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
import useLocalStorage from '../../hooks/useLocalStorage';
import useSortableSensors from '../../hooks/useSortableSensors';
import useToast from '../../hooks/useToast';
import type { Calculator, Material, MessageBuilderState } from '../../types';
import { MESSAGES_STORAGE_KEY } from '../../utils/backupIo';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { formatTemplateWarning } from '../../utils/formatTemplateWarning';
import { createUniqueMessageName, normalizeMessagesState } from '../../utils/messageBuilder';
import { buildRowInsertOptions, resolveMessageTemplate } from '../../utils/messageTemplate';
import {
  sectionWrapperClass,
  sectionSideRightClass,
  sectionGlassClass,
  sideActionButtonClass,
} from '../../constants/layout';
import MessageSortableRow from '../MessageSortableRow/MessageSortableRow';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import PlusIcon from '../icons/PlusIcon';
import Toast from '../Toast/Toast';

interface MessageBuilderProps {
  onImportRef: React.MutableRefObject<(state: MessageBuilderState) => void>;
  calculatorRows: Calculator[];
  materials: Material[];
  calculatorTotal: number;
}

const MessageBuilder = ({
  onImportRef,
  calculatorRows,
  materials,
  calculatorTotal,
}: MessageBuilderProps) => {
  const { t } = useLocale();
  const sensors = useSortableSensors();
  const [builderState, setBuilderState] = useLocalStorage<MessageBuilderState>(
    MESSAGES_STORAGE_KEY,
    { messages: [] },
    normalizeMessagesState
  );

  const { toast, showToast } = useToast();
  const rowOptions = useMemo(
    () => buildRowInsertOptions(calculatorRows, materials),
    [calculatorRows, materials]
  );

  const suggestedNames = useMemo(
    () => [t('messages.templateBuyAd'), t('messages.templateWhisper'), t('messages.suggestedName')],
    [t]
  );

  const handleAddMessage = () => {
    setBuilderState((prev) => {
      const baseName =
        suggestedNames[Math.min(prev.messages.length, suggestedNames.length - 1)];
      const name = createUniqueMessageName(
        baseName,
        prev.messages.map((message) => message.name)
      );

      return {
        messages: [...prev.messages, { id: crypto.randomUUID(), name, content: '' }],
      };
    });
  };

  const handleNameChange = (id: string, name: string) => {
    setBuilderState((prev) => ({
      ...prev,
      messages: prev.messages.map((message) =>
        message.id === id ? { ...message, name } : message
      ),
    }));
  };

  const handleChangeMessage = (id: string, e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBuilderState((prev) => ({
      ...prev,
      messages: prev.messages.map((message) =>
        message.id === id ? { ...message, content: e.target.value } : message
      ),
    }));
  };

  const handleSetMessageContent = (id: string, content: string) => {
    setBuilderState((prev) => ({
      ...prev,
      messages: prev.messages.map((message) =>
        message.id === id ? { ...message, content } : message
      ),
    }));
  };

  const handleCopyMessage = async (content: string) => {
    const { text, warnings } = resolveMessageTemplate(
      content,
      calculatorRows,
      materials,
      calculatorTotal
    );

    try {
      await copyToClipboard(text);
      if (warnings.length) {
        showToast(formatTemplateWarning(warnings[0], t), 'error');
      } else {
        showToast(t('toast.copied'), 'success');
      }
    } catch {
      showToast(t('toast.copyFailed'), 'error');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setBuilderState((prev) => {
      const oldIndex = prev.messages.findIndex((message) => message.id === active.id);
      const newIndex = prev.messages.findIndex((message) => message.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;

      return { messages: arrayMove(prev.messages, oldIndex, newIndex) };
    });
  };

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const requestDeleteMessage = (id: string) => {
    setPendingDeleteId(id);
  };

  const confirmDeleteMessage = () => {
    if (pendingDeleteId) {
      setBuilderState((prev) => ({
        ...prev,
        messages: prev.messages.filter((message) => message.id !== pendingDeleteId),
      }));
      setPendingDeleteId(null);
      showToast(t('toast.messageDeleted'), 'success');
    }
  };

  const cancelDeleteMessage = () => {
    setPendingDeleteId(null);
  };

  useEffect(() => {
    onImportRef.current = setBuilderState;
  });

  const messageIds = builderState.messages.map((message) => message.id);

  return (
    <div className={sectionWrapperClass}>
      <section className={sectionGlassClass}>
        {builderState.messages.length === 0 ? (
          <p className="text-sm text-white/60 text-center py-6">{t('messages.noMessages')}</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={messageIds} strategy={verticalListSortingStrategy}>
              <div className="w-full">
                {builderState.messages.map((message) => (
                  <MessageSortableRow
                    key={message.id}
                    message={message}
                    calculatorRows={calculatorRows}
                    materials={materials}
                    calculatorTotal={calculatorTotal}
                    rowOptions={rowOptions}
                    onNameChange={handleNameChange}
                    onContentChange={handleChangeMessage}
                    onSetContent={handleSetMessageContent}
                    onCopy={handleCopyMessage}
                    onDelete={requestDeleteMessage}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <Toast toast={toast} />
      </section>

      <div className={sectionSideRightClass}>
        <button
          type="button"
          className={sideActionButtonClass}
          aria-label={t('messages.add')}
          onClick={handleAddMessage}
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      </div>

      {createPortal(
        <ConfirmModal
          isOpen={pendingDeleteId !== null}
          message={t('messages.deleteConfirm')}
          onConfirm={confirmDeleteMessage}
          onCancel={cancelDeleteMessage}
        />,
        document.body
      )}
    </div>
  );
};

export default MessageBuilder;
