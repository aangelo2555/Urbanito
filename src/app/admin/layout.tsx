'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/shared/Loading';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { usuario, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  useEffect(() => {
    if (!loading && (!usuario || usuario.rol !== 'admin')) {
      router.push('/login');
    }
  }, [usuario, loading, router]);

  // Cerrar sidebar al cambiar de ruta en móviles
  useEffect(() => {
    setSidebarAbierto(false);
  }, [pathname]);

  if (loading || !usuario) {
    return <Loading fullScreen message="Cargando..." />;
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { href: '/admin/choferes', label: 'Choferes', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { href: '/admin/rutas', label: 'Rutas', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
    { href: '/admin/reportes', label: 'Reportes', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Header Móvil */}
      <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarAbierto(!sidebarAbierto)}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 focus:outline-none"
            aria-label="Abrir menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarAbierto ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-none">Urbanito</h1>
            <p className="text-xs text-gray-500">Panel Admin</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="text-xs bg-red-50 text-red-600 hover:bg-red-100 font-medium px-3 py-1.5 rounded-md transition-colors"
        >
          Salir
        </button>
      </header>

      {/* Backdrop oscuro para móvil */}
      {sidebarAbierto && (
        <div
          onClick={() => setSidebarAbierto(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Responsive (Desplazable en móvil, fijo en desktop) */}
      <aside
        className={`fixed top-0 left-0 z-50 w-64 h-full bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarAbierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col justify-between p-4">
          <div>
            <div className="mb-6 px-3 pt-2 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Urbanito</h1>
                <p className="text-xs text-gray-500 font-medium">Panel Administrativo</p>
              </div>
              <button
                onClick={() => setSidebarAbierto(false)}
                className="md:hidden text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarAbierto(false)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 shadow-sm font-semibold'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 mr-3 ${isActive ? 'text-primary-600' : 'text-gray-400'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={item.icon}
                      />
                    </svg>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mt-auto">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                {(usuario.nombre || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">{usuario.nombre}</p>
                <p className="text-xs text-gray-500 truncate">Administrador</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="w-full py-2 px-3 text-xs bg-white border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200 font-medium rounded-lg transition-colors flex items-center justify-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Contenido Principal adaptable */}
      <div className="flex-1 md:ml-64 min-w-0">
        <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
