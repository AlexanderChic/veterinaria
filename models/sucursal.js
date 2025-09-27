// /models/sucursal.js
import db from '../config/db.js';

// Función para obtener todas las sucursales
export const obtenerSucursales = (callback) => {
  const query = 'SELECT * FROM sucursal';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener sucursales:', err);
      return callback(err);
    }
    callback(null, results);
  });
};
