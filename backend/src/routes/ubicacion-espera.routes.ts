import { Router } from 'express';
import { db } from '../config/database';
import { requireAuth } from '../middleware/auth';
import { notificarEsperaActualizada } from '../websocket';

const router = Router();

// Helper para obtener o auto-crear el id real en la tabla alumnos dado usuario_id o alumnos.id
async function resolverAlumnoId(id: string, codigoEstudiante?: string): Promise<string> {
  try {
    const res = await db.query(
      'SELECT id FROM alumnos WHERE id = $1 OR usuario_id = $1 LIMIT 1',
      [id]
    );
    if (res.rows.length > 0) {
      return res.rows[0].id;
    }

    const userRes = await db.query('SELECT id, email FROM usuarios WHERE id = $1', [id]);
    if (userRes.rows.length > 0) {
      const codigo = codigoEstudiante || `EST-${Math.floor(100000 + Math.random() * 900000)}`;
      const newAlumno = await db.query(
        `INSERT INTO alumnos (usuario_id, codigo_estudiante)
         VALUES ($1, $2)
         ON CONFLICT (codigo_estudiante) DO UPDATE SET usuario_id = $1
         RETURNING id`,
        [id, codigo]
      );
      return newAlumno.rows[0].id;
    }
  } catch (err) {
    console.error('Error al resolver alumno_id:', err);
  }
  return id;
}

// Activar "Estoy esperando"
router.post('/', requireAuth, async (req, res) => {
  try {
    const { alumno_id, usuario_nombre, codigo_estudiante, lat, lng, ruta_id } = req.body;

    const realAlumnoId = await resolverAlumnoId(alumno_id, codigo_estudiante);

    // Desactivar cualquier ubicación previa activa del alumno
    await db.query(
      `UPDATE ubicaciones_espera_alumnos SET activo = FALSE WHERE alumno_id = $1 OR alumno_id IN (SELECT id FROM alumnos WHERE usuario_id = $2)`,
      [realAlumnoId, alumno_id]
    );

    // Insertar nueva ubicación (expira en 20 minutos)
    const result = await db.query(
      `INSERT INTO ubicaciones_espera_alumnos
        (alumno_id, usuario_nombre, codigo_estudiante, lat, lng, ruta_id, activo, expira_en)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE, CURRENT_TIMESTAMP + INTERVAL '20 minutes')
       RETURNING id`,
      [realAlumnoId, usuario_nombre, codigo_estudiante || 'ALUMNO', lat, lng, ruta_id || null]
    );

    notificarEsperaActualizada();

    res.status(201).json({ id: result.rows[0].id });
  } catch (error: any) {
    console.error('Error al activar espera:', error);
    res.status(500).json({ error: error.message });
  }
});

// Desactivar "Estoy esperando" para un alumno
router.put('/alumno/:alumnoId/desactivar', requireAuth, async (req, res) => {
  try {
    const { alumnoId } = req.params;
    const realAlumnoId = await resolverAlumnoId(alumnoId);

    await db.query(
      `UPDATE ubicaciones_espera_alumnos SET activo = FALSE WHERE alumno_id = $1 OR alumno_id IN (SELECT id FROM alumnos WHERE usuario_id = $2)`,
      [realAlumnoId, alumnoId]
    );

    notificarEsperaActualizada();

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener ubicación activa de un alumno
router.get('/alumno/:alumnoId/activa', requireAuth, async (req, res) => {
  try {
    const { alumnoId } = req.params;
    const realAlumnoId = await resolverAlumnoId(alumnoId);

    const result = await db.query(
      `SELECT * FROM ubicaciones_espera_alumnos
       WHERE (alumno_id = $1 OR alumno_id IN (SELECT id FROM alumnos WHERE usuario_id = $2))
         AND activo = TRUE AND expira_en > CURRENT_TIMESTAMP
       LIMIT 1`,
      [realAlumnoId, alumnoId]
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
