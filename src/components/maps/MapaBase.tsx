'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, TrafficLayer } from '@react-google-maps/api';
import { Coordenada, MarcadorCombi, MarcadorAlumnoEsperando } from '@/types';
import { Loading } from '@/components/shared/Loading';

interface MapaBaseProps {
  centro: Coordenada;
  zoom?: number;
  altura?: string;
  mostrarTrafico?: boolean;
  children?: React.ReactNode;
  onMapClick?: (coordenada: Coordenada) => void;

  // Props adicionales para sincronizar mapa Leaflet y Google Maps
  polyline?: Coordenada[];
  combis?: Record<string, MarcadorCombi>;
  alumnos?: MarcadorAlumnoEsperando[];
  posicionUsuario?: Coordenada;
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
  polyline,
  combis,
  alumnos,
  posicionUsuario,
  onMapClick,
}: MapaBaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

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

        const layerGroup = L.layerGroup().addTo(map);
        layerGroupRef.current = layerGroup;
        mapRef.current = map;
      } else {
        // No forzar setView en re-renders para permitir al usuario hacer zoom y mover libremente el mapa
      }

      // Dibujar capas (Polyline, combis, alumnos)
      if (layerGroupRef.current) {
        layerGroupRef.current.clearLayers();

        // 1. Trazar Polyline de la Ruta
        if (polyline && polyline.length > 0) {
          const coords = polyline.map((c) => [c.lat, c.lng] as [number, number]);
          L.polyline(coords, { color: '#1890ff', weight: 5, opacity: 0.8 }).addTo(layerGroupRef.current);
        }

        // 2. Marcadores de Combis en tiempo real (Color azul en curso / Gris si finalizó o desactivó GPS)
        if (combis) {
          Object.values(combis).forEach((c) => {
            const msInactivo = Date.now() - new Date(c.ultima_actualizacion).getTime();
            const esInactivo = (c as any).inactivo || (c as any).estado_viaje === 'finalizado' || msInactivo > 40000;

            const bgColor = esInactivo ? '#8c8c8c' : '#1890ff';
            const opacity = esInactivo ? 0.75 : 1.0;
            const estadoTag = esInactivo ? ' (Inactivo/Finalizado)' : '';

            const combiIcon = L.divIcon({
              className: 'custom-combi-icon',
              html: `
                <div style="background-color: ${bgColor}; opacity: ${opacity}; color: white; padding: 5px 10px; border-radius: 20px; font-weight: bold; font-size: 11px; border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
                  🚌 <span>${c.placa}${estadoTag}</span>
                </div>
              `,
              iconSize: [120, 28],
              iconAnchor: [60, 14],
            });

            const marker = L.marker([c.posicion.lat, c.posicion.lng], { icon: combiIcon }).addTo(layerGroupRef.current);
            marker.bindPopup(`
              <div style="padding: 4px;">
                <h4 style="margin: 0 0 4px 0; font-weight: bold; color: ${bgColor};">Combi ${c.placa} ${estadoTag}</h4>
                <p style="margin: 2px 0;"><b>Chofer:</b> ${c.chofer_nombre}</p>
                <p style="margin: 2px 0;"><b>Estado del viaje:</b> ${esInactivo ? '<span style="color: #8c8c8c; font-weight: bold;">Finalizado / GPS Inactivo</span>' : '<span style="color: #52c41a; font-weight: bold;">En Curso</span>'}</p>
                <p style="margin: 2px 0;"><b>Tiempo en ruta:</b> ${c.tiempo_en_ruta_minutos} min</p>
                ${c.velocidad && !esInactivo ? `<p style="margin: 2px 0;"><b>Velocidad:</b> ${Math.round(c.velocidad)} km/h</p>` : ''}
              </div>
            `);
          });
        }

        // 3. Marcadores de Alumnos Esperando
        if (alumnos) {
          alumnos.forEach((a) => {
            const alumnoIcon = L.divIcon({
              className: 'custom-alumno-icon',
              html: `
                <div style="background-color: #faad14; color: white; padding: 4px 8px; border-radius: 12px; font-weight: bold; font-size: 11px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); white-space: nowrap;">
                  🙋 Esperando (${a.tiempo_esperando_minutos}m)
                </div>
              `,
              iconSize: [100, 24],
              iconAnchor: [50, 12],
            });

            const marker = L.marker([a.posicion.lat, a.posicion.lng], { icon: alumnoIcon }).addTo(layerGroupRef.current);
            marker.bindPopup(`
              <div style="padding: 4px;">
                <p style="margin: 0; font-weight: bold;">Alumno en Paradero</p>
                <p style="margin: 2px 0;">Tiempo esperando: ${a.tiempo_esperando_minutos} minutos</p>
              </div>
            `);
          });
        }

        // 4. Ubicación actual del usuario
        if (posicionUsuario) {
          const userIcon = L.divIcon({
            className: 'custom-user-icon',
            html: `<div style="background-color: #52c41a; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(82,196,26,0.8);"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });
          L.marker([posicionUsuario.lat, posicionUsuario.lng], { icon: userIcon }).addTo(layerGroupRef.current);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [centro, zoom, polyline, combis, alumnos, posicionUsuario, onMapClick]);

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
