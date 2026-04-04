import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, Trash2, Shield, AlertCircle } from 'lucide-react';
import { useFinanceContext } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import ConfirmDialog from './ConfirmDialog';

interface SharingManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SharingManagerModal: React.FC<SharingManagerModalProps> = ({ isOpen, onClose }) => {
    const { shares, actions, isReadOnly } = useFinanceContext();
    const { t } = useLanguage();

    const [inviteId, setInviteId] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [revokingId, setRevokingId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    if (!isOpen) return null;

    const sh = (key: string) => t(`sharing.${key}`);

    const handleInvite = async () => {
        if (!inviteId.trim()) return;
        setIsInviting(true);
        setErrorMsg(null);
        try {
            await actions.inviteUser(inviteId.trim());
            setInviteId('');
        } catch (err: any) {
            setErrorMsg(sh('errorInvite'));
        } finally {
            setIsInviting(false);
        }
    };

    const handleRevoke = async () => {
        if (revokingId) {
            try {
                await actions.revokeShare(revokingId);
                setRevokingId(null);
            } catch (err: any) {
                setErrorMsg(err.message || 'Error revoking share');
                setRevokingId(null);
            }
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg relative z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <Shield className="text-blue-500" size={20} />
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{sh('title')}</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div className="mx-6 mt-3 flex items-start gap-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 px-3 py-2 text-sm text-rose-700 dark:text-rose-400">
                        <AlertCircle size={15} className="mt-0.5 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* Invite Form */}
                {!isReadOnly && (
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{sh('inviteUser')}</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={sh('username')}
                                value={inviteId}
                                onChange={(e) => setInviteId(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                            />
                            <button
                                onClick={handleInvite}
                                disabled={isInviting || !inviteId.trim()}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <UserPlus size={16} />
                                {isInviting ? sh('inviting') : sh('invite')}
                            </button>
                        </div>
                    </div>
                )}

                {/* My Shares List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{sh('myShares')}</h3>
                    {shares.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400 italic">{sh('noShares')}</p>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700 border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden">
                            {shares.map((share) => (
                                <div key={share.sharedWithId} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-slate-900 dark:text-white">{share.sharedWithId}</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(share.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {!isReadOnly && (
                                        <button
                                            onClick={() => setRevokingId(share.sharedWithId)}
                                            className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                                            title={sh('revoke')}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={revokingId !== null}
                title={sh('revoke')}
                message={`${sh('revoke')} access for ${revokingId}?`}
                confirmText={sh('revoke')}
                cancelText={t('cancel')}
                variant="danger"
                onConfirm={handleRevoke}
                onCancel={() => setRevokingId(null)}
            />
        </div>,
        document.body
    );
};

export default SharingManagerModal;
