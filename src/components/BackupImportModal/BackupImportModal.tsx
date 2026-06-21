import { useLocale } from '../../context/LocaleContext';
import type { AppBackup } from '../../utils/backupIo';
import type { BackupImportMode } from '../../utils/backupMerge';
import { describeBackup } from '../../utils/backupMerge';

interface BackupImportModalProps {
  isOpen: boolean;
  backup: AppBackup | null;
  onConfirm: (mode: BackupImportMode) => void;
  onCancel: () => void;
}

const BackupImportModal = ({ isOpen, backup, onConfirm, onCancel }: BackupImportModalProps) => {
  const { t } = useLocale();

  if (!isOpen || !backup) return null;

  const summary = describeBackup(backup);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t('common.close')}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        className="glass-container relative flex-col gap-4 p-6 max-w-md w-full items-stretch"
        role="dialog"
        aria-modal="true"
        aria-labelledby="backup-import-title"
      >
        <h2 id="backup-import-title" className="text-lg font-semibold text-center">
          {t('modal.importBackupTitle')}
        </h2>

        <p className="text-sm text-white/70 text-center">{t('modal.importBackupSummary')}</p>

        <ul className="text-sm text-white/85 space-y-1 px-2">
          <li>{t('modal.importBackupMaterials', { count: summary.materialCount })}</li>
          <li>{t('modal.importBackupProfiles', { count: summary.profileCount })}</li>
          <li>{t('modal.importBackupMessages', { count: summary.messageCount })}</li>
        </ul>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="btn w-full py-2"
            onClick={() => onConfirm('merge')}
          >
            {t('modal.importBackupMerge')}
          </button>
          <button
            type="button"
            className="btn w-full py-2 bg-red-500/70 hover:bg-red-500/90"
            onClick={() => onConfirm('replace')}
          >
            {t('modal.importBackupReplace')}
          </button>
          <button type="button" className="btn w-full py-2" onClick={onCancel}>
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackupImportModal;
