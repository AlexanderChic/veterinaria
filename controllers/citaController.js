// /controllers/citaController.js
import * as Cita from '../models/cita.js';

// Obtener todas las citas
export const obtenerCitas = (req, res) => {
  Cita.obtenerCitas((err, resultados) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener las citas' });
    }
    res.json(resultados);
  });
};

// Agregar una nueva cita
export const agregarCita = (req, res) => {
  const { fecha, hora, cliente_id, mascota_id, sucursal_id, servicio_id, estado } = req.body;

  Cita.agregarCita(fecha, hora, cliente_id, mascota_id, sucursal_id, servicio_id, estado, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al agregar la cita' });
    }
    res.status(201).json({ message: 'Cita agregada exitosamente', data: result });
  });
};
