import { useEffect, useState } from 'react';
import { useLocale } from '../../context/LocaleContext';

const INSTALL_HINT_KEY = 'pwaInstallHintDismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallAppBanner = () => {
  const { t } = useLocale();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(INSTALL_HINT_KEY)) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const dismiss = () => {
    localStorage.setItem(INSTALL_HINT_KEY, '1');
    setVisible(false);
    setDeferredPrompt(null);
  };

  const install = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    dismiss();
  };

  if (!visible || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(100vw-2rem,28rem)]">
      <div className="dropdown-panel px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/85">{t('pwa.installHint')}</p>
        <div className="flex gap-2 shrink-0">
          <button type="button" className="btn w-auto px-3 py-1.5 text-sm" onClick={install}>
            {t('pwa.install')}
          </button>
          <button type="button" className="btn w-auto px-3 py-1.5 text-sm" onClick={dismiss}>
            {t('pwa.dismiss')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallAppBanner;
