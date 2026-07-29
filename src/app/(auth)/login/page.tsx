'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Alert } from '@/components/shared/Alert';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email_o_codigo: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      // La redirección se maneja en el layout principal
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-primary-100 rounded-full mb-4">
            <svg
              className="w-12 h-12 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Urbanito</h1>
          <p className="text-gray-600 mt-2">Sistema de Rastreo GPS</p>
        </div>

        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email o Código de Estudiante"
            type="text"
            value={formData.email_o_codigo}
            onChange={(e) =>
              setFormData({ ...formData, email_o_codigo: e.target.value })
            }
            placeholder="ejemplo@unab.edu.pe o 111.0222.033"
            required
            autoComplete="username"
          />

          <Input
            label="Contraseña"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          <Button type="submit" className="w-full" loading={loading}>
            Iniciar Sesión
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link
              href="/registro"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Ruta: Buenavista → La Florida (UNAB)
          </p>
        </div>
      </div>
    </div>
  );
}
