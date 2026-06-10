import { useState } from 'react';
import type { Material } from '../../types';
import Modal from '../Modal/Modal';
import SettingsIcon from '../icons/SettingsIcon';
import MaterialManager from './MaterialManager';

interface MaterialManagerTriggerProps {
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<{ materials: Material[] }>>;
  onMaterialRemoved: (materialId: string, remainingMaterials: Material[]) => void;
}

const MaterialManagerTrigger = ({
  materials,
  setMaterials,
  onMaterialRemoved,
}: MaterialManagerTriggerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn fixed top-4 right-4 z-30 w-auto p-2.5"
        aria-label="Manage materials"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <SettingsIcon className="w-6 h-6" />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Manage materials">
        <MaterialManager
          materials={materials}
          setMaterials={setMaterials}
          onMaterialRemoved={onMaterialRemoved}
        />
      </Modal>
    </>
  );
};

export default MaterialManagerTrigger;
