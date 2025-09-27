// /models/zona.js
import db from '../config/db.js';

// Función para obtener todas las zonas
export const obtenerZonas = (callback) => {
  const query = 'SELECT * FROM zona';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener zonas:', err);
      return callback(err);
    }
    callback(null, results);
  });
};

// Función para agregar una nueva zona
export const agregarZona = (nombre, callback) => {
  const query = 'INSERT INTO zona (nombre) VALUES (?)';
  db.query(query, [nombre], (err, result) => {
    if (err) {
      console.error('Error al agregar zona:', err);
      return callback(err);
    }
    callback(null, result);
  });
};
