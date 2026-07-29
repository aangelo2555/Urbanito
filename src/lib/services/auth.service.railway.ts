/**
 * Servicio de autenticación usando Firebase Auth + Backend Railway
 */

import { auth } from '@/lib/firebase/config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { apiClient } from '@/lib/api/client';
import { Usuario, LoginDTO, RegistroAlumnoDTO } from '@/types';

export class AuthService {
  /**
   * Registrar un nuevo alumno
   */
  static async registrarAlumno(data: RegistroAlumnoDTO): Promise<void> {
    const firebaseAuth = auth;
    if (!firebaseAuth) {
      throw new Error('Firebase Auth no está configurado. Por favor configura las credenciales de Firebase.');
    }
    // 1. Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      firebaseAuth,
      data.email,
      data.password
    );

    const firebaseUid = userCredential.user.uid;
    const idToken = await userCredential.user.getIdToken();

    // 2. Guardar en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', idToken);
    }

    try {
      // 3. Crear usuario en PostgreSQL vía API
      await apiClient.post('/api/auth/register-alumno', {
        firebaseUid,
        nombre: data.nombre,
        email: data.email,
        codigo_estudiante: data.codigo_estudiante,
        telefono: data.telefono,
      });
    } catch (error) {
      // Si falla, eliminar de Firebase Auth
      await userCredential.user.delete();
      throw error;
    }
  }

  /**
   * Iniciar sesión
   */
  static async login(credentials: LoginDTO): Promise<Usuario> {
    const firebaseAuth = auth;
    if (!firebaseAuth) {
      throw new Error('Firebase Auth no está configurado. Por favor configura las credenciales de Firebase.');
    }
    // 1. Autenticar con Firebase
    let email = credentials.email_o_codigo;

    // Si es código de estudiante, obtener email del backend
    if (/^\d{6,8}$/.test(credentials.email_o_codigo)) {
      const response = await apiClient.post<{ email: string }>(
        '/api/auth/email-by-codigo',
        { codigo_estudiante: credentials.email_o_codigo }
      );
      email = response.email;
    }

    const userCredential = await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      credentials.password
    );

    const idToken = await userCredential.user.getIdToken();

    // 2. Guardar token
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', idToken);
    }

    // 3. Obtener datos del usuario desde PostgreSQL
    const usuario = await apiClient.post<Usuario>('/api/auth/verify', {
      idToken,
    });

    return usuario;
  }

  /**
   * Cerrar sesión
   */
  static async logout(): Promise<void> {
    const firebaseAuth = auth;
    if (firebaseAuth) {
      await firebaseSignOut(firebaseAuth);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  /**
   * Obtener usuario actual
   */
  static async obtenerUsuarioActual(): Promise<Usuario | null> {
    const firebaseAuth = auth;
    if (!firebaseAuth) return null;
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser: any) => {
        unsubscribe();
        
        if (firebaseUser) {
          try {
            const idToken = await firebaseUser.getIdToken();
            
            if (typeof window !== 'undefined') {
              localStorage.setItem('authToken', idToken);
            }

            const usuario = await apiClient.post<Usuario>('/api/auth/verify', {
              idToken,
            });
            
            resolve(usuario);
          } catch (error) {
            console.error('Error obteniendo usuario:', error);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * Observar cambios en la autenticación
   */
  static onAuthChange(callback: (usuario: Usuario | null) => void): () => void {
    const firebaseAuth = auth;
    if (!firebaseAuth) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(firebaseAuth, async (firebaseUser: any) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('authToken', idToken);
          }

          const usuario = await apiClient.post<Usuario>('/api/auth/verify', {
            idToken,
          });
          
          callback(usuario);
        } catch (error) {
          console.error('Error en auth change:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }
}
