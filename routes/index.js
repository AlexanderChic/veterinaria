// /routes/index.js
import express from 'express';
import departamentoRoutes from './departamentoRoutes.js';
import municipioRoutes from './municipioRoutes.js';
import zonaRoutes from './zonaRoutes.js';
import sucursalRoutes from './sucursalRoutes.js';
import usuariosRoutes from './usuariosRoutes.js';
import servicioRoutes from './servicioRoutes.js';
import citaRoutes from './citaRoutes.js';
import clienteRoutes from './clienteRoutes.js';
import mascotaRoutes from './mascotaRoutes.js';

const router = express.Router();

router.use('/departamento', departamentoRoutes);
router.use('/municipio', municipioRoutes);
router.use('/zona', zonaRoutes);
router.use('/sucursal', sucursalRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/servicio', servicioRoutes);
router.use('/cita', citaRoutes);
router.use('/cliente', clienteRoutes);
router.use('/mascota', mascotaRoutes);

export default router;
