import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Material } from '../../types';
import { findMaterial } from '../../utils/materialImage';

interface MaterialSelectProps {
  materials: Material[];
  value: string;
  onChange: (materialId: string) => void;
  ariaLabel: string;
  className?: string;
  triggerClassName?: string;
  menuAlign?: 'left' | 'right';
  renderTrigger?: (props: {
    isOpen: boolean;
    toggle: () => void;
    label: string;
  }) => React.ReactNode;
}

const MaterialSelect = ({
  materials,
  value,
  onChange,
  ariaLabel,
  className = '',
  triggerClassName = '',
  menuAlign = 'left',
  renderTrigger,
}: MaterialSelectProps) => {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const activeMaterial = findMaterial(materials, value);
  const activeLabel = activeMaterial?.label ?? value;

  const updateMenuPosition = useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    setMenuStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: menuAlign === 'right' ? undefined : rect.left,
      right: menuAlign === 'right' ? window.innerWidth - rect.right : undefined,
      minWidth: rect.width,
      zIndex: 50,
    });
  }, [menuAlign]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    updateMenuPosition();
    window.addEventListener('scroll', updateMenuPosition, true);
    window.addEventListener('resize', updateMenuPosition);
    return () => {
      window.removeEventListener('scroll', updateMenuPosition, true);
      window.removeEventListener('resize', updateMenuPosition);
    };
  }, [isOpen, updateMenuPosition]);

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

  const pick = (materialId: string) => {
    onChange(materialId);
    setIsOpen(false);
  };

  const menu = isOpen ? (
    <ul
      ref={menuRef}
      id={listId}
      role="listbox"
      aria-label={ariaLabel}
      style={menuStyle}
      className="w-max max-w-[min(100vw,20rem)] max-h-52 overflow-y-auto dropdown-panel py-1"
    >
      {materials.map((material) => (
        <li key={material.id}>
          <button
            type="button"
            role="option"
            aria-selected={material.id === value}
            className={`w-full text-left px-3 py-1.5 text-sm whitespace-nowrap hover:bg-white/10 transition-colors ${
              material.id === value ? 'bg-white/10' : ''
            }`}
            onClick={() => pick(material.id)}
          >
            {material.label}
          </button>
        </li>
      ))}
    </ul>
  ) : null;

  return (
    <div ref={containerRef} className={`relative min-w-0 ${className}`}>
      {renderTrigger ? (
        renderTrigger({ isOpen, toggle, label: activeLabel })
      ) : (
        <button
          type="button"
          className={`input select-dropdown-trigger block w-full min-w-0 text-left ${triggerClassName}`}
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listId}
          title={activeLabel}
          onClick={toggle}
        >
          <span className="block truncate">{activeLabel}</span>
        </button>
      )}

      {menu && createPortal(menu, document.body)}
    </div>
  );
};

export default MaterialSelect;
