import Pedido from '../models/Pedido.js';
import PedidoBebida from '../models/PedidoBebidas.js';
import Mesa from '../models/Mesa.js';
import Venta from '../models/Ventas.js';
import Cart from '../models/Cart.js';
import Producto from '../models/Producto.js';
import SesionMesa from '../models/SesionMesa.js';
import { io } from '../../index.js';

// Crear un nuevo pedido
import axios from 'axios';

// Crear un nuevo pedido
export const crearPedido = async (req, res) => {
  try {
    const {
      mesa,
      productos,
      total,
      comensales,
      alergias,
      pan,
      cartId,
      precioSeleccionado,
      tipoPrecio,
    } = req.body;

    const mesaExistente = await Mesa.findById(mesa);

    if (!mesaExistente) {
      console.error('Mesa no encontrada');
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }

    const nuevoPedido = new Pedido({
      productos,
      total,
      comensales,
      alergias,
      pan,
      tipoPrecio,
      mesa: mesaExistente._id,
      precioSeleccionado,
    });

    nuevoPedido.total = parseFloat(nuevoPedido.total.toFixed(2));
    await nuevoPedido.save();

    mesaExistente.pedidos.push(nuevoPedido._id);
    mesaExistente.total += nuevoPedido.total;
    mesaExistente.total = parseFloat(mesaExistente.total.toFixed(2));
    await mesaExistente.save();

    for (const producto of productos) {
      const venta = new Venta({
        producto: producto.producto,
        pedidoId: nuevoPedido._id,
        cantidad: producto.cantidad,
        total,
      });

      await venta.save();

      const productoEnDB = await Producto.findById(producto.producto);

      if (productoEnDB) {
        productoEnDB.ventas.push(venta._id);
        productoEnDB.stock -= producto.cantidad;
        await productoEnDB.save();
      } else {
        console.error(
          'Producto no encontrado en la base de datos:',
          producto.productoId
        );
        return res
          .status(400)
          .json({ error: 'Producto no encontrado en la base de datos' });
      }
    }

    if (cartId) {
      await Cart.findByIdAndDelete(cartId);
    }

    // Emitir el evento de nuevo pedido
    req.io.emit('nuevoPedido', nuevoPedido);

    res.status(201).json({
      message: 'Pedido creado con éxito',
      pedidoId: nuevoPedido._id,
      pedido: nuevoPedido,
    });
  } catch (error) {
    console.error('Error al procesar el pedido:', error);
    res.status(400).json({ error: error.message });
  }
};

export const agregarProductoAlPedido = async (req, res) => {
  const { mesaId } = req.params; // puede ser ID o número
  const { productos } = req.body;

  if (!Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: 'Debes enviar al menos un producto válido.' });
  }

  const errores = productos.filter(p => !p.producto || !p.cantidad || !p.total || !p.precioSeleccionado);
  if (errores.length > 0) {
    return res.status(400).json({ error: 'Cada producto debe tener: producto, cantidad, total y precioSeleccionado.' });
  }

  try {
    // Buscar la mesa por ID o por número
    const mesa = /^[0-9a-fA-F]{24}$/.test(mesaId)
      ? await Mesa.findById(mesaId).populate('pedidos')
      : await Mesa.findOne({ numero: parseInt(mesaId, 10) }).populate('pedidos');

    if (!mesa) return res.status(404).json({ error: 'Mesa no encontrada' });

    // Buscar la sesión activa
    const sesionActiva = await SesionMesa.findOne({ mesa: mesa._id, estado: 'activa' });
    if (!sesionActiva) {
      return res.status(400).json({ error: 'La mesa no tiene una sesión activa. Abre la mesa antes de agregar productos.' });
    }

    // Obtener datos completos de productos para completar campos obligatorios
    const idsProductos = productos.map(p => p.producto);
    const productosDB = await Producto.find({ _id: { $in: idsProductos } });

    // Completar productos con datos obligatorios
    const productosCompletos = productos.map(p => {
      const productoInfo = productosDB.find(prod => prod._id.toString() === p.producto.toString());

      return {
        ...p,
        tipoPrecio: p.tipoPrecio || productoInfo?.tipoPrecio || 'tapa', // ajustar valor por defecto según convenga
        categoria: p.categoria || productoInfo?.categoria || 'general',
        tipo: p.tipo || productoInfo?.tipo || 'producto',
      };
    });

    let pedidoModificado;
    const pedidoExistente = mesa.pedidos.find(p => p.estado === 'pendiente');

    if (pedidoExistente) {
      productosCompletos.forEach(p => {
        pedidoExistente.productos.push({ ...p });
        pedidoExistente.total += p.total;
      });
      pedidoModificado = await pedidoExistente.save();
    } else {
      const nuevoPedido = new Pedido({
        mesa: mesa._id,
        sesionId: sesionActiva._id,
        productos: productosCompletos,
        estado: 'pendiente',
        total: productosCompletos.reduce((sum, p) => sum + p.total, 0),
      });
      pedidoModificado = await nuevoPedido.save();
      mesa.pedidos.push(pedidoModificado._id);
    }

    mesa.total += productosCompletos.reduce((sum, p) => sum + p.total, 0);
    await mesa.save();

    req.io.emit('nuevoPedido', pedidoModificado);

    const datosRespuesta = {
      mesaNumero: mesa.numero,
      comensales: mesa.comensales || 0,
      productos: productosCompletos.map(p => {
        const productoInfo = productosDB.find(prod => prod._id.toString() === p.producto);
        return {
          nombre: productoInfo?.nombre || 'Producto desconocido',
          cantidad: p.cantidad,
          opcionesPersonalizables: p.opcionesPersonalizables,
          precioSeleccionado: p.precioSeleccionado,
          total: p.total,
          tipoPlato: p.tipoPlato,
          acompanante: p.acompanante,
          ingredientes: p.ingredientes,
          categoria: p.categoria,
          mensaje: p.mensaje,
          adicionales: p.adicionales,
          tipo: p.tipo,
          alergiasComensal: p.alergiasComensal,
          tipoPrecio: p.tipoPrecio,
          seccion: p.seccion,
        };
      }),
      total: productosCompletos.reduce((sum, p) => sum + p.total, 0),
      horaSalida: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };

    try {
      const IMPRESION_SERVER = 'http://100.91.21.52:4000';
      await axios.post(`${IMPRESION_SERVER}/imprimir`, datosRespuesta);
    } catch (error) {
      console.error('Error al enviar pedido a la impresora:', error.message);
    }

    res.json(datosRespuesta);
  } catch (error) {
    console.error('Error al agregar producto:', error);
    res.status(500).json({ error: 'Error al agregar producto' });
  }
};

