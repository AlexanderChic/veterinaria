// /controllers/municipioController.js
import { 
  obtenerTodosMunicipios, 
  obtenerMunicipiosPorDepartamento, 
  obtenerMunicipioPorId 
} from '../models/municipio.js';

// Obtener todos los municipios
export const obtenerMunicipios = (req, res) => {
  try {
    console.log('Obteniendo lista de municipios');

    obtenerTodosMunicipios((err, municipios) => {
      if (err) {
        console.error('Error al obtener municipios:', err);
        return res.status(500).json({ error: 'Error al obtener los municipios' });
      }

      console.log(`Se obtuvieron ${municipios.length} municipios`);
      
      res.status(200).json(municipios);
    });

  } catch (error) {
    console.error('Error general en obtenerMunicipios:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
};

// Obtener municipios por departamento
export const obtenerMunicipiosDepartamento = (req, res) => {
  try {
    const { departamentoId } = req.params;

    console.log('Obteniendo municipios del departamento:', departamentoId);

    if (!departamentoId || isNaN(departamentoId)) {
      return res.status(400).json({ error: 'ID de departamento inválido' });
    }

    obtenerMunicipiosPorDepartamento(departamentoId, (err, municipios) => {
      if (err) {
        console.error('Error al obtener municipios por departamento:', err);
        return res.status(500).json({ error: 'Error al obtener los municipios' });
      }

      console.log(`Se obtuvieron ${municipios.length} municipios para el departamento ${departamentoId}`);
      
      res.status(200).json(municipios);
    });

  } catch (error) {
    console.error('Error general en obtenerMunicipiosDepartamento:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
};

// Obtener un municipio por ID
export const obtenerMunicipio = (req, res) => {
  try {
    const { id } = req.params;

    console.log('Obteniendo municipio con ID:', id);

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID de municipio inválido' });
    }

    obtenerMunicipioPorId(id, (err, municipio) => {
      if (err) {
        console.error('Error al obtener municipio:', err);
        return res.status(500).json({ error: 'Error al obtener el municipio' });
      }

      if (!municipio) {
        return res.status(404).json({ error: 'Municipio no encontrado' });
      }

      console.log('Municipio encontrado:', municipio);
      
      res.status(200).json(municipio);
    });

  } catch (error) {
    console.error('Error general en obtenerMunicipio:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
};