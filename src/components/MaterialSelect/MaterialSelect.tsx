import type { Material } from '../../types';
import { findMaterial } from '../../utils/materialImage';
import DropdownMenu from '../DropdownMenu/DropdownMenu';

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
    listId: string;
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
  const activeMaterial = findMaterial(materials, value);
  const activeLabel = activeMaterial?.label ?? value;

  return (
    <DropdownMenu
      className={className}
      ariaLabel={ariaLabel}
      menuAlign={menuAlign}
      portaled
      trigger={({ isOpen, toggle, listId }) =>
        renderTrigger ? (
          renderTrigger({ isOpen, toggle, label: activeLabel, listId })
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
        )
      }
    >
      {({ close }) =>
        materials.map((material) => (
          <li key={material.id}>
            <button
              type="button"
              role="option"
              aria-selected={material.id === value}
              className={`w-full text-left px-3 py-1.5 text-sm whitespace-nowrap hover:bg-white/10 transition-colors ${
                material.id === value ? 'bg-white/10' : ''
              }`}
              onClick={() => {
                onChange(material.id);
                close();
              }}
            >
              {material.label}
            </button>
          </li>
        ))
      }
    </DropdownMenu>
  );
};

export default MaterialSelect;
