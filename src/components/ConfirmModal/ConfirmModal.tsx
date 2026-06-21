import { useEffect, useRef } from 'react';
import { useLocale } from '../../context/LocaleContext';

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

const ConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  message,
  confirmLabel,
  cancelLabel,
}: ConfirmModalProps) => {
  const { t } = useLocale();
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleEscapeKey);
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onCancel]);

  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t('common.close')}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        className="glass-container relative flex-col gap-4 p-6 max-w-sm w-full"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-message"
      >
        <p className="text-base font-medium text-center" id="confirm-modal-message">
          {message ?? t('messages.deleteConfirm')}
        </p>
        <div className="flex gap-4">
          <button
            type="button"
            className="btn w-auto focus:ring-2 focus:ring-white/50"
            onClick={onCancel}
          >
            {cancelLabel ?? t('common.cancel')}
          </button>
          <button
            type="button"
            className="btn w-auto bg-red-500/80 hover:bg-red-500/100 focus:ring-2 focus:ring-red-500/50"
            onClick={onConfirm}
            ref={confirmButtonRef}
          >
            {confirmLabel ?? t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
