import { Coordenada } from '@/types';

/**
 * Calcula la distancia entre dos coordenadas usando la fórmula de Haversine
 * @returns distancia en kilómetros
 */
export function calcularDistancia(
  coord1: Coordenada,
  coord2: Coordenada
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distancia = R * c;
  
  return distancia;
}

/**
 * Convierte grados a radianes
 */
function toRad(grados: number): number {
  return (grados * Math.PI) / 180;
}

/**
 * Calcula el rumbo (bearing) entre dos coordenadas
 * @returns rumbo en grados (0-360)
 */
export function calcularRumbo(
  coord1: Coordenada,
  coord2: Coordenada
): number {
  const dLng = toRad(coord2.lng - coord1.lng);
  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);
  
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  
  let rumbo = Math.atan2(y, x);
  rumbo = (rumbo * 180) / Math.PI;
  rumbo = (rumbo + 360) % 360;
  
  return rumbo;
}

/**
 * Verifica si un punto está cerca de una línea (ruta)
 * @param punto Punto a verificar
 * @param ruta Array de coordenadas que forman la ruta
 * @param umbralMetros Distancia máxima en metros para considerar "cerca"
 * @returns true si el punto está cerca de la ruta
 */
export function estaCercaDeLaRuta(
  punto: Coordenada,
  ruta: Coordenada[],
  umbralMetros: number = 500
): boolean {
  const umbralKm = umbralMetros / 1000;
  
  for (let i = 0; i < ruta.length - 1; i++) {
    const distancia = distanciaPuntoALinea(punto, ruta[i], ruta[i + 1]);
    if (distancia <= umbralKm) {
      return true;
    }
  }
  
  return false;
}

/**
 * Calcula la distancia más corta de un punto a una línea
 */
function distanciaPuntoALinea(
  punto: Coordenada,
  lineaInicio: Coordenada,
  lineaFin: Coordenada
): number {
  const A = punto.lat - lineaInicio.lat;
  const B = punto.lng - lineaInicio.lng;
  const C = lineaFin.lat - lineaInicio.lat;
  const D = lineaFin.lng - lineaInicio.lng;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) {
    param = dot / lenSq;
  }
  
  let xx, yy;
  
  if (param < 0) {
    xx = lineaInicio.lat;
    yy = lineaInicio.lng;
  } else if (param > 1) {
    xx = lineaFin.lat;
    yy = lineaFin.lng;
  } else {
    xx = lineaInicio.lat + param * C;
    yy = lineaInicio.lng + param * D;
  }
  
  return calcularDistancia(punto, { lat: xx, lng: yy });
}

/**
 * Formatea la distancia para mostrar
 */
export function formatearDistancia(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Formatea la velocidad para mostrar
 */
export function formatearVelocidad(kmh: number): string {
  return `${Math.round(kmh)} km/h`;
}

/**
 * Formatea la duración para mostrar
 */
export function formatearDuracion(minutos: number): string {
  if (minutos < 60) {
    return `${Math.round(minutos)} min`;
  }
  const horas = Math.floor(minutos / 60);
  const mins = Math.round(minutos % 60);
  return `${horas}h ${mins}min`;
}

/**
 * Calcula el centro geográfico de múltiples puntos
 */
export function calcularCentroGeografico(puntos: Coordenada[]): Coordenada {
  if (puntos.length === 0) {
    throw new Error('Se requiere al menos un punto');
  }
  
  if (puntos.length === 1) {
    return puntos[0];
  }
  
  let x = 0;
  let y = 0;
  let z = 0;
  
  for (const punto of puntos) {
    const latRad = toRad(punto.lat);
    const lngRad = toRad(punto.lng);
    
    x += Math.cos(latRad) * Math.cos(lngRad);
    y += Math.cos(latRad) * Math.sin(lngRad);
    z += Math.sin(latRad);
  }
  
  const total = puntos.length;
  x = x / total;
  y = y / total;
  z = z / total;
  
  const lngCentro = Math.atan2(y, x);
  const hipotenusa = Math.sqrt(x * x + y * y);
  const latCentro = Math.atan2(z, hipotenusa);
  
  return {
    lat: (latCentro * 180) / Math.PI,
    lng: (lngCentro * 180) / Math.PI,
  };
}

/**
 * Obtiene los límites (bounds) de un conjunto de coordenadas
 */
export function obtenerBounds(puntos: Coordenada[]) {
  if (puntos.length === 0) {
    return null;
  }
  
  let north = puntos[0].lat;
  let south = puntos[0].lat;
  let east = puntos[0].lng;
  let west = puntos[0].lng;
  
  for (const punto of puntos) {
    if (punto.lat > north) north = punto.lat;
    if (punto.lat < south) south = punto.lat;
    if (punto.lng > east) east = punto.lng;
    if (punto.lng < west) west = punto.lng;
  }
  
  return { north, south, east, west };
}
