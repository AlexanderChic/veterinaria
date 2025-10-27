// routes/servicioRoutes.js - CORREGIDO
import express from 'express';
import {
  // Sucursales
  obtenerSucursales,
  obtenerSucursalesFiltradas,
  obtenerSucursal,
  
  // Servicios
  obtenerServicios,
  obtenerServicio,
  nuevoServicio,
  modificarServicio,
  borrarServicio,
  cambiarEstadoServicio,
  
  // Horarios por sucursal
  obtenerHorariosAtencionPorSucursal,
  modificarHorario,
  modificarHorariosMasivo,
  
  // Horarios especiales
  obtenerHorariosEspeciales,
  nuevoHorarioEspecial,
  modificarHorarioEspecial,
  borrarHorarioEspecial,
  
  // Días no laborables
  obtenerDiasNoLaborables,
  nuevoDiaNoLaborable,
  borrarDiaNoLaborable
} from '../controllers/serviciosController.js';

const router = express.Router();

// ==================== RUTAS DE SUCURSALES ====================

// Obtener todas las sucursales
router.get('/sucursales', obtenerSucursales);

// Obtener sucursales filtradas por departamento o municipio
router.get('/sucursales/filtrar', obtenerSucursalesFiltradas);

// Obtener sucursal por ID
router.get('/sucursales/:id', obtenerSucursal);

// ==================== RUTAS DE SERVICIOS (GLOBALES) ====================
// NOTA: Rutas simplificadas sin el prefijo duplicado /servicios/servicios

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

// ==================== RUTAS DE HORARIOS POR SUCURSAL ====================

// Obtener horarios de atención de una sucursal específica
router.get('/sucursales/:sucursal_id/horarios', obtenerHorariosAtencionPorSucursal);

// Actualizar horario individual
router.put('/horarios/:id', modificarHorario);

// Actualizar múltiples horarios de una sucursal
router.put('/sucursales/:sucursal_id/horarios', modificarHorariosMasivo);

// ==================== RUTAS DE HORARIOS ESPECIALES ====================

// Obtener horarios especiales de una sucursal
router.get('/sucursales/:sucursal_id/horarios-especiales', obtenerHorariosEspeciales);

// Crear horario especial para una sucursal
router.post('/sucursales/:sucursal_id/horarios-especiales', nuevoHorarioEspecial);

// Actualizar horario especial
router.put('/horarios-especiales/:id', modificarHorarioEspecial);

// Eliminar horario especial
router.delete('/horarios-especiales/:id', borrarHorarioEspecial);

// ==================== RUTAS DE DÍAS NO LABORABLES ====================

// Obtener días no laborables de una sucursal
router.get('/sucursales/:sucursal_id/dias-no-laborables', obtenerDiasNoLaborables);

// Crear día no laborable para una sucursal
router.post('/sucursales/:sucursal_id/dias-no-laborables', nuevoDiaNoLaborable);

// Eliminar día no laborable
router.delete('/dias-no-laborables/:id', borrarDiaNoLaborable);

export default router;