/**
 * Servicio de ubicaciones de espera usando backend Railway/PostgreSQL
 */

import { apiClient } from '@/lib/api/client';
import {
  UbicacionEsperaAlumno,
  Coordenada,
  MarcadorAlumnoEsperando,
  MarcadorAlumnoCompletoAdmin,
} from '@/types';

export class UbicacionEsperaService {
  /**
   * Activar "Estoy esperando"
   */
  static async activarEsperaAlumno(
    alumnoId: string,
    nombreAlumno: string,
    codigoEstudiante: string,
    coordenada: Coordenada,
    rutaId?: string
  ): Promise<string> {
    const response = await apiClient.post<{ id: string }>(
      '/api/ubicaciones-espera',
      {
        alumno_id: alumnoId,
        usuario_nombre: nombreAlumno,
        codigo_estudiante: codigoEstudiante,
        lat: coordenada.lat,
        lng: coordenada.lng,
        ruta_id: rutaId,
      }
    );
    return response.id;
  }

  /**
   * Desactivar "Estoy esperando"
   */
  static async desactivarEsperaAlumno(alumnoId: string): Promise<void> {
    await apiClient.put(`/api/ubicaciones-espera/alumno/${alumnoId}/desactivar`, {});
  }

  /**
   * Obtener ubicación activa de un alumno
   */
  static async obtenerUbicacionActivaAlumno(
    alumnoId: string
  ): Promise<UbicacionEsperaAlumno | null> {
    try {
      return await apiClient.get<UbicacionEsperaAlumno>(
        `/api/ubicaciones-espera/alumno/${alumnoId}/activa`
      );
    } catch (error) {
      return null;
    }
  }

  /**
   * Obtener ubicaciones activas para chofer
   */
  static async obtenerUbicacionesActivasParaChofer(
    rutaPolyline?: Coordenada[]
  ): Promise<MarcadorAlumnoEsperando[]> {
    const params = rutaPolyline 
      ? `?polyline=${encodeURIComponent(JSON.stringify(rutaPolyline))}`
      : '';
    
    return await apiClient.get<MarcadorAlumnoEsperando[]>(
      `/api/ubicaciones-espera/activas/chofer${params}`
    );
  }

  /**
   * Obtener ubicaciones activas para admin
   */
  static async obtenerUbicacionesActivasParaAdmin(): Promise<MarcadorAlumnoCompletoAdmin[]> {
    return await apiClient.get<MarcadorAlumnoCompletoAdmin[]>(
      '/api/ubicaciones-espera/activas/admin'
    );
  }

  /**
   * Limpiar ubicaciones expiradas
   */
  static async limpiarUbicacionesExpiradas(): Promise<number> {
    const response = await apiClient.post<{ limpiadas: number }>(
      '/api/ubicaciones-espera/limpiar-expiradas',
      {}
    );
    return response.limpiadas;
  }
}
