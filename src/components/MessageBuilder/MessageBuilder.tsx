import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import useLocalStorage from '../../hooks/useLocalStorage';
import type { MessageBuilderState } from '../../types';

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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
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
