import { Router } from 'express';
import bcrypt from 'bcryptjs';
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
      password = 'chofer123',
      dni,
      telefono,
      placa_vehiculo,
      ruta_id,
      foto_url,
      creado_por,
    } = req.body;

    if (!nombre || !email || !dni || !telefono || !placa_vehiculo) {
      return res.status(400).json({ error: 'Nombre, email, DNI, teléfono y placa son requeridos' });
    }

    // Verificar duplicados
    const checkEmail = await db.query('SELECT id FROM usuarios WHERE email = $1', [email.toLowerCase()]);
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    const checkDni = await db.query('SELECT id FROM choferes WHERE dni = $1', [dni]);
    if (checkDni.rows.length > 0) {
      return res.status(400).json({ error: 'El DNI ya está registrado' });
    }

    const checkPlaca = await db.query('SELECT id FROM choferes WHERE placa_vehiculo = $1', [placa_vehiculo]);
    if (checkPlaca.rows.length > 0) {
      return res.status(400).json({ error: 'La placa del vehículo ya está registrada' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear usuario primero
    const usuarioResult = await db.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol, estado)
       VALUES ($1, $2, $3, 'chofer', 'activo')
       RETURNING id`,
      [nombre, email.toLowerCase(), hashedPassword]
    );
    
    const usuarioId = usuarioResult.rows[0].id;
    
    // Crear chofer (autorizado directamente por el admin)
    const choferResult = await db.query(
      `INSERT INTO choferes (
        usuario_id, dni, telefono, placa_vehiculo, ruta_id, foto_url, estado_autorizacion, autorizado_por, fecha_autorizacion
      ) VALUES ($1, $2, $3, $4, $5, $6, 'activo', $7, CURRENT_TIMESTAMP)
      RETURNING id`,
      [usuarioId, dni, telefono, placa_vehiculo, ruta_id || null, foto_url || null, creado_por || null]
    );
    
    res.status(201).json({ id: choferResult.rows[0].id });
  } catch (error: any) {
    console.error('Error al crear chofer:', error);
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
