'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Alert } from '@/components/shared/Alert';
import { ChoferService } from '@/lib/services/chofer.service';
import { RutaService } from '@/lib/services/ruta.service';
import { Chofer, Ruta, EstadoAutorizacion } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { formatearDNI, formatearPlaca, formatearTelefono } from '@/lib/utils/validaciones';
import { formatearFechaCorta } from '@/lib/utils/fechas';

export default function ChoferesPage() {
  const { usuario } = useAuth();
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  // Estado del Modal para Agregar Chofer
  const [mostrarModal, setMostrarModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    dni: '',
    telefono: '',
    placa_vehiculo: '',
    ruta_id: '',
  });

  useEffect(() => {
    cargarChoferes();
    cargarRutas();
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

  const cargarRutas = async () => {
    try {
      const data = await RutaService.obtenerRutasActivas();
      setRutas(data);
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, ruta_id: data[0].id }));
      }
    } catch (err) {
      console.error('Error al cargar rutas:', err);
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

  const handleCrearChofer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    setFormError('');

    if (!formData.nombre.trim() || !formData.email.trim() || !formData.dni.trim() || !formData.placa_vehiculo.trim()) {
      setFormError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setGuardando(true);
      await ChoferService.registrarChofer(
        {
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password.trim() || `Urb#2026!${Math.floor(1000 + Math.random() * 9000)}`,
          dni: formData.dni,
          telefono: formData.telefono,
          placa_vehiculo: formData.placa_vehiculo,
          ruta_id: formData.ruta_id || (rutas[0]?.id || ''),
        },
        usuario.id
      );

      setMensaje('Chofer registrado y autorizado exitosamente');
      setMostrarModal(false);
      setFormData({
        nombre: '',
        email: '',
        password: '',
        dni: '',
        telefono: '',
        placa_vehiculo: '',
        ruta_id: rutas[0]?.id || '',
      });
      await cargarChoferes();
    } catch (err: any) {
      setFormError(err.message || 'Error al registrar chofer');
    } finally {
      setGuardando(false);
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
        <Button variant="primary" onClick={() => setMostrarModal(true)}>
          <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
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

      {/* Tabla de choferes */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Chofer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  DNI
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Placa
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Teléfono
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Registrado
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Cargando choferes...
                  </td>
                </tr>
              ) : choferes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No hay choferes registrados. Presiona "+ Agregar Chofer" para registrar uno.
                  </td>
                </tr>
              ) : (
                choferes.map((chofer) => (
                  <tr key={chofer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mr-3 font-bold text-sm">
                          {((chofer as any).nombre || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {(chofer as any).nombre || 'Chofer'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {(chofer as any).email || '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 font-mono">
                      {formatearDNI(chofer.dni)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 font-mono font-bold">
                      {formatearPlaca(chofer.placa_vehiculo)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {formatearTelefono(chofer.telefono)}
                    </td>
                    <td className="px-4 py-4">
                      {getEstadoBadge(chofer.estado_autorizacion)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
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

      {/* Modal para Agregar Chofer */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Agregar Nuevo Chofer</h3>
              <button
                onClick={() => setMostrarModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCrearChofer} className="p-6 space-y-4">
              {formError && <Alert type="error" message={formError} onClose={() => setFormError('')} />}

              <Input
                label="Nombre Completo"
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="ej. Juan Pérez"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Correo Electrónico"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="chofer@urbanito.com"
                  required
                />
                <Input
                  label="Contraseña del Chofer"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Ej. MiClaveSegura#2026"
                  helperText="Opcional (se creará una clave segura automáticamente)"
                  autoComplete="new-password"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="DNI"
                  type="text"
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  placeholder="12345678"
                  maxLength={8}
                  required
                />
                <Input
                  label="Teléfono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="999888777"
                  maxLength={9}
                  required
                />
                <Input
                  label="Placa Vehículo"
                  type="text"
                  value={formData.placa_vehiculo}
                  onChange={(e) => setFormData({ ...formData, placa_vehiculo: e.target.value.toUpperCase() })}
                  placeholder="ABC-123"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ruta Asignada
                </label>
                <select
                  value={formData.ruta_id}
                  onChange={(e) => setFormData({ ...formData, ruta_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {rutas.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre} ({r.origen} → {r.destino})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                <Button variant="secondary" type="button" onClick={() => setMostrarModal(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" type="submit" loading={guardando}>
                  Registrar Chofer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
