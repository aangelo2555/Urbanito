/**
 * Servicio de choferes usando backend Railway/PostgreSQL
 */

import { apiClient } from '@/lib/api/client';
import {
  Chofer,
  RegistroChoferDTO,
  ActualizarEstadoChoferDTO,
  EstadoAutorizacion,
} from '@/types';

export class ChoferService {
  /**
   * Registrar un nuevo chofer
   */
  static async registrarChofer(
    data: RegistroChoferDTO,
    adminId: string
  ): Promise<string> {
    const response = await apiClient.post<{ id: string }>(
      '/api/choferes',
      { ...data, creado_por: adminId }
    );
    return response.id;
  }

  /**
   * Obtener chofer por ID
   */
  static async obtenerChofer(choferId: string): Promise<Chofer | null> {
    try {
      return await apiClient.get<Chofer>(`/api/choferes/${choferId}`);
    } catch (error) {
      return null;
    }
  }

  /**
   * Obtener todos los choferes
   */
  static async obtenerTodosLosChoferes(): Promise<Chofer[]> {
    return await apiClient.get<Chofer[]>('/api/choferes');
  }

  /**
   * Obtener choferes por estado
   */
  static async obtenerChoferesPorEstado(
    estado: EstadoAutorizacion
  ): Promise<Chofer[]> {
    return await apiClient.get<Chofer[]>(
      `/api/choferes?estado=${estado}`
    );
  }

  /**
   * Actualizar estado de autorización
   */
  static async actualizarEstadoAutorizacion(
    data: ActualizarEstadoChoferDTO
  ): Promise<void> {
    await apiClient.put(`/api/choferes/${data.chofer_id}/estado`, {
      nuevo_estado: data.nuevo_estado,
      autorizado_por: data.autorizado_por,
    });
  }

  /**
   * Verificar si está autorizado para transmitir
   */
  static async estaAutorizadoParaTransmitir(choferId: string): Promise<boolean> {
    const chofer = await this.obtenerChofer(choferId);
    return chofer?.estado_autorizacion === 'activo';
  }
}
