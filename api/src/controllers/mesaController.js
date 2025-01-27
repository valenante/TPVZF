import Mesa from '../models/Mesa.js';
import MesaCerrada from '../models/MesaCerrada.js';
import { v4 as uuidv4 } from "uuid"; // Generador de UUID

export const checkTokenLider = async (req, res) => {
    //Conseguir el mesaId de los params
    const { mesaId } = req.params;
  
    if (!mesaId) {
      return res.status(400).json({ error: "El número de la mesa es obligatorio" });
    }
  
    try {
      const mesaDoc = await Mesa.findById(mesaId);  
  
      if (!mesaDoc) {
        return res.status(404).json({ error: "Mesa no encontrada" });
      }
  
      res.status(200).json({ tokenLider: mesaDoc.tokenLider || null });
    } catch (error) {
      console.error("Error al verificar el tokenLider:", error);
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

    // Generar tokenLider y cambiar estado a "abierto"
    mesaDoc.tokenLider = uuidv4();
    mesaDoc.estado = "abierta";
    await mesaDoc.save();

    res.status(201).json({ tokenLider: mesaDoc.tokenLider, estado: mesaDoc.estado });
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

export const cerrarMesa = async (req, res) => {
  const { id } = req.params; // ID de la mesa
  const { metodoPago } = req.body; // Efectivo y tarjeta

  try {
    const mesa = await Mesa.findById(id).populate('pedidos');
    if (!mesa) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }

    const { efectivo = 0, tarjeta = 0 } = metodoPago || {};

    // Verificar que la suma de efectivo y tarjeta sea igual al total
    if (efectivo + tarjeta !== mesa.total) {
      return res.status(400).json({ error: 'Los montos no coinciden con el total de la mesa.' });
    }

    // Crear registro en `mesasCerradas`
    const mesaCerrada = new MesaCerrada({
      numero: mesa.numero,
      pedidos: mesa.pedidos.map((pedido) => pedido._id),
      total: mesa.total,
      inicio: mesa.inicio,
      cierre: new Date(),
      metodoPago: { efectivo, tarjeta },
    });

    await mesaCerrada.save();

    //Restablecer valores de mesa abierta
    mesa.estado = 'cerrada';
    mesa.total = 0;
    mesa.pedidos = [];
    mesa.tokenLider = null;
    await mesa.save();

    res.status(200).json({ message: 'Mesa cerrada con éxito', mesaCerrada });
  } catch (error) {
    console.error('Error al cerrar la mesa:', error);
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

export const obtenerMesasCerradas = async (req, res) => {
  try {
    const mesasCerradas = await MesaCerrada.find({})
      .populate({
        path: 'pedidos', // Relación con pedidos
        populate: {
          path: 'productos', // Relación con productos dentro de los pedidos
          select: 'producto cantidad total', // Selecciona los campos relevantes
          populate: {
            path: 'producto', // Relación con el nombre del producto
            select: 'nombre', // Solo obtén el nombre del producto
          },
        },
      })
      .sort({ cierre: -1 }); // Ordenar por cierre descendente

    res.status(200).json(mesasCerradas);
  } catch (error) {
    console.error('Error al obtener las mesas cerradas:', error);
    res.status(500).json({ error: 'Error al obtener las mesas cerradas.' });
  }
};


export const recuperarMesa = async (req, res) => {
  const { mesaId } = req.params; // ID de la mesa cerrada
    try {
    // Obtener la mesa cerrada
    const mesaCerrada = await MesaCerrada.findById(mesaId);
    if (!mesaCerrada) {
      return res.status(404).json({ error: 'Mesa cerrada no encontrada.' });
    }

    // Buscar la mesa activa correspondiente
    const mesaActiva = await Mesa.findOne({ numero: mesaCerrada.numero });
    if (!mesaActiva) {
      return res.status(404).json({ error: 'Mesa activa no encontrada.' });
    }

    // Transferir los datos de la mesa cerrada a la activa
    mesaActiva.pedidos = mesaCerrada.pedidos;
    mesaActiva.total = mesaCerrada.total;
    mesaActiva.inicio = mesaCerrada.inicio;
    mesaActiva.estado = 'abierta'; // Cambiar el estado a abierta
    mesaActiva.updatedAt = new Date();

    // Guardar la mesa activa
    await mesaActiva.save();

    // Eliminar o marcar la mesa cerrada como recuperada
    await MesaCerrada.findByIdAndDelete(mesaId);

    res.status(200).json({ message: 'Mesa recuperada con éxito.' });
  } catch (error) {
    console.error('Error al recuperar la mesa:', error);
    res.status(500).json({ error: 'Error al recuperar la mesa.' });
  }
};

export const crearMesa = async (req, res) => {
  try {
    const { numero } = req.body;

    // Verificar si el número de la mesa ya existe
    const mesaExistente = await Mesa.findOne({ numero });
    if (mesaExistente) {
      return res.status(400).json({ error: `La mesa número ${numero} ya existe.` });
    }

    // Crear la nueva mesa
    const nuevaMesa = new Mesa({
      numero,
      inicio: new Date(),
      cierre: null,
      estado: 'cerrada',
      total: 0,
      metodoPago: { efectivo: 0, tarjeta: 0 }, // Inicializa método de pago vacío
      pedidos: [], // Inicializa con pedidos vacíos
    });

    await nuevaMesa.save(); // Guarda la mesa en la base de datos

    res.status(201).json({ message: "Mesa creada exitosamente", mesa: nuevaMesa });
  } catch (error) {
    console.error("Error al crear la mesa:", error);
    res.status(500).json({ error: "Hubo un problema al crear la mesa." });
  }
};

export const eliminarMesa = async (req, res) => {
  try {
    const { numero } = req.query; // Obtiene el número de la mesa del cuerpo de la solicitud

    // Verificar que el número fue proporcionado
    if (!numero) {
      return res.status(400).json({ error: "El número de la mesa es obligatorio." });
    }

    // Buscar y eliminar la mesa por su número
    const mesaEliminada = await Mesa.findOneAndDelete({ numero });

    // Si no se encontró la mesa, devolver un error
    if (!mesaEliminada) {
      return res.status(404).json({ error: `No se encontró una mesa con el número ${numero}.` });
    }

    res.status(200).json({
      message: `Mesa número ${numero} eliminada exitosamente.`,
      mesa: mesaEliminada,
    });
  } catch (error) {
    console.error("Error al eliminar la mesa:", error);
    res.status(500).json({ error: "Hubo un problema al eliminar la mesa." });
  }
};