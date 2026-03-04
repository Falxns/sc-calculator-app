import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import useLocalStorage from '../../hooks/useLocalStorage';
import type { MessageBuilderState } from '../../types';
import MessageComponent from '../MessageComponent/MessageComponent';
import ConfirmModal from '../ConfirmModal/ConfirmModal';

const MessageBuilder = () => {
  const [builderState, setBuilderState] = useLocalStorage<MessageBuilderState>(
    'messageBuilderState',
    {
      messages: [],
    }
  );

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    if (toastRef.current) {
      clearTimeout(toastRef.current);
      toastRef.current = null;
    }
    setToast({ message, type });
    toastRef.current = setTimeout(() => {
      setToast(null);
      toastRef.current = null;
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (toastRef.current) {
        clearTimeout(toastRef.current);
      }
    };
  }, []);

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

  const handleCopyMessage = (content: string) => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        showToast('Copied!', 'success');
      })
      .catch(() => {
        showToast('Failed to copy!', 'error');
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
      {toast &&
        createPortal(
          <div
            role="status"
            aria-live="polite"
            className={`blur-effect fixed top-4 right-4 p-4 z-50 ${toast.type === 'success' ? 'bg-green-300/30 hover:bg-green-300/40' : 'bg-red-300/30 hover:bg-red-300/40'}`}
          >
            {toast.message}
          </div>,
          document.body
        )}
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
