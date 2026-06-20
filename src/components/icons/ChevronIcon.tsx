interface ChevronIconProps {
  className?: string;
  expanded?: boolean;
}

const ChevronIcon = ({ className, expanded = false }: ChevronIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''} ${className ?? ''}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
};

export default ChevronIcon;
