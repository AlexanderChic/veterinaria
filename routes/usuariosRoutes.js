// /routes/usuariosRoutes.js
import express from 'express';
import { loginUsuario, registrarUsuario } from '../controllers/usuariosController.js';

const router = express.Router();

// ==================== MIDDLEWARE DE DEBUGGING ====================
// Solo activo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  router.use((req, res, next) => {
    // No logear contraseñas por seguridad
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '***';
    if (sanitizedBody.contrasena) sanitizedBody.contrasena = '***';
    
    console.log(`[${new Date().toISOString()}] Usuarios: ${req.method} ${req.originalUrl}`);
    console.log('Body (sanitizado):', sanitizedBody);
    next();
  });
}

// ==================== RUTAS ====================

// Ruta de prueba/health check
router.get('/usuarios-test', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Rutas de usuarios funcionando correctamente',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/login - Iniciar sesión',
      'POST /api/register - Registrar nuevo usuario'
    ]
  });
});

// Ruta para iniciar sesión
router.post('/login', loginUsuario);

// Ruta para registrar usuario
router.post('/register', registrarUsuario);

export default router;