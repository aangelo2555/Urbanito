/**
 * Servicio de reportes usando backend Railway/PostgreSQL
 */

import { apiClient } from '@/lib/api/client';

export interface ResumenReportes {
  total_viajes: number;
  viajes_completados: number;
  total_choferes: number;
  choferes_activos: number;
  total_alumnos: number;
  total_rutas_activas: number;
}

export interface ViajeReporte {
  id: string;
  chofer_id: string;
  chofer_nombre: string;
  placa_vehiculo: string;
  ruta_nombre: string;
  hora_inicio: string;
  hora_fin?: string;
  estado: string;
  duracion_minutos?: number;
}

export interface ChoferActivoRanking {
  chofer_id: string;
  chofer_nombre: string;
  placa_vehiculo: string;
  total_viajes: number;
  total_minutos_en_ruta: number;
}

export interface HoraPico {
  hora: number;
  cantidad_viajes: number;
}

export class ReporteService {
  /**
   * Obtener resumen de estadísticas
   */
  static async obtenerResumen(): Promise<ResumenReportes> {
    return await apiClient.get<ResumenReportes>('/api/reportes/resumen');
  }

  /**
   * Obtener historial de viajes con filtros
   */
  static async obtenerViajes(params?: {
    chofer_id?: string;
    estado?: string;
    desde?: string;
    hasta?: string;
    limit?: number;
  }): Promise<ViajeReporte[]> {
    const query = new URLSearchParams();
    if (params?.chofer_id) query.append('chofer_id', params.chofer_id);
    if (params?.estado) query.append('estado', params.estado);
    if (params?.desde) query.append('desde', params.desde);
    if (params?.hasta) query.append('hasta', params.hasta);
    if (params?.limit) query.append('limit', params.limit.toString());

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await apiClient.get<ViajeReporte[]>(`/api/reportes/viajes${queryString}`);
  }

  /**
   * Obtener choferes más activos
   */
  static async obtenerChoferesMasActivos(): Promise<ChoferActivoRanking[]> {
    return await apiClient.get<ChoferActivoRanking[]>('/api/reportes/choferes-activos');
  }

  /**
   * Obtener horas pico
   */
  static async obtenerHorasPico(): Promise<HoraPico[]> {
    return await apiClient.get<HoraPico[]>('/api/reportes/horas-pico');
  }
}
