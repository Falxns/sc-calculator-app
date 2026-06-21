import type { Material } from '../../types';
import { useMaterialIcon } from '../../hooks/useMaterialIcon';

interface MaterialIconProps {
  material: Material | undefined;
  className?: string;
  placeholderClassName?: string;
}

const MaterialIcon = ({
  material,
  className = 'w-6 h-6 shrink-0',
  placeholderClassName = 'w-6 h-6 shrink-0 rounded bg-white/10',
}: MaterialIconProps) => {
  const src = useMaterialIcon(material);

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={className}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return <span className={placeholderClassName} aria-hidden />;
};

export default MaterialIcon;
