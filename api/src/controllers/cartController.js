import Cart from '../models/Cart.js';

// Obtener carrito por número de mesa
export const obtenerCarrito = async (req, res) => {
  const { numeroMesa } = req.query;

  if (!numeroMesa) {
    return res.status(400).json({ error: 'Falta el número de mesa en la solicitud.' });
  }

  try {
    const cart = await Cart.findOne({ mesa: numeroMesa }).populate('items.productId');
    res.status(200).json(cart || { items: [] });
  } catch (error) {
    console.error('❌ Error al obtener el carrito:', error);
    res.status(500).json({ error: 'Error al obtener el carrito.' });
  }
};

// Agregar producto al carrito
export const agregarAlCarrito = async (req, res) => {
  let { mesa, items } = req.body;

  if (!mesa) return res.status(400).json({ error: 'El número de mesa es obligatorio.' });
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Debe haber al menos un producto en el carrito.' });
  }

  let {
    productId,
    cantidad,
    opciones,
    ingredientes,
    nombre,
    alergias,
    precioSeleccionado,
    tipoPlato,
    tipoPrecio,
    acompanante,
    sabor,
    tipoCroqueta,
    adicionales,
  } = items[0];

  cantidad = parseInt(cantidad, 10);

  if (!productId || !nombre || !precioSeleccionado || isNaN(cantidad) || cantidad <= 0) {
    return res.status(400).json({ error: 'Faltan datos obligatorios o cantidad inválida.' });
  }

  if (tipoPlato === 'surtido' && (!sabor || sabor.length !== 6)) {
    return res.status(400).json({ error: 'El surtido debe tener exactamente 6 sabores.' });
  }

  try {
    let cart = await Cart.findOne({ mesa }) || new Cart({ mesa, items: [] });

    const opcionesStr = JSON.stringify(opciones || {});
    const ingredientesStr = JSON.stringify(ingredientes || []);

    const index = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        JSON.stringify(item.opciones) === opcionesStr &&
        JSON.stringify(item.ingredientes) === ingredientesStr
    );

    if (index > -1) {
      cart.items[index].cantidad += cantidad;
      if (tipoPlato === 'surtido') cart.items[index].sabor = sabor;
    } else {
      cart.items.push({
        productId,
        cantidad,
        opciones,
        ingredientes,
        nombre,
        alergias,
        precioSeleccionado,
        tipoPlato,
        tipoPrecio,
        tipoCroqueta,
        acompanante,
        sabor,
        mesa,
        adicionales,
      });
    }

    await cart.save();

    req.io.emit('carritoActualizado', {
      cartId: cart._id,
      totalItems: cart.items.length,
      numeroMesa: cart.mesa,
    });

    res.status(200).json(cart);
  } catch (error) {
    console.error('❌ Error al agregar al carrito:', error);
    res.status(500).json({ error: 'Error al agregar al carrito.' });
  }
};

// Actualizar cantidad de un producto en el carrito
export const actualizarItem = async (req, res) => {
  const { itemId, cantidad } = req.body;

  if (!itemId || cantidad == null) {
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }

  try {
    const cart = await Cart.findOne({ 'items._id': itemId });
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado.' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Producto no encontrado.' });

    item.cantidad = cantidad;
    await cart.save();

    res.status(200).json({ message: 'Cantidad actualizada.', cart });
  } catch (error) {
    console.error('❌ Error al actualizar cantidad:', error);
    res.status(500).json({ error: 'Error al actualizar el carrito.' });
  }
};

// Eliminar producto del carrito
export const eliminarDelCarrito = async (req, res) => {
  const { itemId } = req.params;
  const cartId = req.headers['x-cart-id'];

  if (!cartId) return res.status(400).json({ error: 'Falta el ID del carrito.' });

  try {
    const cart = await Cart.findById(cartId);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado.' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ error: 'Producto no encontrado.' });

    if (item.cantidad > 1) {
      item.cantidad -= 1;
    } else {
      cart.items = cart.items.filter((i) => i._id.toString() !== itemId);
    }

    if (cart.items.length === 0) {
      await Cart.deleteOne({ _id: cart._id });
      req.io.emit('carritoActualizado', { cartId: cart._id, totalItems: 0 });
      return res.status(200).json({
        message: 'Producto eliminado y carrito eliminado por estar vacío.',
        carritoEliminado: true,
      });
    }

    await cart.save();

    req.io.emit('carritoActualizado', {
      cartId: cart._id,
      totalItems: cart.items.reduce((acc, item) => acc + item.cantidad, 0),
    });

    res.status(200).json({
      message: 'Producto eliminado.',
      carritoEliminado: false,
      cart,
    });
  } catch (error) {
    console.error('❌ Error al eliminar producto del carrito:', error);
    res.status(500).json({ error: 'Error al eliminar el producto.' });
  }
};

// Vaciar carrito por número de mesa
export const vaciarCarrito = async (req, res) => {
  const { mesa } = req.body;

  if (!mesa) return res.status(400).json({ error: 'El número de mesa es obligatorio.' });

  try {
    const cart = await Cart.findOne({ mesa });
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado.' });

    cart.items = [];
    await cart.save();

    res.status(200).json({ message: 'Carrito vaciado.', cart });
  } catch (error) {
    console.error('❌ Error al vaciar el carrito:', error);
    res.status(500).json({ error: 'Error al vaciar el carrito.' });
  }
};
