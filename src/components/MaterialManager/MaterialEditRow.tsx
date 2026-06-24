import { useEffect, useState } from 'react';
import { useLocale } from '../../context/LocaleContext';
import { useToast } from '../../context/ToastContext';
import type { Material } from '../../types';
import { getIconUrl } from '../../utils/iconStore';
import { getBuiltinImageSrc, materialUsesCustomIcon } from '../../utils/materialImage';
import { MAX_ICON_BYTES } from '../../utils/readFileAsDataUrl';
import UploadIcon from '../icons/UploadIcon';

type EditImageState = 'unchanged' | 'cleared' | 'pending';

interface MaterialEditRowProps {
  material: Material;
  onSave: (
    id: string,
    updates: {
      label: string;
      defaultPrice: number;
      customIcon?: boolean;
      iconFile?: File;
      clearIcon?: boolean;
    }
  ) => void;
  onCancel: () => void;
}

const MaterialEditRow = ({ material, onSave, onCancel }: MaterialEditRowProps) => {
  const { t } = useLocale();
  const { showToast } = useToast();
  const [editLabel, setEditLabel] = useState(material.label);
  const [editPrice, setEditPrice] = useState(String(material.defaultPrice));
  const [editImage, setEditImage] = useState<EditImageState>('unchanged');
  const [iconFile, setIconFile] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [existingCustomUrl, setExistingCustomUrl] = useState('');

  const builtinSrc = getBuiltinImageSrc(material);

  useEffect(() => {
    if (!materialUsesCustomIcon(material)) return;
    let cancelled = false;
    getIconUrl(material.id).then((url) => {
      if (!cancelled && url) setExistingCustomUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [material.id, material.customIcon]);

  const displayPreviewSrc =
    editImage === 'pending' && previewUrl
      ? previewUrl
      : editImage === 'cleared'
        ? builtinSrc
        : existingCustomUrl || builtinSrc;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_ICON_BYTES) {
      showToast(t('materials.imageTooLarge'), 'error');
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setIconFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setEditImage('pending');
  };

  const handleClearIcon = () => {
    setEditImage('cleared');
    setIconFile(undefined);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(undefined);
  };

  const handleSave = () => {
    const trimmedLabel = editLabel.trim();
    const price = editPrice === '' ? 0 : Number(editPrice);
    if (!trimmedLabel || Number.isNaN(price) || price < 0) return;

    onSave(material.id, {
      label: trimmedLabel,
      defaultPrice: price,
      ...(editImage === 'cleared'
        ? { clearIcon: true, customIcon: false }
        : editImage === 'pending' && iconFile
          ? { iconFile, customIcon: true }
          : material.customIcon
            ? { customIcon: true }
            : {}),
    });
  };

  const showClearIcon =
    materialUsesCustomIcon(material) && editImage !== 'cleared' && editImage !== 'pending';

  return (
    <li className="py-2 first:pt-0 last:pb-0">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-end gap-2">
          <label
            className="calc-btn w-9 h-9 min-w-9 p-0 shrink-0 flex items-center justify-center cursor-pointer overflow-hidden"
            aria-label={t('materials.uploadIcon')}
          >
            {displayPreviewSrc ? (
              <img src={displayPreviewSrc} alt="" className="w-full h-full object-cover" />
            ) : (
              <UploadIcon className="w-4 h-4 text-white/60" />
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
          {showClearIcon && (
            <button
              type="button"
              className="calc-btn w-auto py-1.5 px-2 text-xs"
              onClick={handleClearIcon}
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
