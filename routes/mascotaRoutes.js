// /routes/mascotaRoutes.js
import express from 'express';
import { 
  obtenerMascotasCliente,
  obtenerMascota,
  crearNuevaMascota,
  actualizarMascotaExistente,
  eliminarMascotaExistente,
  obtenerEstadisticasCliente,
  obtenerTodasMascotas
} from '../controllers/mascotaController.js';

const router = express.Router();

// Middleware de debugging para estas rutas específicas
router.use((req, res, next) => {
  console.log('=== MASCOTAS ROUTES DEBUG ===');
  console.log('Método:', req.method);
  console.log('URL completa:', req.originalUrl);
  console.log('Ruta:', req.route?.path || 'No definida');
  console.log('Params:', req.params);
  console.log('Body:', req.body);
  next();
});

// RUTAS ESPECÍFICAS (deben ir ANTES que las rutas con parámetros)

// Obtener todas las mascotas (para administradores)
router.get('/mascotas/todas', (req, res, next) => {
  console.log('Llegó a la ruta GET /mascotas/todas');
  obtenerTodasMascotas(req, res, next);
});

// Obtener estadísticas de mascotas por cliente
router.get('/mascotas/estadisticas/:clienteId', (req, res, next) => {
  console.log('Llegó a la ruta GET /mascotas/estadisticas/:clienteId');
  obtenerEstadisticasCliente(req, res, next);
});

// Obtener mascotas de un cliente específico
router.get('/mascotas/cliente/:clienteId', (req, res, next) => {
  console.log('Llegó a la ruta GET /mascotas/cliente/:clienteId');
  obtenerMascotasCliente(req, res, next);
});

// RUTAS GENERALES (con parámetros)

// Obtener una mascota específica por ID
router.get('/mascotas/:id', (req, res, next) => {
  console.log('Llegó a la ruta GET /mascotas/:id');
  obtenerMascota(req, res, next);
});

// Crear nueva mascota
router.post('/mascotas', (req, res, next) => {
  console.log('Llegó a la ruta POST /mascotas');
  crearNuevaMascota(req, res, next);
});

// Actualizar mascota existente
router.put('/mascotas/:id', (req, res, next) => {
  console.log('Llegó a la ruta PUT /mascotas/:id');
  actualizarMascotaExistente(req, res, next);
});

// Eliminar mascota
router.delete('/mascotas/:id', (req, res, next) => {
  console.log('Llegó a la ruta DELETE /mascotas/:id');
  eliminarMascotaExistente(req, res, next);
});

// Ruta de prueba para verificar que las rutas funcionan
router.get('/mascotas-test', (req, res) => {
  res.json({ 
    message: 'Rutas de mascotas funcionando correctamente',
    timestamp: new Date(),
    availableRoutes: [
      'GET /api/mascotas/todas - Obtener todas las mascotas',
      'GET /api/mascotas/cliente/:clienteId - Obtener mascotas de un cliente',
      'GET /api/mascotas/estadisticas/:clienteId - Obtener estadísticas por cliente',
      'GET /api/mascotas/:id - Obtener una mascota específica',
      'POST /api/mascotas - Crear nueva mascota',
      'PUT /api/mascotas/:id - Actualizar mascota',
      'DELETE /api/mascotas/:id - Eliminar mascota'
    ]
  });
});

export default router;