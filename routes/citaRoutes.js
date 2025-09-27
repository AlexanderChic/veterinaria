// /routes/citaRoutes.js
import express from 'express';
import { obtenerCitas, agregarCita } from '../controllers/citaController.js';

const router = express.Router();

// Ruta para obtener todas las citas
router.get('/citas', obtenerCitas);

// Ruta para agregar una nueva cita
router.post('/citas', agregarCita);

export default router;
