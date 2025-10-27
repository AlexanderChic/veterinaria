// controllers/municipioController.js - VERSIÓN ORIGINAL QUE FUNCIONABA

import db from '../config/db.js';

// ==================== OBTENER MUNICIPIOS ====================
export const obtenerMunicipios = (req, res) => {
  try {
    const { departamento_id } = req.query;
    
    let query = `
      SELECT 
        m.id,
        m.nombre,
        m.departamento_id,
        d.nombre as departamento_nombre
      FROM municipio m
      INNER JOIN departamento d ON m.departamento_id = d.id
    `;
    
    const params = [];
    
    // Si hay filtro por departamento, agregarlo
    if (departamento_id) {
      query += ' WHERE m.departamento_id = ?';
      params.push(departamento_id);
    }
    
    query += ' ORDER BY m.nombre ASC';
    
    console.log('🔍 Ejecutando query:', query);
    console.log('📊 Parámetros:', params);
    
    db.query(query, params, (error, resultados) => {
      if (error) {
        console.error('❌ Error al obtener municipios:', error);
        return res.status(500).json({ 
          error: 'Error al obtener los municipios',
          detalles: error.message 
        });
      }
      
      if (departamento_id) {
        console.log(`✅ ${resultados.length} municipios encontrados para departamento ${departamento_id}`);
      } else {
        console.log(`✅ ${resultados.length} municipios encontrados (todos)`);
      }
      
      res.status(200).json(resultados);
    });
    
  } catch (error) {
    console.error('❌ Error general en obtenerMunicipios:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalles: error.message 
    });
  }
};

// ==================== OBTENER MUNICIPIO POR ID ====================
export const obtenerMunicipioPorId = (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        m.id,
        m.nombre,
        m.departamento_id,
        d.nombre as departamento_nombre
      FROM municipio m
      INNER JOIN departamento d ON m.departamento_id = d.id
      WHERE m.id = ?
    `;
    
    db.query(query, [id], (error, resultados) => {
      if (error) {
        console.error('❌ Error al obtener municipio:', error);
        return res.status(500).json({ 
          error: 'Error al obtener el municipio',
          detalles: error.message 
        });
      }
      
      if (resultados.length === 0) {
        console.log(`⚠️ Municipio ${id} no encontrado`);
        return res.status(404).json({ error: 'Municipio no encontrado' });
      }
      
      console.log(`✅ Municipio encontrado: ${resultados[0].nombre}`);
      res.status(200).json(resultados[0]);
    });
    
  } catch (error) {
    console.error('❌ Error general en obtenerMunicipioPorId:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalles: error.message 
    });
  }
};

// ==================== CREAR MUNICIPIO ====================
export const crearMunicipio = (req, res) => {
  try {
    const { nombre, departamento_id } = req.body;
    
    // Validaciones
    if (!nombre || !departamento_id) {
      return res.status(400).json({ 
        error: 'Nombre y departamento_id son requeridos' 
      });
    }
    
    const query = 'INSERT INTO municipio (nombre, departamento_id) VALUES (?, ?)';
    
    db.query(query, [nombre, departamento_id], (error, resultado) => {
      if (error) {
        console.error('❌ Error al crear municipio:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ 
            error: 'Ya existe un municipio con ese nombre en este departamento' 
          });
        }
        
        return res.status(500).json({ 
          error: 'Error al crear el municipio',
          detalles: error.message 
        });
      }
      
      console.log(`✅ Municipio creado: ${nombre} (ID: ${resultado.insertId})`);
      
      res.status(201).json({
        message: 'Municipio creado exitosamente',
        id: resultado.insertId,
        nombre,
        departamento_id
      });
    });
    
  } catch (error) {
    console.error('❌ Error general en crearMunicipio:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalles: error.message 
    });
  }
};

// ==================== ACTUALIZAR MUNICIPIO ====================
export const actualizarMunicipio = (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, departamento_id } = req.body;
    
    // Validaciones
    if (!nombre || !departamento_id) {
      return res.status(400).json({ 
        error: 'Nombre y departamento_id son requeridos' 
      });
    }
    
    const query = 'UPDATE municipio SET nombre = ?, departamento_id = ? WHERE id = ?';
    
    db.query(query, [nombre, departamento_id, id], (error, resultado) => {
      if (error) {
        console.error('❌ Error al actualizar municipio:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ 
            error: 'Ya existe un municipio con ese nombre en este departamento' 
          });
        }
        
        return res.status(500).json({ 
          error: 'Error al actualizar el municipio',
          detalles: error.message 
        });
      }
      
      if (resultado.affectedRows === 0) {
        console.log(`⚠️ Municipio ${id} no encontrado para actualizar`);
        return res.status(404).json({ error: 'Municipio no encontrado' });
      }
      
      console.log(`✅ Municipio ${id} actualizado: ${nombre}`);
      
      res.status(200).json({
        message: 'Municipio actualizado exitosamente',
        id,
        nombre,
        departamento_id
      });
    });
    
  } catch (error) {
    console.error('❌ Error general en actualizarMunicipio:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalles: error.message 
    });
  }
};

// ==================== ELIMINAR MUNICIPIO ====================
export const eliminarMunicipio = (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si hay sucursales asociadas
    const checkQuery = 'SELECT COUNT(*) as count FROM sucursal WHERE municipio_id = ?';
    
    db.query(checkQuery, [id], (error, resultado) => {
      if (error) {
        console.error('❌ Error al verificar sucursales:', error);
        return res.status(500).json({ 
          error: 'Error al verificar dependencias',
          detalles: error.message 
        });
      }
      
      if (resultado[0].count > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar el municipio porque tiene sucursales asociadas',
          sucursales_count: resultado[0].count
        });
      }
      
      // Si no hay sucursales, eliminar
      const deleteQuery = 'DELETE FROM municipio WHERE id = ?';
      
      db.query(deleteQuery, [id], (error, resultado) => {
        if (error) {
          console.error('❌ Error al eliminar municipio:', error);
          return res.status(500).json({ 
            error: 'Error al eliminar el municipio',
            detalles: error.message 
          });
        }
        
        if (resultado.affectedRows === 0) {
          console.log(`⚠️ Municipio ${id} no encontrado para eliminar`);
          return res.status(404).json({ error: 'Municipio no encontrado' });
        }
        
        console.log(`✅ Municipio ${id} eliminado correctamente`);
        
        res.status(200).json({
          message: 'Municipio eliminado exitosamente'
        });
      });
    });
    
  } catch (error) {
    console.error('❌ Error general en eliminarMunicipio:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalles: error.message 
    });
  }
};