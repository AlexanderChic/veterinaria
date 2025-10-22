// /routes/municipioRoutes.js
import express from 'express';
import { 
  obtenerMunicipios, 
  obtenerMunicipiosDepartamento, 
  obtenerMunicipio 
} from '../controllers/municipioController.js';

const router = express.Router();

// ==================== MIDDLEWARE DE DEBUGGING ====================
// Solo activo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Municipios: ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ==================== RUTAS ====================

// Ruta de prueba/health check (primero, para evitar conflictos)
router.get('/municipios-test', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Rutas de municipios funcionando correctamente',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/municipios - Obtener todos los municipios',
      'GET /api/municipios/departamento/:departamentoId - Obtener municipios por departamento',
      'GET /api/municipios/:id - Obtener municipio por ID'
    ]
  });
});

// IMPORTANTE: Ruta específica antes de la genérica
// Obtener municipios por departamento
router.get('/municipios/departamento/:departamentoId', obtenerMunicipiosDepartamento);

// Obtener todos los municipios
router.get('/municipios', obtenerMunicipios);

// Obtener un municipio por ID (al final para no capturar las rutas específicas)
router.get('/municipios/:id', obtenerMunicipio);

export default router;