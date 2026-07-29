import { Router } from 'express';
import { db } from '../config/database';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Iniciar viaje
router.post('/', requireAuth, async (req, res) => {
  try {
    const { chofer_id, ruta_id } = req.body;

    const result = await db.query(
      `INSERT INTO viajes (chofer_id, ruta_id, hora_inicio, estado)
       VALUES ($1, $2, CURRENT_TIMESTAMP, 'en_curso')
       RETURNING id`,
      [chofer_id, ruta_id]
    );

    res.status(201).json({ id: result.rows[0].id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener viaje activo del chofer
router.get('/activos/chofer/:choferId', requireAuth, async (req, res) => {
  try {
    const { choferId } = req.params;

    const result = await db.query(
      `SELECT * FROM viajes
       WHERE chofer_id = $1 AND estado = 'en_curso'
       ORDER BY hora_inicio DESC LIMIT 1`,
      [choferId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sin viaje activo' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener viaje por ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM viajes WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Viaje no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Finalizar viaje
router.put('/:id/finalizar', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      `UPDATE viajes
       SET estado = 'finalizado',
           hora_fin = CURRENT_TIMESTAMP,
           duracion_minutos = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - hora_inicio)) / 60
       WHERE id = $1`,
      [id]
    );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Historial de viajes del chofer
router.get('/historial/:choferId', requireAuth, async (req, res) => {
  try {
    const { choferId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await db.query(
      `SELECT * FROM viajes
       WHERE chofer_id = $1
       ORDER BY hora_inicio DESC
       LIMIT $2`,
      [choferId, limit]
    );

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
