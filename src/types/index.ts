// Tipos de roles del sistema
export type RolUsuario = 'admin' | 'chofer' | 'alumno';

// Estados de autorización del chofer
export type EstadoAutorizacion = 'pendiente' | 'activo' | 'suspendido';

// Estados de viaje
export type EstadoViaje = 'en_curso' | 'finalizado' | 'cancelado';

// Usuario base
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  estado: 'activo' | 'inactivo';
  creado_en: Date;
  actualizado_en: Date;
}

// Chofer
export interface Chofer {
  id: string;
  usuario_id: string;
  dni: string;
  telefono: string;
  foto_url?: string;
  placa_vehiculo: string;
  ruta_id: string;
  estado_autorizacion: EstadoAutorizacion;
  autorizado_por?: string; // ID del admin que autorizó
  fecha_autorizacion?: Date;
  creado_en: Date;
  actualizado_en: Date;
}

// Alumno
export interface Alumno {
  id: string;
  usuario_id: string;
  codigo_estudiante: string; // Código universitario UNAB (único)
  telefono?: string;
  notificaciones_activas: boolean;
  minutos_notificacion: number; // Minutos antes de llegada para notificar
  creado_en: Date;
  actualizado_en: Date;
}

// Coordenadas geográficas
export interface Coordenada {
  lat: number;
  lng: number;
}

// Parada en una ruta
export interface Parada {
  id: string;
  nombre: string;
  coordenada: Coordenada;
  orden: number; // Orden en la ruta
  es_parada_universidad?: boolean; // Marca la parada principal de la UNAB
}

// Ruta
export interface Ruta {
  id: string;
  nombre: string;
  origen: string;
  destino: string;
  paradas: Parada[];
  polyline: Coordenada[]; // Array de coordenadas que trazan la ruta
  distancia_km: number;
  tiempo_estimado_min: number;
  activa: boolean;
  creado_en: Date;
  actualizado_en: Date;
}

// Viaje
export interface Viaje {
  id: string;
  chofer_id: string;
  ruta_id: string;
  hora_inicio: Date;
  hora_fin?: Date;
  estado: EstadoViaje;
  distancia_recorrida_km?: number;
  duracion_minutos?: number;
  creado_en: Date;
  actualizado_en: Date;
}

// Ubicación en tiempo real (Realtime Database)
export interface UbicacionTiempoReal {
  viaje_id: string;
  chofer_id: string;
  lat: number;
  lng: number;
  velocidad?: number; // km/h
  rumbo?: number; // Grados (0-360)
  precision?: number; // Precisión en metros
  timestamp: number; // Unix timestamp
}

// Ubicación de alumno esperando
export interface UbicacionEsperaAlumno {
  id: string;
  alumno_id: string;
  usuario_nombre: string; // Solo visible para admin
  codigo_estudiante: string; // Solo visible para admin
  lat: number;
  lng: number;
  activo: boolean;
  creado_en: Date;
  expira_en: Date;
  ruta_id?: string; // Para filtrar por ruta si hay múltiples
}

// Notificación
export interface Notificacion {
  id: string;
  tipo: 'info' | 'alerta' | 'error' | 'exito';
  titulo: string;
  mensaje: string;
  rol_destinatario?: RolUsuario; // Si es para un rol específico
  usuario_destinatario?: string; // Si es para un usuario específico
  leido: boolean;
  creado_en: Date;
}

// ETA calculado
export interface ETACalculado {
  parada_id: string;
  parada_nombre: string;
  distancia_metros: number;
  duracion_segundos: number;
  duracion_con_trafico_segundos: number;
  hora_llegada_estimada: Date;
}

// Reporte de puntualidad
export interface ReportePuntualidad {
  chofer_id: string;
  chofer_nombre: string;
  total_viajes: number;
  viajes_a_tiempo: number;
  viajes_tarde: number;
  promedio_minutos_retraso: number;
  periodo: {
    inicio: Date;
    fin: Date;
  };
}

