'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/shared/Loading';

export default function AlumnoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { usuario, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!usuario || usuario.rol !== 'alumno')) {
      router.push('/login');
    }
  }, [usuario, loading, router]);

  if (loading || !usuario) {
    return <Loading fullScreen message="Cargando..." />;
  }

  return (
    <div className="urbanito-page">
      <header className="urbanito-header">
        <div className="urbanito-container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Urbanito</h1>
            <p className="text-sm text-gray-600">Hola, {usuario.nombre}</p>
          </div>
          <button
            onClick={() => logout()}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
