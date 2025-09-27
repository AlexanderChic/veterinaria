// /controllers/mascotaController.js
import * as Mascota from '../models/mascota.js';

// Obtener todas las mascotas
export const obtenerMascotas = (req, res) => {
  Mascota.obtenerMascotas((err, resultados) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener las mascotas' });
    }
    res.json(resultados);
  });
};

// Agregar una nueva mascota
export const agregarMascota = (req, res) => {
  const { nombre, especie, raza, edad, peso, observaciones, cliente_id } = req.body;

  Mascota.agregarMascota(nombre, especie, raza, edad, peso, observaciones, cliente_id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al agregar la mascota' });
    }
    res.status(201).json({ message: 'Mascota agregada exitosamente', data: result });
  });
};
