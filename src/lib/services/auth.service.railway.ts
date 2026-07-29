/**
 * Servicio de autenticación 100% nativo para Railway (PostgreSQL + JWT)
 * Sin dependencias de Firebase
 */

import { apiClient } from '@/lib/api/client';
import { Usuario, LoginDTO, RegistroAlumnoDTO } from '@/types';

export class AuthService {
  /**
   * Registrar un nuevo alumno
   */
  static async registrarAlumno(data: RegistroAlumnoDTO): Promise<Usuario> {
    const response = await apiClient.post<{ token: string; usuario: Usuario }>(
      '/api/auth/register-alumno',
      data
    );

    if (typeof window !== 'undefined' && response.token) {
      localStorage.setItem('authToken', response.token);
    }

    return response.usuario;
  }

  /**
   * Iniciar sesión (email o código de estudiante)
   */
  static async login(credentials: LoginDTO): Promise<Usuario> {
    const response = await apiClient.post<{ token: string; usuario: Usuario }>(
      '/api/auth/login',
      credentials
    );

    if (typeof window !== 'undefined' && response.token) {
      localStorage.setItem('authToken', response.token);
    }

    return response.usuario;
  }

  /**
   * Cerrar sesión
   */
  static async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  /**
   * Obtener usuario actual
   */
  static async obtenerUsuarioActual(): Promise<Usuario | null> {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    try {
      const response = await apiClient.get<{ usuario: Usuario }>('/api/auth/me');
      return response.usuario;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      localStorage.removeItem('authToken');
      return null;
    }
  }

  /**
   * Observar cambios en la autenticación
   */
  static onAuthChange(callback: (usuario: Usuario | null) => void): () => void {
    let active = true;

    this.obtenerUsuarioActual()
      .then((user) => {
        if (active) callback(user);
      })
      .catch(() => {
        if (active) callback(null);
      });

    return () => {
      active = false;
    };
  }
}
