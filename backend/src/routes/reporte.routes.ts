import { Router } from 'express';
import { db } from '../config/database';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// Resumen de estadísticas del sistema para Dashboard y Reportes
router.get('/resumen', requireAdmin, async (req, res) => {
  try {
    const totalViajesRes = await db.query('SELECT COUNT(*) FROM viajes');
    const viajesCompletadosRes = await db.query("SELECT COUNT(*) FROM viajes WHERE estado = 'finalizado'");
    const totalChoferesRes = await db.query('SELECT COUNT(*) FROM choferes');
    const choferesActivosRes = await db.query("SELECT COUNT(*) FROM choferes WHERE estado_autorizacion = 'activo'");
    const totalAlumnosRes = await db.query('SELECT COUNT(*) FROM alumnos');
    const totalRutasRes = await db.query('SELECT COUNT(*) FROM rutas WHERE activa = TRUE');

    res.json({
      total_viajes: parseInt(totalViajesRes.rows[0].count),
      viajes_completados: parseInt(viajesCompletadosRes.rows[0].count),
      total_choferes: parseInt(totalChoferesRes.rows[0].count),
      choferes_activos: parseInt(choferesActivosRes.rows[0].count),
      total_alumnos: parseInt(totalAlumnosRes.rows[0].count),
      total_rutas_activas: parseInt(totalRutasRes.rows[0].count),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Historial detallado de viajes con filtros
router.get('/viajes', requireAdmin, async (req, res) => {
  try {
    const { chofer_id, estado, desde, hasta, limit = 50 } = req.query;

    let query = `
      SELECT v.*, c.placa_vehiculo, c.dni, u.nombre AS chofer_nombre, r.nombre AS ruta_nombre
      FROM viajes v
      JOIN choferes c ON v.chofer_id = c.id
      JOIN usuarios u ON c.usuario_id = u.id
      JOIN rutas r ON v.ruta_id = r.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (chofer_id) {
      params.push(chofer_id);
      query += ` AND v.chofer_id = $${params.length}`;
    }

    if (estado) {
      params.push(estado);
      query += ` AND v.estado = $${params.length}`;
    }

    if (desde) {
      params.push(desde);
      query += ` AND v.hora_inicio >= $${params.length}`;
    }

    if (hasta) {
      params.push(hasta);
      query += ` AND v.hora_inicio <= $${params.length}`;
    }

    params.push(parseInt(limit as string));
    query += ` ORDER BY v.hora_inicio DESC LIMIT $${params.length}`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Choferes más activos (Ranking)
router.get('/choferes-activos', requireAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.id AS chofer_id, u.nombre AS chofer_nombre, c.placa_vehiculo,
             COUNT(v.id) AS total_viajes,
             COALESCE(SUM(v.duracion_minutos), 0) AS total_minutos_en_ruta
      FROM choferes c
      JOIN usuarios u ON c.usuario_id = u.id
      LEFT JOIN viajes v ON c.id = v.chofer_id AND v.estado = 'finalizado'
      GROUP BY c.id, u.nombre, c.placa_vehiculo
      ORDER BY total_viajes DESC
      LIMIT 10
    `);

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Análisis de horas pico
router.get('/horas-pico', requireAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT EXTRACT(HOUR FROM hora_inicio) AS hora,
             COUNT(*) AS cantidad_viajes
      FROM viajes
      GROUP BY hora
      ORDER BY hora ASC
    `);

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
