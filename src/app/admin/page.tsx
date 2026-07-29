'use client';

import { useState, useEffect } from 'react';
import { MapaBase, LineaRuta } from '@/components/maps/MapaBase';
import { MarcadorCombiComponent } from '@/components/maps/MarcadorCombi';
import { MarcadorAlumnoEsperandoComponent } from '@/components/maps/MarcadorAlumnoEsperando';
import { Card, CardHeader, CardTitle } from '@/components/shared/Card';
import { ViajeService } from '@/lib/services/viaje.service';
import { RutaService } from '@/lib/services/ruta.service';
import { UbicacionEsperaService } from '@/lib/services/ubicacion-espera.service';
import { ChoferService } from '@/lib/services/chofer.service';
import { MarcadorCombi, Ruta, UbicacionTiempoReal, MarcadorAlumnoCompletoAdmin } from '@/types';
import { calcularMinutosTranscurridos } from '@/lib/utils/fechas';

export default function AdminDashboardPage() {
  const [combis, setCombis] = useState<Record<string, MarcadorCombi>>({});
  const [alumnosEsperando, setAlumnosEsperando] = useState<MarcadorAlumnoCompletoAdmin[]>([]);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [combiSeleccionada, setCombiSeleccionada] = useState<string | null>(null);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<string | null>(null);
  const [estadisticas, setEstadisticas] = useState({
    combisActivas: 0,
    alumnosEsperando: 0,
    choferesAutorizados: 0,
  });

  // Cargar rutas
  useEffect(() => {
    RutaService.obtenerRutasActivas().then(setRutas);
  }, []);

  // Observar combis en tiempo real
  useEffect(() => {
    const unsubscribe = ViajeService.observarTodasLasUbicaciones(
      async (ubicaciones: Record<string, UbicacionTiempoReal>) => {
        const combisMarcadores: Record<string, MarcadorCombi> = {};

        for (const [choferId, ubicacion] of Object.entries(ubicaciones)) {
          try {
            const viaje = await ViajeService.obtenerViaje(ubicacion.viaje_id);
            if (!viaje) continue;

            const chofer = await ChoferService.obtenerChofer(choferId);
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
        setEstadisticas((prev) => ({ ...prev, combisActivas: Object.keys(combisMarcadores).length }));
      }
    );

    return unsubscribe;
  }, []);

  // Cargar alumnos esperando
  useEffect(() => {
    const cargar = async () => {
      const alumnos = await UbicacionEsperaService.obtenerUbicacionesActivasParaAdmin();
      setAlumnosEsperando(alumnos);
      setEstadisticas((prev) => ({ ...prev, alumnosEsperando: alumnos.length }));
    };
    cargar();
    const interval = setInterval(cargar, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cargar estadísticas de choferes
  useEffect(() => {
    const cargar = async () => {
      const choferes = await ChoferService.obtenerChoferesPorEstado('activo');
      setEstadisticas((prev) => ({ ...prev, choferesAutorizados: choferes.length }));
    };
    cargar();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Vista general del sistema en tiempo real</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Combis Activas</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.combisActivas}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Alumnos Esperando</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.alumnosEsperando}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Choferes Autorizados</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.choferesAutorizados}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Mapa */}
      <Card padding={false}>
        <CardHeader className="px-6 pt-6">
          <CardTitle>Mapa en Tiempo Real</CardTitle>
        </CardHeader>
        <div className="h-[600px]">
          <MapaBase
            centro={rutas[0]?.polyline[0] || { lat: -10.75, lng: -77.76 }}
            zoom={14}
            altura="100%"
            mostrarTrafico={true}
            polyline={rutas[0]?.polyline}
            combis={combis}
            alumnos={alumnosEsperando}
          >
            {/* Rutas */}
            {rutas.map((ruta) => (
              <LineaRuta key={ruta.id} coordenadas={ruta.polyline} />
            ))}

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

            {/* Alumnos esperando */}
            {alumnosEsperando.map((alumno) => (
              <MarcadorAlumnoEsperandoComponent
                key={alumno.id}
                alumno={alumno}
                mostrarInfo={alumnoSeleccionado === alumno.id}
                vistaAdmin={true}
                onSelect={() => setAlumnoSeleccionado(alumno.id)}
                onDeselect={() => setAlumnoSeleccionado(null)}
              />
            ))}
          </MapaBase>
        </div>
      </Card>
    </div>
  );
}
