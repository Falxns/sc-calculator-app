import { useEffect, useRef, useState } from 'react';

export type ToastType = 'success' | 'error';

export interface ToastState {
  message: string;
  type: ToastType;
}

const useToast = () => {
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, type: ToastType) => {
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

  return { toast, showToast };
};

export default useToast;
