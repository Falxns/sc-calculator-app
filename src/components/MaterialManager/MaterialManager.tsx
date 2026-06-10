import { useState } from 'react';
import {
  createUniqueMaterialId,
} from '../../constants/materials';
import type { Material } from '../../types';
import { getMaterialImageSrc } from '../../utils/materialImage';

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

interface MaterialManagerProps {
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<{ materials: Material[] }>>;
  onMaterialRemoved: (materialId: string, remainingMaterials: Material[]) => void;
}

const MaterialManager = ({
  materials,
  setMaterials,
  onMaterialRemoved,
}: MaterialManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [defaultPrice, setDefaultPrice] = useState('');
  const [imageData, setImageData] = useState<string | undefined>();

  const resetForm = () => {
    setLabel('');
    setDefaultPrice('');
    setImageData(undefined);
  };

  const handleAddMaterial = () => {
    const trimmedLabel = label.trim();
    const price = defaultPrice === '' ? 0 : Number(defaultPrice);
    if (!trimmedLabel || Number.isNaN(price) || price < 0) return;

    const id = createUniqueMaterialId(
      trimmedLabel,
      materials.map((m) => m.id)
    );

    const newMaterial: Material = {
      id,
      label: trimmedLabel,
      defaultPrice: price,
      ...(imageData ? { imageData } : {}),
    };

    setMaterials((prev) => ({
      materials: [...prev.materials, newMaterial],
    }));
    resetForm();
  };

  const handleRemoveMaterial = (materialId: string) => {
    if (materials.length <= 1) return;
    const remainingMaterials = materials.filter((m) => m.id !== materialId);
    setMaterials({ materials: remainingMaterials });
    onMaterialRemoved(materialId, remainingMaterials);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 200_000) {
      alert('Image is too large. Please use an icon under 200 KB.');
      e.target.value = '';
      return;
    }
    setImageData(await readFileAsDataUrl(file));
    e.target.value = '';
  };

  return (
    <div className="w-full border-t border-white/10 pt-3">
      <button
        type="button"
        className="text-sm text-white/70 hover:text-white transition-colors"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
      >
        {isOpen ? '▾ Hide materials' : '▸ Manage materials'}
      </button>

      {isOpen && (
        <div className="mt-3 flex flex-col gap-3">
          <ul className="flex flex-col gap-2">
            {materials.map((material) => (
              <li
                key={material.id}
                className="flex items-center gap-2 text-sm py-1 border-b border-white/5 last:border-b-0"
              >
                {getMaterialImageSrc(material) ? (
                  <img
                    src={getMaterialImageSrc(material)}
                    alt=""
                    className="w-6 h-6 shrink-0"
                  />
                ) : (
                  <span className="w-6 h-6 shrink-0 rounded bg-white/10" />
                )}
                <span className="flex-1 min-w-0 truncate">{material.label}</span>
                <span className="text-white/60 shrink-0">
                  {material.defaultPrice.toLocaleString()}
                </span>
                <button
                  type="button"
                  className="btn w-auto p-1 shrink-0 text-xs"
                  aria-label={`Remove ${material.label}`}
                  disabled={materials.length <= 1}
                  onClick={() => handleRemoveMaterial(material.id)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-end gap-2">
            <input
              className="input py-1.5 px-2 text-sm flex-1 min-w-[6rem]"
              type="text"
              placeholder="Name"
              value={label}
              aria-label="Material name"
              onChange={(e) => setLabel(e.target.value)}
            />
            <input
              className="input py-1.5 px-2 text-sm w-24 text-center"
              type="number"
              placeholder="Price"
              value={defaultPrice}
              aria-label="Default price"
              onChange={(e) => setDefaultPrice(e.target.value)}
            />
            <label className="btn w-auto py-1.5 px-2 text-sm cursor-pointer">
              Icon
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
            <button
              type="button"
              className="btn w-auto py-1.5 px-3 text-sm"
              onClick={handleAddMaterial}
            >
              Add
            </button>
          </div>
          {imageData && (
            <p className="text-xs text-white/50">Custom icon selected</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MaterialManager;
