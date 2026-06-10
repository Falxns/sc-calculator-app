import { useState } from 'react';
import { createUniqueMaterialId } from '../../constants/materials';
import type { Material } from '../../types';
import { getMaterialImageSrc } from '../../utils/materialImage';
import PlusIcon from '../icons/PlusIcon';

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
    <div className="flex flex-col gap-3 w-full">
      <ul className="flex flex-col divide-y divide-white/10">
        {materials.map((material) => (
          <li
            key={material.id}
            className="flex items-center gap-2 text-sm py-2 first:pt-0 last:pb-0"
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
              className="btn w-7 h-7 min-w-7 p-0 shrink-0 flex items-center justify-center text-base leading-none"
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
        <label
          className="btn w-9 h-9 min-w-9 p-0 shrink-0 flex items-center justify-center cursor-pointer overflow-hidden text-xs"
          aria-label="Upload icon"
        >
          {imageData ? (
            <img src={imageData} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white/60">Icon</span>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
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
        <button
          type="button"
          className="btn w-9 h-9 min-w-9 p-0 shrink-0 flex items-center justify-center"
          aria-label="Add material"
          onClick={handleAddMaterial}
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MaterialManager;
