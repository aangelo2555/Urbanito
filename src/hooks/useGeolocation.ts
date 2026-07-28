import { useState, useEffect, useCallback } from 'react';
import { Coordenada } from '@/types';

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

interface GeolocationState {
  posicion: Coordenada | null;
  error: string | null;
  loading: boolean;
  precisión: number | null;
}

export function useGeolocation(opciones?: UseGeolocationOptions) {
  const [state, setState] = useState<GeolocationState>({
    posicion: null,
    error: null,
    loading: true,
    precisión: null,
  });

  const options: PositionOptions = {
    enableHighAccuracy: opciones?.enableHighAccuracy ?? true,
    timeout: opciones?.timeout ?? 10000,
    maximumAge: opciones?.maximumAge ?? 0,
  };

  const obtenerPosicion = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        posicion: null,
        error: 'Tu navegador no soporta geolocalización',
        loading: false,
        precisión: null,
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          posicion: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          error: null,
          loading: false,
          precisión: position.coords.accuracy,
        });
      },
      (error) => {
        let mensaje = 'Error al obtener ubicación';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            mensaje = 'Permiso de ubicación denegado. Actívalo en la configuración de tu navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            mensaje = 'Ubicación no disponible. Verifica tu conexión y GPS.';
            break;
          case error.TIMEOUT:
            mensaje = 'Tiempo de espera agotado. Intenta nuevamente.';
            break;
        }

        setState({
          posicion: null,
          error: mensaje,
          loading: false,
          precisión: null,
        });
      },
      options
    );
  }, [options.enableHighAccuracy, options.timeout, options.maximumAge]);

  useEffect(() => {
    obtenerPosicion();
  }, [obtenerPosicion]);

  return {
    ...state,
    refrescar: obtenerPosicion,
  };
}

export function useGeolocationWatch(
  callback: (posicion: Coordenada, velocidad?: number, rumbo?: number) => void,
  opciones?: UseGeolocationOptions
) {
  const [error, setError] = useState<string | null>(null);
  const [watching, setWatching] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: opciones?.enableHighAccuracy ?? true,
      timeout: opciones?.timeout ?? 10000,
      maximumAge: opciones?.maximumAge ?? 0,
    };

    setWatching(true);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setError(null);
        callback(
          {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          position.coords.speed ?? undefined,
          position.coords.heading ?? undefined
        );
      },
      (error) => {
        let mensaje = 'Error al rastrear ubicación';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            mensaje = 'Permiso de ubicación denegado';
            break;
          case error.POSITION_UNAVAILABLE:
            mensaje = 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            mensaje = 'Tiempo de espera agotado';
            break;
        }

        setError(mensaje);
      },
      options
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setWatching(false);
    };
  }, [callback, opciones?.enableHighAccuracy, opciones?.timeout, opciones?.maximumAge]);

  return { error, watching };
}
