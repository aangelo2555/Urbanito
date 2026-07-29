'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
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
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Crear Cuenta</h1>
          <p className="text-gray-600 mt-2">Registro de Estudiantes UNAB</p>
        </div>

        {successMsg && (
          <div className="mb-4">
            <Alert
              type="success"
              message={successMsg}
            />
          </div>
        )}

        {errors.general && (
          <div className="mb-4">
            <Alert
              type="error"
              message={errors.general}
              onClose={() => setErrors({ ...errors, general: '' })}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre Completo"
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            error={errors.nombre}
            required
          />

          <Input
            label="Correo Institucional"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="tunombre@unab.edu.pe"
            error={errors.email}
            helperText="Usa tu correo institucional de la UNAB"
            required
          />

          <Input
            label="Código de Estudiante"
            type="text"
            value={formData.codigo_estudiante}
            onChange={(e) =>
              setFormData({ ...formData, codigo_estudiante: e.target.value })
            }
            placeholder="ej. 111.0222.033"
            error={errors.codigo_estudiante}
            helperText="Tu código universitario (ej. 111.0222.033 o 12345678)"
            required
          />

          <Input
            label="Teléfono (Opcional)"
            type="tel"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            placeholder="999999999"
          />

          <Input
            label="Contraseña"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            helperText="Mínimo 8 caracteres"
            required
          />

          <Input
            label="Confirmar Contraseña"
            type="password"
            value={formData.confirmarPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmarPassword: e.target.value })
            }
            error={errors.confirmarPassword}
            required
          />

          <Button type="submit" className="w-full" loading={loading}>
            Registrarse
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
