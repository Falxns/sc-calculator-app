interface GripIconProps {
  className?: string;
}

const GripIcon = ({ className = 'w-4 h-4' }: GripIconProps) => (
  <svg
    className={className}
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden
  >
    <circle cx="5" cy="4" r="1.25" />
    <circle cx="11" cy="4" r="1.25" />
    <circle cx="5" cy="8" r="1.25" />
    <circle cx="11" cy="8" r="1.25" />
    <circle cx="5" cy="12" r="1.25" />
    <circle cx="11" cy="12" r="1.25" />
  </svg>
);

export default GripIcon;
