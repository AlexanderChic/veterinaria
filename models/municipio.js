// /models/municipio.js
import db from '../config/db.js';

// Función para obtener todos los municipios
export const obtenerTodosMunicipios = (callback) => {
  console.log('Obteniendo todos los municipios');
  
  const query = `
    SELECT m.id, m.nombre, m.departamento_id, d.nombre as departamento_nombre
    FROM municipio m
    JOIN departamento d ON m.departamento_id = d.id
    ORDER BY d.nombre, m.nombre
  `;
  
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error al obtener municipios:', err);
      return callback(err, null);
    }
    
    console.log('Municipios obtenidos:', result.length);
    callback(null, result);
  });
};

// Función para obtener municipios por departamento
export const obtenerMunicipiosPorDepartamento = (departamentoId, callback) => {
  console.log('Obteniendo municipios del departamento:', departamentoId);
  
  const query = `
    SELECT id, nombre, departamento_id 
    FROM municipio 
    WHERE departamento_id = ? 
    ORDER BY nombre
  `;
  
  db.query(query, [departamentoId], (err, result) => {
    if (err) {
      console.error('Error al obtener municipios por departamento:', err);
      return callback(err, null);
    }
    
    console.log('Municipios obtenidos para el departamento:', result.length);
    callback(null, result);
  });
};

// Función para obtener un municipio por ID
export const obtenerMunicipioPorId = (id, callback) => {
  console.log('Obteniendo municipio con ID:', id);
  
  const query = `
    SELECT m.id, m.nombre, m.departamento_id, d.nombre as departamento_nombre
    FROM municipio m
    JOIN departamento d ON m.departamento_id = d.id
    WHERE m.id = ?
  `;
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al obtener municipio:', err);
      return callback(err, null);
    }
    
    if (result.length === 0) {
      return callback(null, null);
    }
    
    callback(null, result[0]);
  });
};