import { createPortal } from 'react-dom';
import type { ToastState } from '../../hooks/useToast';

interface ToastProps {
  toast: ToastState | null;
}

const Toast = ({ toast }: ToastProps) => {
  if (!toast) return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className={`blur-effect fixed top-4 right-4 p-4 z-50 ${toast.type === 'success' ? 'bg-green-300/30 hover:bg-green-300/40' : 'bg-red-300/30 hover:bg-red-300/40'}`}
    >
      {toast.message}
    </div>,
    document.body
  );
};

export default Toast;
