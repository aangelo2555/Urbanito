import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { db } from '../config/database';

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

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
    
    const idToken = authHeader.split('Bearer ')[1];
    
    // Verificar token con Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Obtener usuario de PostgreSQL
    const result = await db.query(
      'SELECT * FROM usuarios WHERE firebase_uid = $1',
      [decodedToken.uid]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    
    req.user = result.rows[0];
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
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
