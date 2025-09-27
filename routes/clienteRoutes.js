// /routes/clienteRoutes.js
import express from 'express';
import { obtenerClientes, agregarCliente } from '../controllers/clienteController.js';

const router = express.Router();

// Ruta para obtener todos los clientes
router.get('/clientes', obtenerClientes);

// Ruta para agregar un nuevo cliente
router.post('/clientes', agregarCliente);

export default router;
