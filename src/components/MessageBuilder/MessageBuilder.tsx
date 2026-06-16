import { useState } from 'react';
import { createPortal } from 'react-dom';
import useLocalStorage from '../../hooks/useLocalStorage';
import useToast from '../../hooks/useToast';
import type { MessageBuilderState } from '../../types';
import { copyToClipboard } from '../../utils/copyToClipboard';
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

const MessageBuilder = () => {
  const [builderState, setBuilderState] = useLocalStorage<MessageBuilderState>(
    'messageBuilderState',
    {
      messages: [],
    }
  );

  const { toast, showToast } = useToast();

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

  const handleCopyMessage = async (content: string) => {
    try {
      await copyToClipboard(content);
      showToast('Copied!', 'success');
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

  return (
    <div className={sectionWrapperClass}>
      <section className={sectionGlassClass}>
        {builderState.messages.length === 0 ? (
          <p className="text-sm text-white/60 text-center py-6">
            No messages yet. Click &quot;Add message&quot; to get started.
          </p>
        ) : (
          <div className="w-full">
            {builderState.messages.map((message) => (
              <MessageComponent
                key={message.id}
                message={message}
                handleChangeMessage={handleChangeMessage}
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
