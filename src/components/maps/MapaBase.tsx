'use client';

import React, { useCallback, useState } from 'react';
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

export function MapaBase({
  centro,
  zoom = 14,
  altura = '100%',
  mostrarTrafico = true,
  children,
  onMapClick,
}: MapaBaseProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places', 'geometry'],
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
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <div className="text-center p-4">
          <p className="text-red-600 font-semibold mb-2">Error al cargar el mapa</p>
          <p className="text-gray-600 text-sm">
            Verifica tu conexión a internet y la configuración de la API de Google Maps
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ height: altura }}
      >
        <Loading size="lg" message="Cargando mapa..." />
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

// Componentes auxiliares para usar dentro del mapa

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
