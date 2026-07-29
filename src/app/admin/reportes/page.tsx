'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Alert } from '@/components/shared/Alert';
import {
  ReporteService,
  ResumenReportes,
  ViajeReporte,
  ChoferActivoRanking,
  HoraPico,
} from '@/lib/services/reporte.service';

export default function ReportesPage() {
  const [resumen, setResumen] = useState<ResumenReportes | null>(null);
  const [viajes, setViajes] = useState<ViajeReporte[]>([]);
  const [choferesRanking, setChoferesRanking] = useState<ChoferActivoRanking[]>([]);
  const [horasPico, setHorasPico] = useState<HoraPico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    try {
      setLoading(true);
      setError('');

      const [resumenData, viajesData, choferesData, horasData] = await Promise.all([
        ReporteService.obtenerResumen().catch(() => null),
        ReporteService.obtenerViajes({ limit: 20 }).catch(() => []),
        ReporteService.obtenerChoferesMasActivos().catch(() => []),
        ReporteService.obtenerHorasPico().catch(() => []),
      ]);

      setResumen(resumenData);
      setViajes(viajesData);
      setChoferesRanking(choferesData);
      setHorasPico(horasData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos de reportes');
    } finally {
      setLoading(false);
    }
  };

  const exportarCSV = () => {
    if (viajes.length === 0) return;

    const headers = ['ID Viaje', 'Chofer', 'Placa', 'Ruta', 'Estado', 'Hora Inicio', 'Duración (min)'];
    const rows = viajes.map((v) => [
      v.id,
      v.chofer_nombre || 'N/A',
      v.placa_vehiculo || 'N/A',
      v.ruta_nombre || 'N/A',
      v.estado,
      new Date(v.hora_inicio).toLocaleString(),
      v.duracion_minutos || 0,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_viajes_urbanito_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
          <p className="text-gray-600 mt-1">
            Análisis de rendimiento, viajes e historial del sistema (Fase 2)
          </p>
        </div>
        <Button variant="primary" onClick={exportarCSV} disabled={viajes.length === 0}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar a CSV
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Cards de Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-2">
            <p className="text-sm text-gray-600">Total de Viajes</p>
            <p className="text-3xl font-bold text-primary-600 mt-1">
              {loading ? '...' : resumen?.total_viajes || 0}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-2">
            <p className="text-sm text-gray-600">Choferes Registrados</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {loading ? '...' : resumen?.total_choferes || 0}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-2">
            <p className="text-sm text-gray-600">Alumnos Registrados</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {loading ? '...' : resumen?.total_alumnos || 0}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-2">
            <p className="text-sm text-gray-600">Rutas Activas</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">
              {loading ? '...' : resumen?.total_rutas_activas || 0}
            </p>
          </div>
        </Card>
      </div>

      {/* Grid de Choferes más activos y Horas pico */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Choferes */}
        <Card>
          <CardHeader>
            <CardTitle>Choferes Más Activos</CardTitle>
          </CardHeader>
          {loading ? (
            <p className="text-gray-500 text-center py-4">Cargando datos...</p>
          ) : choferesRanking.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay datos de viajes finalizados</p>
          ) : (
            <div className="space-y-3">
              {choferesRanking.map((item, index) => (
                <div
                  key={item.chofer_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.chofer_nombre}</p>
                      <p className="text-xs text-gray-500 font-mono">Placa: {item.placa_vehiculo}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{item.total_viajes} viajes</p>
                    <p className="text-xs text-gray-500">{Math.round(item.total_minutos_en_ruta)} min en ruta</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Distribución por Horas Pico */}
        <Card>
          <CardHeader>
            <CardTitle>Análisis de Horas Pico</CardTitle>
          </CardHeader>
          {loading ? (
            <p className="text-gray-500 text-center py-4">Cargando datos...</p>
          ) : horasPico.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Sin datos de horarios aún</p>
          ) : (
            <div className="space-y-3">
              {horasPico.map((hp) => (
                <div key={hp.hora} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {String(hp.hora).padStart(2, '0')}:00 - {String(hp.hora).padStart(2, '0')}:59
                    </span>
                    <span className="font-bold text-gray-900">{hp.cantidad_viajes} viajes</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary-600 h-2.5 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (hp.cantidad_viajes / Math.max(...horasPico.map((h) => h.cantidad_viajes))) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Historial de Viajes */}
      <Card>
        <CardHeader>
          <CardTitle>Historial Reciente de Viajes</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Chofer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Placa</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Ruta</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fecha / Hora</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Duración</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Cargando historial...
                  </td>
                </tr>
              ) : viajes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No se han registrado viajes aún
                  </td>
                </tr>
              ) : (
                viajes.map((viaje) => (
                  <tr key={viaje.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {viaje.chofer_nombre || 'Chofer'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                      {viaje.placa_vehiculo || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {viaje.ruta_nombre || 'Buenavista - La Florida'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          viaje.estado === 'en_curso'
                            ? 'bg-blue-100 text-blue-800'
                            : viaje.estado === 'finalizado'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {viaje.estado === 'en_curso'
                          ? 'En Curso'
                          : viaje.estado === 'finalizado'
                          ? 'Finalizado'
                          : 'Cancelado'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(viaje.hora_inicio).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                      {viaje.duracion_minutos ? `${Math.round(viaje.duracion_minutos)} min` : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
