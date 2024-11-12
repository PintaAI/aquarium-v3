'use client';

import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-50 md:left-auto md:right-4 md:w-96">
      <h3 className="text-lg font-semibold mb-2">Install Pejuangkorea App</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Install our app for a better experience and quick access to your courses!
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setShowPrompt(false)}>
          Later
        </Button>
        <Button onClick={handleInstallClick}>
          Install
        </Button>
      </div>
    </div>
  );
}
