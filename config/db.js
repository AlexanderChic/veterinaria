// /config/db.js
import mysql from 'mysql2';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Crear la conexión a la base de datos
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mascotico'
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar con la base de datos:', err);
    return;
  }
  console.log('✅ Conexión a la base de datos MySQL exitosa!');
});

export default db;