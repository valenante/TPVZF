import Eliminacion from '../models/Eliminacion.js';

export const obtenerEliminaciones = async (req, res) => {
  try {
    const eliminaciones = await Eliminacion.find()
      .populate('producto', 'nombre precio')
      .populate('pedido', 'comensales')
      .populate('mesa', 'numero')
      .populate('user', 'name role')
      .sort({ fecha: -1 });

    res.json(eliminaciones);
  } catch (error) {
    console.error('❌ Error al obtener eliminaciones:', error);
    res.status(500).json({ error: 'Error al obtener eliminaciones.' });
  }
};