// Obtener todos los pedidos
export const obtenerPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find()
      .populate('mesa')
      .populate('productos.producto');
    res.status(200).json(pedidos);
  } catch (error) {
    console.error('Error al obtener los pedidos:', error);
    res.status(500).json({ error: 'Error al obtener los pedidos' });
  }
};

// Obtener un pedido por ID
export const obtenerPedidosId = async (req, res) => {
  const { id } = req.params;

  try {
    const pedido = await Pedido.findById(id)
      .populate('mesa')
      .populate('productos.productoId');
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.status(200).json(pedido);
  } catch (error) {
    console.error('Error al obtener el pedido:', error);
    res.status(500).json({ error: 'Error al obtener el pedido' });
  }
};
export const obtenerPedidoPorMesaId = async (req, res) => {
  const { mesaId } = req.params;

  try {
    const mesa = await Mesa.findById(mesaId);
    if (!mesa) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }

    if (mesa.estado !== 'abierta') {
      return res.status(400).json({ error: 'La mesa no está abierta' });
    }

    if (!mesa.sesionActiva) {
      return res.status(404).json({ error: 'La mesa no tiene una sesión activa registrada' });
    }

    const pedidos = await Pedido.find({ mesa: mesa._id, sesionId: mesa.sesionActiva })
      .populate('mesa')
      .populate('productos.producto');

    const pedidosBebidas = await PedidoBebida.find({ mesa: mesa._id, sesionId: mesa.sesionActiva })
      .populate('mesa')
      .populate('productos.producto');

    if ((!pedidos.length) && (!pedidosBebidas.length)) {
      return res.status(404).json({ error: 'No se encontraron pedidos en la sesión activa para esta mesa' });
    }

    // Unificar productos de todos los pedidos
    const productosComida = pedidos.flatMap(p => p.productos.map(prod => ({
      ...prod.toObject(),
      tipo: 'comida'
    })));

    const productosBebidas = pedidosBebidas.flatMap(p => p.productos.map(prod => ({
      ...prod.toObject(),
      tipo: 'bebida'
    })));

    const productosUnificados = [...productosComida, ...productosBebidas];

    res.status(200).json(productosUnificados);

  } catch (error) {
    console.error('🔴 Error al obtener los pedidos de la mesa:', error);
    res.status(500).json({ error: 'Error al obtener los pedidos de la mesa' });
  }
};

// Obtener pedidos pendientes
export const obtenerPedidosPendientes = async (req, res) => {
  try {
    const { tipo } = req.query; // Obtener el tipo de la consulta (plato o bebida)

    const filter = { estado: 'pendiente' };
    if (tipo) {
      filter['productos.tipo'] = tipo; // Filtrar productos por tipo si se especifica
    }

    const pedidos = await Pedido.find(filter)
      .populate('mesa')
      .populate('productos.producto'); // Expande los detalles del producto

    res.status(200).json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos pendientes:', error);
    res.status(500).json({ error: 'Error al obtener pedidos pendientes' });
  }
};

