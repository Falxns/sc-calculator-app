import { useRef, useState } from 'react';
import type { Material } from '../../types';
import useToast from '../../hooks/useToast';
import { downloadMaterialsJson, readMaterialsFromFile } from '../../utils/materialsIo';
import Modal from '../Modal/Modal';
import Toast from '../Toast/Toast';
import SettingsIcon from '../icons/SettingsIcon';
import DownloadIcon from '../icons/DownloadIcon';
import UploadIcon from '../icons/UploadIcon';
import MaterialManager from '../MaterialManager/MaterialManager';

interface SideToolbarProps {
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<{ materials: Material[] }>>;
  onMaterialRemoved: (materialId: string, remainingMaterials: Material[]) => void;
  onMaterialsImported: (materials: Material[]) => void;
}

const toolbarButtonClass = 'btn w-auto p-2.5';

const SideToolbar = ({
  materials,
  setMaterials,
  onMaterialRemoved,
  onMaterialsImported,
}: SideToolbarProps) => {
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast, showToast } = useToast();

  const handleExport = () => {
    try {
      downloadMaterialsJson(materials);
      showToast('Materials exported!', 'success');
    } catch {
      showToast('Export failed!', 'error');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const imported = await readMaterialsFromFile(file);
      setMaterials({ materials: imported });
      onMaterialsImported(imported);
      showToast('Materials imported!', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Import failed!';
      showToast(message, 'error');
    }
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-30 flex flex-col gap-2">
        <button
          type="button"
          className={toolbarButtonClass}
          aria-label="Manage materials"
          aria-haspopup="dialog"
          aria-expanded={isManagerOpen}
          onClick={() => setIsManagerOpen(true)}
        >
          <SettingsIcon className="w-6 h-6" />
        </button>
        <button
          type="button"
          className={toolbarButtonClass}
          aria-label="Export materials as JSON"
          onClick={handleExport}
        >
          <DownloadIcon className="w-6 h-6" />
        </button>
        <button
          type="button"
          className={toolbarButtonClass}
          aria-label="Import materials from JSON"
          onClick={handleImportClick}
        >
          <UploadIcon className="w-6 h-6" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleImportFile}
        />
      </div>

      <Modal isOpen={isManagerOpen} onClose={() => setIsManagerOpen(false)} title="Manage materials">
        <MaterialManager
          materials={materials}
          setMaterials={setMaterials}
          onMaterialRemoved={onMaterialRemoved}
        />
      </Modal>

      <Toast toast={toast} />
    </>
  );
};

export default SideToolbar;
