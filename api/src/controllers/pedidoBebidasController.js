import axios from 'axios';
import PedidoBebida from '../models/PedidoBebidas.js';
import Mesa from '../models/Mesa.js';
import Venta from '../models/Ventas.js';
import Cart from '../models/Cart.js';
import Producto from '../models/Producto.js';
import SesionMesa from '../models/SesionMesa.js';

export const crearPedido = async (req, res) => {
  try {
    const {
      mesa,
      productos,
      total,
      comensales,
      alergias,
      cartId,
      precioSeleccionado,
    } = req.body;

    const mesaExistente = await Mesa.findById(mesa);
    if (!mesaExistente) {
      console.error('Mesa no encontrada');
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }

    const nuevoPedido = new PedidoBebida({
      productos,
      total: parseFloat(total.toFixed(2)),
      comensales,
      alergias,
      mesa: mesaExistente._id,
      precioSeleccionado,
    });

    await nuevoPedido.save();

    mesaExistente.pedidosBebidas.push(nuevoPedido._id);
    mesaExistente.total += nuevoPedido.total;
    mesaExistente.total = parseFloat(mesaExistente.total.toFixed(2));
    await mesaExistente.save();

    // Registrar cada producto como venta
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
        console.error('Producto no encontrado en la base de datos:', producto.producto);
        return res.status(400).json({ error: 'Producto no encontrado en la base de datos' });
      }
    }

    if (cartId) {
      await Cart.findByIdAndDelete(cartId);
    }

    // Emitir evento para actualizar en tiempo real
    req.io.emit('nuevoPedido', nuevoPedido);

    // ✅ No se envía nada a impresión aquí

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


export const obtenerPedidos = async (req, res) => {
  try {
    const idsParam = req.query.ids;

    if (!idsParam) {
      return res
        .status(400)
        .json({ error: 'Debes proporcionar los IDs de los pedidos.' });
    }

    const ids = idsParam.split(',');

    const pedidos = await PedidoBebida.find({ _id: { $in: ids } })
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
    const pedido = await PedidoBebida.findById(id)
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

// Obtener pedidos pendientes
export const obtenerPedidosPendientes = async (req, res) => {
  try {
    const { tipo } = req.query; // Obtener el tipo de la consulta (plato o bebida)

    const filter = { estado: 'pendiente' };
    if (tipo) {
      filter['productos.tipo'] = tipo; // Filtrar productos por tipo si se especifica
    }

    const pedidos = await PedidoBebida.find(filter)
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

    const pedidosFinalizados = await PedidoBebida.find(filter)
      .populate('mesa')
      .populate('productos.producto'); // Expande los detalles del producto

    res.status(200).json(pedidosFinalizados);
  } catch (error) {
    console.error('Error al obtener pedidos finalizados:', error);
    res.status(500).json({ error: 'Error al obtener pedidos finalizados' });
  }
};

//Actualizar el estado de un producto en un pedido
export const actualizarProducto = async (req, res) => {
  try {
    const { pedidoId, productoId } = req.params;
    const { estadoPreparacion } = req.body;

    const pedido = await PedidoBebida.findById(pedidoId);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

    const producto = pedido.productos.id(productoId);
    if (!producto)
      return res.status(404).json({ error: 'Producto no encontrado' });

    producto.estadoPreparacion = estadoPreparacion;
    await pedido.save();

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
    const pedido = await PedidoBebida.findById(id);

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
    const pedido = await PedidoBebida.findByIdAndDelete(id);

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

    const pedidos = await PedidoBebida.find({ mesa: mesa._id });
    const todosListos = pedidos.every((pedido) => pedido.estado === 'listo');

    res.status(200).json({ todosListos });
  } catch (error) {
    console.error('Error al verificar pedidos de la mesa:', error);
    res.status(500).json({ error: 'Error al verificar pedidos de la mesa.' });
  }
};

export const agregarProductoBebida = async (req, res) => {
  const { mesaId } = req.params;
  const { productos } = req.body;

  if (!Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: 'Debes enviar al menos una bebida válida.' });
  }

  const errores = productos.filter(p => !p.producto || !p.cantidad || !p.total || !p.precioSeleccionado);
  if (errores.length > 0) {
    return res.status(400).json({ error: 'Cada bebida debe tener: producto, cantidad, total y precioSeleccionado.' });
  }

  try {
    // Buscar mesa por ID o número
    const mesa = /^[0-9a-fA-F]{24}$/.test(mesaId)
      ? await Mesa.findById(mesaId).populate('pedidosBebidas')
      : await Mesa.findOne({ numero: parseInt(mesaId, 10) }).populate('pedidosBebidas');

    if (!mesa) return res.status(404).json({ error: 'Mesa no encontrada' });

    // Buscar sesión activa
    const sesionActiva = await SesionMesa.findOne({ mesa: mesa._id, estado: 'activa' });
    if (!sesionActiva) {
      return res.status(400).json({ error: 'No se encontró una sesión activa para esta mesa.' });
    }

    // Obtener datos completos de productos para completar campos obligatorios
    const idsProductos = productos.map(p => p.producto);
    const productosDB = await Producto.find({ _id: { $in: idsProductos } });

    // Completar productos con datos obligatorios
    const productosCompletos = productos.map(p => {
      const productoInfo = productosDB.find(prod => prod._id.toString() === p.producto.toString());

      return {
        ...p,
        tipoPrecio: p.tipoPrecio || productoInfo?.tipoPrecio || 'precioBase', // default para bebida puede ser 'precioBase'
        categoria: p.categoria || productoInfo?.categoria || 'bebida',
        tipo: p.tipo || productoInfo?.tipo || 'bebida',
      };
    });

    let pedidoModificado;
    const pedidoExistente = mesa.pedidosBebidas.find(p => p.estado === 'pendiente');

    if (pedidoExistente) {
      productosCompletos.forEach(p => {
        pedidoExistente.productos.push({ ...p });
        pedidoExistente.total += p.total;
      });
      pedidoModificado = await pedidoExistente.save();
    } else {
      const nuevoPedidoBebida = new PedidoBebida({
        mesa: mesa._id,
        sesionId: sesionActiva._id,
        productos: productosCompletos,
        estado: 'pendiente',
        total: productosCompletos.reduce((sum, p) => sum + p.total, 0),
      });
      pedidoModificado = await nuevoPedidoBebida.save();
      mesa.pedidosBebidas.push(pedidoModificado._id);
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
          tipoPrecio: p.tipoPrecio,
          opcionesPersonalizables: p.opcionesPersonalizables || [],
          alergiasComensal: p.alergiasComensal || '',
          mensaje: p.mensaje || '',
          acompanante: p.acompanante || null,
        };
      }),
      total: productosCompletos.reduce((sum, p) => sum + p.total, 0),
    };

    try {
      const IMPRESION_SERVER = 'http://100.91.21.52:4000'; // Ajusta la IP si es necesario
      await axios.post(`${IMPRESION_SERVER}/imprimir-bebidas`, datosRespuesta);
    } catch (error) {
      console.error('Error al enviar pedido de bebidas a la impresora:', error.message);
    }

    res.json(datosRespuesta);
  } catch (error) {
    console.error('Error al agregar bebida:', error);
    res.status(500).json({ error: 'Error al agregar bebida' });
  }
};