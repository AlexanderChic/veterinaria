// /routes/citaRoutes.js
import express from 'express';
import { 
  obtenerCitas, 
  obtenerCitasPorCliente,
  obtenerCitaPorId,
  crearCita, 
  actualizarCita,
  eliminarCita,
  obtenerEstadisticasCitas,
  obtenerCitasPorFecha
} from '../controllers/citaController.js';

const router = express.Router();

// Middleware de debugging para estas rutas específicas
router.use((req, res, next) => {
  console.log('=== CITAS ROUTES DEBUG ===');
  console.log('Método:', req.method);
  console.log('URL completa:', req.originalUrl);
  console.log('Ruta:', req.route?.path || 'No definida');
  console.log('Parámetros:', req.params);
  console.log('Body:', req.body);
  next();
});

// Ruta para obtener todas las citas
router.get('/citas', (req, res, next) => {
  console.log('Llegó a la ruta GET /citas');
  obtenerCitas(req, res, next);
});

// Ruta para obtener una cita por ID
router.get('/citas/:id', (req, res, next) => {
  console.log('Llegó a la ruta GET /citas/:id con ID:', req.params.id);
  obtenerCitaPorId(req, res, next);
});

// Ruta para obtener citas por cliente
router.get('/citas/cliente/:cliente_id', (req, res, next) => {
  console.log('Llegó a la ruta GET /citas/cliente/:cliente_id con cliente_id:', req.params.cliente_id);
  obtenerCitasPorCliente(req, res, next);
});

// Ruta para obtener citas por fecha
router.get('/citas/fecha/:fecha', (req, res, next) => {
  console.log('Llegó a la ruta GET /citas/fecha/:fecha con fecha:', req.params.fecha);
  obtenerCitasPorFecha(req, res, next);
});

// Ruta para obtener estadísticas de citas por cliente
router.get('/citas/estadisticas/:cliente_id', (req, res, next) => {
  console.log('Llegó a la ruta GET /citas/estadisticas/:cliente_id con cliente_id:', req.params.cliente_id);
  obtenerEstadisticasCitas(req, res, next);
});

// Ruta para crear una nueva cita
router.post('/citas', (req, res, next) => {
  console.log('Llegó a la ruta POST /citas');
  console.log('Datos de la cita:', req.body);
  crearCita(req, res, next);
});

// Ruta para actualizar una cita
router.put('/citas/:id', (req, res, next) => {
  console.log('Llegó a la ruta PUT /citas/:id con ID:', req.params.id);
  console.log('Datos a actualizar:', req.body);
  actualizarCita(req, res, next);
});

// Ruta alternativa para actualización parcial
router.patch('/citas/:id', (req, res, next) => {
  console.log('Llegó a la ruta PATCH /citas/:id con ID:', req.params.id);
  console.log('Datos a actualizar:', req.body);
  actualizarCita(req, res, next);
});

// Ruta para eliminar una cita
router.delete('/citas/:id', (req, res, next) => {
  console.log('Llegó a la ruta DELETE /citas/:id con ID:', req.params.id);
  eliminarCita(req, res, next);
});

// Ruta de prueba para verificar que las rutas funcionan
router.get('/citas-test', (req, res) => {
  res.json({ 
    message: 'Rutas de citas funcionando correctamente',
    timestamp: new Date(),
    endpoints: [
      'GET /api/citas - Obtener todas las citas',
      'GET /api/citas/:id - Obtener cita por ID',
      'GET /api/citas/cliente/:cliente_id - Obtener citas por cliente',
      'GET /api/citas/fecha/:fecha - Obtener citas por fecha',
      'GET /api/citas/estadisticas/:cliente_id - Obtener estadísticas',
      'POST /api/citas - Crear nueva cita',
      'PUT /api/citas/:id - Actualizar cita',
      'PATCH /api/citas/:id - Actualizar cita parcial',
      'DELETE /api/citas/:id - Eliminar cita'
    ]
  });
});

export default router;