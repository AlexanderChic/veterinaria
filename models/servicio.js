// /models/servicio.js
import db from '../config/db.js';

// Función para obtener todos los servicios
export const obtenerServicios = (callback) => {
  const query = 'SELECT * FROM servicio';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener servicios:', err);
      return callback(err);
    }
    callback(null, results);
  });
};

// Función para agregar un nuevo servicio
export const agregarServicio = (nombre, descripcion, precio, callback) => {
  const query = 'INSERT INTO servicio (nombre, descripcion, precio) VALUES (?, ?, ?)';
  db.query(query, [nombre, descripcion, precio], (err, result) => {
    if (err) {
      console.error('Error al agregar servicio:', err);
      return callback(err);
    }
    callback(null, result);
  });
};
