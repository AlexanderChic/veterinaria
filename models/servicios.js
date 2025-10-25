// models/servicios.js - Modelo completo de servicios y horarios
import db from '../config/db.js';

// ==================== SERVICIOS ====================

// Obtener todos los servicios
export const obtenerTodosLosServicios = (callback) => {
  console.log('📋 Obteniendo todos los servicios...');
  
  const query = `
    SELECT 
      id, nombre, descripcion, precio, duracion_minutos, 
      activo, icono, color, fecha_creacion, fecha_modificacion
    FROM servicio 
    ORDER BY nombre ASC
  `;
  
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error al obtener servicios:', err);
      return callback(err, null);
    }
    console.log(`✅ ${result.length} servicios obtenidos`);
    callback(null, result);
  });
};

// Obtener servicio por ID
export const obtenerServicioPorId = (id, callback) => {
  console.log('🔍 Buscando servicio con ID:', id);
  
  const query = `
    SELECT 
      id, nombre, descripcion, precio, duracion_minutos, 
      activo, icono, color, fecha_creacion, fecha_modificacion
    FROM servicio 
    WHERE id = ?
  `;
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al obtener servicio:', err);
      return callback(err, null);
    }
    
    if (result.length === 0) {
      return callback(null, null);
    }
    
    console.log('✅ Servicio encontrado:', result[0].nombre);
    callback(null, result[0]);
  });
};

