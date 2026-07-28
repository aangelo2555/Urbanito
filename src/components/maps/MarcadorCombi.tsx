'use client';

import React from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import { MarcadorCombi } from '@/types';
import { formatearVelocidad, formatearDistancia } from '@/lib/utils/geo';
import { formatearTiempoRelativo } from '@/lib/utils/fechas';

interface MarcadorCombiProps {
  combi: MarcadorCombi;
  seleccionada: boolean;
  onSelect: () => void;
  onDeselect: () => void;
}

export function MarcadorCombiComponent({
  combi,
  seleccionada,
  onSelect,
  onDeselect,
}: MarcadorCombiProps) {
  // Icono SVG de combi con rotación según el rumbo
  const iconoCombi = {
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
    fillColor: '#1890ff',
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: 1.5,
    rotation: combi.rumbo || 0,
    anchor: { x: 12, y: 12 } as google.maps.Point,
  };

  return (
    <>
      <Marker
        position={combi.posicion}
        icon={iconoCombi}
        onClick={onSelect}
        title={`Combi ${combi.placa}`}
      />

      {seleccionada && (
        <InfoWindow position={combi.posicion} onCloseClick={onDeselect}>
          <div className="p-2 min-w-[200px]">
            <h3 className="font-semibold text-lg mb-2">
              Combi {combi.placa}
            </h3>
            <div className="space-y-1 text-sm">
              <p className="text-gray-700">
                <span className="font-medium">Chofer:</span> {combi.chofer_nombre}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Tiempo en ruta:</span>{' '}
                {combi.tiempo_en_ruta_minutos} minutos
              </p>
              {combi.velocidad && (
                <p className="text-gray-700">
                  <span className="font-medium">Velocidad:</span>{' '}
                  {formatearVelocidad(combi.velocidad)}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-2">
                {formatearTiempoRelativo(combi.ultima_actualizacion)}
              </p>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}
