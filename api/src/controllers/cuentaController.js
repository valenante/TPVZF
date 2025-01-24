import Mesa from '../models/Mesa.js';
import {io} from '../../index.js';


// Endpoint para solicitar la cuenta de una mesa
export const pedirCuenta = async (req, res) => {
    const { numeroMesa } = req.params; // Número de mesa enviado en el cuerpo de la solicitud
    try {
      // Verificar si la mesa existe
      const mesa = await Mesa.findOne({ numero: numeroMesa });
      if (!mesa) {
        return res.status(404).json({ error: 'Mesa no encontrada.' });
      }
  
      // Emitir evento de WebSocket para el TPV
      io.emit('cuentaSolicitada', { numeroMesa }); // Enviar el número de la mesa al TPV
  
      res.status(200).json({ message: `Cuenta solicitada para la mesa ${numeroMesa}` });
    } catch (error) {
      console.error('Error al solicitar la cuenta:', error);
      res.status(500).json({ error: 'Error al solicitar la cuenta.' });
    }
  };
