// /routes/sucursalRoutes.js
import express from 'express';
import { obtenerSucursales } from '../controllers/sucursalController.js';

const router = express.Router();

// Ruta para obtener todas las sucursales
router.get('/sucursales', obtenerSucursales);

export default router;
