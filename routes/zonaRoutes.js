// /routes/zonaRoutes.js
import express from 'express';
import { obtenerZonas } from '../controllers/zonaController.js';

const router = express.Router();

// Ruta para obtener todas las zonas
router.get('/zonas', obtenerZonas);

export default router;
