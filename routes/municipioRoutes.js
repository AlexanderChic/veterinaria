// routes/municipioRoutes.js - VERSIÓN ORIGINAL QUE FUNCIONABA
import express from 'express';
import {
  obtenerMunicipios,
  obtenerMunicipioPorId,
  crearMunicipio,
  actualizarMunicipio,
  eliminarMunicipio
} from '../controllers/municipioController.js';

const router = express.Router();

// ==================== MIDDLEWARE DEBUG ====================
router.use((req, res, next) => {
  console.log(`[MUNICIPIOS] ${req.method} ${req.originalUrl}`);
  console.log('Query params:', req.query);
  next();
});

// ==================== RUTAS ====================

// Obtener todos los municipios (con filtro opcional por departamento)
router.get('/municipios', obtenerMunicipios);

// Obtener municipio por ID
router.get('/municipios/:id', obtenerMunicipioPorId);

// Crear nuevo municipio
router.post('/municipios', crearMunicipio);

// Actualizar municipio
router.put('/municipios/:id', actualizarMunicipio);

// Eliminar municipio
router.delete('/municipios/:id', eliminarMunicipio);

console.log('✅ Rutas de municipios cargadas correctamente');

export default router;