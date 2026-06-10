import { useState } from 'react';
import { createPortal } from 'react-dom';
import useLocalStorage from '../../hooks/useLocalStorage';
import useToast from '../../hooks/useToast';
import type { MessageBuilderState } from '../../types';
import { copyToClipboard } from '../../utils/copyToClipboard';
import MessageComponent from '../MessageComponent/MessageComponent';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
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
    <section className="glass-container flex-col gap-4 w-full">
      <button type="button" className="btn w-auto" onClick={handleAddMessage}>
        Add message
      </button>
      {builderState.messages.length === 0 && (
        <p className="text-base font-medium">No messages yet</p>
      )}
      {builderState.messages.map((message) => (
        <MessageComponent
          key={message.id}
          message={message}
          handleChangeMessage={handleChangeMessage}
          handleCopyMessage={handleCopyMessage}
          handleDeleteMessage={requestDeleteMessage}
        />
      ))}
      <Toast toast={toast} />
      {createPortal(
        <ConfirmModal
          isOpen={pendingDeleteId !== null}
          onConfirm={confirmDeleteMessage}
          onCancel={cancelDeleteMessage}
        />,
        document.body
      )}
    </section>
  );
};

export default MessageBuilder;
