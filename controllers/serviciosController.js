// controllers/serviciosController.js - Controlador completo de servicios y horarios
import {
  obtenerTodosLosServicios,
  obtenerServicioPorId,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
  toggleServicio,
  obtenerHorarios,
  actualizarHorario,
  actualizarHorariosMasivo,
  obtenerDiasNoLaborables as obtenerDiasNoLaborablesModel,
  crearDiaNoLaborable,
  eliminarDiaNoLaborable
} from '../models/servicios.js';

// ==================== SERVICIOS ====================

// Obtener todos los servicios
export const obtenerServicios = (req, res) => {
  try {
    console.log('📋 Obteniendo todos los servicios...');
    
    obtenerTodosLosServicios((err, servicios) => {
      if (err) {
        console.error('Error al obtener servicios:', err);
        return res.status(500).json({ error: 'Error al obtener los servicios' });
      }
      
      console.log(`✅ ${servicios.length} servicios obtenidos`);
      res.status(200).json(servicios);
    });
  } catch (error) {
    console.error('Error general en obtenerServicios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener servicio por ID
export const obtenerServicio = (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Buscando servicio con ID:', id);
    
    obtenerServicioPorId(id, (err, servicio) => {
      if (err) {
        console.error('Error al obtener servicio:', err);
        return res.status(500).json({ error: 'Error al obtener el servicio' });
      }
      
      if (!servicio) {
        return res.status(404).json({ error: 'Servicio no encontrado' });
      }
      
      console.log('✅ Servicio encontrado:', servicio.nombre);
      res.status(200).json(servicio);
    });
  } catch (error) {
    console.error('Error general en obtenerServicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear nuevo servicio
export const nuevoServicio = (req, res) => {
  try {
    const { nombre, descripcion, precio, duracion_minutos, activo, icono, color } = req.body;
    
    console.log('➕ Creando nuevo servicio:', nombre);
    
    // Validaciones
    if (!nombre || !precio) {
      return res.status(400).json({ error: 'Nombre y precio son requeridos' });
    }
    
    if (precio <= 0) {
      return res.status(400).json({ error: 'El precio debe ser mayor a 0' });
    }
    
    if (duracion_minutos && (duracion_minutos < 5 || duracion_minutos > 480)) {
      return res.status(400).json({ error: 'La duración debe estar entre 5 y 480 minutos' });
    }
    
    const datos = {
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      precio: parseFloat(precio),
      duracion_minutos: duracion_minutos ? parseInt(duracion_minutos) : 30,
      activo: activo !== undefined ? activo : true,
      icono: icono || 'bi-heart-pulse',
      color: color || 'primary'
    };
    
    crearServicio(datos, (err, resultado) => {
      if (err) {
        console.error('Error al crear servicio:', err);
        return res.status(500).json({ error: 'Error al crear el servicio' });
      }
      
      console.log('✅ Servicio creado exitosamente');
      res.status(201).json({
        message: 'Servicio creado correctamente',
        servicio: resultado
      });
    });
  } catch (error) {
    console.error('Error general en nuevoServicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar servicio
export const modificarServicio = (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, duracion_minutos, activo, icono, color } = req.body;
    
    console.log('📝 Actualizando servicio ID:', id);
    
    // Validar que al menos un campo esté presente
    if (!nombre && !descripcion && !precio && !duracion_minutos && activo === undefined && !icono && !color) {
      return res.status(400).json({ error: 'Debe proporcionar al menos un campo para actualizar' });
    }
    
    // Validaciones
    if (precio !== undefined && precio <= 0) {
      return res.status(400).json({ error: 'El precio debe ser mayor a 0' });
    }
    
    if (duracion_minutos && (duracion_minutos < 5 || duracion_minutos > 480)) {
      return res.status(400).json({ error: 'La duración debe estar entre 5 y 480 minutos' });
    }
    
    const datos = {};
    if (nombre) datos.nombre = nombre.trim();
    if (descripcion !== undefined) datos.descripcion = descripcion.trim();
    if (precio) datos.precio = parseFloat(precio);
    if (duracion_minutos) datos.duracion_minutos = parseInt(duracion_minutos);
    if (activo !== undefined) datos.activo = activo;
    if (icono) datos.icono = icono;
    if (color) datos.color = color;
    
    actualizarServicio(id, datos, (err, resultado) => {
      if (err) {
        console.error('Error al actualizar servicio:', err);
        return res.status(500).json({ error: 'Error al actualizar el servicio' });
      }
      
      if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: 'Servicio no encontrado' });
      }
      
      console.log('✅ Servicio actualizado exitosamente');
      res.status(200).json({
        message: 'Servicio actualizado correctamente',
        id: id,
        cambios: datos
      });
    });
  } catch (error) {
    console.error('Error general en modificarServicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar servicio
export const borrarServicio = (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Eliminando servicio ID:', id);
    
    eliminarServicio(id, (err, resultado) => {
      if (err) {
        console.error('Error al eliminar servicio:', err);
        
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
          return res.status(400).json({ 
            error: 'No se puede eliminar el servicio porque tiene citas asociadas' 
          });
        }
        
        return res.status(500).json({ error: 'Error al eliminar el servicio' });
      }
      
      if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: 'Servicio no encontrado' });
      }
      
      console.log('✅ Servicio eliminado exitosamente');
      res.status(200).json({
        message: 'Servicio eliminado correctamente',
        id: id
      });
    });
  } catch (error) {
    console.error('Error general en borrarServicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Activar/Desactivar servicio
export const cambiarEstadoServicio = (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;
    
    console.log(`🔄 Cambiando estado del servicio ID: ${id} a ${activo}`);
    
    if (activo === undefined) {
      return res.status(400).json({ error: 'El campo activo es requerido' });
    }
    
    toggleServicio(id, activo, (err, resultado) => {
      if (err) {
        console.error('Error al cambiar estado del servicio:', err);
        return res.status(500).json({ error: 'Error al cambiar el estado del servicio' });
      }
      
      if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: 'Servicio no encontrado' });
      }
      
      console.log('✅ Estado del servicio actualizado');
      res.status(200).json({
        message: `Servicio ${activo ? 'activado' : 'desactivado'} correctamente`,
        id: id,
        activo: activo
      });
    });
  } catch (error) {
    console.error('Error general en cambiarEstadoServicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ==================== HORARIOS ====================

// Obtener horarios de atención
export const obtenerHorariosAtencion = (req, res) => {
  try {
    console.log('⏰ Obteniendo horarios de atención...');
    
    obtenerHorarios((err, horarios) => {
      if (err) {
        console.error('Error al obtener horarios:', err);
        return res.status(500).json({ error: 'Error al obtener los horarios' });
      }
      
      console.log(`✅ ${horarios.length} horarios obtenidos`);
      res.status(200).json(horarios);
    });
  } catch (error) {
    console.error('Error general en obtenerHorariosAtencion:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar horario individual
export const modificarHorario = (req, res) => {
  try {
    const { id } = req.params;
    const { hora_inicio, hora_fin, activo } = req.body;
    
    console.log('📝 Actualizando horario ID:', id);
    
    // Validaciones
    if (!hora_inicio && !hora_fin && activo === undefined) {
      return res.status(400).json({ error: 'Debe proporcionar al menos un campo para actualizar' });
    }
    
    // Validar formato de horas
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (hora_inicio && !timeRegex.test(hora_inicio)) {
      return res.status(400).json({ error: 'Formato de hora de inicio inválido (HH:MM)' });
    }
    
    if (hora_fin && !timeRegex.test(hora_fin)) {
      return res.status(400).json({ error: 'Formato de hora de fin inválido (HH:MM)' });
    }
    
    // Validar que hora_fin sea mayor que hora_inicio
    if (hora_inicio && hora_fin) {
      const [h1, m1] = hora_inicio.split(':').map(Number);
      const [h2, m2] = hora_fin.split(':').map(Number);
      const minutos1 = h1 * 60 + m1;
      const minutos2 = h2 * 60 + m2;
      
      if (minutos2 <= minutos1) {
        return res.status(400).json({ error: 'La hora de fin debe ser mayor que la hora de inicio' });
      }
    }
    
    const datos = {};
    if (hora_inicio) datos.hora_inicio = hora_inicio + ':00';
    if (hora_fin) datos.hora_fin = hora_fin + ':00';
    if (activo !== undefined) datos.activo = activo;
    
    actualizarHorario(id, datos, (err, resultado) => {
      if (err) {
        console.error('Error al actualizar horario:', err);
        return res.status(500).json({ error: 'Error al actualizar el horario' });
      }
      
      if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: 'Horario no encontrado' });
      }
      
      console.log('✅ Horario actualizado exitosamente');
      res.status(200).json({
        message: 'Horario actualizado correctamente',
        id: id,
        cambios: datos
      });
    });
  } catch (error) {
    console.error('Error general en modificarHorario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar múltiples horarios
export const modificarHorariosMasivo = (req, res) => {
  try {
    const { horarios } = req.body;
    
    console.log('📝 Actualizando múltiples horarios...');
    
    if (!Array.isArray(horarios) || horarios.length === 0) {
      return res.status(400).json({ error: 'Debe proporcionar un array de horarios' });
    }
    
    // Validar cada horario
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    for (const h of horarios) {
      if (!h.id) {
        return res.status(400).json({ error: 'Cada horario debe tener un ID' });
      }
      
      if (h.hora_inicio && !timeRegex.test(h.hora_inicio)) {
        return res.status(400).json({ error: `Formato de hora inválido en horario ID ${h.id}` });
      }
      
      if (h.hora_fin && !timeRegex.test(h.hora_fin)) {
        return res.status(400).json({ error: `Formato de hora inválido en horario ID ${h.id}` });
      }
      
      // Agregar segundos si no los tienen
      if (h.hora_inicio && !h.hora_inicio.includes(':00', 5)) {
        h.hora_inicio += ':00';
      }
      if (h.hora_fin && !h.hora_fin.includes(':00', 5)) {
        h.hora_fin += ':00';
      }
    }
    
    actualizarHorariosMasivo(horarios, (err, resultado) => {
      if (err) {
        console.error('Error al actualizar horarios:', err);
        return res.status(500).json({ error: 'Error al actualizar los horarios' });
      }
      
      console.log('✅ Horarios actualizados exitosamente');
      res.status(200).json({
        message: 'Horarios actualizados correctamente',
        updated: resultado.updated
      });
    });
  } catch (error) {
    console.error('Error general en modificarHorariosMasivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ==================== DÍAS NO LABORABLES ====================

// Obtener días no laborables
export const obtenerDiasNoLaborablesController = (req, res) => {
  try {
    console.log('📅 Obteniendo días no laborables...');
    
    obtenerDiasNoLaborablesModel((err, dias) => {
      if (err) {
        console.error('Error al obtener días no laborables:', err);
        return res.status(500).json({ error: 'Error al obtener los días no laborables' });
      }
      
      console.log(`✅ ${dias.length} días no laborables obtenidos`);
      res.status(200).json(dias);
    });
  } catch (error) {
    console.error('Error general en obtenerDiasNoLaborables:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear día no laborable
export const nuevoDiaNoLaborable = (req, res) => {
  try {
    const { fecha, descripcion, sucursal_id } = req.body;
    
    console.log('➕ Creando día no laborable:', fecha);
    
    if (!fecha || !descripcion) {
      return res.status(400).json({ error: 'Fecha y descripción son requeridos' });
    }
    
    // Validar formato de fecha
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(fecha)) {
      return res.status(400).json({ error: 'Formato de fecha inválido (YYYY-MM-DD)' });
    }
    
    const datos = {
      fecha,
      descripcion: descripcion.trim(),
      sucursal_id: sucursal_id || null
    };
    
    crearDiaNoLaborable(datos, (err, resultado) => {
      if (err) {
        console.error('Error al crear día no laborable:', err);
        
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Ya existe un día no laborable para esa fecha' });
        }
        
        return res.status(500).json({ error: 'Error al crear el día no laborable' });
      }
      
      console.log('✅ Día no laborable creado exitosamente');
      res.status(201).json({
        message: 'Día no laborable creado correctamente',
        dia: resultado
      });
    });
  } catch (error) {
    console.error('Error general en nuevoDiaNoLaborable:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar día no laborable
export const borrarDiaNoLaborable = (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Eliminando día no laborable ID:', id);
    
    eliminarDiaNoLaborable(id, (err, resultado) => {
      if (err) {
        console.error('Error al eliminar día no laborable:', err);
        return res.status(500).json({ error: 'Error al eliminar el día no laborable' });
      }
      
      if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: 'Día no laborable no encontrado' });
      }
      
      console.log('✅ Día no laborable eliminado exitosamente');
      res.status(200).json({
        message: 'Día no laborable eliminado correctamente',
        id: id
      });
    });
  } catch (error) {
    console.error('Error general en borrarDiaNoLaborable:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};