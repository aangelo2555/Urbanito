import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'urbanito_jwt_secret_key_2026';

// Helper para generar JWT
function generarToken(usuario: { id: string; rol: string }) {
  return jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Iniciar sesión (email o código de estudiante + contraseña)
router.post('/login', async (req, res) => {
  try {
    const { email_o_codigo, password } = req.body;

    if (!email_o_codigo || !password) {
      return res.status(400).json({ message: 'Email/código y contraseña son requeridos' });
    }

    let usuario: any = null;

    // Verificar si es código de estudiante (6 a 8 dígitos)
    if (/^\d{6,8}$/.test(email_o_codigo)) {
      const alumnoRes = await db.query(
        `SELECT u.* FROM usuarios u
         JOIN alumnos a ON u.id = a.usuario_id
         WHERE a.codigo_estudiante = $1`,
        [email_o_codigo]
      );
      usuario = alumnoRes.rows[0];
    } else {
      // Buscar por email
      const userRes = await db.query(
        `SELECT * FROM usuarios WHERE email = $1`,
        [email_o_codigo.toLowerCase()]
      );
      usuario = userRes.rows[0];
    }

    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    if (usuario.estado !== 'activo') {
      return res.status(403).json({ message: 'Cuenta inactiva o suspendida' });
    }

    // Verificar contraseña si existe password_hash
    if (usuario.password_hash) {
      const passwordMatch = await bcrypt.compare(password, usuario.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
    } else {
      // Si la cuenta aún no tiene password_hash, la asignamos ahora (migración suave)
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(
        `UPDATE usuarios SET password_hash = $1 WHERE id = $2`,
        [hashedPassword, usuario.id]
      );
    }

    const token = generarToken(usuario);

    const { password_hash, firebase_uid, ...usuarioSinPassword } = usuario;

    res.json({
      token,
      usuario: usuarioSinPassword,
    });
  } catch (error: any) {
    console.error('Error en login:', error);
    res.status(500).json({ message: error.message || 'Error interno en login' });
  }
});

// Registrar nuevo alumno
router.post('/register-alumno', async (req, res) => {
  try {
    const { nombre, email, codigo_estudiante, telefono, password } = req.body;

    if (!nombre || !email || !codigo_estudiante || !password) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    // Verificar si el email o código ya existen
    const checkUser = await db.query(
      `SELECT email FROM usuarios WHERE email = $1`,
      [email.toLowerCase()]
    );
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    const checkCodigo = await db.query(
      `SELECT codigo_estudiante FROM alumnos WHERE codigo_estudiante = $1`,
      [codigo_estudiante]
    );
    if (checkCodigo.rows.length > 0) {
      return res.status(400).json({ message: 'El código de estudiante ya está registrado' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario en PostgreSQL
    const usuarioRes = await db.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol, estado)
       VALUES ($1, $2, $3, 'alumno', 'activo')
       RETURNING id, nombre, email, rol, estado, creado_en, actualizado_en`,
      [nombre, email.toLowerCase(), hashedPassword]
    );

    const nuevoUsuario = usuarioRes.rows[0];

    // Insertar alumno en PostgreSQL
    await db.query(
      `INSERT INTO alumnos (usuario_id, codigo_estudiante, telefono)
       VALUES ($1, $2, $3)`,
      [nuevoUsuario.id, codigo_estudiante, telefono || null]
    );

    const token = generarToken(nuevoUsuario);

    res.status(201).json({
      token,
      usuario: nuevoUsuario,
    });
  } catch (error: any) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: error.message || 'Error interno en registro' });
  }
});

// Obtener email dado un código de estudiante
router.post('/email-by-codigo', async (req, res) => {
  try {
    const { codigo_estudiante } = req.body;
    const result = await db.query(
      `SELECT u.email FROM usuarios u
       JOIN alumnos a ON u.id = a.usuario_id
       WHERE a.codigo_estudiante = $1`,
      [codigo_estudiante]
    );

    if (result.rows.length === 0) {
      return res.status(444).json({ message: 'Código de estudiante no encontrado' });
    }

    res.json({ email: result.rows[0].email });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener usuario autenticado o verificar token
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const result = await db.query(
      `SELECT id, nombre, email, rol, estado, creado_en, actualizado_en FROM usuarios WHERE id = $1`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ usuario: result.rows[0] });
  } catch (error: any) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
});

// Alias legacy para compatibilidad
router.post('/verify', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'Token requerido' });
    }
    const decoded: any = jwt.verify(idToken, JWT_SECRET);
    const result = await db.query(
      `SELECT id, nombre, email, rol, estado, creado_en, actualizado_en FROM usuarios WHERE id = $1`,
      [decoded.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(401).json({ message: 'Token inválido' });
  }
});

export default router;