// Obtener pedidos finalizados
export const obtenerPedidosFinalizados = async (req, res) => {
  try {
    const { tipo } = req.query; // Obtener el tipo de la consulta (plato o bebida)
    const hace20Minutos = new Date(Date.now() - 20 * 60 * 1000); // Fecha límite

    const filter = {
      estado: 'listo',
      fecha: { $gte: hace20Minutos },
    };

    if (tipo) {
      filter['productos.tipo'] = tipo; // Filtrar productos por tipo si se especifica
    }

    const pedidosFinalizados = await Pedido.find(filter)
      .populate('mesa')
      .populate('productos.producto'); // Expande los detalles del producto

    res.status(200).json(pedidosFinalizados);
  } catch (error) {
    console.error('Error al obtener pedidos finalizados:', error);
    res.status(500).json({ error: 'Error al obtener pedidos finalizados' });
  }
};

export const actualizarProducto = async (req, res) => {
  try {
    const { pedidoId, productoId } = req.params;
    const { estadoPreparacion } = req.body;

    const pedido = await Pedido.findById(pedidoId).populate('mesa');
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

    const producto = pedido.productos.id(productoId);
    if (!producto)
      return res.status(404).json({ error: 'Producto no encontrado' });

    producto.estadoPreparacion = estadoPreparacion;
    await pedido.save();

    // Verificar si TODOS los productos de TODOS los pedidos de la misma mesa están listos
    const pedidosMesa = await Pedido.find({ mesa: pedido.mesa._id });

    const todosListos = pedidosMesa.every((ped) =>
      ped.productos.every((prod) => prod.estadoPreparacion === 'listo')
    );

    // Emitir el evento usando el número real de mesa
    io.emit('pedidosActualizados', {
      numeroMesa: pedido.mesa.numero,
      todosListos,
    });

    res.status(200).json({ message: 'Producto actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

// Actualizar un pedido por ID
export const actualizarPedido = async (req, res) => {
  const { id } = req.params;
  const { productos, total, comensales, alergias, pan, estado } = req.body;

  try {
    const pedido = await Pedido.findById(id);

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    // Actualizar los campos permitidos
    if (productos) pedido.productos = productos;
    if (total) pedido.total = parseFloat(total.toFixed(2));
    if (comensales) pedido.comensales = comensales;
    if (alergias) pedido.alergias = alergias;
    if (pan !== undefined) pedido.pan = pan;
    if (estado) pedido.estado = estado;

    // Guardar los cambios
    await pedido.save();

    res.status(200).json({ message: 'Pedido actualizado con éxito', pedido });
  } catch (error) {
    console.error('Error al actualizar el pedido:', error);
    res.status(400).json({ error: 'Error al actualizar el pedido' });
  }
};

// Eliminar un pedido por ID
export const eliminarPedido = async (req, res) => {
  const { id } = req.params;

  try {
    const pedido = await Pedido.findByIdAndDelete(id);

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    // Actualizar la mesa para quitar el pedido eliminado
    const mesa = await Mesa.findById(pedido.mesa);
    if (mesa) {
      mesa.pedidos = mesa.pedidos.filter(
        (pedidoId) => pedidoId.toString() !== id
      );
      mesa.total -= pedido.total;
      await mesa.save();
    }

    res.status(200).json({ message: 'Pedido eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar el pedido:', error);
    res.status(500).json({ error: 'Error al eliminar el pedido' });
  }
};

// Endpoint para verificar si todos los pedidos de una mesa están listos
export const verificarPedidosMesa = async (req, res) => {
  const { numeroMesa } = req.params;

  if (!numeroMesa || isNaN(Number(numeroMesa))) {
    console.error('Número de mesa no válido:', numeroMesa);
    return res.status(400).json({ error: 'Número de mesa no válido.' });
  }

  try {
    const mesa = await Mesa.findOne({ numero: Number(numeroMesa) });
    if (!mesa) {
      return res.status(404).json({ error: 'Mesa no encontrada.' });
    }

    const pedidos = await Pedido.find({ mesa: mesa._id });

    if (pedidos.length === 0) {
      // ✅ Si no hay pedidos, devolver false
      return res.status(200).json({ todosListos: false });
    }

    const todosListos = pedidos.every((pedido) => pedido.estado === 'listo');

    res.status(200).json({ todosListos });
  } catch (error) {
    console.error('Error al verificar pedidos de la mesa:', error);
    res.status(500).json({ error: 'Error al verificar pedidos de la mesa.' });
  }
};
