"use client";

import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<any | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function beforeInstall(e: any) {
      e.preventDefault();
      setDeferred(e);
+      setVisible(true);
    }

    window.addEventListener('beforeinstallprompt', beforeInstall as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstall as EventListener);
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

  if (!visible) return null;

  return (
    <div style={{ position: 'fixed', bottom: 80, left: 16, right: 16, display: 'flex', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: 12, borderRadius: 12, boxShadow: '0 6px 20px rgba(2,6,23,0.08)' }}>
        <div style={{ marginBottom: 8 }}>Install BeachLife for a better experience</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onInstall} style={{ padding: '8px 12px', background: '#06b6d4', color: 'white', borderRadius: 8 }}>Install</button>
          <button onClick={() => setVisible(false)} style={{ padding: '8px 12px' }}>Dismiss</button>
        </div>
      </div>
    </div>
  );
}
