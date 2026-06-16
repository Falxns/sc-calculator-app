import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Material } from '../../types';
import type { AppBackup } from '../../utils/backupIo';
import useToast from '../../hooks/useToast';
import { downloadFullBackupJson, readBackupFromFile } from '../../utils/backupIo';
import Modal from '../Modal/Modal';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
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
  onFullBackupImport: (backup: AppBackup) => void;
}

const toolbarButtonClass = 'btn w-auto p-2.5';

const SideToolbar = ({
  materials,
  setMaterials,
  onMaterialRemoved,
  onMaterialsImported,
  onFullBackupImport,
}: SideToolbarProps) => {
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [pendingBackup, setPendingBackup] = useState<AppBackup | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast, showToast } = useToast();

  const handleExport = () => {
    try {
      downloadFullBackupJson();
      showToast('Backup exported!', 'success');
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
      const result = await readBackupFromFile(file);

      if (result.type === 'materials') {
        setMaterials({ materials: result.materials });
        onMaterialsImported(result.materials);
        showToast('Materials imported!', 'success');
        return;
      }

      setPendingBackup(result.backup);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Import failed!';
      showToast(message, 'error');
    }
  };

  const confirmFullImport = () => {
    if (pendingBackup) {
      onFullBackupImport(pendingBackup);
      showToast('Backup imported!', 'success');
    }
    setPendingBackup(null);
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
          aria-label="Export full backup as JSON"
          onClick={handleExport}
        >
          <DownloadIcon className="w-6 h-6" />
        </button>
        <button
          type="button"
          className={toolbarButtonClass}
          aria-label="Import backup from JSON"
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

      {createPortal(
        <ConfirmModal
          isOpen={pendingBackup !== null}
          message="Import backup? This replaces materials, profiles, and messages."
          confirmLabel="Import"
          onConfirm={confirmFullImport}
          onCancel={() => setPendingBackup(null)}
        />,
        document.body
      )}

      <Toast toast={toast} />
    </>
  );
};

export default SideToolbar;
