import { Router } from 'express';
import { db } from '../config/database';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// Obtener todos los choferes
router.get('/', requireAuth, async (req, res) => {
  try {
    const { estado } = req.query;
    
    let query = `
      SELECT c.*, u.nombre, u.email
      FROM choferes c
      JOIN usuarios u ON c.usuario_id = u.id
    `;
    
    const params: any[] = [];
    
    if (estado) {
      query += ' WHERE c.estado_autorizacion = $1';
      params.push(estado);
    }
    
    query += ' ORDER BY c.creado_en DESC';
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener chofer por ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      `SELECT c.*, u.nombre, u.email
       FROM choferes c
       JOIN usuarios u ON c.usuario_id = u.id
       WHERE c.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chofer no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Crear chofer (solo admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      nombre,
      email,
      dni,
      telefono,
      placa_vehiculo,
      ruta_id,
      foto_url,
      creado_por,
    } = req.body;
    
    // Crear usuario primero
    const usuarioResult = await db.query(
      `INSERT INTO usuarios (nombre, email, rol, estado)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [nombre, email, 'chofer', 'activo']
    );
    
    const usuarioId = usuarioResult.rows[0].id;
    
    // Crear chofer
    const choferResult = await db.query(
      `INSERT INTO choferes (
        usuario_id, dni, telefono, placa_vehiculo, ruta_id, foto_url
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id`,
      [usuarioId, dni, telefono, placa_vehiculo, ruta_id, foto_url]
    );
    
    res.status(201).json({ id: choferResult.rows[0].id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar estado de autorización
router.put('/:id/estado', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevo_estado, autorizado_por } = req.body;
    
    await db.query(
      `UPDATE choferes
       SET estado_autorizacion = $1,
           autorizado_por = $2,
           fecha_autorizacion = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [nuevo_estado, autorizado_por, id]
    );
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
