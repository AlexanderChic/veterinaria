// /controllers/mascotaController.js
import { 
  obtenerMascotasPorCliente,
  obtenerMascotaPorId,
  crearMascota,
  actualizarMascota,
  eliminarMascota,
  obtenerEstadisticasPorCliente,
  verificarPropietarioMascota,
  obtenerTodasLasMascotas
} from '../models/mascota.js';

// Obtener todas las mascotas de un cliente específico
export const obtenerMascotasCliente = (req, res) => {
  try {
    const { clienteId } = req.params;

    console.log('Obteniendo mascotas para cliente:', clienteId);

    if (!clienteId) {
      return res.status(400).json({ 
        error: 'ID de cliente es requerido' 
      });
    }

    obtenerMascotasPorCliente(clienteId, (err, mascotas) => {
      if (err) {
        console.error('Error al obtener mascotas:', err);
        return res.status(500).json({ 
          error: 'Error al obtener las mascotas de la base de datos' 
        });
      }

      console.log(`Mascotas encontradas para cliente ${clienteId}:`, mascotas.length);

      res.status(200).json(mascotas);
    });

  } catch (error) {
    console.error('Error general en obtenerMascotasCliente:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
};

// Obtener una mascota específica por ID
export const obtenerMascota = (req, res) => {
  try {
    const { id } = req.params;

    console.log('Obteniendo mascota ID:', id);

    if (!id) {
      return res.status(400).json({ 
        error: 'ID de mascota es requerido' 
      });
    }

    obtenerMascotaPorId(id, (err, mascota) => {
      if (err) {
        console.error('Error al obtener mascota:', err);
        return res.status(500).json({ 
          error: 'Error al obtener la mascota de la base de datos' 
        });
      }

      if (!mascota) {
        return res.status(404).json({ 
          error: 'Mascota no encontrada' 
        });
      }

      console.log('Mascota encontrada:', mascota.nombre);
      res.status(200).json(mascota);
    });

  } catch (error) {
    console.error('Error general en obtenerMascota:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
};

// Crear nueva mascota
export const crearNuevaMascota = (req, res) => {
  try {
    const { 
      cliente_id,
      nombre,
      especie,
      raza,
      edad,
      peso,
      observaciones
    } = req.body;

    console.log('Datos recibidos para crear mascota:', {
      cliente_id, nombre, especie, raza, edad, peso
    });

    // Validar campos requeridos
    if (!cliente_id || !nombre || !especie) {
      return res.status(400).json({ 
        error: 'Cliente ID, nombre y especie son requeridos' 
      });
    }

    // Validar tipos de datos
    if (edad && (isNaN(edad) || edad < 0 || edad > 50)) {
      return res.status(400).json({ 
        error: 'La edad debe ser un número válido entre 0 y 50' 
      });
    }

    if (peso && (isNaN(peso) || peso <= 0 || peso > 500)) {
      return res.status(400).json({ 
        error: 'El peso debe ser un número válido entre 0.1 y 500 kg' 
      });
    }

    // Validar especie
    const especiesValidas = ['perro', 'gato', 'ave', 'conejo', 'hamster', 'pez', 'reptil', 'tortuga'];
    if (!especiesValidas.includes(especie.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Especie no válida. Debe ser una de: ' + especiesValidas.join(', ') 
      });
    }

    // Preparar datos para inserción
    const datosMascota = {
      cliente_id: parseInt(cliente_id),
      nombre: nombre.trim(),
      especie: especie.toLowerCase(),
      raza: raza ? raza.trim() : null,
      edad: edad ? parseInt(edad) : null,
      peso: peso ? parseFloat(peso) : null,
      observaciones: observaciones ? observaciones.trim() : null
    };

    console.log('Datos preparados para inserción:', datosMascota);

    crearMascota(datosMascota, (err, mascotaCreada) => {
      if (err) {
        console.error('Error al crear mascota:', err);
        return res.status(500).json({ 
          error: 'Error al crear la mascota en la base de datos' 
        });
      }

      console.log('Mascota creada exitosamente:', mascotaCreada);

      res.status(201).json({
        message: 'Mascota creada exitosamente',
        data: mascotaCreada
      });
    });

  } catch (error) {
    console.error('Error general en crearNuevaMascota:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
};

// Actualizar mascota existente
export const actualizarMascotaExistente = (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombre,
      especie,
      raza,
      edad,
      peso,
      observaciones
    } = req.body;

    console.log('Actualizando mascota ID:', id, 'con datos:', req.body);

    if (!id) {
      return res.status(400).json({ 
        error: 'ID de mascota es requerido' 
      });
    }

    // Validar campos requeridos
    if (!nombre || !especie) {
      return res.status(400).json({ 
        error: 'Nombre y especie son requeridos' 
      });
    }

    // Validar tipos de datos
    if (edad && (isNaN(edad) || edad < 0 || edad > 50)) {
      return res.status(400).json({ 
        error: 'La edad debe ser un número válido entre 0 y 50' 
      });
    }

    if (peso && (isNaN(peso) || peso <= 0 || peso > 500)) {
      return res.status(400).json({ 
        error: 'El peso debe ser un número válido entre 0.1 y 500 kg' 
      });
    }

    // Validar especie
    const especiesValidas = ['perro', 'gato', 'ave', 'conejo', 'hamster', 'pez', 'reptil', 'tortuga'];
    if (!especiesValidas.includes(especie.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Especie no válida. Debe ser una de: ' + especiesValidas.join(', ') 
      });
    }

    // Preparar datos para actualización
    const datosMascota = {
      nombre: nombre.trim(),
      especie: especie.toLowerCase(),
      raza: raza ? raza.trim() : null,
      edad: edad ? parseInt(edad) : null,
      peso: peso ? parseFloat(peso) : null,
      observaciones: observaciones ? observaciones.trim() : null
    };

    console.log('Datos preparados para actualización:', datosMascota);

    actualizarMascota(id, datosMascota, (err, mascotaActualizada) => {
      if (err) {
        console.error('Error al actualizar mascota:', err);
        if (err.message === 'Mascota no encontrada') {
          return res.status(404).json({ 
            error: 'Mascota no encontrada' 
          });
        }
        return res.status(500).json({ 
          error: 'Error al actualizar la mascota en la base de datos' 
        });
      }

      console.log('Mascota actualizada exitosamente:', mascotaActualizada);

      res.status(200).json({
        message: 'Mascota actualizada exitosamente',
        data: mascotaActualizada
      });
    });

  } catch (error) {
    console.error('Error general en actualizarMascotaExistente:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
};

// Eliminar mascota
export const eliminarMascotaExistente = (req, res) => {
  try {
    const { id } = req.params;

    console.log('Eliminando mascota ID:', id);

    if (!id) {
      return res.status(400).json({ 
        error: 'ID de mascota es requerido' 
      });
    }

    eliminarMascota(id, (err, resultado) => {
      if (err) {
        console.error('Error al eliminar mascota:', err);
        if (err.message === 'Mascota no encontrada') {
          return res.status(404).json({ 
            error: 'Mascota no encontrada' 
          });
        }
        return res.status(500).json({ 
          error: 'Error al eliminar la mascota de la base de datos' 
        });
      }

      console.log('Mascota eliminada exitosamente');

      res.status(200).json({
        message: 'Mascota eliminada exitosamente',
        data: resultado
      });
    });

  } catch (error) {
    console.error('Error general en eliminarMascotaExistente:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
};

// Obtener estadísticas de mascotas por cliente
export const obtenerEstadisticasCliente = (req, res) => {
  try {
    const { clienteId } = req.params;

    console.log('Obteniendo estadísticas para cliente:', clienteId);

    if (!clienteId) {
      return res.status(400).json({ 
        error: 'ID de cliente es requerido' 
      });
    }

    obtenerEstadisticasPorCliente(clienteId, (err, estadisticas) => {
      if (err) {
        console.error('Error al obtener estadísticas:', err);
        return res.status(500).json({ 
          error: 'Error al obtener las estadísticas de la base de datos' 
        });
      }

      console.log('Estadísticas obtenidas:', estadisticas);

      res.status(200).json(estadisticas);
    });

  } catch (error) {
    console.error('Error general en obtenerEstadisticasCliente:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
};

// Obtener todas las mascotas (para administradores)
export const obtenerTodasMascotas = (req, res) => {
  try {
    console.log('Obteniendo todas las mascotas');

    obtenerTodasLasMascotas((err, mascotas) => {
      if (err) {
        console.error('Error al obtener todas las mascotas:', err);
        return res.status(500).json({ 
          error: 'Error al obtener las mascotas de la base de datos' 
        });
      }

      console.log('Total de mascotas encontradas:', mascotas.length);

      res.status(200).json(mascotas);
    });

  } catch (error) {
    console.error('Error general en obtenerTodasMascotas:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
};  