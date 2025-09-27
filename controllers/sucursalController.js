// /controllers/sucursalController.js
import * as Sucursal from '../models/sucursal.js';

// Obtener todas las sucursales
export const obtenerSucursales = (req, res) => {
  Sucursal.obtenerSucursales((err, resultados) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener sucursales' });
    }
    res.json(resultados);
  });
};
