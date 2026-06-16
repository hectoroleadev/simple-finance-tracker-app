import { useFinanceContext } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';

export interface SnapshotPreviewItem {
  label: string;
  value: number;
  color: string;
}

/**
 * Shared snapshot logic — relative "last snapshot" age, staleness, the value
 * preview and the confirm action. Consumed by the header (desktop icon + mobile
 * drawer entry), the keyboard shortcut and the confirmation dialog so the
 * computation lives in one place.
 */
export const useSnapshot = () => {
  const { totals, history, isReadOnly, viewAs, actions } = useFinanceContext();
  const { t, language } = useLanguage();
  const locale = language === 'es' ? 'es-MX' : 'en-US';

  const lastSnapshotDate = history.length > 0 ? new Date(history[0].date) : null;
  const daysSinceSnapshot =
    lastSnapshotDate && !isNaN(lastSnapshotDate.getTime())
      ? Math.max(0, Math.floor((Date.now() - lastSnapshotDate.getTime()) / 86_400_000))
      : null;

  const snapshotAge =
    daysSinceSnapshot === null
      ? null
      : daysSinceSnapshot >= 30
        ? new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
            -Math.round(daysSinceSnapshot / 30),
            'month'
          )
        : new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
            -daysSinceSnapshot,
            'day'
          );

  const hasSnapshot = daysSinceSnapshot !== null;
  const isStale = daysSinceSnapshot !== null && daysSinceSnapshot >= 30;
  const canSnapshot = !isReadOnly && !viewAs;

  // Values frozen by a snapshot, in the same order/colors used by HistoryTable
  const snapshotPreview: SnapshotPreviewItem[] = [
    { label: t('savings'), value: totals.income, color: 'text-emerald-600 dark:text-emerald-400' },
    { label: t('totalDebt'), value: totals.expenses, color: 'text-rose-600 dark:text-rose-400' },
    { label: t('netBalance'), value: totals.balance, color: 'text-blue-600 dark:text-blue-400' },
    {
      label: t('retirementCapital'),
      value: totals.informative,
      color: 'text-amber-600 dark:text-amber-400',
    },
  ];

  return {
    lastSnapshotDate,
    daysSinceSnapshot,
    snapshotAge,
    hasSnapshot,
    isStale,
    canSnapshot,
    locale,
    snapshotPreview,
    confirm: () => actions.snapshotHistory(),
  };
};
