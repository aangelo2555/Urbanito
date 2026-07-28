import { Router } from 'express';
import { db } from '../config/database';
import admin from 'firebase-admin';

const router = Router();

// Verificar token de Firebase y crear/actualizar usuario en PostgreSQL
router.post('/verify', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    // Verificar token con Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email } = decodedToken;
    
    // Buscar o crear usuario en PostgreSQL
    const result = await db.query(
      `SELECT * FROM usuarios WHERE firebase_uid = $1`,
      [uid]
    );
    
    let usuario = result.rows[0];
    
    if (!usuario && email) {
      // Crear nuevo usuario
      const insertResult = await db.query(
        `INSERT INTO usuarios (firebase_uid, email, nombre, rol, estado)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [uid, email, email.split('@')[0], 'alumno', 'activo']
      );
      usuario = insertResult.rows[0];
    }
    
    res.json({ usuario });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

export default router;
