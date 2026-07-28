import { format, formatDistanceToNow, differenceInMinutes, addMinutes, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha a formato legible
 */
export function formatearFecha(fecha: Date | number): string {
  const fechaObj = typeof fecha === 'number' ? new Date(fecha) : fecha;
  return format(fechaObj, "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });
}

/**
 * Formatea una fecha a formato corto
 */
export function formatearFechaCorta(fecha: Date | number): string {
  const fechaObj = typeof fecha === 'number' ? new Date(fecha) : fecha;
  return format(fechaObj, 'dd/MM/yyyy HH:mm', { locale: es });
}

/**
 * Formatea solo la hora
 */
export function formatearHora(fecha: Date | number): string {
  const fechaObj = typeof fecha === 'number' ? new Date(fecha) : fecha;
  return format(fechaObj, 'HH:mm', { locale: es });
}

/**
 * Formatea tiempo relativo ("hace 5 minutos")
 */
export function formatearTiempoRelativo(fecha: Date | number): string {
  const fechaObj = typeof fecha === 'number' ? new Date(fecha) : fecha;
  return formatDistanceToNow(fechaObj, { addSuffix: true, locale: es });
}

/**
 * Calcula minutos transcurridos desde una fecha
 */
export function calcularMinutosTranscurridos(fechaInicio: Date | number): number {
  const inicio = typeof fechaInicio === 'number' ? new Date(fechaInicio) : fechaInicio;
  return differenceInMinutes(new Date(), inicio);
}

/**
 * Calcula minutos entre dos fechas
 */
export function calcularMinutosEntre(fechaInicio: Date | number, fechaFin: Date | number): number {
  const inicio = typeof fechaInicio === 'number' ? new Date(fechaInicio) : fechaInicio;
  const fin = typeof fechaFin === 'number' ? new Date(fechaFin) : fechaFin;
  return differenceInMinutes(fin, inicio);
}

/**
 * Calcula la hora de llegada estimada
 */
export function calcularHoraLlegada(duracionMinutos: number): Date {
  return addMinutes(new Date(), duracionMinutos);
}

/**
 * Formatea ETA para mostrar
 */
export function formatearETA(duracionMinutos: number): string {
  if (duracionMinutos < 1) {
    return 'Llegando ahora';
  }
  if (duracionMinutos === 1) {
    return '1 minuto';
  }
  if (duracionMinutos < 60) {
    return `${Math.round(duracionMinutos)} minutos`;
  }
  const horas = Math.floor(duracionMinutos / 60);
  const minutos = Math.round(duracionMinutos % 60);
  if (minutos === 0) {
    return `${horas} hora${horas > 1 ? 's' : ''}`;
  }
  return `${horas}h ${minutos}min`;
}

/**
 * Verifica si una ubicación de espera ha expirado
 */
export function haExpirado(fechaExpiracion: Date): boolean {
  return isAfter(new Date(), fechaExpiracion);
}

/**
 * Verifica si una ubicación está por expirar (en los próximos 2 minutos)
 */
export function estaPorExpirar(fechaExpiracion: Date): boolean {
  const dentroDeDoMinutos = addMinutes(new Date(), 2);
  return isAfter(dentroDeDoMinutos, fechaExpiracion) && isBefore(new Date(), fechaExpiracion);
}

/**
 * Calcula la fecha de expiración de ubicación de espera
 */
export function calcularFechaExpiracion(minutosExpiracion: number = 20): Date {
  return addMinutes(new Date(), minutosExpiracion);
}

/**
 * Convierte Date a timestamp de Firebase
 */
export function dateATimestamp(fecha: Date): number {
  return fecha.getTime();
}

/**
 * Convierte timestamp de Firebase a Date
 */
export function timestampADate(timestamp: number): Date {
  return new Date(timestamp);
}
