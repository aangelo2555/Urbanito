import { Router } from 'express';
import { db } from '../config/database';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// Obtener todas las rutas (o solo activas)
router.get('/', async (req, res) => {
  try {
    const { activas } = req.query;
    let query = 'SELECT * FROM rutas';
    const params: any[] = [];

    if (activas === 'true') {
      query += ' WHERE activa = TRUE';
    }

    query += ' ORDER BY creado_en DESC';

    const result = await db.query(query, params);

    // Formatear tipos JSONB de paradas y polyline
    const rutas = result.rows.map((row) => ({
      ...row,
      distancia_km: parseFloat(row.distancia_km),
      paradas: typeof row.paradas === 'string' ? JSON.parse(row.paradas) : row.paradas,
      polyline: typeof row.polyline === 'string' ? JSON.parse(row.polyline) : row.polyline,
    }));

    res.json(rutas);
  } catch (error: any) {
    console.error('Error al obtener rutas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener ruta por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM rutas WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }

    const row = result.rows[0];
    res.json({
      ...row,
      distancia_km: parseFloat(row.distancia_km),
      paradas: typeof row.paradas === 'string' ? JSON.parse(row.paradas) : row.paradas,
      polyline: typeof row.polyline === 'string' ? JSON.parse(row.polyline) : row.polyline,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar polyline de la ruta
router.put('/:id/polyline', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { polyline } = req.body;

    await db.query(
      `UPDATE rutas SET polyline = $1, actualizado_en = CURRENT_TIMESTAMP WHERE id = $2`,
      [JSON.stringify(polyline), id]
    );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Agregar parada a la ruta
router.post('/:id/paradas', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const parada = req.body;

    const rutaRes = await db.query('SELECT paradas FROM rutas WHERE id = $1', [id]);
    if (rutaRes.rows.length === 0) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }

    let paradas = rutaRes.rows[0].paradas;
    if (typeof paradas === 'string') paradas = JSON.parse(paradas);

    const nuevaParada = {
      id: Date.now().toString(),
      ...parada,
    };

    paradas.push(nuevaParada);

    await db.query(
      `UPDATE rutas SET paradas = $1, actualizado_en = CURRENT_TIMESTAMP WHERE id = $2`,
      [JSON.stringify(paradas), id]
    );

    res.status(201).json(nuevaParada);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
