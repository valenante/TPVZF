import Mesa from '../models/Mesa.js';
import MesaCerrada from '../models/MesaCerrada.js';
import { v4 as uuidv4 } from "uuid"; // Generador de UUID

export const checkTokenLider = async (req, res) => {
    //Conseguir el mesaId de los params
    const { mesaId } = req.params;
    console.log(req.params);
  
    if (!mesaId) {
      return res.status(400).json({ error: "El número de la mesa es obligatorio" });
    }
  
    try {
      const mesaDoc = await Mesa.findById(mesaId);  
  
      if (!mesaDoc) {
        return res.status(404).json({ error: "Mesa no encontrada" });
      }
  
      res.status(200).json({ tokenLider: mesaDoc.tokenLider || null });
      console.log("TokenLider:", mesaDoc.tokenLider);
    } catch (error) {
      console.error("Error al verificar el tokenLider:", error);
      console.log("TokenLider:", null);
      res.status(500).json({ error: "Error al procesar la solicitud" });
    }
  };

  export const checkTokenLiderByNumber = async (req, res) => {
    const { mesa } = req.query; // Obtener el número de mesa desde los query params
  
    if (!mesa) {
      return res.status(400).json({ error: 'El número de la mesa es obligatorio' });
    }
  
    try {
      // Buscar la mesa por su número
      const mesaDoc = await Mesa.findOne({ numero: mesa });
  
      if (!mesaDoc) {
        return res.status(404).json({ error: 'Mesa no encontrada' });
      }
  
      // Retornar el tokenLider si existe o null si no existe
      res.status(200).json({ tokenLider: mesaDoc.tokenLider || null });
    } catch (error) {
      console.error('Error al verificar el tokenLider:', error);
      res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
  };

  export const createTokenLider = async (req, res) => {
    const { mesa } = req.body;
  
    if (!mesa) {
      return res.status(400).json({ error: "El número de la mesa es obligatorio" });
    }
  
    try {
      const mesaDoc = await Mesa.findOne({ numero: mesa });
  
      if (!mesaDoc) {
        return res.status(404).json({ error: "Mesa no encontrada" });
      }
  
      if (mesaDoc.tokenLider) {
        return res.status(400).json({ error: "El tokenLider ya existe para esta mesa" });
      }
  
      mesaDoc.tokenLider = uuidv4();
      await mesaDoc.save();
  
      res.status(201).json({ tokenLider: mesaDoc.tokenLider });
    } catch (error) {
      console.error("Error al crear el tokenLider:", error);
      res.status(500).json({ error: "Error al procesar la solicitud" });
    }
  };  


// Obtener todas las mesas activas
export const getMesas = async (req, res) => {
    try {
        const mesas = await Mesa.find().populate('pedidos');
        res.status(200).json(mesas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las mesas activas' });
    }
};

// Obtener una mesa activa por ID
export const getMesaById = async (req, res) => {
    const { id } = req.params;
    try {
        const mesa = await Mesa.findById(id).populate('pedidos');
        if (!mesa) {
            return res.status(404).json({ error: 'Mesa no encontrada' });
        }
        res.status(200).json(mesa);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la mesa' });
    }
};

// Abrir una nueva mesa
export const abrirMesa = async (req, res) => {
    const { numero } = req.body;
    try {
        // Verificar si la mesa ya está abierta
        const mesaExistente = await Mesa.findOne({ numero, estado: 'abierta' });
        if (mesaExistente) {
            return res.status(400).json({ error: 'La mesa ya está abierta' });
        }

        // Crear una nueva mesa activa
        const nuevaMesa = new Mesa({ numero });
        await nuevaMesa.save();

        // Emitir evento de apertura de mesa
        req.io.emit('mesaAbierta', nuevaMesa);

        res.status(201).json(nuevaMesa);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al abrir la mesa' });
    }
};

// Cerrar una mesa
export const cerrarMesa = async (req, res) => {
    const { id } = req.params;
    const { total } = req.body; // Total acumulado para la mesa

    try {
        // Buscar la mesa activa
        const mesa = await Mesa.findById(id).populate('pedidos');
        if (!mesa) {
            return res.status(404).json({ error: 'Mesa no encontrada o ya cerrada' });
        }

        // Crear un registro en el historial
        const mesaCerrada = new MesaCerrada({
            numero: mesa.numero,
            pedidos: mesa.pedidos,
            total,
            inicio: mesa.inicio,
            cierre: new Date(),
        });
        await mesaCerrada.save();

        // Eliminar la mesa activa
        await Mesa.findByIdAndDelete(id);

        // Emitir evento de cierre de mesa
        req.io.emit('mesaCerrada', mesaCerrada);

        res.status(200).json({ message: 'Mesa cerrada y registrada en el historial', mesaCerrada });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al cerrar la mesa' });
    }
};

// Obtener historial de mesas cerradas
export const getHistorialMesas = async (req, res) => {
    const { numero, desde, hasta } = req.query;

    try {
        const filtros = {};
        if (numero) filtros.numero = numero;
        if (desde || hasta) {
            filtros.cierre = {};
            if (desde) filtros.cierre.$gte = new Date(desde);
            if (hasta) filtros.cierre.$lte = new Date(hasta);
        }

        const historial = await MesaCerrada.find(filtros).populate('pedidos');
        res.status(200).json(historial);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el historial de mesas' });
    }
};


//Obtener el ID de una mesa por su número
export const getMesaByNumero = async (req, res) => {
    const { numero } = req.params;
    try {
        const mesa = await Mesa.findOne({ numero });
        if (!mesa) {
            return res.status(404).json({ error: 'Mesa no encontrada' });
        }
        res.status(200).json(mesa);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la mesa' });
    }
};