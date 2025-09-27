// /models/cliente.js
import db from '../config/db.js';

// Función para obtener todos los clientes
export const obtenerClientes = (callback) => {
  const query = 'SELECT * FROM cliente';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener clientes:', err);
      return callback(err);
    }
    callback(null, results);
  });
};

// Función para agregar un nuevo cliente
export const agregarCliente = (usuario_id, callback) => {
  const query = 'INSERT INTO cliente (usuario_id) VALUES (?)';
  db.query(query, [usuario_id], (err, result) => {
    if (err) {
      console.error('Error al agregar cliente:', err);
      return callback(err);
    }
    callback(null, result);
  });
};
