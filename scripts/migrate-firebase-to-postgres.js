/**
 * Script para migrar datos de Firebase a PostgreSQL
 * Uso: node scripts/migrate-firebase-to-postgres.js
 */

const admin = require('firebase-admin');
const { Pool } = require('pg');
const path = require('path');

// Configurar Firebase Admin
const serviceAccount = require(path.join(__dirname, '../firebase-key.json'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();

// Configurar PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/urbanito_db'
});

async function migrateUsuarios() {
  console.log('Migrando usuarios...');
  const snapshot = await firestore.collection('usuarios').get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    await pool.query(
      `INSERT INTO usuarios (id, firebase_uid, nombre, email, rol, estado, creado_en)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [doc.id, data.firebase_uid, data.nombre, data.email, data.rol, 
       data.estado, data.creado_en?.toDate() || new Date()]
    );
  }
  
  console.log(`✅ ${snapshot.size} usuarios migrados`);
}

async function migrateChoferes() {
  console.log('Migrando choferes...');
  const snapshot = await firestore.collection('choferes').get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    await pool.query(
      `INSERT INTO choferes (id, usuario_id, dni, telefono, foto_url, placa_vehiculo, 
                             ruta_id, estado_autorizacion, creado_en)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO NOTHING`,
      [doc.id, data.usuario_id, data.dni, data.telefono, data.foto_url,
       data.placa_vehiculo, data.ruta_id, data.estado_autorizacion,
       data.creado_en?.toDate() || new Date()]
    );
  }
  
  console.log(`✅ ${snapshot.size} choferes migrados`);
}

async function migrateAlumnos() {
  console.log('Migrando alumnos...');
  const snapshot = await firestore.collection('alumnos').get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    await pool.query(
      `INSERT INTO alumnos (id, usuario_id, codigo_estudiante, telefono, 
                            notificaciones_activas, minutos_notificacion, creado_en)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [doc.id, data.usuario_id, data.codigo_estudiante, data.telefono,
       data.notificaciones_activas, data.minutos_notificacion,
       data.creado_en?.toDate() || new Date()]
    );
  }
  
  console.log(`✅ ${snapshot.size} alumnos migrados`);
}

async function main() {
  try {
    await migrateUsuarios();
    await migrateChoferes();
    await migrateAlumnos();
    console.log('\n✅ Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error en migración:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main();