// Resumen de alumnos esperando (para admin)
export interface ResumenAlumnosEsperando {
  zona: string;
  coordenada: Coordenada;
  cantidad_alumnos: number;
  alumnos: Array<{
    id: string;
    nombre: string;
    codigo_estudiante: string;
    tiempo_esperando_minutos: number;
  }>;
}

// DTOs para formularios

export interface RegistroAlumnoDTO {
  nombre: string;
  email: string;
  codigo_estudiante: string;
  telefono?: string;
  password: string;
}

export interface LoginDTO {
  email_o_codigo: string;
  password: string;
}

export interface RegistroChoferDTO {
  nombre: string;
  email: string;
  dni: string;
  telefono: string;
  placa_vehiculo: string;
  ruta_id: string;
  foto?: File;
  password: string;
}

export interface ActualizarEstadoChoferDTO {
  chofer_id: string;
  nuevo_estado: EstadoAutorizacion;
  autorizado_por: string;
}

// Contexto de autenticación
export interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  login: (credentials: LoginDTO) => Promise<void>;
  logout: () => Promise<void>;
  registrarAlumno: (data: RegistroAlumnoDTO) => Promise<void>;
}

// Estado global de mapa
export interface MapaState {
  centroMapa: Coordenada;
  zoom: number;
  combiSeleccionada: string | null;
  mostrarTrafico: boolean;
  setCentroMapa: (coordenada: Coordenada) => void;
  setZoom: (zoom: number) => void;
  setCombiSeleccionada: (id: string | null) => void;
  toggleTrafico: () => void;
}

// Props comunes de componentes de mapa
export interface MapaBaseProps {
  centro: Coordenada;
  zoom: number;
  altura?: string;
  mostrarTrafico?: boolean;
}

// Marcador de combi en el mapa
export interface MarcadorCombi {
  viaje_id: string;
  chofer_id: string;
  chofer_nombre: string;
  placa: string;
  posicion: Coordenada;
  velocidad?: number;
  rumbo?: number;
  tiempo_en_ruta_minutos: number;
  ultima_actualizacion: Date;
}

// Marcador de alumno esperando (vista simplificada para chofer)
export interface MarcadorAlumnoEsperando {
  id: string;
  posicion: Coordenada;
  tiempo_esperando_minutos: number;
}

// Marcador completo de alumno (para admin)
export interface MarcadorAlumnoCompletoAdmin extends MarcadorAlumnoEsperando {
  nombre: string;
  codigo_estudiante: string;
  telefono?: string;
}

// Log de auditoría
export interface LogAuditoria {
  id: string;
  usuario_id: string;
  usuario_nombre: string;
  usuario_rol: RolUsuario;
  accion: string;
  entidad_tipo: string;
  entidad_id: string;
  detalles?: Record<string, any>;
  ip?: string;
  timestamp: Date;
}

// Configuración del sistema
export interface ConfiguracionSistema {
  ubicacion_espera_expiracion_minutos: number;
  actualizacion_gps_segundos: number;
  radio_busqueda_alumnos_metros: number;
  velocidad_minima_movimiento_kmh: number;
  tiempo_inactividad_alerta_minutos: number;
}

// Constantes
export const COORDENADAS_BUENAVISTA: Coordenada = {
  lat: -10.75,
  lng: -77.76
};

export const COORDENADAS_LA_FLORIDA_UNAB: Coordenada = {
  lat: -10.73833,
  lng: -77.75278
};

export const CONFIGURACION_DEFAULT: ConfiguracionSistema = {
  ubicacion_espera_expiracion_minutos: 20,
  actualizacion_gps_segundos: 7,
  radio_busqueda_alumnos_metros: 500,
  velocidad_minima_movimiento_kmh: 5,
  tiempo_inactividad_alerta_minutos: 10,
};
