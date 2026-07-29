import { Router } from 'express';
import authRoutes from './auth.routes';
import choferRoutes from './chofer.routes';
import rutaRoutes from './ruta.routes';
import viajeRoutes from './viaje.routes';
import ubicacionEsperaRoutes from './ubicacion-espera.routes';
import reporteRoutes from './reporte.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/choferes', choferRoutes);
router.use('/rutas', rutaRoutes);
router.use('/viajes', viajeRoutes);
router.use('/ubicaciones-espera', ubicacionEsperaRoutes);
router.use('/reportes', reporteRoutes);

export default router;
