import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'urbanito_jwt_secret_key_2026';

export interface AuthRequest extends Request {
  user?: any;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // Verificar token JWT
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    // Obtener usuario de PostgreSQL
    const result = await db.query(
      'SELECT id, nombre, email, rol, estado, creado_en, actualizado_en FROM usuarios WHERE id = $1 AND estado = $2',
      [decoded.id, 'activo']
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
    }
    
    req.user = result.rows[0];
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  requireAuth(req, res, () => {
    if (req.user?.rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    next();
  });
}

export function requireChofer(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  requireAuth(req, res, () => {
    if (req.user?.rol !== 'chofer') {
      return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de chofer.' });
    }
    next();
  });
}
