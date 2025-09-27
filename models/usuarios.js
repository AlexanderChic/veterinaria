// /models/usuarios.js
import db from '../config/db.js';

// Función para obtener usuario por email
export const obtenerUsuarioPorEmail = (email, callback) => {
  console.log('Buscando usuario con email:', email);
  
  const query = 'SELECT * FROM usuarios WHERE email = ?';
  
  db.query(query, [email], (err, result) => {
    if (err) {
      console.error('Error en la consulta SQL:', err);
      return callback(err, null);
    }
    
    console.log('Resultado de la consulta:', result);
    console.log('Número de usuarios encontrados:', result.length);
    
    if (result.length === 0) {
      return callback(null, null); // No se encontró usuario
    }
    
    callback(null, result[0]); // Devolver el primer usuario encontrado
  });
};

// Función para crear un nuevo usuario
export const crearUsuario = (datosUsuario, callback) => {
  console.log('Creando usuario:', datosUsuario);
  
  const query = `
    INSERT INTO usuarios (nombre, email, password, telefono, direccion, rol) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  const valores = [
    datosUsuario.nombre,
    datosUsuario.email,
    datosUsuario.password,
    datosUsuario.telefono,
    datosUsuario.direccion,
    datosUsuario.rol || 'cliente' // Por defecto cliente
  ];
  
  db.query(query, valores, (err, result) => {
    if (err) {
      console.error('Error al crear usuario:', err);
      return callback(err, null);
    }
    
    console.log('Usuario creado exitosamente con ID:', result.insertId);
    callback(null, { 
      id: result.insertId, 
      ...datosUsuario 
    });
  });
};

// Función para verificar si un email ya existe
export const verificarEmailExistente = (email, callback) => {
  console.log('Verificando si el email existe:', email);
  
  const query = 'SELECT COUNT(*) as count FROM usuarios WHERE email = ?';
  
  db.query(query, [email], (err, result) => {
    if (err) {
      console.error('Error al verificar email:', err);
      return callback(err, null);
    }
    
    const existe = result[0].count > 0;
    console.log('Email existe:', existe);
    callback(null, existe);
  });
};

// Función para crear un cliente asociado al usuario
export const crearCliente = (usuarioId, callback) => {
  console.log('Creando cliente para usuario ID:', usuarioId);
  
  const query = 'INSERT INTO cliente (usuario_id) VALUES (?)';
  
  db.query(query, [usuarioId], (err, result) => {
    if (err) {
      console.error('Error al crear cliente:', err);
      return callback(err, null);
    }
    
    console.log('Cliente creado exitosamente con ID:', result.insertId);
    callback(null, {
      id: result.insertId,
      usuario_id: usuarioId,
      fecha_registro: new Date()
    });
  });
};

// Función para obtener todos los usuarios (opcional, para debugging)
export const obtenerTodosLosUsuarios = (callback) => {
  const query = 'SELECT id, nombre, email, rol FROM usuarios';
  
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error al obtener usuarios:', err);
      return callback(err, null);
    }
    callback(null, result);
  });
};