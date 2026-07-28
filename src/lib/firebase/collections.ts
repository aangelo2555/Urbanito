// Nombres de colecciones de Firestore
export const COLLECTIONS = {
  USUARIOS: 'usuarios',
  CHOFERES: 'choferes',
  ALUMNOS: 'alumnos',
  RUTAS: 'rutas',
  VIAJES: 'viajes',
  UBICACIONES_ESPERA: 'ubicaciones_espera_alumnos',
  NOTIFICACIONES: 'notificaciones',
  LOGS_AUDITORIA: 'logs_auditoria',
} as const;

// Paths de Realtime Database
export const REALTIME_PATHS = {
  UBICACIONES_TIEMPO_REAL: 'ubicaciones_tiempo_real',
  VIAJES_ACTIVOS: 'viajes_activos',
} as const;
