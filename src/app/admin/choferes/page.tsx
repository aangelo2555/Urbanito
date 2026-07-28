'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Alert } from '@/components/shared/Alert';
import { ChoferService } from '@/lib/services/chofer.service';
import { Chofer, EstadoAutorizacion } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { formatearDNI, formatearPlaca, formatearTelefono } from '@/lib/utils/validaciones';
import { formatearFechaCorta } from '@/lib/utils/fechas';

export default function ChoferesPage() {
  const { usuario } = useAuth();
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    cargarChoferes();
  }, []);

  const cargarChoferes = async () => {
    try {
      setLoading(true);
      const data = await ChoferService.obtenerTodosLosChoferes();
      setChoferes(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar choferes');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (choferId: string, nuevoEstado: EstadoAutorizacion) => {
    if (!usuario) return;

    try {
      await ChoferService.actualizarEstadoAutorizacion({
        chofer_id: choferId,
        nuevo_estado: nuevoEstado,
        autorizado_por: usuario.id,
      });
      setMensaje(`Estado actualizado a "${nuevoEstado}" correctamente`);
      await cargarChoferes();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar estado');
    }
  };

  const getEstadoBadge = (estado: EstadoAutorizacion) => {
    const styles = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      activo: 'bg-green-100 text-green-800',
      suspendido: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[estado]}`}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Choferes</h1>
          <p className="text-gray-600 mt-1">
            Administra y autoriza a los choferes del sistema
          </p>
        </div>
        <Button variant="primary">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Agregar Chofer
        </Button>
      </div>

      {mensaje && (
        <Alert type="success" message={mensaje} onClose={() => setMensaje('')} />
      )}
      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Chofer
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  DNI
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Placa
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Teléfono
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Registrado
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Cargando choferes...
                  </td>
                </tr>
              ) : choferes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No hay choferes registrados
                  </td>
                </tr>
              ) : (
                choferes.map((chofer) => (
                  <tr key={chofer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        {chofer.foto_url ? (
                          <img
                            src={chofer.foto_url}
                            alt={`Foto de ${chofer.usuario_id}`}
                            className="w-10 h-10 rounded-full object-cover mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {chofer.usuario_id}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {formatearDNI(chofer.dni)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 font-mono">
                      {formatearPlaca(chofer.placa_vehiculo)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {formatearTelefono(chofer.telefono)}
                    </td>
                    <td className="px-4 py-4">
                      {getEstadoBadge(chofer.estado_autorizacion)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {formatearFechaCorta(chofer.creado_en)}
                    </td>
                    <td className="px-4 py-4 text-right space-x-2">
                      {chofer.estado_autorizacion === 'pendiente' && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => cambiarEstado(chofer.id, 'activo')}
                        >
                          Activar
                        </Button>
                      )}
                      {chofer.estado_autorizacion === 'activo' && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => cambiarEstado(chofer.id, 'suspendido')}
                        >
                          Suspender
                        </Button>
                      )}
                      {chofer.estado_autorizacion === 'suspendido' && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => cambiarEstado(chofer.id, 'activo')}
                        >
                          Reactivar
                        </Button>
                      )}
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
