// routes/servicioRoutes.js - Rutas completas para servicios y horarios
import express from 'express';
import {
  obtenerServicios,
  obtenerServicio,
  nuevoServicio,
  modificarServicio,
  borrarServicio,
  cambiarEstadoServicio,
  obtenerHorariosAtencion,
  modificarHorario,
  modificarHorariosMasivo,
  obtenerDiasNoLaborablesController,
  nuevoDiaNoLaborable,
  borrarDiaNoLaborable
} from '../controllers/serviciosController.js';

const router = express.Router();

// ==================== RUTAS DE SERVICIOS ====================

// Obtener todos los servicios
router.get('/servicios', obtenerServicios);

// Obtener servicio por ID
router.get('/servicios/:id', obtenerServicio);

// Crear nuevo servicio
router.post('/servicios', nuevoServicio);

// Actualizar servicio
router.put('/servicios/:id', modificarServicio);

// Eliminar servicio
router.delete('/servicios/:id', borrarServicio);

// Activar/Desactivar servicio
router.patch('/servicios/:id/estado', cambiarEstadoServicio);

// ==================== RUTAS DE HORARIOS ====================

// Obtener horarios de atención
router.get('/horarios', obtenerHorariosAtencion);

// Actualizar horario individual
router.put('/horarios/:id', modificarHorario);

// Actualizar múltiples horarios
router.put('/horarios-masivo', modificarHorariosMasivo);

// ==================== RUTAS DE DÍAS NO LABORABLES ====================

// Obtener días no laborables
router.get('/dias-no-laborables', obtenerDiasNoLaborablesController);

// Crear día no laborable
router.post('/dias-no-laborables', nuevoDiaNoLaborable);

// Eliminar día no laborable
router.delete('/dias-no-laborables/:id', borrarDiaNoLaborable);

export default router;