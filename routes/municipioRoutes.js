// /routes/municipioRoutes.js
import express from 'express';
import { 
  obtenerMunicipios, 
  obtenerMunicipiosDepartamento, 
  obtenerMunicipio 
} from '../controllers/municipioController.js';

const router = express.Router();

// Middleware de debugging para estas rutas específicas
router.use((req, res, next) => {
  console.log('=== MUNICIPIO ROUTES DEBUG ===');
  console.log('Método:', req.method);
  console.log('URL completa:', req.originalUrl);
  console.log('Ruta:', req.route?.path || 'No definida');
  next();
});

// Obtener todos los municipios
router.get('/municipios', (req, res, next) => {
  console.log('Llegó a la ruta GET /municipios');
  obtenerMunicipios(req, res, next);
});

// Obtener municipios por departamento
router.get('/municipios/departamento/:departamentoId', (req, res, next) => {
  console.log('Llegó a la ruta GET /municipios/departamento/:departamentoId');
  obtenerMunicipiosDepartamento(req, res, next);
});

// Obtener un municipio por ID
router.get('/municipios/:id', (req, res, next) => {
  console.log('Llegó a la ruta GET /municipios/:id');
  obtenerMunicipio(req, res, next);
});

// Ruta de prueba
router.get('/municipios-test', (req, res) => {
  res.json({ message: 'Rutas de municipios funcionando correctamente' });
});

export default router;