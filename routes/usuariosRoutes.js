// /routes/usuariosRoutes.js
import express from 'express';
import { loginUsuario, registrarUsuario } from '../controllers/usuariosController.js';

const router = express.Router();

// Middleware de debugging para estas rutas específicas
router.use((req, res, next) => {
  console.log('=== USUARIOS ROUTES DEBUG ===');
  console.log('Método:', req.method);
  console.log('URL completa:', req.originalUrl);
  console.log('Ruta:', req.route?.path || 'No definida');
  console.log('Body:', req.body);
  next();
});

// Ruta para iniciar sesión
router.post('/login', (req, res, next) => {
  console.log('Llegó a la ruta POST /login');
  loginUsuario(req, res, next);
});

// Ruta para registrar usuario
router.post('/register', (req, res, next) => {
  console.log('Llegó a la ruta POST /register');
  registrarUsuario(req, res, next);
});

// Ruta de prueba para verificar que las rutas funcionan
router.get('/test', (req, res) => {
  res.json({ message: 'Rutas de usuarios funcionando correctamente' });
});

export default router;