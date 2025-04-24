import Mesa from '../models/Mesa.js';
import MesaCerrada from '../models/MesaCerrada.js';
import Caja from '../models/Caja.js';
import Comensal from '../models/Comensal.js';
import { v4 as uuidv4 } from "uuid"; // Generador de UUID

export const verificarTokenLider = async (req, res) => {
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
    res.status(200).json({ tokenLider: mesaDoc.tokenLider });
  } catch (error) {
    console.error("Error al verificar el tokenLider:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
};

export const verificarTokenLiderPorNumero = async (req, res) => {
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

export const crearTokenLider = async (req, res) => {
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

    req.io.emit('mesaAbierta', mesaDoc); // Emitir evento de apertura de mesa

    await mesaDoc.save();

    res.status(201).json({ tokenLider: mesaDoc.tokenLider, estado: mesaDoc.estado });
  } catch (error) {
    console.error("Error al crear el tokenLider:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
};


// Obtener todas las mesas activas
export const obtenerMesas = async (req, res) => {
  try {
    const mesas = await Mesa.find().populate('pedidos');
    res.status(200).json(mesas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las mesas activas' });
  }
};

// Obtener una mesa activa por ID
export const obtenerMesaPorId = async (req, res) => {
  ('nanananannana');
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
  const { metodoPago } = req.body; // Efectivo, tarjeta y propina

  try {
    const mesa = await Mesa.findById(id).populate('pedidos');
    if (!mesa) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }

    const { efectivo = 0, tarjeta = 0, propina = 0 } = metodoPago || {};

    const totalPagado = efectivo + tarjeta;
    const totalMesa = mesa.total;

    // Permitir que el total pagado sea igual o mayor al total de la mesa (considerando propina)
    if (totalPagado < totalMesa) {
      return res.status(400).json({
        error: `El monto ingresado (${totalPagado} €) es menor que el total de la mesa (${totalMesa} €).`,
      });
    }

    const propinaCalculada = totalPagado > totalMesa ? totalPagado - totalMesa : propina;

    // Crear registro en `mesasCerradas`
    const mesaCerrada = new MesaCerrada({
      numero: mesa.numero,
      pedidos: mesa.pedidos.map((pedido) => pedido._id),
      pedidoBebidas: mesa.pedidosBebidas.map((pedido) => pedido._id),
      total: mesa.total,
      inicio: mesa.inicio,
      cierre: new Date(),
      metodoPago: { efectivo, tarjeta, propina: propinaCalculada },
    });

    await mesaCerrada.save();

    // Calcular el rango de fechas para el día actual
    const hoy = new Date();
    const inicioDelDia = new Date(hoy.setHours(0, 0, 0, 0));
    const finDelDia = new Date(hoy.setHours(23, 59, 59, 999));

    // Buscar la caja con fecha de hoy y estado abierta
    const caja = await Caja.findOne({
      fechaApertura: { $gte: inicioDelDia, $lte: finDelDia },
      estado: "abierta"
    });

      if(caja) {
        // Sumar los totales de la mesa cerrada a la caja existente
        caja.detallesMetodoPago.efectivo += efectivo;
        caja.detallesMetodoPago.tarjeta += tarjeta;
        caja.detallesMetodoPago.propina += propinaCalculada; // Sumar la propina al campo correspondiente
        caja.total += totalMesa;

        // Registrar la operación de cierre
        caja.operaciones.push({
          tipo: "cierre",
          monto: totalMesa,
          razon: `Cierre de la mesa número ${mesa.numero}`,
        });

        await caja.save();
      } else {
        // Crear una nueva caja si no existe
        const nuevaCaja = new Caja({
          total: totalMesa,
          detallesMetodoPago: { efectivo, tarjeta, propina: propinaCalculada },
          operaciones: [
            {
              tipo: "cierre",
              monto: totalMesa,
              razon: `Cierre de la mesa número ${mesa.numero}`,
            },
          ],
        });

        await nuevaCaja.save();
      }

    // Restablecer valores de mesa abierta
    mesa.estado = 'cerrada';
      mesa.total = 0;
      mesa.pedidos = [];
      mesa.pedidosBebidas = [];
      mesa.tokenLider = null;
      await mesa.save();

      res.status(200).json({
        message: 'Mesa cerrada con éxito',
        mesaCerrada,
        propina: propinaCalculada,
      });
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
  export const obtenerMesaPorNumero = async (req, res) => {
    const { numeroMesa } = req.params;
    try {
      const mesa = await Mesa.findOne({ numeroMesa });
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

  export const obtenerMesasAbiertas = async (req, res) => {
    try {
      const mesasAbiertas = await Mesa.find({ estado: 'abierta' }).populate('pedidos');
      res.status(200).json(mesasAbiertas);
    } catch (error) {
      console.error('Error al obtener las mesas abiertas:', error);
      res.status(500).json({ error: 'Error al obtener las mesas abiertas.' });
    }
  };

  export const recuperarMesa = async (req, res) => {
    const { mesaId } = req.params; // ID de la mesa cerrada
    try {
        // 1️⃣ Obtener la mesa cerrada
        const mesaCerrada = await MesaCerrada.findById(mesaId);
        if (!mesaCerrada) {
            return res.status(404).json({ error: 'Mesa cerrada no encontrada.' });
        }

        // 2️⃣ Buscar la mesa activa correspondiente
        const mesaActiva = await Mesa.findOne({ numero: mesaCerrada.numero });
        if (!mesaActiva) {
            return res.status(404).json({ error: 'Mesa activa no encontrada.' });
        }

        // 3️⃣ Transferir los datos de la mesa cerrada a la activa
        mesaActiva.pedidos = mesaCerrada.pedidos;
        mesaActiva.total = mesaCerrada.total;
        mesaActiva.inicio = mesaCerrada.inicio;
        mesaActiva.estado = 'abierta'; // Cambiar el estado a abierta
        mesaActiva.updatedAt = new Date();

        // 4️⃣ Guardar la mesa activa
        await mesaActiva.save();

        // 5️⃣ Ajustar la caja actual restando el total de la mesa
        const hoy = new Date();
        const inicioDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0);
        const finDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);

        // Buscar la caja abierta del día actual
        const cajaActual = await Caja.findOne({
            fechaApertura: { $gte: inicioDelDia, $lte: finDelDia },
            estado: "abierta"
        });

        if (!cajaActual) {
            console.warn("⚠️ No se encontró una caja abierta para ajustar el total.");
        } else {
            // Restar el total de la mesa recuperada
            cajaActual.total -= mesaCerrada.total;

            // Restar las cantidades de los métodos de pago correspondientes
            cajaActual.detallesMetodoPago.efectivo -= mesaCerrada.metodoPago.efectivo || 0;
            cajaActual.detallesMetodoPago.tarjeta -= mesaCerrada.metodoPago.tarjeta || 0;
            cajaActual.detallesMetodoPago.propina -= mesaCerrada.metodoPago.propina || 0;

            // Registrar la operación
            cajaActual.operaciones.push({
                tipo: "ajuste",
                monto: -mesaCerrada.total,
                razon: `Recuperación de la mesa número ${mesaCerrada.numero}`
            });

            await cajaActual.save();
        }

        // 6️⃣ Eliminar la mesa cerrada
        await MesaCerrada.findByIdAndDelete(mesaId);

        res.status(200).json({ message: '✅ Mesa recuperada y caja ajustada correctamente.' });
    } catch (error) {
        console.error('❌ Error al recuperar la mesa:', error);
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

  // POST /mesas/comensal
  export const registrarComensal = async (req, res) => {
  try {
    const { mesa, nombre, alergias, esLider, comensales } = req.body;

    if (!mesa || !nombre) {
      return res.status(400).json({ message: "Mesa y nombre son obligatorios." });
    }

    const nuevoComensal = new Comensal({
      mesa,
      nombre,
      alergias,
      esLider,
      comensales: esLider ? comensales : null,
    });

    await nuevoComensal.save();
    res.status(201).json({ message: "Comensal registrado correctamente." });
  } catch (error) {
    console.error("Error al guardar comensal:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};