"use client";

import { useEffect } from "react";

export default function SwRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const swPath = window.location.hostname === 'localhost' ? '/sw.js' : '/sw-generated.js';

    navigator.serviceWorker.register(swPath).then((reg) => {
      console.log('SW registered', reg);

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
