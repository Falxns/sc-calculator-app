import { createPortal } from 'react-dom';
import { useDropdown } from '../../hooks/useDropdown';

interface DropdownMenuProps {
  ariaLabel: string;
  className?: string;
  menuClassName?: string;
  menuAlign?: 'left' | 'right';
  portaled?: boolean;
  trigger: (props: { isOpen: boolean; toggle: () => void; listId: string }) => React.ReactNode;
  children: React.ReactNode | ((props: { close: () => void }) => React.ReactNode);
}

const DropdownMenu = ({
  ariaLabel,
  className = '',
  menuClassName = '',
  menuAlign = 'left',
  portaled = false,
  trigger,
  children,
}: DropdownMenuProps) => {
  const {
    listId,
    containerRef,
    menuRef,
    isOpen,
    toggle,
    close,
    menuStyle,
    menuPositionClass,
  } = useDropdown({ menuAlign, portaled });

  const menu = isOpen ? (
    <ul
      ref={menuRef}
      id={listId}
      role="listbox"
      aria-label={ariaLabel}
      style={portaled ? menuStyle : undefined}
      className={
        portaled
          ? `w-max max-w-[min(100vw,20rem)] max-h-52 overflow-y-auto dropdown-panel py-1 ${menuClassName}`
          : `absolute ${menuPositionClass} top-full mt-1 z-20 min-w-full w-max max-w-[min(100vw,20rem)] max-h-52 overflow-y-auto dropdown-panel py-1 ${menuClassName}`
      }
    >
      {typeof children === 'function' ? children({ close }) : children}
    </ul>
  ) : null;

  return (
    <div ref={containerRef} className={`relative min-w-0 ${className}`}>
      {trigger({ isOpen, toggle, listId })}
      {menu && (portaled ? createPortal(menu, document.body) : menu)}
    </div>
  );
};

export default DropdownMenu;
