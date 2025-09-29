"use client";

import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<any | null>(null);
  const [visible, setVisible] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    function beforeInstall(e: any) {
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    }

    function onSwUpdated() {
      setUpdateAvailable(true);
      setVisible(true);
    }

    window.addEventListener('beforeinstallprompt', beforeInstall as EventListener);
    window.addEventListener('swUpdated', onSwUpdated as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstall as EventListener);
      window.removeEventListener('swUpdated', onSwUpdated as EventListener);
    };
  }, []);

  function onInstall() {
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.then(() => {
      setDeferred(null);
      setVisible(false);
    });
  }

  function onUpdate() {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    setUpdateAvailable(false);
    setVisible(false);
    setTimeout(() => location.reload(), 800);
  }

  if (!visible) return null;

  return (
    <div style={{ position: 'fixed', bottom: 80, left: 16, right: 16, display: 'flex', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: 12, borderRadius: 12, boxShadow: '0 6px 20px rgba(2,6,23,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="/icons/icon-192.png" style={{ width: 40, height: 40, borderRadius: 8 }} alt="app" />
        <div style={{ minWidth: 200 }}>
          <div style={{ fontWeight: 600 }}>Install BeachLife</div>
          <div style={{ fontSize: 12, color: '#475569' }}>Save the app to your home screen for faster access</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!updateAvailable ? (
            <>
              <button onClick={onInstall} style={{ padding: '8px 14px', background: '#06b6d4', color: 'white', borderRadius: 10, border: 'none' }}>Install</button>
              <button onClick={() => setVisible(false)} style={{ padding: '8px 12px', borderRadius: 10 }}>Dismiss</button>
            </>
          ) : (
            <>
              <button onClick={onUpdate} style={{ padding: '8px 14px', background: '#0ea5a4', color: 'white', borderRadius: 10, border: 'none' }}>Update</button>
              <button onClick={() => setVisible(false)} style={{ padding: '8px 12px', borderRadius: 10 }}>Later</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
