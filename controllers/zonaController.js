// /controllers/zonaController.js
import * as Zona from '../models/zona.js';

// Obtener todas las zonas
export const obtenerZonas = (req, res) => {
  Zona.obtenerZonas((err, resultados) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener zonas' });
    }
    res.json(resultados);
  });
};
