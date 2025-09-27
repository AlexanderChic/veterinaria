// /controllers/servicioController.js
import * as Servicio from '../models/servicio.js';

// Obtener todos los servicios
export const obtenerServicios = (req, res) => {
  Servicio.obtenerServicios((err, resultados) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener servicios' });
    }
    res.json(resultados);
  });
};

// Agregar un nuevo servicio
export const agregarServicio = (req, res) => {
  const { nombre, descripcion, precio } = req.body;

  Servicio.agregarServicio(nombre, descripcion, precio, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al agregar el servicio' });
    }
    res.status(201).json({ message: 'Servicio agregado exitosamente', data: result });
  });
};
