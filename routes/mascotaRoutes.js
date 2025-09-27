// /routes/mascotaRoutes.js
import express from 'express';
import { obtenerMascotas, agregarMascota } from '../controllers/mascotaController.js';

const router = express.Router();

// Ruta para obtener todas las mascotas
router.get('/mascotas', obtenerMascotas);

// Ruta para agregar una nueva mascota
router.post('/mascotas', agregarMascota);

export default router;
