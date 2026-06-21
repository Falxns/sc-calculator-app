import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

interface UseDropdownOptions {
  menuAlign?: 'left' | 'right';
  portaled?: boolean;
}

export const useDropdown = ({ menuAlign = 'left', portaled = false }: UseDropdownOptions = {}) => {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const updateMenuPosition = useCallback(() => {
    if (!portaled || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    setMenuStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: menuAlign === 'right' ? undefined : rect.left,
      right: menuAlign === 'right' ? window.innerWidth - rect.right : undefined,
      minWidth: rect.width,
      zIndex: 50,
    });
  }, [menuAlign, portaled]);

  useLayoutEffect(() => {
    if (!isOpen || !portaled) return;

    updateMenuPosition();
    window.addEventListener('scroll', updateMenuPosition, true);
    window.addEventListener('resize', updateMenuPosition);
    return () => {
      window.removeEventListener('scroll', updateMenuPosition, true);
      window.removeEventListener('resize', updateMenuPosition);
    };
  }, [isOpen, portaled, updateMenuPosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const toggle = () => setIsOpen((open) => !open);
  const close = () => setIsOpen(false);

  const menuPositionClass = menuAlign === 'right' ? 'right-0' : 'left-0';

  return {
    listId,
    containerRef,
    menuRef,
    isOpen,
    toggle,
    close,
    menuStyle,
    menuPositionClass,
  };
};
