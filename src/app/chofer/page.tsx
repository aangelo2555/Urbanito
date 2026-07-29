'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapaBase, LineaRuta, MarcadorPersonalizado } from '@/components/maps/MapaBase';
import { MarcadorAlumnoEsperandoComponent } from '@/components/maps/MarcadorAlumnoEsperando';
import { Button } from '@/components/shared/Button';
import { Card, CardTitle } from '@/components/shared/Card';
import { Alert } from '@/components/shared/Alert';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocationWatch } from '@/hooks/useGeolocation';
import { ViajeService } from '@/lib/services/viaje.service';
import { RutaService } from '@/lib/services/ruta.service';
import { ChoferService } from '@/lib/services/chofer.service';
import { UbicacionEsperaService } from '@/lib/services/ubicacion-espera.service';
import { Viaje, Ruta, Coordenada, MarcadorAlumnoEsperando, Chofer } from '@/types';
import { CONFIGURACION_DEFAULT } from '@/types';

export default function ChoferPage() {
  const { usuario } = useAuth();
  const [chofer, setChofer] = useState<Chofer | null>(null);
  const [viaje, setViaje] = useState<Viaje | null>(null);
  const [ruta, setRuta] = useState<Ruta | null>(null);
  const [posicionActual, setPosicionActual] = useState<Coordenada | null>(null);
  const [alumnosEsperando, setAlumnosEsperando] = useState<MarcadorAlumnoEsperando[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  // Cargar info del chofer
  useEffect(() => {
    if (usuario) {
      ChoferService.obtenerChofer(usuario.id).then(setChofer);
    }
  }, [usuario]);

  // Cargar ruta
  useEffect(() => {
    if (chofer && chofer.ruta_id) {
      RutaService.obtenerRuta(chofer.ruta_id).then((r) => {
        if (r) setRuta(r);
        else RutaService.obtenerRutasActivas().then((rutas) => setRuta(rutas[0] || null));
      });
    } else {
      RutaService.obtenerRutasActivas().then((rutas) => setRuta(rutas[0] || null));
    }
  }, [chofer]);

  // Cargar alumnos esperando
  useEffect(() => {
    if (ruta) {
      const cargarAlumnos = async () => {
        const alumnos = await UbicacionEsperaService.obtenerUbicacionesActivasParaChofer(
          ruta.polyline
        );
        setAlumnosEsperando(alumnos);
      };
      cargarAlumnos();
      const interval = setInterval(cargarAlumnos, 30000); // Actualizar cada 30s
      return () => clearInterval(interval);
    }
  }, [ruta]);

  // Rastrear GPS durante el viaje
  const { error: errorGPS, watching } = useGeolocationWatch(
    useCallback(
      async (posicion, velocidad, rumbo) => {
        setPosicionActual(posicion);
        
        if (viaje && usuario) {
          try {
            await ViajeService.actualizarUbicacionTiempoReal(usuario.id, {
              lat: posicion.lat,
              lng: posicion.lng,
              velocidad: velocidad ? velocidad * 3.6 : undefined, // m/s a km/h
              rumbo,
              timestamp: Date.now(),
            });
          } catch (error: any) {
            console.error('Error al actualizar ubicación:', error);
          }
        }
      },
      [viaje, usuario]
    ),
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );

  const iniciarViaje = async () => {
    if (!usuario) return;

    try {
      let targetRuta = ruta;
      if (!targetRuta) {
        const rutas = await RutaService.obtenerRutasActivas();
        if (rutas.length > 0) {
          targetRuta = rutas[0];
          setRuta(targetRuta);
        }
      }

      if (!targetRuta) {
        setError('No hay rutas disponibles para iniciar el viaje.');
        return;
      }

      const viajeId = await ViajeService.iniciarViaje(usuario.id, targetRuta.id);
      const nuevoViaje = await ViajeService.obtenerViaje(viajeId);
      setViaje(nuevoViaje);
      setMensaje('¡Viaje iniciado! Tu ubicación está siendo compartida en tiempo real.');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar viaje');
    }
  };

  const finalizarViaje = async () => {
    if (!usuario || !viaje) return;

    try {
      await ViajeService.finalizarViaje(viaje.id, usuario.id);
      setViaje(null);
      setMensaje('Viaje finalizado correctamente');
    } catch (err: any) {
      setError(err.message || 'Error al finalizar viaje');
    }
  };

  // Verificar estado de autorización
  if (chofer && chofer.estado_autorizacion !== 'activo') {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <Card className="max-w-md text-center">
          <CardTitle>Estado de tu cuenta</CardTitle>
          <div className="mt-4">
            {chofer.estado_autorizacion === 'pendiente' && (
              <Alert
                type="warning"
                title="Cuenta Pendiente"
                message="Tu cuenta está pendiente de autorización. El administrador debe activarla antes de que puedas iniciar viajes."
              />
            )}
            {chofer.estado_autorizacion === 'suspendido' && (
              <Alert
                type="error"
                title="Cuenta Suspendida"
                message="Tu cuenta ha sido suspendida. Contacta al administrador para más información."
              />
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Controles */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="urbanito-container">
          {mensaje && (
            <Alert type="success" message={mensaje} onClose={() => setMensaje('')} />
          )}
          {error && (
            <Alert type="error" message={error} onClose={() => setError('')} />
          )}

          <div className="mt-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600">
                {viaje ? 'Viaje en curso' : 'Sin viaje activo'}
              </p>
              {chofer && (
                <p className="text-xs text-gray-500">
                  Placa: {chofer.placa_vehiculo}
                </p>
              )}
            </div>

            {!viaje ? (
              <Button variant="success" size="lg" onClick={iniciarViaje}>
                Iniciar Viaje
              </Button>
            ) : (
              <Button variant="danger" size="lg" onClick={finalizarViaje}>
                Finalizar Viaje
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="flex-1">
        <MapaBase
          centro={posicionActual || ruta?.polyline[0] || { lat: -10.75, lng: -77.76 }}
          zoom={15}
          altura="100%"
          mostrarTrafico={true}
          polyline={ruta?.polyline}
          alumnos={alumnosEsperando}
          posicionUsuario={posicionActual || undefined}
        >
          {ruta && <LineaRuta coordenadas={ruta.polyline} />}
          
          {posicionActual && (
            <MarcadorPersonalizado
              posicion={posicionActual}
              titulo="Tu ubicación"
            />
          )}

          {alumnosEsperando.map((alumno) => (
            <MarcadorAlumnoEsperandoComponent
              key={alumno.id}
              alumno={alumno}
              mostrarInfo={false}
              onSelect={() => {}}
              onDeselect={() => {}}
            />
          ))}
        </MapaBase>
      </div>
    </div>
  );
}
