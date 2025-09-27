// /models/departamento.js
import db from '../config/db.js';

// Función para obtener todos los departamentos
export const obtenerTodosDepartamentos = (callback) => {
  console.log('Obteniendo todos los departamentos');
  
  const query = 'SELECT id, nombre FROM departamento ORDER BY nombre';
  
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error al obtener departamentos:', err);
      return callback(err, null);
    }
    
    console.log('Departamentos obtenidos:', result.length);
    callback(null, result);
  });
};

// Función para obtener un departamento por ID
export const obtenerDepartamentoPorId = (id, callback) => {
  console.log('Obteniendo departamento con ID:', id);
  
  const query = 'SELECT id, nombre FROM departamento WHERE id = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al obtener departamento:', err);
      return callback(err, null);
    }
    
    if (result.length === 0) {
      return callback(null, null);
    }
    
    callback(null, result[0]);
  });
};