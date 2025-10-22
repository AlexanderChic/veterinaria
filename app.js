// app.js
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
import adminRoutes from './routes/adminRoutes.js';
import { iniciarScheduler } from './services/citaScheduler.js';

// Cargar variables de entorno PRIMERO
dotenv.config();

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARES ====================

// Middleware de logging mejorado
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Middleware para parsear JSON y form data
app.use(express.json({ limit: '10mb' })); // Añadido límite de tamaño
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// ==================== RUTAS ====================

// Ruta de prueba (health check)
app.get('/test', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Servidor funcionando correctamente', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta principal - Login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// API Routes - Orden específico a general
// Las rutas más específicas deben ir primero para evitar conflictos
app.use('/api', citaRoutes);
app.use('/api', adminRoutes);
app.use('/api', mascotaRoutes);
app.use('/api', clienteRoutes);
app.use('/api', servicioRoutes);
app.use('/api', sucursalRoutes);
app.use('/api', zonaRoutes);
app.use('/api', municipioRoutes);
app.use('/api', departamentoRoutes);
app.use('/api', usuariosRoutes);

// Ruta 404 para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.url,
    method: req.method
  });
});

// ==================== MANEJO DE ERRORES ====================

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  // Log del error completo en servidor
  console.error('❌ Error capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Respuesta al cliente (sin exponer detalles sensibles en producción)
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Error interno del servidor' 
    : err.message;

  res.status(statusCode).json({ 
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ==================== INICIALIZACIÓN ====================

// Función para iniciar el servidor con manejo de errores
const startServer = async () => {
  try {
    // Iniciar el scheduler de citas automáticas
    console.log('🕐 Iniciando scheduler de citas...');
    await iniciarScheduler();
    console.log('✅ Scheduler iniciado correctamente');

    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log('='.repeat(60));
      console.log('\n📋 Endpoints disponibles:');
      console.log(`   GET  /                                      -> Login page`);
      console.log(`   GET  /test                                  -> Health check`);
      console.log(`   POST /api/login                             -> Login endpoint`);
      console.log(`   POST /api/citas/actualizar-pasadas          -> Actualizar citas`);
      console.log(`   GET  /api/admin/*                           -> Admin endpoints`);
      console.log(`   GET  /api/departamentos                     -> Departamentos`);
      console.log(`   GET  /api/municipios                        -> Municipios`);
      console.log(`   GET  /api/zonas                             -> Zonas`);
      console.log(`   GET  /api/sucursales                        -> Sucursales`);
      console.log(`   GET  /api/servicios                         -> Servicios`);
      console.log(`   GET  /api/clientes                          -> Clientes`);
      console.log(`   GET  /api/mascotas                          -> Mascotas`);
      console.log('='.repeat(60) + '\n');
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM recibido. Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT recibido. Cerrando servidor...');
  process.exit(0);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection en:', promise, 'razón:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Iniciar el servidor
startServer();

export default app;