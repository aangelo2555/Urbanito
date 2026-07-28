/**
 * Servicio de viajes usando backend Railway/PostgreSQL + WebSocket
 */

import { apiClient } from '@/lib/api/client';
import { wsClient } from '@/lib/api/websocket';
import { Viaje, UbicacionTiempoReal, Coordenada } from '@/types';

export class ViajeService {
  /**
   * Iniciar un nuevo viaje
   */
  static async iniciarViaje(choferId: string, rutaId: string): Promise<string> {
    const response = await apiClient.post<{ id: string }>('/api/viajes', {
      chofer_id: choferId,
      ruta_id: rutaId,
    });
    return response.id;
  }

  /**
   * Finalizar un viaje
   */
  static async finalizarViaje(viajeId: string, choferId: string): Promise<void> {
    await apiClient.put(`/api/viajes/${viajeId}/finalizar`, {
      chofer_id: choferId,
    });
  }

  /**
   * Obtener viaje por ID
   */
  static async obtenerViaje(viajeId: string): Promise<Viaje | null> {
    try {
      return await apiClient.get<Viaje>(`/api/viajes/${viajeId}`);
    } catch (error) {
      return null;
    }
  }

  /**
   * Obtener viaje activo de un chofer
   */
  static async obtenerViajeActivoDelChofer(choferId: string): Promise<Viaje | null> {
    try {
      return await apiClient.get<Viaje>(
        `/api/viajes/activos/chofer/${choferId}`
      );
    } catch (error) {
      return null;
    }
  }

  /**
   * Obtener historial de viajes
   */
  static async obtenerHistorialViajes(
    choferId: string,
    limitCount: number = 50
  ): Promise<Viaje[]> {
    return await apiClient.get<Viaje[]>(
      `/api/viajes/historial/${choferId}?limit=${limitCount}`
    );
  }

  /**
   * Actualizar ubicación en tiempo real vía WebSocket
   */
  static async actualizarUbicacionTiempoReal(
    choferId: string,
    ubicacion: Omit<UbicacionTiempoReal, 'viaje_id' | 'chofer_id'>
  ): Promise<void> {
    wsClient.send({
      type: 'ubicacion_gps',
      choferId,
      ...ubicacion,
    });
  }

  /**
   * Observar ubicaciones en tiempo real vía WebSocket
   */
  static observarTodasLasUbicaciones(
    callback: (ubicaciones: Record<string, UbicacionTiempoReal>) => void
  ): () => void {
    const handler = (data: any) => {
      if (data.type === 'ubicaciones_actualizadas') {
        callback(data.ubicaciones);
      }
    };

    wsClient.on('ubicaciones_actualizadas', handler);

    // Suscribirse
    wsClient.send({ type: 'subscribe_ubicaciones' });

    // Retornar función para desuscribirse
    return () => {
      wsClient.off('ubicaciones_actualizadas', handler);
    };
  }

  /**
   * Observar ubicación de un chofer específico
   */
  static observarUbicacionChofer(
    choferId: string,
    callback: (ubicacion: UbicacionTiempoReal | null) => void
  ): () => void {
    const handler = (data: any) => {
      if (data.type === 'ubicacion_actualizada' && data.choferId === choferId) {
        callback(data.ubicacion);
      }
    };

    wsClient.on('ubicacion_actualizada', handler);

    // Suscribirse
    wsClient.send({ type: 'subscribe_ubicacion', choferId });

    return () => {
      wsClient.off('ubicacion_actualizada', handler);
    };
  }
}
