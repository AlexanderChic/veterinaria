// routes/clienteActividadRoutes.js
import express from 'express';
import { 
  registrarActividad,
  obtenerDiasActivos,
  obtenerHistorialActividad,
  obtenerEstadisticasActividad
} from '../controllers/clienteActividadController.js';

const router = express.Router();

// Middleware de debugging
router.use((req, res, next) => {
  console.log('=== CLIENTE ACTIVIDAD ROUTES ===');
  console.log('Método:', req.method);
  console.log('URL:', req.originalUrl);
  console.log('Parámetros:', req.params);
  console.log('Body:', req.body);
  next();
});

// Registrar actividad del cliente
router.post('/cliente-actividad', registrarActividad);

// Obtener días activos de un cliente
router.get('/cliente-actividad/:cliente_id', obtenerDiasActivos);

// Obtener historial de actividad
router.get('/cliente-actividad/:cliente_id/historial', obtenerHistorialActividad);

// Obtener estadísticas de actividad
router.get('/cliente-actividad/:cliente_id/estadisticas', obtenerEstadisticasActividad);

export default router;