import { Router } from 'express';
import { db } from '../config/database';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Activar "Estoy esperando"
router.post('/', requireAuth, async (req, res) => {
  try {
    const { alumno_id, usuario_nombre, codigo_estudiante, lat, lng, ruta_id } = req.body;

    // Desactivar cualquier ubicación previa activa del alumno
    await db.query(
      `UPDATE ubicaciones_espera_alumnos SET activo = FALSE WHERE alumno_id = $1`,
      [alumno_id]
    );

    // Insertar nueva ubicación (expira en 20 minutos)
    const result = await db.query(
      `INSERT INTO ubicaciones_espera_alumnos
        (alumno_id, usuario_nombre, codigo_estudiante, lat, lng, ruta_id, activo, expira_en)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE, CURRENT_TIMESTAMP + INTERVAL '20 minutes')
       RETURNING id`,
      [alumno_id, usuario_nombre, codigo_estudiante, lat, lng, ruta_id || null]
    );

    res.status(201).json({ id: result.rows[0].id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Desactivar "Estoy esperando" para un alumno
router.put('/alumno/:alumnoId/desactivar', requireAuth, async (req, res) => {
  try {
    const { alumnoId } = req.params;

    await db.query(
      `UPDATE ubicaciones_espera_alumnos SET activo = FALSE WHERE alumno_id = $1`,
      [alumnoId]
    );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener ubicación activa de un alumno
router.get('/alumno/:alumnoId/activa', requireAuth, async (req, res) => {
  try {
    const { alumnoId } = req.params;

    const result = await db.query(
      `SELECT * FROM ubicaciones_espera_alumnos
       WHERE alumno_id = $1 AND activo = TRUE AND expira_en > CURRENT_TIMESTAMP
       LIMIT 1`,
      [alumnoId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No hay ubicación activa' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener ubicaciones activas para chofer (anónimas)
router.get('/activas/chofer', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, lat, lng,
              ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - creado_en)) / 60) AS tiempo_esperando_minutos
       FROM ubicaciones_espera_alumnos
       WHERE activo = TRUE AND expira_en > CURRENT_TIMESTAMP`
    );

    const marcadores = result.rows.map((row) => ({
      id: row.id,
      posicion: { lat: parseFloat(row.lat), lng: parseFloat(row.lng) },
      tiempo_esperando_minutos: parseInt(row.tiempo_esperando_minutos) || 0,
    }));

    res.json(marcadores);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener ubicaciones activas para admin (con nombre y código)
router.get('/activas/admin', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, usuario_nombre AS nombre, codigo_estudiante, lat, lng,
              ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - creado_en)) / 60) AS tiempo_esperando_minutos
       FROM ubicaciones_espera_alumnos
       WHERE activo = TRUE AND expira_en > CURRENT_TIMESTAMP`
    );

    const marcadores = result.rows.map((row) => ({
      id: row.id,
      nombre: row.nombre,
      codigo_estudiante: row.codigo_estudiante,
      posicion: { lat: parseFloat(row.lat), lng: parseFloat(row.lng) },
      tiempo_esperando_minutos: parseInt(row.tiempo_esperando_minutos) || 0,
    }));

    res.json(marcadores);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Limpiar ubicaciones expiradas
router.post('/limpiar-expiradas', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE ubicaciones_espera_alumnos SET activo = FALSE WHERE expira_en <= CURRENT_TIMESTAMP AND activo = TRUE`
    );

    res.json({ limpiadas: result.rowCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
