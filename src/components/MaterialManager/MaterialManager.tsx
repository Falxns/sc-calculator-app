import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { createUniqueMaterialId } from '../../utils/slugify';
import useSortableSensors from '../../hooks/useSortableSensors';
import { useLocale } from '../../context/LocaleContext';
import type { Material } from '../../types';
import { getMaterialImageSrc } from '../../utils/materialImage';
import { MAX_ICON_BYTES, readFileAsDataUrl } from '../../utils/readFileAsDataUrl';
import MaterialSortableRow from './MaterialSortableRow';
import PlusIcon from '../icons/PlusIcon';
import UploadIcon from '../icons/UploadIcon';

interface MaterialManagerProps {
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<{ materials: Material[] }>>;
  onMaterialRemoved: (materialId: string, remainingMaterials: Material[]) => void;
  onNotify: (message: string, type: 'success' | 'error') => void;
}

type EditImageState = 'unchanged' | 'cleared' | string;

const MaterialManager = ({
  materials,
  setMaterials,
  onMaterialRemoved,
  onNotify,
}: MaterialManagerProps) => {
  const { t } = useLocale();
  const sensors = useSortableSensors();

  const [label, setLabel] = useState('');
  const [defaultPrice, setDefaultPrice] = useState('');
  const [imageData, setImageData] = useState<string | undefined>();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editImage, setEditImage] = useState<EditImageState>('unchanged');

  const resetAddForm = () => {
    setLabel('');
    setDefaultPrice('');
    setImageData(undefined);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel('');
    setEditPrice('');
    setEditImage('unchanged');
  };

  const startEdit = (material: Material) => {
    setEditingId(material.id);
    setEditLabel(material.label);
    setEditPrice(String(material.defaultPrice));
    setEditImage('unchanged');
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onLoaded: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_ICON_BYTES) {
      onNotify(t('materials.imageTooLarge'), 'error');
      return;
    }
    onLoaded(await readFileAsDataUrl(file));
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
    resetAddForm();
  };

  const handleSaveEdit = () => {
    if (!editingId) return;

    const trimmedLabel = editLabel.trim();
    const price = editPrice === '' ? 0 : Number(editPrice);
    if (!trimmedLabel || Number.isNaN(price) || price < 0) return;

    setMaterials((prev) => ({
      materials: prev.materials.map((material) => {
        if (material.id !== editingId) return material;

        const updated: Material = {
          ...material,
          label: trimmedLabel,
          defaultPrice: price,
        };

        if (editImage === 'cleared') {
          delete updated.imageData;
        } else if (editImage !== 'unchanged') {
          updated.imageData = editImage;
        }

        return updated;
      }),
    }));
    cancelEdit();
  };

  const handleRemoveMaterial = (materialId: string) => {
    if (materials.length <= 1) return;
    if (editingId === materialId) cancelEdit();
    const remainingMaterials = materials.filter((m) => m.id !== materialId);
    setMaterials({ materials: remainingMaterials });
    onMaterialRemoved(materialId, remainingMaterials);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || editingId) return;

    setMaterials((prev) => {
      const oldIndex = prev.materials.findIndex((m) => m.id === active.id);
      const newIndex = prev.materials.findIndex((m) => m.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;

      return { materials: arrayMove(prev.materials, oldIndex, newIndex) };
    });
  };

  const editingMaterial = materials.find((m) => m.id === editingId);
  const editPreviewSrc =
    editImage === 'unchanged'
      ? getMaterialImageSrc(editingMaterial)
      : editImage === 'cleared'
        ? editingMaterial?.imgSrc
          ? getMaterialImageSrc({ ...editingMaterial, imageData: undefined })
          : ''
        : editImage;

  const materialIds = materials.map((m) => m.id);
  const dragDisabled = editingId !== null;

  return (
    <div className="flex flex-col gap-3 w-full">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={materialIds} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col divide-y divide-white/10">
            {materials.map((material) =>
              editingId === material.id ? (
                <li key={material.id} className="py-2 first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-end gap-2">
                      <label
                        className="btn w-9 h-9 min-w-9 p-0 shrink-0 flex items-center justify-center cursor-pointer overflow-hidden"
                        aria-label={t('materials.uploadIcon')}
                      >
                        {editPreviewSrc ? (
                          <img
                            src={editPreviewSrc}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UploadIcon className="w-4 h-4 text-white/60" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, (data) => setEditImage(data))}
                        />
                      </label>
                      {material.imageData && (
                        <button
                          type="button"
                          className="btn w-auto py-1.5 px-2 text-xs"
                          onClick={() => setEditImage('cleared')}
                        >
                          {t('materials.clearIcon')}
                        </button>
                      )}
                      <input
                        className="input py-1.5 px-2 text-sm flex-1 min-w-[6rem]"
                        type="text"
                        value={editLabel}
                        aria-label={t('materials.materialName')}
                        onChange={(e) => setEditLabel(e.target.value)}
                      />
                      <input
                        className="input py-1.5 px-2 text-sm w-24 text-center"
                        type="number"
                        value={editPrice}
                        aria-label={t('materials.defaultPrice')}
                        onChange={(e) => setEditPrice(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        className="btn w-auto py-1.5 px-3 text-sm"
                        onClick={cancelEdit}
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        type="button"
                        className="btn w-auto py-1.5 px-3 text-sm"
                        onClick={handleSaveEdit}
                      >
                        {t('common.save')}
                      </button>
                    </div>
                  </div>
                </li>
              ) : (
                <MaterialSortableRow
                  key={material.id}
                  material={material}
                  dragDisabled={dragDisabled}
                  canRemove={materials.length > 1}
                  onEdit={startEdit}
                  onRemove={handleRemoveMaterial}
                />
              )
            )}
            <li className="pt-2">
              <div className="flex flex-wrap items-end gap-2">
                <label
                  className="btn w-9 h-9 min-w-9 p-0 shrink-0 flex items-center justify-center cursor-pointer overflow-hidden"
                  aria-label={t('materials.uploadIcon')}
                >
                  {imageData ? (
                    <img src={imageData} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UploadIcon className="w-4 h-4 text-white/60" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, setImageData)}
                  />
                </label>
                <input
                  className="input py-1.5 px-2 text-sm flex-1 min-w-[6rem]"
                  type="text"
                  placeholder={t('common.name')}
                  value={label}
                  aria-label={t('materials.materialName')}
                  onChange={(e) => setLabel(e.target.value)}
                />
                <input
                  className="input py-1.5 px-2 text-sm w-24 text-center"
                  type="number"
                  placeholder={t('common.price')}
                  value={defaultPrice}
                  aria-label={t('materials.defaultPrice')}
                  onChange={(e) => setDefaultPrice(e.target.value)}
                />
                <button
                  type="button"
                  className="btn w-9 h-9 min-w-9 p-0 shrink-0 flex items-center justify-center"
                  aria-label={t('materials.addMaterial')}
                  onClick={handleAddMaterial}
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
            </li>
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default MaterialManager;
