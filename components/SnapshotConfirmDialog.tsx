import React from 'react';
import ConfirmDialog from './ConfirmDialog';
import { formatCurrency } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';
import { useSnapshot } from '../hooks/useSnapshot';

interface SnapshotConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Confirmation dialog for recording a snapshot. Shows a preview of the four
 * values that will be frozen into history, then commits via useSnapshot().
 */
const SnapshotConfirmDialog: React.FC<SnapshotConfirmDialogProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const locale = language === 'es' ? 'es-MX' : 'en-US';
  const { snapshotPreview, confirm } = useSnapshot();

  const handleConfirm = () => {
    confirm();
    onClose();
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      title={t('confirmSnapshot')}
      message={t('confirmSnapshotMessage')}
      confirmText={t('save')}
      cancelText={t('cancel')}
      onConfirm={handleConfirm}
      onCancel={onClose}
      variant="info"
    >
      <div className="grid grid-cols-2 gap-2">
        {snapshotPreview.map(({ label, value, color }) => (
          <div key={label} className="rounded-lg bg-slate-50 dark:bg-slate-700/30 px-3 py-2">
            <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-0.5">
              {label}
            </span>
            <span className={`text-sm font-bold tabular-nums ${color}`}>
              {formatCurrency(value)}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-400 dark:text-slate-500 text-right capitalize">
        {new Date().toLocaleDateString(locale, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </p>
    </ConfirmDialog>
  );
};

export default SnapshotConfirmDialog;
