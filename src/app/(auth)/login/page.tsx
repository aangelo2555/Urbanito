'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/shared/Button';
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
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center p-4 selection:bg-blue-500 selection:text-white">
      <div className="w-full max-w-md bg-gray-900/80 border border-gray-800 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6 relative overflow-hidden">
        {/* Glow de acento superior */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center relative z-10">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-gray-800 to-gray-900 border border-gray-700/60 rounded-2xl mb-4 shadow-inner">
            <img src="/icon.svg" alt="Urbanito Logo" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Urbanito</h1>
          <p className="text-gray-400 text-sm mt-1.5 font-medium">Sistema de Rastreo GPS en Tiempo Real</p>
        </div>

        {error && (
          <div className="relative z-10">
            <Alert type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
              Email o Código de Estudiante
            </label>
            <input
              type="text"
              value={formData.email_o_codigo}
              onChange={(e) =>
                setFormData({ ...formData, email_o_codigo: e.target.value })
              }
              placeholder="ejemplo@unab.edu.pe o 111.0222.033"
              required
              autoComplete="username"
              className="w-full px-4 py-3 bg-gray-950/70 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
              Contraseña
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-gray-950/70 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
            />
          </div>

          <Button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 active:scale-95 text-base mt-2"
            loading={loading}
          >
            Iniciar Sesión
          </Button>
        </form>

        <div className="text-center relative z-10 pt-2">
          <p className="text-sm text-gray-400">
            ¿No tienes cuenta?{' '}
            <Link
              href="/registro"
              className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4 transition-colors"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>

        <div className="pt-4 border-t border-gray-800/80 text-center relative z-10">
          <p className="text-xs text-gray-500">
            Ruta Oficial: Buenavista → La Florida (UNAB)
          </p>
        </div>
      </div>
    </div>
  );
}
