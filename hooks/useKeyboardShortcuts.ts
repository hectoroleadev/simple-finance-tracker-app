import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
    description: string;
    action: () => void;
}

interface UseKeyboardShortcutsOptions {
    shortcuts: KeyboardShortcut[];
    enabled?: boolean;
}

/**
 * Hook to handle global keyboard shortcuts
 * @param options - Configuration object with shortcuts and enabled flag
 */
export const useKeyboardShortcuts = ({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) => {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!enabled) return;

            // Don't trigger shortcuts when user is typing in an input
            const target = event.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                // Allow '?' shortcut even in inputs for help
                if (event.key !== '?') {
                    return;
                }
            }

            for (const shortcut of shortcuts) {
                const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

                // Check if modifiers match
                const hasCtrl = event.ctrlKey || event.metaKey;
                const hasShift = event.shiftKey;
                const hasAlt = event.altKey;

                const ctrlMatch = shortcut.ctrl ? hasCtrl : !hasCtrl;
                const shiftMatch = shortcut.shift ? hasShift : !hasShift;
                const altMatch = shortcut.alt ? hasAlt : !hasAlt;

                if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
                    event.preventDefault();
                    shortcut.action();
                    break;
                }
            }
        },
        [shortcuts, enabled]
    );

    useEffect(() => {
        if (!enabled) return;

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown, enabled]);

    return { shortcuts };
};
