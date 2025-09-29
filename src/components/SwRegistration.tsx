"use client";

import { useEffect } from "react";

export default function SwRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const swPath = window.location.hostname === 'localhost' ? '/sw.js' : '/sw-generated.js';

    navigator.serviceWorker.register(swPath).then((reg) => {
      console.log('SW registered', reg);

      // If there's a waiting worker, tell it to skip waiting so it becomes active
      // immediately and serves the newest content.
      if (reg.waiting) {
        try {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        } catch (err) {
          console.warn('Failed to message waiting SW', err);
        }
      }

      // Reload the page when the new service worker takes control.
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service worker controller changed — reloading to apply update');
        window.location.reload();
      });

      // listen for updatefound
      if (reg.waiting) {
        window.dispatchEvent(new CustomEvent('swUpdated'));
      }
      reg.addEventListener('updatefound', () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // new update available
              window.dispatchEvent(new CustomEvent('swUpdated'));
            }
          }
        });
      });

    }).catch((err) => {
      console.warn('SW registration failed', err);
    });
  }, []);

  return null;
}
