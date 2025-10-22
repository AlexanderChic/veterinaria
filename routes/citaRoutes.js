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
  obtenerCitasPorFecha,
  actualizarCitasPasadasManual,
  actualizarCitasPasadasPorCliente 
} from '../controllers/citaController.js';

const router = express.Router();

// ==================== MIDDLEWARE DE DEBUGGING ====================
// Solo activo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  router.use((req, res, next) => {
    console.log('\n=== CITAS ROUTES DEBUG ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Método:', req.method);
    console.log('URL completa:', req.originalUrl);
    console.log('Parámetros:', req.params);
    console.log('Query:', req.query);
    console.log('========================\n');
    next();
  });
}

// ==================== RUTAS DE PRUEBA ====================

// Ruta de prueba/health check (PRIMERO)
router.get('/citas-test', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Rutas de citas funcionando correctamente',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/citas - Obtener todas las citas',
      'GET /api/citas/:id - Obtener cita por ID',
      'GET /api/citas/cliente/:cliente_id - Obtener citas por cliente',
      'GET /api/citas/fecha/:fecha - Obtener citas por fecha',
      'GET /api/citas/estadisticas/:cliente_id - Obtener estadísticas',
      'POST /api/citas - Crear nueva cita',
      'POST /api/citas/actualizar-pasadas - Actualizar citas pasadas',
      'POST /api/citas/actualizar-cliente/:clienteId - Actualizar citas de cliente',
      'PUT /api/citas/:id - Actualizar cita',
      'PATCH /api/citas/:id - Actualizar cita parcial',
      'DELETE /api/citas/:id - Eliminar cita'
    ]
  });
});

// ==================== RUTAS ESPECÍFICAS (GET) ====================
// IMPORTANTE: Las rutas MÁS específicas van PRIMERO

// Obtener estadísticas de citas por cliente
router.get('/citas/estadisticas/:cliente_id', obtenerEstadisticasCitas);

// Obtener citas por cliente
router.get('/citas/cliente/:cliente_id', obtenerCitasPorCliente);

// Obtener citas por fecha
router.get('/citas/fecha/:fecha', obtenerCitasPorFecha);

// ==================== RUTAS GENERALES (GET) ====================

// Obtener todas las citas
router.get('/citas', obtenerCitas);

// Obtener una cita por ID (ÚLTIMA, para no capturar las anteriores)
router.get('/citas/:id', obtenerCitaPorId);

// ==================== RUTAS POST ====================

// Actualizar manualmente todas las citas pasadas
router.post('/citas/actualizar-pasadas', actualizarCitasPasadasManual);

// Actualizar citas pasadas de un cliente específico
router.post('/citas/actualizar-cliente/:clienteId', actualizarCitasPasadasPorCliente);

// Crear una nueva cita
router.post('/citas', crearCita);

// ==================== RUTAS PUT/PATCH ====================

// Actualizar una cita (completa)
router.put('/citas/:id', actualizarCita);

// Actualizar una cita (parcial)
router.patch('/citas/:id', actualizarCita);

// ==================== RUTAS DELETE ====================

// Eliminar una cita
router.delete('/citas/:id', eliminarCita);

export default router;