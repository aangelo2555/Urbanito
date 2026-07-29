'use client';

import React, { useState, useEffect } from 'react';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 1. Verificar si ya está ejecutándose como PWA instalada
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // 2. Detectar si es iOS
    const userAgent = window.navigator.userAgent;
    const iosDevice = /iPhone|iPad|iPod/i.test(userAgent);
    setIsIOS(iosDevice);

    // 3. Capturar evento de instalación para Android / Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // En iOS, si no es standalone, mostramos el botón
    if (iosDevice && !isStandalone) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isStandalone]);

  // Si ya es standalone (App instalada), no mostrar el botón
  if (isStandalone || !showBanner) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      // En iOS abrir modal explicativo con instrucciones
      setShowIOSModal(true);
    } else if (deferredPrompt) {
      // En Android / Chrome invocar el prompt nativo
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <>
      {/* Banner / Botón flotante PWA en la parte inferior */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 animate-bounce-short">
        <div className="bg-gradient-to-r from-primary-600 to-blue-700 text-white p-3.5 rounded-2xl shadow-xl border border-white/20 flex items-center justify-between gap-3 max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-xl shrink-0">
              📲
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Instalar App Urbanito</p>
              <p className="text-xs text-blue-100 leading-tight">
                {isIOS ? 'Agrega la App a tu pantalla de inicio' : 'Acceso directo con GPS optimizado'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-white text-primary-700 hover:bg-blue-50 font-bold text-xs px-3.5 py-2 rounded-xl shadow transition-all active:scale-95 whitespace-nowrap"
            >
              Instalar
            </button>
            <button
              onClick={() => setShowBanner(false)}
              className="text-white/70 hover:text-white p-1 rounded-lg"
              title="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Modal instruccional para iPhone / iOS */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>📱</span> Instalar en iPhone / iPad
              </h3>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-sm text-gray-700">
              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  Toca el botón <strong>Compartir</strong> en la barra inferior de Safari{' '}
                  <span className="inline-block px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300 font-mono text-xs">
                    ⎋
                  </span>
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  Desplázate hacia abajo y selecciona <strong>"Agregar a la pantalla de inicio"</strong> ➕
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  3
                </span>
                <p>
                  Toca <strong>"Agregar"</strong> en la esquina superior derecha y ¡listo!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