// Crear nuevo servicio
export const crearServicio = (datos, callback) => {
  console.log('➕ Creando nuevo servicio:', datos.nombre);
  
  const query = `
    INSERT INTO servicio 
    (nombre, descripcion, precio, duracion_minutos, activo, icono, color) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  const valores = [
    datos.nombre,
    datos.descripcion || null,
    datos.precio,
    datos.duracion_minutos || 30,
    datos.activo !== undefined ? datos.activo : true,
    datos.icono || 'bi-heart-pulse',
    datos.color || 'primary'
  ];
  
  db.query(query, valores, (err, result) => {
    if (err) {
      console.error('Error al crear servicio:', err);
      return callback(err, null);
    }
    
    console.log('✅ Servicio creado con ID:', result.insertId);
    callback(null, { id: result.insertId, ...datos });
  });
};

// Actualizar servicio
export const actualizarServicio = (id, datos, callback) => {
  console.log('📝 Actualizando servicio ID:', id);
  
  const campos = [];
  const valores = [];
  
  if (datos.nombre !== undefined) {
    campos.push('nombre = ?');
    valores.push(datos.nombre);
  }
  
  if (datos.descripcion !== undefined) {
    campos.push('descripcion = ?');
    valores.push(datos.descripcion);
  }
  
  if (datos.precio !== undefined) {
    campos.push('precio = ?');
    valores.push(datos.precio);
  }
  
  if (datos.duracion_minutos !== undefined) {
    campos.push('duracion_minutos = ?');
    valores.push(datos.duracion_minutos);
  }
  
  if (datos.activo !== undefined) {
    campos.push('activo = ?');
    valores.push(datos.activo);
  }
  
  if (datos.icono !== undefined) {
    campos.push('icono = ?');
    valores.push(datos.icono);
  }
  
  if (datos.color !== undefined) {
    campos.push('color = ?');
    valores.push(datos.color);
  }
  
  if (campos.length === 0) {
    return callback(new Error('No hay campos para actualizar'), null);
  }
  
  valores.push(id);
  const query = `UPDATE servicio SET ${campos.join(', ')} WHERE id = ?`;
  
  db.query(query, valores, (err, result) => {
    if (err) {
      console.error('Error al actualizar servicio:', err);
      return callback(err, null);
    }
    
    console.log(`✅ Servicio actualizado. Filas afectadas: ${result.affectedRows}`);
    callback(null, result);
  });
};

// Eliminar servicio
export const eliminarServicio = (id, callback) => {
  console.log('🗑️ Eliminando servicio ID:', id);
  
  const query = 'DELETE FROM servicio WHERE id = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar servicio:', err);
      return callback(err, null);
    }
    
    console.log(`✅ Servicio eliminado. Filas afectadas: ${result.affectedRows}`);
    callback(null, result);
  });
};

// Activar/Desactivar servicio
export const toggleServicio = (id, activo, callback) => {
  console.log(`🔄 ${activo ? 'Activando' : 'Desactivando'} servicio ID:`, id);
  
  const query = 'UPDATE servicio SET activo = ? WHERE id = ?';
  
  db.query(query, [activo, id], (err, result) => {
    if (err) {
      console.error('Error al cambiar estado del servicio:', err);
      return callback(err, null);
    }
    
    console.log(`✅ Estado del servicio actualizado`);
    callback(null, result);
  });
};

// ==================== HORARIOS DE ATENCIÓN ====================

// Obtener todos los horarios
export const obtenerHorarios = (callback) => {
  console.log('⏰ Obteniendo horarios de atención...');
  
  const query = `
    SELECT 
      id, dia_semana, hora_inicio, hora_fin, activo, 
      sucursal_id, fecha_creacion, fecha_modificacion
    FROM horario_atencion 
    ORDER BY FIELD(dia_semana, 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')
  `;
  
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error al obtener horarios:', err);
      return callback(err, null);
    }
    console.log(`✅ ${result.length} horarios obtenidos`);
    callback(null, result);
  });
};

// Actualizar horario
export const actualizarHorario = (id, datos, callback) => {
  console.log('📝 Actualizando horario ID:', id);
  
  const campos = [];
  const valores = [];
  
  if (datos.hora_inicio !== undefined) {
    campos.push('hora_inicio = ?');
    valores.push(datos.hora_inicio);
  }
  
  if (datos.hora_fin !== undefined) {
    campos.push('hora_fin = ?');
    valores.push(datos.hora_fin);
  }
  
  if (datos.activo !== undefined) {
    campos.push('activo = ?');
    valores.push(datos.activo);
  }
  
  if (campos.length === 0) {
    return callback(new Error('No hay campos para actualizar'), null);
  }
  
  valores.push(id);
  const query = `UPDATE horario_atencion SET ${campos.join(', ')} WHERE id = ?`;
  
  db.query(query, valores, (err, result) => {
    if (err) {
      console.error('Error al actualizar horario:', err);
      return callback(err, null);
    }
    
    console.log(`✅ Horario actualizado. Filas afectadas: ${result.affectedRows}`);
    callback(null, result);
  });
};

// Actualizar múltiples horarios a la vez
export const actualizarHorariosMasivo = (horarios, callback) => {
  console.log('📝 Actualizando múltiples horarios...');
  
  // Comenzar una transacción
  db.beginTransaction((err) => {
    if (err) {
      console.error('Error al iniciar transacción:', err);
      return callback(err, null);
    }
    
    let completados = 0;
    let errores = [];
    
    horarios.forEach((horario) => {
      const query = `
        UPDATE horario_atencion 
        SET hora_inicio = ?, hora_fin = ?, activo = ? 
        WHERE id = ?
      `;
      
      const valores = [
        horario.hora_inicio,
        horario.hora_fin,
        horario.activo,
        horario.id
      ];
      
      db.query(query, valores, (err, result) => {
        if (err) {
          errores.push({ id: horario.id, error: err });
        }
        
        completados++;
        
        // Cuando todos se hayan procesado
        if (completados === horarios.length) {
          if (errores.length > 0) {
            db.rollback(() => {
              console.error('❌ Errores al actualizar horarios:', errores);
              callback(new Error('Error al actualizar algunos horarios'), null);
            });
          } else {
            db.commit((err) => {
              if (err) {
                db.rollback(() => {
                  console.error('Error al hacer commit:', err);
                  callback(err, null);
                });
              } else {
                console.log('✅ Todos los horarios actualizados correctamente');
                callback(null, { success: true, updated: horarios.length });
              }
            });
          }
        }
      });
    });
  });
};

// ==================== DÍAS NO LABORABLES ====================

// Obtener días no laborables
export const obtenerDiasNoLaborables = (callback) => {
  console.log('📅 Obteniendo días no laborables...');
  
  const query = `
    SELECT 
      id, fecha, descripcion, sucursal_id, fecha_creacion
    FROM dias_no_laborables 
    WHERE fecha >= CURDATE()
    ORDER BY fecha ASC
  `;
  
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error al obtener días no laborables:', err);
      return callback(err, null);
    }
    console.log(`✅ ${result.length} días no laborables obtenidos`);
    callback(null, result);
  });
};

// Crear día no laborable
export const crearDiaNoLaborable = (datos, callback) => {
  console.log('➕ Creando día no laborable:', datos.fecha);
  
  const query = `
    INSERT INTO dias_no_laborables (fecha, descripcion, sucursal_id) 
    VALUES (?, ?, ?)
  `;
  
  const valores = [
    datos.fecha,
    datos.descripcion,
    datos.sucursal_id || null
  ];
  
  db.query(query, valores, (err, result) => {
    if (err) {
      console.error('Error al crear día no laborable:', err);
      return callback(err, null);
    }
    
    console.log('✅ Día no laborable creado con ID:', result.insertId);
    callback(null, { id: result.insertId, ...datos });
  });
};

// Eliminar día no laborable
export const eliminarDiaNoLaborable = (id, callback) => {
  console.log('🗑️ Eliminando día no laborable ID:', id);
  
  const query = 'DELETE FROM dias_no_laborables WHERE id = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar día no laborable:', err);
      return callback(err, null);
    }
    
    console.log(`✅ Día no laborable eliminado`);
    callback(null, result);
  });
};