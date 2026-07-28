'use client';

import { Card, CardHeader, CardTitle } from '@/components/shared/Card';
import { Alert } from '@/components/shared/Alert';

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
        <p className="text-gray-600 mt-1">
          Analiza el rendimiento del sistema
        </p>
      </div>

      <Alert
        type="info"
        title="Próximamente"
        message="Esta funcionalidad se implementará en la Fase 2 del proyecto. Incluirá reportes de puntualidad, historial de viajes, estadísticas de choferes y mapas de calor de demanda."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Reportes Disponibles (Fase 2)</CardTitle>
          </CardHeader>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
              Historial de viajes por chofer
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
              Reporte de puntualidad
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
              Choferes más activos
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
              Análisis de horas pico
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
              Mapa de calor de demanda
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
              Exportación de reportes (PDF/Excel)
            </li>
          </ul>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estadísticas en Tiempo Real</CardTitle>
          </CardHeader>
          <p className="text-sm text-gray-600">
            Las estadísticas básicas están disponibles en el Dashboard principal.
            Los reportes detallados históricos se agregarán próximamente.
          </p>
        </Card>
      </div>
    </div>
  );
}
