'use client';

import React from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import { MarcadorAlumnoEsperando, MarcadorAlumnoCompletoAdmin } from '@/types';

interface MarcadorAlumnoEsperandoProps {
  alumno: MarcadorAlumnoEsperando | MarcadorAlumnoCompletoAdmin;
  mostrarInfo: boolean;
  vistaAdmin?: boolean;
  onSelect: () => void;
  onDeselect: () => void;
}

export function MarcadorAlumnoEsperandoComponent({
  alumno,
  mostrarInfo,
  vistaAdmin = false,
  onSelect,
  onDeselect,
}: MarcadorAlumnoEsperandoProps) {
  // Icono de alumno esperando
  const iconoAlumno = {
    path: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
    fillColor: '#f59e0b',
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: 1.2,
    anchor: { x: 12, y: 12 } as google.maps.Point,
  };

  const esAdmin = vistaAdmin && 'nombre' in alumno;

  return (
    <>
      <Marker
        position={alumno.posicion}
        icon={iconoAlumno}
        onClick={onSelect}
        title={esAdmin ? `${alumno.nombre} esperando` : 'Alumno esperando'}
      />

      {mostrarInfo && (
        <InfoWindow position={alumno.posicion} onCloseClick={onDeselect}>
          <div className="p-2 min-w-[180px]">
            <h3 className="font-semibold text-base mb-2">
              {esAdmin ? alumno.nombre : 'Alumno esperando'}
            </h3>
            <div className="space-y-1 text-sm">
              {esAdmin && (
                <>
                  <p className="text-gray-700">
                    <span className="font-medium">Código:</span> {alumno.codigo_estudiante}
                  </p>
                  {alumno.telefono && (
                    <p className="text-gray-700">
                      <span className="font-medium">Teléfono:</span> {alumno.telefono}
                    </p>
                  )}
                </>
              )}
              <p className="text-gray-700">
                <span className="font-medium">Esperando:</span>{' '}
                {alumno.tiempo_esperando_minutos} min
              </p>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}
