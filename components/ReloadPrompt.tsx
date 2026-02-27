import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, WifiOff, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ReloadPrompt: React.FC = () => {
    const { t } = useLanguage();
    const [offlineReady, setOfflineReady] = useState(false);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    // Hook for PWA updates
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered:', r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
        onOfflineReady() {
            setOfflineReady(true);
        },
    });

    // Listener to detect physical network connection status
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const closePrompt = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    return (
        <>
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-2">
                {/* Offline Indicator Badge */}
                {isOffline && (
                    <div className="bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in text-sm font-medium">
                        <WifiOff size={16} />
                        {t('pwa.offlineMode')}
                    </div>
                )}

                {/* Update or Offline Ready Prompt */}
                {(needRefresh || offlineReady) && (
                    <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-xl animate-slide-up max-w-sm flex items-start gap-4 ring-1 ring-black/5">
                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-full shrink-0">
                            {needRefresh ? <RefreshCw size={20} className="animate-spin-slow" /> : <WifiOff size={20} />}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                                {needRefresh ? t('pwa.updateAvailable') : t('pwa.offlineReady')}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                                {needRefresh
                                    ? t('pwa.updateDesc')
                                    : t('pwa.offlineDesc')}
                            </p>
                            <div className="flex gap-2">
                                {needRefresh && (
                                    <button
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
                                        onClick={() => updateServiceWorker(true)}
                                    >
                                        {t('pwa.reload')}
                                    </button>
                                )}
                                <button
                                    className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
                                    onClick={closePrompt}
                                >
                                    {t('pwa.close')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ReloadPrompt;
