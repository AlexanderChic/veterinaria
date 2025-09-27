// /routes/departamentoRoutes.js
import express from 'express';
import { obtenerDepartamentos, obtenerDepartamento } from '../controllers/departamentoController.js';

const router = express.Router();

// Middleware de debugging para estas rutas específicas
router.use((req, res, next) => {
  console.log('=== DEPARTAMENTO ROUTES DEBUG ===');
  console.log('Método:', req.method);
  console.log('URL completa:', req.originalUrl);
  console.log('Ruta:', req.route?.path || 'No definida');
  next();
});

// Obtener todos los departamentos
router.get('/departamentos', (req, res, next) => {
  console.log('Llegó a la ruta GET /departamentos');
  obtenerDepartamentos(req, res, next);
});

// Obtener un departamento por ID
router.get('/departamentos/:id', (req, res, next) => {
  console.log('Llegó a la ruta GET /departamentos/:id');
  obtenerDepartamento(req, res, next);
});

// Ruta de prueba
router.get('/departamentos-test', (req, res) => {
  res.json({ message: 'Rutas de departamentos funcionando correctamente' });
});

export default router;