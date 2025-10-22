// /routes/adminRoutes.js
import express from 'express';
import {
  obtenerEstadisticasGenerales,
  obtenerEstadisticasPorFecha,
  obtenerReporteMensual,
  obtenerTopClientes,
  obtenerServiciosPopulares,
  obtenerActividadReciente,
  obtenerDashboardCompleto
} from '../controllers/adminController.js';

const router = express.Router();

// ==================== MIDDLEWARE DE DEBUGGING ====================
// Solo activo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Admin: ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ==================== RUTAS ====================

// Ruta de prueba/health check (primero)
router.get('/admin/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Rutas de administrador funcionando correctamente',
    timestamp: new Date().toISOString(),
    endpoints: {
      estadisticas: [
        'GET /api/admin/estadisticas - Estadísticas generales',
        'GET /api/admin/estadisticas/fechas - Estadísticas por rango de fechas',
        'GET /api/admin/dashboard - Dashboard completo'
      ],
      reportes: [
        'GET /api/admin/reporte-mensual - Reporte del mes actual',
        'GET /api/admin/top-clientes - Clientes más frecuentes',
        'GET /api/admin/servicios-populares - Servicios más solicitados',
        'GET /api/admin/actividad-reciente - Últimas actividades'
      ]
    }
  });
});

// IMPORTANTE: Ruta específica antes de la genérica
// Obtener estadísticas por rango de fechas
router.get('/admin/estadisticas/fechas', obtenerEstadisticasPorFecha);

// Obtener estadísticas generales
router.get('/admin/estadisticas', obtenerEstadisticasGenerales);

// Obtener dashboard completo (todo en uno)
router.get('/admin/dashboard', obtenerDashboardCompleto);

// Obtener reporte mensual
router.get('/admin/reporte-mensual', obtenerReporteMensual);

// Obtener top clientes
router.get('/admin/top-clientes', obtenerTopClientes);

// Obtener servicios más populares
router.get('/admin/servicios-populares', obtenerServiciosPopulares);

// Obtener actividad reciente
router.get('/admin/actividad-reciente', obtenerActividadReciente);

export default router;