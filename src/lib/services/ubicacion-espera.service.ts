import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import {
  UbicacionEsperaAlumno,
  Coordenada,
  ResumenAlumnosEsperando,
  MarcadorAlumnoEsperando,
  MarcadorAlumnoCompletoAdmin,
} from '@/types';
import { calcularFechaExpiracion, haExpirado, calcularMinutosTranscurridos } from '@/lib/utils/fechas';
import { estaCercaDeLaRuta } from '@/lib/utils/geo';
import { CONFIGURACION_DEFAULT } from '@/types';

export class UbicacionEsperaService {
  /**
   * Activar "Estoy esperando" para un alumno
   */
  static async activarEsperaAlumno(
    alumnoId: string,
    nombreAlumno: string,
    codigoEstudiante: string,
    coordenada: Coordenada,
    rutaId?: string
  ): Promise<string> {
    // Verificar si el alumno ya tiene una ubicación activa
    const ubicacionActiva = await this.obtenerUbicacionActivaAlumno(alumnoId);
    if (ubicacionActiva) {
      // Actualizar la existente
      return this.actualizarUbicacionEspera(ubicacionActiva.id, coordenada);
    }

    // Crear nueva ubicación de espera
    const ubicacionDocRef = doc(collection(firestore, COLLECTIONS.UBICACIONES_ESPERA));
    const ubicacionId = ubicacionDocRef.id;

    const fechaExpiracion = calcularFechaExpiracion(
      CONFIGURACION_DEFAULT.ubicacion_espera_expiracion_minutos
    );

    const ubicacion: UbicacionEsperaAlumno = {
      id: ubicacionId,
      alumno_id: alumnoId,
      usuario_nombre: nombreAlumno,
      codigo_estudiante: codigoEstudiante,
      lat: coordenada.lat,
      lng: coordenada.lng,
      activo: true,
      creado_en: new Date(),
      expira_en: fechaExpiracion,
      ruta_id: rutaId,
    };

    await setDoc(ubicacionDocRef, {
      ...ubicacion,
      creado_en: serverTimestamp(),
      expira_en: Timestamp.fromDate(fechaExpiracion),
    });

    return ubicacionId;
  }

  /**
   * Desactivar "Estoy esperando" para un alumno
   */
  static async desactivarEsperaAlumno(alumnoId: string): Promise<void> {
    const ubicacionActiva = await this.obtenerUbicacionActivaAlumno(alumnoId);
    
    if (!ubicacionActiva) {
      return; // No hay ubicación activa
    }

    const docRef = doc(firestore, COLLECTIONS.UBICACIONES_ESPERA, ubicacionActiva.id);
    await updateDoc(docRef, {
      activo: false,
    });
  }

  /**
   * Actualizar ubicación de espera existente
   */
  static async actualizarUbicacionEspera(
    ubicacionId: string,
    nuevaCoordenada: Coordenada
  ): Promise<string> {
    const docRef = doc(firestore, COLLECTIONS.UBICACIONES_ESPERA, ubicacionId);

    const nuevaExpiracion = calcularFechaExpiracion(
      CONFIGURACION_DEFAULT.ubicacion_espera_expiracion_minutos
    );

    await updateDoc(docRef, {
      lat: nuevaCoordenada.lat,
      lng: nuevaCoordenada.lng,
      expira_en: Timestamp.fromDate(nuevaExpiracion),
      activo: true,
    });

    return ubicacionId;
  }

