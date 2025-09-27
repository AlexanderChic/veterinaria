// /models/cita.js
import db from '../config/db.js';

// Función para obtener todas las citas
export const obtenerCitas = (callback) => {
  const query = 'SELECT * FROM cita';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener citas:', err);
      return callback(err);
    }
    callback(null, results);
  });
};

// Función para insertar una nueva cita
export const agregarCita = (fecha, hora, cliente_id, mascota_id, sucursal_id, servicio_id, estado, callback) => {
  const query = 'INSERT INTO cita (fecha, hora, cliente_id, mascota_id, sucursal_id, servicio_id, estado) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [fecha, hora, cliente_id, mascota_id, sucursal_id, servicio_id, estado], (err, result) => {
    if (err) {
      console.error('Error al agregar cita:', err);
      return callback(err);
    }
    callback(null, result);
  });
};
