import { useState } from 'react';
import { useLocale } from '../../context/LocaleContext';
import { useToast } from '../../context/ToastContext';
import type { Material } from '../../types';
import { createUniqueMaterialId } from '../../utils/slugify';
import { MAX_ICON_BYTES, readFileAsDataUrl } from '../../utils/readFileAsDataUrl';
import PlusIcon from '../icons/PlusIcon';
import UploadIcon from '../icons/UploadIcon';

interface MaterialAddRowProps {
  existingIds: string[];
  onAdd: (material: Material) => void;
}

const MaterialAddRow = ({ existingIds, onAdd }: MaterialAddRowProps) => {
  const { t } = useLocale();
  const { showToast } = useToast();
  const [label, setLabel] = useState('');
  const [defaultPrice, setDefaultPrice] = useState('');
  const [imageData, setImageData] = useState<string | undefined>();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_ICON_BYTES) {
      showToast(t('materials.imageTooLarge'), 'error');
      return;
    }
    setImageData(await readFileAsDataUrl(file));
  };

  const handleAdd = () => {
    const trimmedLabel = label.trim();
    const price = defaultPrice === '' ? 0 : Number(defaultPrice);
    if (!trimmedLabel || Number.isNaN(price) || price < 0) return;

    onAdd({
      id: createUniqueMaterialId(trimmedLabel, existingIds),
      label: trimmedLabel,
      defaultPrice: price,
      ...(imageData ? { imageData } : {}),
    });

    setLabel('');
    setDefaultPrice('');
    setImageData(undefined);
  };

  return (
    <li className="pt-2">
      <div className="flex flex-wrap items-end gap-2">
        <label
          className="calc-btn w-9 h-9 min-w-9 p-0 shrink-0 flex items-center justify-center cursor-pointer overflow-hidden"
          aria-label={t('materials.uploadIcon')}
        >
          {imageData ? (
            <img src={imageData} alt="" className="w-full h-full object-cover" />
          ) : (
            <UploadIcon className="w-4 h-4 text-white/60" />
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
        <input
          className="calc-control py-1.5 px-2 text-sm flex-1 min-w-[6rem]"
          type="text"
          placeholder={t('common.name')}
          value={label}
          aria-label={t('materials.materialName')}
          onChange={(e) => setLabel(e.target.value)}
        />
        <input
          className="calc-control py-1.5 px-2 text-sm w-24 text-center"
          type="number"
          placeholder={t('common.price')}
          value={defaultPrice}
          aria-label={t('materials.defaultPrice')}
          onChange={(e) => setDefaultPrice(e.target.value)}
        />
        <button
          type="button"
          className="calc-btn w-9 h-9 min-w-9 p-0 shrink-0 flex items-center justify-center"
          aria-label={t('materials.addMaterial')}
          onClick={handleAdd}
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>
    </li>
  );
};

export default MaterialAddRow;
