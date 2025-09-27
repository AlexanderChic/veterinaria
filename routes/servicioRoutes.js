// /routes/servicioRoutes.js
import express from 'express';
import { obtenerServicios, agregarServicio } from '../controllers/servicioController.js';

const router = express.Router();

// Ruta para obtener todos los servicios
router.get('/servicios', obtenerServicios);

// Ruta para agregar un nuevo servicio
router.post('/servicios', agregarServicio);

export default router;
