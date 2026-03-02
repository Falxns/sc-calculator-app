import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import useLocalStorage from '../../hooks/useLocalStorage';
import type { MessageBuilderState } from '../../types';
import TrashIcon from '../icons/TrashIcon';
import CopyIcon from '../icons/CopyIcon';

const MessageBuilder = () => {
  const [state, setState] = useLocalStorage<MessageBuilderState>('messageBuilderState', {
    messages: [],
  });

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

  return (
    <section className="glass-container flex-col gap-4 w-full">
      <button
        type="button"
        className="btn w-20"
        onClick={() => {
          setState((prev) => ({
            ...prev,
            messages: [...prev.messages, { id: crypto.randomUUID(), content: '' }],
          }));
        }}
      >
        Add
      </button>
      {state.messages.length === 0 && <p className="text-base font-medium">No messages yet</p>}
      {state.messages.map(({ id, content }) => (
        <div key={id} className="flex justify-center items-start gap-4 w-full">
          <textarea
            className="input w-96 h-32 resize-none"
            value={content}
            onChange={(e) => {
              setState((prev) => ({
                ...prev,
                messages: prev.messages.map((m) =>
                  m.id === id ? { ...m, content: e.target.value } : m
                ),
              }));
            }}
          />
          <div className="flex flex-col justify-center items-center gap-2">
            <button
              type="button"
              className="btn w-auto p-2"
              aria-label="Copy"
              onClick={() => {
                navigator.clipboard
                  .writeText(content)
                  .then(() => {
                    showToast('Copied!', 'success');
                  })
                  .catch(() => {
                    showToast('Failed to copy!', 'error');
                  });
              }}
            >
              <CopyIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="btn w-auto p-2"
              aria-label="Delete"
              onClick={() => {
                if (confirm('Are you sure you want to delete this message?')) {
                  setState((prev) => ({
                    ...prev,
                    messages: prev.messages.filter((m) => m.id !== id),
                  }));
                }
              }}
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
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
    </section>
  );
};

export default MessageBuilder;
