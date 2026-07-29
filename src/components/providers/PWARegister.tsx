'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('PWA Service Worker registrado con éxito:', registration.scope);
          })
          .catch((error) => {
            console.error('Error al registrar Service Worker:', error);
          });
      });
    }
  }, []);

  return null;
}