  /**
   * Obtener ubicación activa de un alumno
   */
  static async obtenerUbicacionActivaAlumno(
    alumnoId: string
  ): Promise<UbicacionEsperaAlumno | null> {
    const q = query(
      collection(firestore, COLLECTIONS.UBICACIONES_ESPERA),
      where('alumno_id', '==', alumnoId),
      where('activo', '==', true)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    const ubicacion: UbicacionEsperaAlumno = {
      id: doc.id,
      alumno_id: data.alumno_id,
      usuario_nombre: data.usuario_nombre,
      codigo_estudiante: data.codigo_estudiante,
      lat: data.lat,
      lng: data.lng,
      activo: data.activo,
      creado_en: data.creado_en?.toDate() || new Date(),
      expira_en: data.expira_en?.toDate() || new Date(),
      ruta_id: data.ruta_id,
    };

    // Verificar si ha expirado
    if (haExpirado(ubicacion.expira_en)) {
      await this.desactivarEsperaAlumno(alumnoId);
      return null;
    }

    return ubicacion;
  }

  /**
   * Obtener todas las ubicaciones activas (para chofer - vista simplificada)
   */
  static async obtenerUbicacionesActivasParaChofer(
    rutaPolyline?: Coordenada[]
  ): Promise<MarcadorAlumnoEsperando[]> {
    const q = query(
      collection(firestore, COLLECTIONS.UBICACIONES_ESPERA),
      where('activo', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const ahora = new Date();

    const ubicaciones: MarcadorAlumnoEsperando[] = [];

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const expiraEn = data.expira_en?.toDate() || new Date();

      // Saltar si ha expirado
      if (haExpirado(expiraEn)) {
        continue;
      }

      const coordenada: Coordenada = { lat: data.lat, lng: data.lng };

      // Si se proporciona una ruta, filtrar solo los alumnos cerca de ella
      if (rutaPolyline && !estaCercaDeLaRuta(coordenada, rutaPolyline)) {
        continue;
      }

      const tiempoEsperando = calcularMinutosTranscurridos(
        data.creado_en?.toDate() || new Date()
      );

      ubicaciones.push({
        id: doc.id,
        posicion: coordenada,
        tiempo_esperando_minutos: tiempoEsperando,
      });
    }

    return ubicaciones;
  }

  /**
   * Obtener todas las ubicaciones activas (para admin - vista completa)
   */
  static async obtenerUbicacionesActivasParaAdmin(): Promise<MarcadorAlumnoCompletoAdmin[]> {
    const q = query(
      collection(firestore, COLLECTIONS.UBICACIONES_ESPERA),
      where('activo', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const ubicaciones: MarcadorAlumnoCompletoAdmin[] = [];

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const expiraEn = data.expira_en?.toDate() || new Date();

      // Saltar si ha expirado
      if (haExpirado(expiraEn)) {
        continue;
      }

      const tiempoEsperando = calcularMinutosTranscurridos(
        data.creado_en?.toDate() || new Date()
      );

      ubicaciones.push({
        id: doc.id,
        posicion: { lat: data.lat, lng: data.lng },
        tiempo_esperando_minutos: tiempoEsperando,
        nombre: data.usuario_nombre,
        codigo_estudiante: data.codigo_estudiante,
        telefono: data.telefono,
      });
    }

    return ubicaciones;
  }

  /**
   * Obtener resumen de alumnos esperando por zona (para admin)
   */
  static async obtenerResumenPorZona(): Promise<ResumenAlumnosEsperando[]> {
    const ubicaciones = await this.obtenerUbicacionesActivasParaAdmin();

    // Agrupar por zona (simplificado - en producción usar clustering geográfico)
    const zonas: Record<string, ResumenAlumnosEsperando> = {};

    for (const ubicacion of ubicaciones) {
      // Redondear coordenadas para agrupar zonas cercanas
      const zonaKey = `${ubicacion.posicion.lat.toFixed(3)},${ubicacion.posicion.lng.toFixed(3)}`;

      if (!zonas[zonaKey]) {
        zonas[zonaKey] = {
          zona: zonaKey,
          coordenada: ubicacion.posicion,
          cantidad_alumnos: 0,
          alumnos: [],
        };
      }

      zonas[zonaKey].cantidad_alumnos++;
      zonas[zonaKey].alumnos.push({
        id: ubicacion.id,
        nombre: ubicacion.nombre,
        codigo_estudiante: ubicacion.codigo_estudiante,
        tiempo_esperando_minutos: ubicacion.tiempo_esperando_minutos,
      });
    }

    return Object.values(zonas);
  }

  /**
   * Limpiar ubicaciones expiradas (tarea programada)
   */
  static async limpiarUbicacionesExpiradas(): Promise<number> {
    const q = query(
      collection(firestore, COLLECTIONS.UBICACIONES_ESPERA),
      where('activo', '==', true)
    );

    const querySnapshot = await getDocs(q);
    let contador = 0;

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const expiraEn = data.expira_en?.toDate() || new Date();

      if (haExpirado(expiraEn)) {
        await updateDoc(doc.ref, {
          activo: false,
        });
        contador++;
      }
    }

    return contador;
  }
}
