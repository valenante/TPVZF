import Usuario from '../models/Usuario.js'; // Asegúrate de que el nombre y la ruta sean correctos
import Eliminacion from '../models/Eliminacion.js';

export const obtenerEliminaciones = async (req, res) => {
  try {
    // Obtener todas las eliminaciones, populando referencias
    const eliminaciones = await Eliminacion.find()
      .populate('producto', 'nombre precio') // Información del producto
      .populate('pedido', 'comensales') // Información del pedido
      .populate('mesa', 'numero') // Información de la mesa
      .populate('user', 'name role') // Información del usuario
      .sort({ fecha: -1 }); // Ordenar por fecha descendente

    res.status(200).json(eliminaciones);
  } catch (error) {
    console.error('Error al obtener eliminaciones:', error);
    res.status(500).json({ error: 'Error al obtener eliminaciones.' });
  }
};
