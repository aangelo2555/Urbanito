'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/shared/Card';
import { Alert } from '@/components/shared/Alert';
import { RutaService } from '@/lib/services/ruta.service';
import { Ruta } from '@/types';
import { formatearDistancia } from '@/lib/utils/geo';
import { formatearDuracion } from '@/lib/utils/fechas';

export default function RutasPage() {
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarRutas();
  }, []);

  const cargarRutas = async () => {
    try {
      setLoading(true);
      const data = await RutaService.obtenerRutasActivas();
      setRutas(data);
    } catch (error) {
      console.error('Error al cargar rutas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Rutas</h1>
        <p className="text-gray-600 mt-1">
          Administra las rutas del sistema de transporte
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <Card>
            <p className="text-center text-gray-500">Cargando rutas...</p>
          </Card>
        ) : rutas.length === 0 ? (
          <Card>
            <Alert
              type="info"
              title="No hay rutas configuradas"
              message="Crea la primera ruta para comenzar"
            />
          </Card>
        ) : (
          rutas.map((ruta) => (
            <Card key={ruta.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{ruta.nombre}</CardTitle>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ruta.activa
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {ruta.activa ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </CardHeader>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Origen</p>
                  <p className="font-medium">{ruta.origen}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Destino</p>
                  <p className="font-medium">{ruta.destino}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Distancia</p>
                    <p className="font-medium">
                      {formatearDistancia(ruta.distancia_km)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tiempo estimado</p>
                    <p className="font-medium">
                      {formatearDuracion(ruta.tiempo_estimado_min)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Paradas ({ruta.paradas.length})
                  </p>
                  <ul className="space-y-1">
                    {ruta.paradas.map((parada) => (
                      <li
                        key={parada.id}
                        className="text-sm flex items-center gap-2"
                      >
                        <span className="w-6 h-6 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                          {parada.orden}
                        </span>
                        <span>{parada.nombre}</span>
                        {parada.es_parada_universidad && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            UNAB
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
