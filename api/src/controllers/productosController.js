import Producto from '../models/Producto.js';
import Pedido from '../models/Pedido.js';
import PedidoBebidas from '../models/PedidoBebidas.js';
import Eliminacion from '../models/Eliminacion.js';
import Mesa from '../models/Mesa.js';

// Obtener todos los productos
export const obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find();
    res.status(200).json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
};

// Obtener un producto por ID
export const obtenerProductoPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const producto = await Producto.findById(id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(200).json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
};

export const obtenerCategoriasPorTipo = async (req, res) => {
  const { type } = req.params;

  try {
    const filtroTipo = type === 'plato' ? ['plato', 'tapaRacion'] : [type];
    const categorias = await Producto.distinct('categoria', {
      tipo: { $in: filtroTipo },
    });

    res.status(200).json({ categories: categorias });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener las categorías' });
  }
};

//Editar producto
export const editarProducto = async (req, res) => {
  const { id } = req.params;
  try {
    const productoActualizado = await Producto.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (req.file) {
      productoActualizado.img = `/images/${req.file.filename}`;
    }
    if (!productoActualizado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(200).json(productoActualizado);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      error: 'Error al actualizar el producto. Verifica los datos enviados.',
    });
  }
};

export const obtenerProductosPorCategoria = async (req, res) => {
  const { category } = req.params;

  try {
    const productos = await Producto.find({ categoria: category });

    res.status(200).json({ products: productos });
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
};

// Crear un nuevo producto
export const crearProducto = async (req, res) => {
  try {
    const nuevoProducto = new Producto(req.body);
    if (req.file) {
      nuevoProducto.img = `/images/${req.file.filename}`; // Asignar la ruta de la imagen
    }
    await nuevoProducto.save();

    // Emitir evento de creación de producto
    req.io.emit('productoCreado', nuevoProducto);

    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      error: 'Error al crear el producto. Verifica los datos enviados.',
    });
  }
};

export const eliminarProducto = async (req, res) => {
  const { id } = req.params;

  try {
    const producto = await Producto.findByIdAndDelete(id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(200).json({ message: 'Producto eliminado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
};

export const eliminarProductoPedido = async (req, res) => {
  const { pedidoId, id: productoId } = req.params;
  const user = req.session?.user?.id;

  try {
    // Verificar que se envió el usuario
    if (!user) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    // Buscar el pedido en pedidos de productos
    let pedido = await Pedido.findById(pedidoId);
    let pedidoTipo = 'producto';

    // Si no se encuentra en pedidos normales, buscar en pedidos de bebidas
    if (!pedido) {
      pedido = await PedidoBebidas.findById(pedidoId);
      pedidoTipo = 'bebida';
    }

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado.' });
    }

    // Buscar el producto en el pedido
    const productoEliminado = pedido.productos.find(
      (producto) => producto.producto.toString() === productoId
    );

    if (!productoEliminado) {
      return res
        .status(404)
        .json({ error: 'Producto no encontrado en el pedido.' });
    }

    // Filtrar el producto del pedido y recalcular el total
    pedido.productos = pedido.productos.filter(
      (producto) => producto.producto.toString() !== productoId
    );

    pedido.total = pedido.productos.reduce(
      (total, producto) => total + (producto.total || 0),
      0
    );

    // Si el pedido no tiene productos después de la eliminación, eliminar el pedido
    if (pedido.productos.length === 0) {
      // Eliminar el pedido según su tipo
      if (pedidoTipo === 'producto') {
        await Pedido.findByIdAndDelete(pedidoId);
      } else {
        await PedidoBebidas.findByIdAndDelete(pedidoId);
      }

      // Actualizar el total de la mesa
      const mesa = await Mesa.findById(pedido.mesa).populate(
        'pedidos pedidosBebidas'
      );
      if (!mesa) {
        return res.status(404).json({ error: 'Mesa no encontrada.' });
      }

      // Eliminar el pedido correspondiente
      if (pedidoTipo === 'producto') {
        mesa.pedidos = mesa.pedidos.filter(
          (p) => p._id.toString() !== pedidoId
        );
      } else {
        mesa.pedidosBebidas = mesa.pedidosBebidas.filter(
          (p) => p._id.toString() !== pedidoId
        );
      }

      // Recalcular el total de la mesa
      mesa.total = [...mesa.pedidos, ...mesa.pedidosBebidas].reduce(
        (totalMesa, pedido) => totalMesa + (pedido.total || 0),
        0
      );

      await mesa.save();

      // Registrar la eliminación en la colección `Eliminaciones`
      const eliminacion = new Eliminacion({
        producto: productoEliminado.producto,
        pedido: pedidoId,
        cantidad: productoEliminado.cantidad || 1,
        user: user,
        mesa: pedido.mesa,
        tipo: pedidoTipo,
      });

      await eliminacion.save();

      return res.json({
        message: `${pedidoTipo === 'bebida' ? 'Bebida' : 'Producto'} eliminado y pedido eliminado con éxito.`,
        mesa: {
          id: mesa._id,
          total: mesa.total,
        },
        pedido: null,
      });
    }

    // Guardar el pedido actualizado
    await pedido.save();

    // Actualizar el total de la mesa
    const mesa = await Mesa.findById(pedido.mesa).populate(
      'pedidos pedidosBebidas'
    );
    if (!mesa) {
      return res.status(404).json({ error: 'Mesa no encontrada.' });
    }

    // Recalcular el total sumando los pedidos de productos y bebidas
    mesa.total = [...mesa.pedidos, ...mesa.pedidosBebidas].reduce(
      (totalMesa, pedido) => totalMesa + (pedido.total || 0),
      0
    );

    await mesa.save();

    // Registrar la eliminación en la colección `Eliminaciones`
    const eliminacion = new Eliminacion({
      producto: productoEliminado.producto,
      pedido: pedidoId,
      cantidad: productoEliminado.cantidad || 1,
      user: user,
      mesa: pedido.mesa,
      tipo: pedidoTipo,
    });

    await eliminacion.save();

    res.json({
      message: `${pedidoTipo === 'bebida' ? 'Bebida' : 'Producto'} eliminado y registrado con éxito.`,
      mesa: {
        id: mesa._id,
        total: mesa.total,
      },
      pedido: {
        id: pedido._id,
        total: pedido.total,
        productos: pedido.productos,
      },
    });
  } catch (error) {
    console.error('Error al eliminar producto/bebida:', error);
    res.status(500).json({ error: 'Error al eliminar producto/bebida.' });
  }
};

export const buscarProductoPorNombre = async (req, res) => {
  let nombre = req.query.nombre;
  if (!nombre) return res.status(400).json({ error: 'Falta el nombre del producto' });

  const nombreNormalizado = nombre.toLowerCase().replace(/[\s\-]+/g, '');

  try {
    const productos = await Producto.find({
      $or: [
        { nombreNormalizado: { $regex: nombreNormalizado, $options: 'i' } },
        { aliases: { $elemMatch: { $regex: nombreNormalizado, $options: 'i' } } },
      ]
    });

    if (productos.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });

    res.json(productos[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al buscar producto' });
  }
};

