"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Minimal typed shape for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    function beforeInstall(e: Event) {
      const be = e as BeforeInstallPromptEvent;
      be.preventDefault();
      setDeferred(be);
      // Expose the deferred event to the window so pages can prompt explicitly.
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - attach to window for runtime usage
        window.__beachlife_before_install_event = be;
      } catch (err) {
        // ignore
      }
      // DO NOT auto-show a banner — the app/home page will render an explicit Install button.
    }

    function onSwUpdated() {
      setUpdateAvailable(true);
      // Expose update availability but do not auto-show UI.
    }

  window.addEventListener('beforeinstallprompt', beforeInstall as EventListener);
  window.addEventListener('swUpdated', onSwUpdated as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstall as EventListener);
      window.removeEventListener('swUpdated', onSwUpdated as EventListener);
    };
  }, []);

  // We intentionally do not render any banner here. The app's home page will prompt
  // using the deferred event stored on `window.__beachlife_before_install_event`.

  function onUpdate() {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    setUpdateAvailable(false);
    setTimeout(() => location.reload(), 800);
  }

  return null;
}
