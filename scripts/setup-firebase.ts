/**
 * Script de inicialización de Firebase para el sistema Urbanito
 * 
 * Este script crea la estructura inicial de datos necesaria:
 * - Ruta predeterminada Buenavista - La Florida
 * - Usuario administrador inicial
 * - Configuración del sistema
 * 
 * Ejecutar con: npx ts-node scripts/setup-firebase.ts
 */

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Inicializar Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: `https://${process.env.FIREBASE_ADMIN_PROJECT_ID}-default-rtdb.firebaseio.com`,
});

const db = admin.firestore();

async function setupDatabase() {
  console.log('🚀 Iniciando configuración de Firebase para Urbanito...\n');

  try {
    // 1. Crear ruta predeterminada Buenavista - La Florida
    console.log('📍 Creando ruta Buenavista - La Florida...');
    const rutaRef = db.collection('rutas').doc();
    await rutaRef.set({
      nombre: 'Buenavista - La Florida (UNAB)',
      origen: 'Buenavista',
      destino: 'La Florida - Universidad Nacional de Barranca',
      paradas: [
        {
          id: '1',
          nombre: 'Buenavista (Inicio)',
          coordenada: { lat: -10.75, lng: -77.76 },
          orden: 1,
        },
        {
          id: '2',
          nombre: 'Universidad Nacional de Barranca - La Florida',
          coordenada: { lat: -10.73833, lng: -77.75278 },
          orden: 2,
          es_parada_universidad: true,
        },
      ],
      polyline: [
        { lat: -10.75, lng: -77.76 },
        { lat: -10.73833, lng: -77.75278 },
      ],
      distancia_km: 3.8,
      tiempo_estimado_min: 15,
      activa: true,
      creado_en: admin.firestore.FieldValue.serverTimestamp(),
      actualizado_en: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ Ruta creada con ID:', rutaRef.id);

    // 2. Crear usuario administrador inicial
    console.log('\n👤 Creando usuario administrador...');
    const adminEmail = 'admin@urbanito.com';
    const adminPassword = 'admin123';
    
    let adminUser;
    try {
      adminUser = await admin.auth().createUser({
        email: adminEmail,
        password: adminPassword,
        displayName: 'Administrador Urbanito',
      });
      console.log('✅ Usuario de autenticación creado:', adminUser.uid);
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        console.log('ℹ️  Usuario ya existe, obteniendo datos...');
        adminUser = await admin.auth().getUserByEmail(adminEmail);
      } else {
        throw error;
      }
    }

    // Crear documento de usuario en Firestore
    await db.collection('usuarios').doc(adminUser.uid).set({
      id: adminUser.uid,
      nombre: 'Administrador Urbanito',
      email: adminEmail,
      rol: 'admin',
      estado: 'activo',
      creado_en: admin.firestore.FieldValue.serverTimestamp(),
      actualizado_en: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ Documento de usuario creado en Firestore');

    // 3. Guardar ID de ruta como referencia
    console.log('\n📝 Guardando configuración del sistema...');
    await db.collection('configuracion').doc('sistema').set({
      ruta_principal_id: rutaRef.id,
      ubicacion_espera_expiracion_minutos: 20,
      actualizacion_gps_segundos: 7,
      radio_busqueda_alumnos_metros: 500,
      velocidad_minima_movimiento_kmh: 5,
      tiempo_inactividad_alerta_minutos: 10,
      creado_en: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ Configuración guardada');

    // Resumen
    console.log('\n' + '='.repeat(50));
    console.log('✨ ¡Configuración completada exitosamente!\n');
    console.log('📋 Credenciales de acceso administrativo:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Contraseña: ${adminPassword}`);
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio de sesión');
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Ejecutar setup
setupDatabase();
