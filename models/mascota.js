// /models/mascota.js
import db from '../config/db.js';

// Función para obtener todas las mascotas
export const obtenerMascotas = (callback) => {
  const query = 'SELECT * FROM mascota';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener mascotas:', err);
      return callback(err);
    }
    callback(null, results);
  });
};

// Función para insertar una nueva mascota
export const agregarMascota = (nombre, especie, raza, edad, peso, observaciones, cliente_id, callback) => {
  const query = 'INSERT INTO mascota (nombre, especie, raza, edad, peso, observaciones, cliente_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [nombre, especie, raza, edad, peso, observaciones, cliente_id], (err, result) => {
    if (err) {
      console.error('Error al agregar mascota:', err);
      return callback(err);
    }
    callback(null, result);
  });
};
