'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapaBase, LineaRuta } from '@/components/maps/MapaBase';
import { MarcadorCombiComponent } from '@/components/maps/MarcadorCombi';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { Alert } from '@/components/shared/Alert';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useMapaStore } from '@/store/mapaStore';
import { ViajeService } from '@/lib/services/viaje.service';
import { RutaService } from '@/lib/services/ruta.service';
import { UbicacionEsperaService } from '@/lib/services/ubicacion-espera.service';
import { MarcadorCombi, Ruta, UbicacionTiempoReal } from '@/types';
import { calcularMinutosTranscurridos } from '@/lib/utils/fechas';

export default function AlumnoPage() {
  const { usuario } = useAuth();
  const { posicion, error: errorGPS } = useGeolocation();
  const { centroMapa, zoom, combiSeleccionada, mostrarTrafico, setCombiSeleccionada } =
    useMapaStore();

  const [combis, setCombis] = useState<Record<string, MarcadorCombi>>({});
  const [ruta, setRuta] = useState<Ruta | null>(null);
  const [esperando, setEsperando] = useState(false);
  const [ubicacionEsperaId, setUbicacionEsperaId] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState('');

  // Cargar ruta
  useEffect(() => {
    const cargarRuta = async () => {
      try {
        const rutas = await RutaService.obtenerRutasActivas();
        if (rutas.length > 0) {
          setRuta(rutas[0]);
        }
      } catch (error) {
        console.error('Error al cargar rutas:', error);
      }
    };
    cargarRuta();
  }, []);

  // Sincronizar estado de "Estoy esperando" activo desde el backend
  useEffect(() => {
    if (usuario) {
      UbicacionEsperaService.obtenerUbicacionActivaAlumno(usuario.id).then((ubicacionActiva) => {
        if (ubicacionActiva && ubicacionActiva.activo) {
          setEsperando(true);
          setUbicacionEsperaId(ubicacionActiva.id);
        }
      });
    }
  }, [usuario]);

  // Observar ubicaciones en tiempo real
  useEffect(() => {
    const unsubscribe = ViajeService.observarTodasLasUbicaciones(
      async (ubicaciones: Record<string, UbicacionTiempoReal>) => {
        const combisMarcadores: Record<string, MarcadorCombi> = {};

        for (const [choferId, ubicacion] of Object.entries(ubicaciones)) {
          try {
            // Obtener info del viaje y chofer
            const viaje = await ViajeService.obtenerViaje(ubicacion.viaje_id);
            if (!viaje) continue;

            const chofer = await import('@/lib/services/chofer.service').then(
              (m) => m.ChoferService.obtenerChofer(choferId)
            );
            if (!chofer) continue;

            combisMarcadores[choferId] = {
              viaje_id: viaje.id,
              chofer_id: choferId,
              chofer_nombre: (chofer as any).nombre || 'Chofer',
              placa: chofer.placa_vehiculo,
              posicion: { lat: ubicacion.lat, lng: ubicacion.lng },
              velocidad: ubicacion.velocidad,
              rumbo: ubicacion.rumbo,
              tiempo_en_ruta_minutos: calcularMinutosTranscurridos(viaje.hora_inicio),
              ultima_actualizacion: new Date(ubicacion.timestamp),
            };
          } catch (error) {
            console.error('Error al procesar combi:', error);
          }
        }

        setCombis(combisMarcadores);
      }
    );

    return unsubscribe;
  }, []);

  // Activar/Desactivar "Estoy esperando"
  const toggleEsperar = useCallback(async () => {
    if (!usuario || !posicion) {
      setMensaje('Se necesita acceso a tu ubicación');
      return;
    }

    try {
      if (esperando) {
        // Desactivar
        await UbicacionEsperaService.desactivarEsperaAlumno(usuario.id);
        setEsperando(false);
        setUbicacionEsperaId(null);
        setMensaje('Ya no estás compartiendo tu ubicación');
      } else {
        const codigoEstudiante = (usuario as any)?.codigo_estudiante || usuario?.email?.split('@')[0] || '';

        const ubicacionId = await UbicacionEsperaService.activarEsperaAlumno(
          usuario.id,
          usuario.nombre,
          codigoEstudiante,
          posicion,
          ruta?.id
        );
        setEsperando(true);
        setUbicacionEsperaId(ubicacionId);
        setMensaje('Compartiendo tu ubicación con los choferes');
      }
    } catch (error: any) {
      setMensaje(error.message || 'Error al actualizar ubicación');
    }
  }, [usuario, posicion, esperando, ruta]);

  return (
    <div className="h-screen flex flex-col">
      {/* Controles superiores */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="urbanito-container">
          {mensaje && (
            <div className="mb-3">
              <Alert
                type="info"
                message={mensaje}
                onClose={() => setMensaje('')}
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              {errorGPS && (
                <Alert type="warning" message={errorGPS} />
              )}
            </div>

            <Button
              variant={esperando ? 'danger' : 'success'}
              onClick={toggleEsperar}
              disabled={!posicion}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 text-base font-bold rounded-xl shadow-md transition-transform active:scale-95"
            >
              {esperando ? (
                <>
                  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Dejar de Esperar</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Estoy Esperando</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="flex-1 relative">
        <MapaBase
          centro={centroMapa}
          zoom={zoom}
          altura="100%"
          mostrarTrafico={mostrarTrafico}
          polyline={ruta?.polyline}
          combis={combis}
          posicionUsuario={posicion || undefined}
        >
          {/* Ruta */}
          {ruta && <LineaRuta coordenadas={ruta.polyline} />}

          {/* Combis */}
          {Object.entries(combis).map(([id, combi]) => (
            <MarcadorCombiComponent
              key={id}
              combi={combi}
              seleccionada={combiSeleccionada === id}
              onSelect={() => setCombiSeleccionada(id)}
              onDeselect={() => setCombiSeleccionada(null)}
            />
          ))}
        </MapaBase>

        {/* Info de combis */}
        {Object.keys(combis).length === 0 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <Card className="bg-yellow-50 border border-yellow-200">
              <p className="text-yellow-800 text-sm">
                No hay combis activas en este momento
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
