
import PedidoBebida from '../models/PedidoBebidas.js';
import Mesa from '../models/Mesa.js';
import Venta from '../models/Ventas.js';
import Cart from '../models/Cart.js';
import Producto from '../models/Producto.js';

// Crear un nuevo pedido
export const crearPedido = async (req, res) => {
    try {
        const { mesa, productos, total, comensales, alergias,cartId, precioSeleccionado } = req.body;

        // Buscar la mesa usando el ObjectId
        const mesaExistente = await Mesa.findById(mesa);

        if (!mesaExistente) {
            console.error('Mesa no encontrada');
            return res.status(404).json({ error: 'Mesa no encontrada' });
        }

        // Crear el nuevo pedido con el ObjectId de la mesa
        const nuevoPedido = new PedidoBebida({
            productos, // Pasamos los productos directamente desde la solicitud
            total,     // Total del pedido
            comensales,
            alergias,
            mesa: mesaExistente._id, // Asignar el ObjectId de la mesa
            precioSeleccionado,
        });

        // Redondear el total del pedido a dos decimales
        nuevoPedido.total = parseFloat(nuevoPedido.total.toFixed(2));

        // Guardar el nuevo pedido en la base de datos
        await nuevoPedido.save();

        // Agregar el ID del nuevo pedido al campo 'pedidos' de la mesa
        mesaExistente.pedidosBebidas.push(nuevoPedido._id);

        // Sumar el total del nuevo pedido al total de la mesa
        mesaExistente.total += nuevoPedido.total;

        // Redondear el total de la mesa a dos decimales
        mesaExistente.total = parseFloat(mesaExistente.total.toFixed(2));

        // Guardar la mesa actualizada
        await mesaExistente.save();

        // Crear ventas para cada producto del pedido
        for (const producto of productos) {

            // Crear la venta
            const venta = new Venta({
                producto: producto.producto, // Asociamos el producto a la venta
                pedidoId: nuevoPedido._id, // Asociamos el pedido a la venta
                cantidad: producto.cantidad,
                total,
            });


            // Guardar la venta en la base de datos
            await venta.save();

            // Ahora, agregar la venta directamente al producto en la colección de productos
            const productoEnDB = await Producto.findById(producto.producto);

            if (productoEnDB) {
                // Añadimos la venta al campo `ventas` del producto
                productoEnDB.ventas.push(venta._id);

                // Guardar el producto con la venta asociada
                await productoEnDB.save();

                // **Restar la cantidad al stock del producto**
                productoEnDB.stock -= producto.cantidad; // Restar la cantidad vendida al stock
                await productoEnDB.save(); // Guardar la actualización del stock
            } else {
                console.error('Producto no encontrado en la base de datos:', producto.productoId);
                return res.status(400).json({ error: 'Producto no encontrado en la base de datos' });
            }
        }

        if (cartId) {
            await Cart.findByIdAndDelete(cartId);
        }

        // Emitir un evento con el nuevo pedido para los clientes conectados
        req.io.emit('nuevoPedido', nuevoPedido);

        res.status(201).json({
            message: 'Pedido creado con éxito',
            pedidoId: nuevoPedido._id,
            pedido: nuevoPedido
        });
    } catch (error) {
        console.error('Error al procesar el pedido:', error);
        res.status(400).json({ error: error.message });
    }
};

// Obtener todos los pedidos
export const obtenerPedidos = async (req, res) => {
    try {
        const pedidos = await PedidoBebida.find().populate('mesa').populate('productos.producto');
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
        const pedido = await PedidoBebida.findById(id).populate('mesa').populate('productos.productoId');
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
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

        producto.estadoPreparacion = estadoPreparacion;
        await pedido.save();

        res.status(200).json({ message: 'Producto actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
}

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
            mesa.pedidos = mesa.pedidos.filter(pedidoId => pedidoId.toString() !== id);
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
      console.error("Número de mesa no válido:", numeroMesa);
      return res.status(400).json({ error: "Número de mesa no válido." });
    }
  
    try {
      const mesa = await Mesa.findOne({ numero: Number(numeroMesa) });
      if (!mesa) {
        return res.status(404).json({ error: "Mesa no encontrada." });
      }
  
      const pedidos = await PedidoBebida.find({ mesa: mesa._id });
      const todosListos = pedidos.every((pedido) => pedido.estado === "listo");
  
      res.status(200).json({ todosListos });
    } catch (error) {
      console.error("Error al verificar pedidos de la mesa:", error);
      res.status(500).json({ error: "Error al verificar pedidos de la mesa." });
    }
  };

  export const agregarProductoBebida = async (req, res) => {
    const { mesaId } = req.params;
    const { productos } = req.body;
  
    if (
      !productos ||
      !productos.producto ||
      !productos.cantidad ||
      !productos.total ||
      !productos.precioSeleccionado
    ) {
      return res.status(400).json({
        error: "Faltan datos obligatorios: `producto`, `cantidad`, `total` y `precioSeleccionado`.",
      });
    }
  
    try {
      const mesa = await Mesa.findById(mesaId).populate("pedidosBebidas");
  
      if (!mesa) {
        return res.status(404).json({ error: "Mesa no encontrada" });
      }
  
      let pedidoModificado;
  
      const pedidoExistente = mesa.pedidosBebidas.find(
        (p) => p.estado === "pendiente"
      );
  
      if (pedidoExistente) {
        pedidoExistente.productos.push({
          producto: productos.producto,
          cantidad: productos.cantidad,
          total: productos.total,
          tipo: productos.tipo,
          tipoPrecio: productos.tipoPrecio,
          categoria: productos.categoria,
          precioSeleccionado: productos.precioSeleccionado,
          acompanante: productos.acompanante,
        });
        pedidoExistente.total += productos.total;
        pedidoModificado = await pedidoExistente.save();
      } else {
        const nuevoPedidoBebida = new PedidoBebida({
          mesa: mesa._id,
          productos: [
            {
              producto: productos.producto,
              cantidad: productos.cantidad,
              total: productos.total,
              tipo: productos.tipo,
              tipoPrecio: productos.tipoPrecio,
              categoria: productos.categoria,
              precioSeleccionado: productos.precioSeleccionado,
              acompanante: productos.acompanante,
            },
          ],
          estado: "pendiente",
          total: productos.total,
        });
  
        pedidoModificado = await nuevoPedidoBebida.save();
        mesa.pedidosBebidas.push(pedidoModificado._id);
      }
  
      mesa.total += productos.total;
      await mesa.save();
  
      // 🔥 Emitir evento Socket.IO para bebidas
      req.io.emit("nuevoPedido", pedidoModificado);
  
      res.json(mesa);
    } catch (error) {
      console.error("Error al agregar bebida:", error);
      res.status(500).json({ error: "Error al agregar bebida" });
    }
  };
  