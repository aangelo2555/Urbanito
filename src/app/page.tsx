'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/shared/Loading';

export default function Home() {
  const { usuario, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!usuario) {
        router.push('/login');
      } else {
        // Redirigir según el rol
        switch (usuario.rol) {
          case 'admin':
            router.push('/admin');
            break;
          case 'chofer':
            router.push('/chofer');
            break;
          case 'alumno':
            router.push('/alumno');
            break;
          default:
            router.push('/login');
        }
      }
    }
  }, [usuario, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loading size="lg" message="Cargando..." />
    </div>
  );
}
