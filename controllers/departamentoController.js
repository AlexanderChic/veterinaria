// /controllers/departamentoController.js
import { obtenerTodosDepartamentos, obtenerDepartamentoPorId } from '../models/departamento.js';

// Obtener todos los departamentos
export const obtenerDepartamentos = (req, res) => {
  try {
    console.log('Obteniendo lista de departamentos');

    obtenerTodosDepartamentos((err, departamentos) => {
      if (err) {
        console.error('Error al obtener departamentos:', err);
        return res.status(500).json({ error: 'Error al obtener los departamentos' });
      }

      console.log(`Se obtuvieron ${departamentos.length} departamentos`);
      
      res.status(200).json(departamentos);
    });

  } catch (error) {
    console.error('Error general en obtenerDepartamentos:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
};

// Obtener un departamento por ID
export const obtenerDepartamento = (req, res) => {
  try {
    const { id } = req.params;

    console.log('Obteniendo departamento con ID:', id);

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID de departamento inválido' });
    }

    obtenerDepartamentoPorId(id, (err, departamento) => {
      if (err) {
        console.error('Error al obtener departamento:', err);
        return res.status(500).json({ error: 'Error al obtener el departamento' });
      }

      if (!departamento) {
        return res.status(404).json({ error: 'Departamento no encontrado' });
      }

      console.log('Departamento encontrado:', departamento);
      
      res.status(200).json(departamento);
    });

  } catch (error) {
    console.error('Error general en obtenerDepartamento:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
};