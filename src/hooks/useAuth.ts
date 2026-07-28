'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Usuario, LoginDTO, RegistroAlumnoDTO } from '@/types';
import { AuthService } from '@/lib/services/auth.service.railway';
import { wsClient } from '@/lib/api/websocket';

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  login: (credentials: LoginDTO) => Promise<void>;
  logout: () => Promise<void>;
  registrarAlumno: (data: RegistroAlumnoDTO) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Observar cambios en la autenticación
    const unsubscribe = AuthService.onAuthChange((user) => {
      setUsuario(user);
      setLoading(false);
      
      // Conectar WebSocket cuando hay usuario
      if (user) {
        wsClient.connect(user.id, user.rol);
      } else {
        wsClient.disconnect();
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (credentials: LoginDTO) => {
    setLoading(true);
    try {
      const user = await AuthService.login(credentials);
      setUsuario(user);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AuthService.logout();
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  };

  const registrarAlumno = async (data: RegistroAlumnoDTO) => {
    setLoading(true);
    try {
      await AuthService.registrarAlumno(data);
      // Después del registro, iniciar sesión automáticamente
      await login({
        email_o_codigo: data.email,
        password: data.password,
      });
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout, registrarAlumno }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
