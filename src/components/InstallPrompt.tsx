import { useState, useEffect } from 'react';
import { Download, X, Share, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed or dismissed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    const wasDismissed = localStorage.getItem('pwa-install-dismissed');
    
    if (isInstalled || wasDismissed) {
      return;
    }

    // Android/Chrome install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // iOS detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isIOS && !isInStandaloneMode) {
      // Show iOS prompt after a delay
      setTimeout(() => setShowIOSPrompt(true), 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowIOSPrompt(false);
    setDeferredPrompt(null);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if dismissed or no prompt available
  if (dismissed || (!deferredPrompt && !showIOSPrompt)) {
    return null;
  }

  // iOS Install Instructions
  if (showIOSPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 glass rounded-2xl p-4 z-50 animate-slide-up">
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 hover:bg-muted rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Install DSA Tracker</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Add to your home screen for the best experience
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-muted flex items-center justify-center">1</span>
                <span>Tap the <Share className="w-4 h-4 inline" /> Share button</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-muted flex items-center justify-center">2</span>
                <span>Scroll and tap <Plus className="w-4 h-4 inline" /> "Add to Home Screen"</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Android/Chrome Install Button
  return (
    <div className="fixed bottom-20 left-4 right-4 glass rounded-2xl p-4 z-50 animate-slide-up">
      <button 
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 hover:bg-muted rounded-lg"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Download className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">Install DSA Tracker</h3>
          <p className="text-sm text-muted-foreground">
            Add to home screen for offline access
          </p>
        </div>
        <button
          onClick={handleInstall}
          className="btn-primary"
        >
          Install
        </button>
      </div>
    </div>
  );
};
