import type { CalculatorViewMode } from '../../types/calculatorView';
import GridIcon from '../icons/GridIcon';
import ListIcon from '../icons/ListIcon';

interface CalculatorViewToggleProps {
  value: CalculatorViewMode;
  onChange: (mode: CalculatorViewMode) => void;
}

const modes: { id: CalculatorViewMode; label: string; Icon: typeof ListIcon }[] = [
  { id: 'list', label: 'List view', Icon: ListIcon },
  { id: 'grid', label: 'Grid view', Icon: GridIcon },
];

const CalculatorViewToggle = ({ value, onChange }: CalculatorViewToggleProps) => (
  <div
    className="inline-flex rounded-xl border border-white/20 bg-white/5 p-0.5"
    role="group"
    aria-label="Calculator display mode"
  >
    {modes.map(({ id, label, Icon }) => {
      const active = value === id;
      return (
        <button
          key={id}
          type="button"
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
            active
              ? 'bg-white/20 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
          aria-label={label}
          aria-pressed={active}
          onClick={() => onChange(id)}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{id === 'list' ? 'List' : 'Grid'}</span>
        </button>
      );
    })}
  </div>
);

export default CalculatorViewToggle;
