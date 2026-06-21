import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from '../../context/LocaleContext';
import { useToast } from '../../context/ToastContext';
import type { Material } from '../../types';
import type { AppBackup } from '../../utils/backupIo';
import type { BackupImportMode } from '../../utils/backupMerge';
import { downloadFullBackupJson, readBackupFromFile } from '../../utils/backupIo';
import { applyImportedMaterialsIcons } from '../../utils/iconStore';
import Modal from '../Modal/Modal';
import BackupImportModal from '../BackupImportModal/BackupImportModal';
import LanguageToggle from '../LanguageToggle/LanguageToggle';
import SettingsIcon from '../icons/SettingsIcon';
import DownloadIcon from '../icons/DownloadIcon';
import UploadIcon from '../icons/UploadIcon';
import MaterialManager from '../MaterialManager/MaterialManager';

interface SideToolbarProps {
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<{ materials: Material[] }>>;
  onMaterialRemoved: (materialId: string, remainingMaterials: Material[]) => void;
  onMaterialsImported: (materials: Material[]) => void;
  onFullBackupImport: (backup: AppBackup, mode: BackupImportMode) => void | Promise<void>;
}

const toolbarButtonClass = 'btn w-11 h-11 min-w-11 p-0 flex items-center justify-center';

const SideToolbar = ({
  materials,
  setMaterials,
  onMaterialRemoved,
  onMaterialsImported,
  onFullBackupImport,
}: SideToolbarProps) => {
  const { t } = useLocale();
  const { showToast } = useToast();
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [pendingBackup, setPendingBackup] = useState<AppBackup | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      await downloadFullBackupJson();
      showToast(t('toast.backupExported'), 'success');
    } catch {
      showToast(t('toast.exportFailed'), 'error');
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
        const imported = await applyImportedMaterialsIcons(result.materials, result.icons);
        setMaterials({ materials: imported });
        onMaterialsImported(imported);
        showToast(t('toast.materialsImported'), 'success');
        return;
      }

      setPendingBackup(result.backup);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('toast.exportFailed');
      showToast(message, 'error');
    }
  };

  const confirmFullImport = async (mode: BackupImportMode) => {
    if (pendingBackup) {
      await onFullBackupImport(pendingBackup, mode);
      showToast(
        mode === 'merge' ? t('toast.backupMerged') : t('toast.backupImported'),
        'success'
      );
    }
    setPendingBackup(null);
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-30 flex flex-col items-stretch gap-2">
        <button
          type="button"
          className={toolbarButtonClass}
          aria-label={t('side.manageMaterials')}
          aria-haspopup="dialog"
          aria-expanded={isManagerOpen}
          onClick={() => setIsManagerOpen(true)}
        >
          <SettingsIcon className="w-6 h-6" />
        </button>
        <button
          type="button"
          className={toolbarButtonClass}
          aria-label={t('side.exportBackup')}
          onClick={() => void handleExport()}
        >
          <DownloadIcon className="w-6 h-6" />
        </button>
        <button
          type="button"
          className={toolbarButtonClass}
          aria-label={t('side.importBackup')}
          onClick={handleImportClick}
        >
          <UploadIcon className="w-6 h-6" />
        </button>
        <LanguageToggle />
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => void handleImportFile(e)}
        />
      </div>

      <Modal
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        title={t('modal.manageMaterials')}
      >
        <MaterialManager
          materials={materials}
          setMaterials={setMaterials}
          onMaterialRemoved={onMaterialRemoved}
        />
      </Modal>

      {createPortal(
        <BackupImportModal
          isOpen={pendingBackup !== null}
          backup={pendingBackup}
          onConfirm={(mode) => void confirmFullImport(mode)}
          onCancel={() => setPendingBackup(null)}
        />,
        document.body
      )}
    </>
  );
};

export default SideToolbar;
