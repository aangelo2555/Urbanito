/**
 * Servicio de rutas usando backend Railway/PostgreSQL
 */

import { apiClient } from '@/lib/api/client';
import { Ruta, Coordenada, Parada } from '@/types';

export class RutaService {
  /**
   * Obtener ruta por ID
   */
  static async obtenerRuta(rutaId: string): Promise<Ruta | null> {
    try {
      return await apiClient.get<Ruta>(`/api/rutas/${rutaId}`);
    } catch (error) {
      return null;
    }
  }

  /**
   * Obtener todas las rutas activas
   */
  static async obtenerRutasActivas(): Promise<Ruta[]> {
    return await apiClient.get<Ruta[]>('/api/rutas?activas=true');
  }

  /**
   * Actualizar polyline de una ruta
   */
  static async actualizarPolylineRuta(
    rutaId: string,
    nuevaPolyline: Coordenada[]
  ): Promise<void> {
    await apiClient.put(`/api/rutas/${rutaId}/polyline`, {
      polyline: nuevaPolyline,
    });
  }

  /**
   * Agregar parada a una ruta
   */
  static async agregarParada(
    rutaId: string,
    parada: Omit<Parada, 'id'>
  ): Promise<void> {
    await apiClient.post(`/api/rutas/${rutaId}/paradas`, parada);
  }

  /**
   * Obtener parada de la universidad
   */
  static async obtenerParadaUniversidad(rutaId: string): Promise<Parada | null> {
    const ruta = await this.obtenerRuta(rutaId);
    if (!ruta) return null;

    return ruta.paradas.find((p) => p.es_parada_universidad) || null;
  }
}
