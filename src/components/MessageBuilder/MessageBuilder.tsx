import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import useLocalStorage from '../../hooks/useLocalStorage';
import useToast from '../../hooks/useToast';
import type { Calculator, Material, MessageBuilderState } from '../../types';
import { MESSAGES_STORAGE_KEY } from '../../utils/backupIo';
import { copyToClipboard } from '../../utils/copyToClipboard';
import {
  buildRowInsertOptions,
  resolveMessageTemplate,
} from '../../utils/messageTemplate';
import {
  sectionWrapperClass,
  sectionSideRightClass,
  sectionGlassClass,
  sideActionButtonClass,
} from '../../constants/layout';
import MessageComponent from '../MessageComponent/MessageComponent';
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
  const [builderState, setBuilderState] = useLocalStorage<MessageBuilderState>(
    MESSAGES_STORAGE_KEY,
    {
      messages: [],
    }
  );

  const { toast, showToast } = useToast();
  const rowOptions = useMemo(
    () => buildRowInsertOptions(calculatorRows, materials),
    [calculatorRows, materials]
  );

  const handleAddMessage = () => {
    setBuilderState((prev) => ({
      ...prev,
      messages: [...prev.messages, { id: crypto.randomUUID(), content: '' }],
    }));
  };

  const handleChangeMessage = (id: string, e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBuilderState((prev) => ({
      ...prev,
      messages: prev.messages.map((m) => (m.id === id ? { ...m, content: e.target.value } : m)),
    }));
  };

  const handleSetMessageContent = (id: string, content: string) => {
    setBuilderState((prev) => ({
      ...prev,
      messages: prev.messages.map((m) => (m.id === id ? { ...m, content } : m)),
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
        showToast(warnings[0], 'error');
      } else {
        showToast('Copied!', 'success');
      }
    } catch {
      showToast('Failed to copy!', 'error');
    }
  };

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const requestDeleteMessage = (id: string) => {
    setPendingDeleteId(id);
  };

  const confirmDeleteMessage = () => {
    if (pendingDeleteId) {
      setBuilderState((prev) => ({
        ...prev,
        messages: prev.messages.filter((m) => m.id !== pendingDeleteId),
      }));
      setPendingDeleteId(null);
      showToast('Message deleted!', 'success');
    }
  };

  const cancelDeleteMessage = () => {
    setPendingDeleteId(null);
  };

  useEffect(() => {
    onImportRef.current = setBuilderState;
  });

  return (
    <div className={sectionWrapperClass}>
      <section className={sectionGlassClass}>
        {builderState.messages.length === 0 ? (
          <p className="text-sm text-white/60 text-center py-6">
            No messages yet. Use + to add one. Insert row placeholders with {'{+}'} — copy
            resolves them to [Material]price for in-game chat.
          </p>
        ) : (
          <div className="w-full">
            {builderState.messages.map((message) => (
              <MessageComponent
                key={message.id}
                message={message}
                rowOptions={rowOptions}
                handleChangeMessage={handleChangeMessage}
                handleSetMessageContent={handleSetMessageContent}
                handleCopyMessage={handleCopyMessage}
                handleDeleteMessage={requestDeleteMessage}
              />
            ))}
          </div>
        )}

        <Toast toast={toast} />
      </section>

      <div className={sectionSideRightClass}>
        <button
          type="button"
          className={sideActionButtonClass}
          aria-label="Add message"
          onClick={handleAddMessage}
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      </div>

      {createPortal(
        <ConfirmModal
          isOpen={pendingDeleteId !== null}
          onConfirm={confirmDeleteMessage}
          onCancel={cancelDeleteMessage}
        />,
        document.body
      )}
    </div>
  );
};

export default MessageBuilder;
