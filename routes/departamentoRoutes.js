// /routes/departamentoRoutes.js
import express from 'express';
import { obtenerDepartamentos, obtenerDepartamento } from '../controllers/departamentoController.js';

const router = express.Router();

// ==================== MIDDLEWARE DE DEBUGGING ====================
// Solo activo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Departamentos: ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ==================== RUTAS ====================

// Ruta de prueba/health check (primero, para evitar conflictos)
router.get('/departamentos-test', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Rutas de departamentos funcionando correctamente',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/departamentos - Obtener todos los departamentos',
      'GET /api/departamentos/:id - Obtener departamento por ID'
    ]
  });
});

// Obtener todos los departamentos
router.get('/departamentos', obtenerDepartamentos);

// Obtener un departamento por ID
router.get('/departamentos/:id', obtenerDepartamento);

export default router;