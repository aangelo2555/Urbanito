'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, TrafficLayer } from '@react-google-maps/api';
import { Coordenada } from '@/types';
import { Loading } from '@/components/shared/Loading';

interface MapaBaseProps {
  centro: Coordenada;
  zoom?: number;
  altura?: string;
  mostrarTrafico?: boolean;
  children?: React.ReactNode;
  onMapClick?: (coordenada: Coordenada) => void;
}

const mapContainerStyle = {
  width: '100%',
};

const defaultOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

const GOOGLE_MAPS_LIBRARIES: ('places' | 'geometry')[] = ['places', 'geometry'];

export function MapaBase(props: MapaBaseProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Si no hay API key o es una plantilla por defecto, usar OpenStreetMap (Leaflet) para un mapa 100% limpio sin errores
  if (!apiKey || apiKey === '' || apiKey === 'your_google_maps_api_key') {
    return <MapaLeaflet {...props} />;
  }

  return <MapaGoogle {...props} />;
}

function MapaGoogle({
  centro,
  zoom = 14,
  altura = '100%',
  mostrarTrafico = true,
  children,
  onMapClick,
}: MapaBaseProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng && onMapClick) {
        onMapClick({
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
        });
      }
    },
    [onMapClick]
  );

  if (loadError) {
    return <MapaLeaflet centro={centro} zoom={zoom} altura={altura} children={children} onMapClick={onMapClick} />;
  }

  if (!isLoaded) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ height: altura }}
      >
        <Loading size="lg" message="Cargando mapa Google..." />
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ ...mapContainerStyle, height: altura }}
      center={centro}
      zoom={zoom}
      options={defaultOptions}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
    >
      {mostrarTrafico && <TrafficLayer />}
      {children}
    </GoogleMap>
  );
}

function MapaLeaflet({
  centro,
  zoom = 14,
  altura = '100%',
  onMapClick,
}: MapaBaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let isMounted = true;
    import('leaflet').then((L) => {
      if (!isMounted || !containerRef.current) return;

      if (!mapRef.current) {
        const map = L.map(containerRef.current, {
          center: [centro.lat, centro.lng],
          zoom: zoom,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        if (onMapClick) {
          map.on('click', (e: any) => {
            onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
          });
        }

        mapRef.current = map;
      } else {
        mapRef.current.setView([centro.lat, centro.lng], zoom);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [centro, zoom, onMapClick]);

  return (
    <div className="relative w-full" style={{ height: altura }}>
      <div ref={containerRef} className="w-full h-full rounded-lg z-0" />
      <div className="absolute top-2 right-2 z-[1000] bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-md border border-gray-200 text-xs font-medium text-gray-700 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        OpenStreetMap (Mapa Gratuito Sin API Key)
      </div>
    </div>
  );
}

// Componentes auxiliares para usar dentro del mapa de Google

interface MarcadorPersonalizadoProps {
  posicion: Coordenada;
  icono?: string;
  titulo?: string;
  onClick?: () => void;
}

export function MarcadorPersonalizado({
  posicion,
  icono,
  titulo,
  onClick,
}: MarcadorPersonalizadoProps) {
  return (
    <Marker
      position={posicion}
      icon={icono}
      title={titulo}
      onClick={onClick}
    />
  );
}

interface LineaRutaProps {
  coordenadas: Coordenada[];
  color?: string;
  ancho?: number;
}

export function LineaRuta({
  coordenadas,
  color = '#1890ff',
  ancho = 4,
}: LineaRutaProps) {
  return (
    <Polyline
      path={coordenadas}
      options={{
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: ancho,
      }}
    />
  );
}
