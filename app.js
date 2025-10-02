// /app.js
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import departamentoRoutes from './routes/departamentoRoutes.js';
import municipioRoutes from './routes/municipioRoutes.js';
import zonaRoutes from './routes/zonaRoutes.js';
import sucursalRoutes from './routes/sucursalRoutes.js';
import usuariosRoutes from './routes/usuariosRoutes.js';
import servicioRoutes from './routes/servicioRoutes.js';
import citaRoutes from './routes/citaRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import mascotaRoutes from './routes/mascotaRoutes.js';
import { iniciarScheduler } from './services/citaScheduler.js';

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middleware básico de logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware para parsear JSON y form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta de prueba
app.get('/test', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente', timestamp: new Date() });
});

// Usar las rutas de la API
app.use('/api', usuariosRoutes);
app.use('/api', departamentoRoutes);
app.use('/api', municipioRoutes);
app.use('/api', zonaRoutes);
app.use('/api', sucursalRoutes);
app.use('/api', servicioRoutes);
app.use('/api', clienteRoutes);
app.use('/api', citaRoutes);
app.use('/api', mascotaRoutes);

// Ruta para servir el login en la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar el scheduler de citas automáticas
iniciarScheduler();

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponibles:`);
  console.log(`   GET  /              -> Login page`);
  console.log(`   GET  /test          -> Test endpoint`);
  console.log(`   POST /api/login     -> Login endpoint`);
  console.log(`   POST /api/citas/actualizar-pasadas -> Actualizar citas manualmente`);
});