'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/shared/Button';
import { Alert } from '@/components/shared/Alert';
import { validarCodigoEstudiante, validarCorreoInstitucional } from '@/lib/utils/validaciones';

export default function RegistroPage() {
  const { registrarAlumno } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    codigo_estudiante: '',
    telefono: '',
    password: '',
    confirmarPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!validarCorreoInstitucional(formData.email)) {
      newErrors.email = 'Debe usar un correo institucional @unab.edu.pe';
    }

    if (!validarCodigoEstudiante(formData.codigo_estudiante)) {
      newErrors.codigo_estudiante = 'Código de estudiante inválido (ej. 111.0222.033 o 12345678)';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (formData.password !== formData.confirmarPassword) {
      newErrors.confirmarPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMsg('');

    try {
      await registrarAlumno({
        nombre: formData.nombre,
        email: formData.email,
        codigo_estudiante: formData.codigo_estudiante,
        telefono: formData.telefono || undefined,
        password: formData.password,
      });
      setSuccessMsg('¡Cuenta creada exitosamente! Redirigiendo al sistema...');
      setTimeout(() => {
        router.push('/alumno');
      }, 1500);
    } catch (err: any) {
      setErrors({ general: err.message || 'Error al registrar' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center p-4 selection:bg-blue-500 selection:text-white">
      <div className="w-full max-w-md bg-gray-900/80 border border-gray-800 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-5 relative overflow-hidden">
        {/* Glow de acento superior */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center relative z-10">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-gray-800 to-gray-900 border border-gray-700/60 rounded-2xl mb-3 shadow-inner">
            <img src="/icon.svg" alt="Urbanito Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Crear Cuenta</h1>
          <p className="text-gray-400 text-xs mt-1 font-medium">Registro de Estudiantes UNAB</p>
        </div>

        {successMsg && (
          <div className="relative z-10">
            <Alert type="success" message={successMsg} />
          </div>
        )}

        {errors.general && (
          <div className="relative z-10">
            <Alert
              type="error"
              message={errors.general}
              onClose={() => setErrors({ ...errors, general: '' })}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wider">
              Nombre Completo
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              className="w-full px-4 py-2.5 bg-gray-950/70 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
            />
            {errors.nombre && <p className="text-red-400 text-xs mt-1">{errors.nombre}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wider">
              Correo Institucional
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="tunombre@unab.edu.pe"
              required
              className="w-full px-4 py-2.5 bg-gray-950/70 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wider">
              Código de Estudiante
            </label>
            <input
              type="text"
              value={formData.codigo_estudiante}
              onChange={(e) =>
                setFormData({ ...formData, codigo_estudiante: e.target.value })
              }
              placeholder="ej. 111.0222.033"
              required
              className="w-full px-4 py-2.5 bg-gray-950/70 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
            />
            {errors.codigo_estudiante && <p className="text-red-400 text-xs mt-1">{errors.codigo_estudiante}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wider">
              Contraseña
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full px-4 py-2.5 bg-gray-950/70 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wider">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              value={formData.confirmarPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmarPassword: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 bg-gray-950/70 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
            />
            {errors.confirmarPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmarPassword}</p>}
          </div>

          <Button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 active:scale-95 text-base mt-2"
            loading={loading}
          >
            Registrarse
          </Button>
        </form>

        <div className="text-center relative z-10 pt-2">
          <p className="text-sm text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/login"
              className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4 transition-colors"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
