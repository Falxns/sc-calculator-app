import { useState } from 'react';
import { useLocale } from '../../context/LocaleContext';
import { useToast } from '../../context/ToastContext';
import type { Material } from '../../types';
import { getMaterialImageSrc } from '../../utils/materialImage';
import { MAX_ICON_BYTES, readFileAsDataUrl } from '../../utils/readFileAsDataUrl';
import UploadIcon from '../icons/UploadIcon';

type EditImageState = 'unchanged' | 'cleared' | string;

interface MaterialEditRowProps {
  material: Material;
  onSave: (
    id: string,
    updates: { label: string; defaultPrice: number; imageData?: string; clearImage?: boolean }
  ) => void;
  onCancel: () => void;
}

const MaterialEditRow = ({ material, onSave, onCancel }: MaterialEditRowProps) => {
  const { t } = useLocale();
  const { showToast } = useToast();
  const [editLabel, setEditLabel] = useState(material.label);
  const [editPrice, setEditPrice] = useState(String(material.defaultPrice));
  const [editImage, setEditImage] = useState<EditImageState>('unchanged');

  const editPreviewSrc =
    editImage === 'unchanged'
      ? getMaterialImageSrc(material)
      : editImage === 'cleared'
        ? material.imgSrc
          ? getMaterialImageSrc({ ...material, imageData: undefined })
          : ''
        : editImage;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_ICON_BYTES) {
      showToast(t('materials.imageTooLarge'), 'error');
      return;
    }
    setEditImage(await readFileAsDataUrl(file));
  };

  const handleSave = () => {
    const trimmedLabel = editLabel.trim();
    const price = editPrice === '' ? 0 : Number(editPrice);
    if (!trimmedLabel || Number.isNaN(price) || price < 0) return;

    onSave(material.id, {
      label: trimmedLabel,
      defaultPrice: price,
      ...(editImage === 'cleared'
        ? { clearImage: true }
        : editImage !== 'unchanged'
          ? { imageData: editImage }
          : {}),
    });
  };

  return (
    <li className="py-2 first:pt-0 last:pb-0">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-end gap-2">
          <label
            className="calc-btn w-9 h-9 min-w-9 p-0 shrink-0 flex items-center justify-center cursor-pointer overflow-hidden"
            aria-label={t('materials.uploadIcon')}
          >
            {editPreviewSrc ? (
              <img src={editPreviewSrc} alt="" className="w-full h-full object-cover" />
            ) : (
              <UploadIcon className="w-4 h-4 text-white/60" />
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
          {material.imageData && editImage !== 'cleared' && (
            <button
              type="button"
              className="calc-btn w-auto py-1.5 px-2 text-xs"
              onClick={() => setEditImage('cleared')}
            >
              {t('materials.clearIcon')}
            </button>
          )}
          <input
            className="calc-control py-1.5 px-2 text-sm flex-1 min-w-[6rem]"
            type="text"
            value={editLabel}
            aria-label={t('materials.materialName')}
            onChange={(e) => setEditLabel(e.target.value)}
          />
          <input
            className="calc-control py-1.5 px-2 text-sm w-24 text-center"
            type="number"
            value={editPrice}
            aria-label={t('materials.defaultPrice')}
            onChange={(e) => setEditPrice(e.target.value)}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" className="calc-btn w-auto py-1.5 px-3 text-sm" onClick={onCancel}>
            {t('common.cancel')}
          </button>
          <button type="button" className="calc-btn w-auto py-1.5 px-3 text-sm" onClick={handleSave}>
            {t('common.save')}
          </button>
        </div>
      </div>
    </li>
  );
};

export default MaterialEditRow;
