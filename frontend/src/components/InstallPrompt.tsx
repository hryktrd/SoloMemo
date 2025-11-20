import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Check if user has dismissed before
            const dismissed = localStorage.getItem('pwa-install-dismissed');
            if (!dismissed) {
                setShowPrompt(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowPrompt(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowPrompt(false);
        }

        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    const handleShowAgain = () => {
        localStorage.removeItem('pwa-install-dismissed');
        if (deferredPrompt) {
            setShowPrompt(true);
        }
    };

    // Floating install button (always visible if installable)
    const showFloatingButton = deferredPrompt && !showPrompt;

    if (!deferredPrompt && !showPrompt) return null;

    return (
        <>
            {/* Install Banner */}
            {showPrompt && (
                <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 shadow-lg z-50 animate-slide-up">
                    <div className="container mx-auto max-w-2xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                            <svg className="w-10 h-10 flex-shrink-0" viewBox="0 0 512 512" fill="currentColor">
                                <rect width="512" height="512" rx="100" fill="white" opacity="0.2" />
                                <path d="M180 180 h152 M180 256 h120 M180 332 h90" stroke="white" strokeWidth="20" strokeLinecap="round" />
                            </svg>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg">SoloMemoをインストール</h3>
                                <p className="text-sm opacity-90 truncate">ホーム画面に追加して、アプリのように使えます</p>
                            </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <button
                                onClick={handleDismiss}
                                className="px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                            >
                                後で
                            </button>
                            <button
                                onClick={handleInstall}
                                className="px-4 py-2 bg-white text-blue-600 font-semibold rounded hover:bg-opacity-90 transition-colors"
                            >
                                インストール
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Install Button */}
            {showFloatingButton && (
                <button
                    onClick={handleShowAgain}
                    className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-40 group"
                    title="ホーム画面に追加"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-3 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        ホーム画面に追加
                    </span>
                </button>
            )}
        </>
    );
};

export default InstallPrompt;
