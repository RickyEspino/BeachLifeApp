"use client";

import { useEffect } from "react";

export default function SwRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log('SW registered', reg);
      }).catch((err) => {
        console.warn('SW registration failed', err);
      });
    }
  }, []);

  return null;
}
