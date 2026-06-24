import { useCallback, useMemo, useState } from 'react';
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
import type { Material } from '../../types';
import { deleteIcon, putIconFromFile } from '../../utils/iconStore';
import MaterialSortableRow from './MaterialSortableRow';
import MaterialEditRow from './MaterialEditRow';
import MaterialAddRow from './MaterialAddRow';

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
  const sensors = useSortableSensors();
  const [editingId, setEditingId] = useState<string | null>(null);

  const materialIds = useMemo(() => materials.map((m) => m.id), [materials]);
  const dragDisabled = editingId !== null;
  const canRemove = materials.length > 1;

  const startEdit = useCallback((materialId: string) => {
    setEditingId(materialId);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  const handleSaveEdit = useCallback(
    async (
      id: string,
      updates: {
        label: string;
        defaultPrice: number;
        customIcon?: boolean;
        iconFile?: File;
        clearIcon?: boolean;
      }
    ) => {
      if (updates.clearIcon) {
        await deleteIcon(id);
      } else if (updates.iconFile) {
        await putIconFromFile(id, updates.iconFile);
      }

      setMaterials((prev) => ({
        materials: prev.materials.map((material) => {
          if (material.id !== id) return material;

          const updated: Material = {
            ...material,
            label: updates.label,
            defaultPrice: updates.defaultPrice,
          };

          if (updates.clearIcon) {
            delete updated.customIcon;
          } else if (updates.customIcon) {
            updated.customIcon = true;
          }

          return updated;
        }),
      }));
      setEditingId(null);
    },
    [setMaterials]
  );

  const handleAddMaterial = useCallback(
    async (draft: Pick<Material, 'label' | 'defaultPrice'> & { customIcon?: boolean }, iconFile?: File) => {
      const id = createUniqueMaterialId(draft.label, materialIds);
      if (iconFile) await putIconFromFile(id, iconFile);

      setMaterials((prev) => ({
        materials: [
          ...prev.materials,
          {
            id,
            label: draft.label,
            defaultPrice: draft.defaultPrice,
            ...(iconFile ? { customIcon: true } : {}),
          },
        ],
      }));
    },
    [materialIds, setMaterials]
  );

  const handleRemoveMaterial = useCallback(
    (materialId: string) => {
      setEditingId((current) => (current === materialId ? null : current));
      setMaterials((prev) => {
        if (prev.materials.length <= 1) return prev;
        const remainingMaterials = prev.materials.filter((m) => m.id !== materialId);
        void deleteIcon(materialId);
        onMaterialRemoved(materialId, remainingMaterials);
        return { materials: remainingMaterials };
      });
    },
    [onMaterialRemoved, setMaterials]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || editingId) return;

      setMaterials((prev) => {
        const oldIndex = prev.materials.findIndex((m) => m.id === active.id);
        const newIndex = prev.materials.findIndex((m) => m.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;

        return { materials: arrayMove(prev.materials, oldIndex, newIndex) };
      });
    },
    [editingId, setMaterials]
  );

  const editingMaterial = editingId
    ? materials.find((m) => m.id === editingId)
    : undefined;

  return (
    <div className="flex flex-col gap-3 w-full">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={materialIds} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col divide-y divide-white/10">
            {materials.map((material) =>
              editingId === material.id && editingMaterial ? (
                <MaterialEditRow
                  key={material.id}
                  material={editingMaterial}
                  onSave={handleSaveEdit}
                  onCancel={cancelEdit}
                />
              ) : (
                <MaterialSortableRow
                  key={material.id}
                  material={material}
                  dragDisabled={dragDisabled}
                  canRemove={canRemove}
                  onEdit={startEdit}
                  onRemove={handleRemoveMaterial}
                />
              )
            )}
            <MaterialAddRow onAdd={handleAddMaterial} />
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default MaterialManager;
