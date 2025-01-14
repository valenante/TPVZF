import Cart from '../models/Cart.js';

export const initCart = async (req, res) => {
  const { cartId } = req.body; // Recibe el UUID generado por el frontend

  try {
    // Buscar el carrito con el UUID proporcionado
    let cart = await Cart.findOne({ cartId: cartId });
    if (!cart) {
      // Si no existe, crear un nuevo carrito vinculado al UUID
      cart = new Cart({ cartId: cartId, items: [] });
      await cart.save();
    }

    // Devolver el `_id` real del carrito y el UUID
    res.status(200).json({ cartId: cart._id });
  } catch (error) {
    console.error('Error al inicializar el carrito:', error);
    res.status(500).json({ error: 'Error al inicializar el carrito.' });
  }
};

// Obtener los productos del carrito
export const getCart = async (req, res) => {
  try {
    const tempCartId = req.headers['x-cart-id']; // Leer el identificador del carrito

    if (!tempCartId) {
      return res.status(400).json({ error: 'Falta el identificador del carrito.' });
    }

    const cart = await Cart.findOne({ _id: tempCartId }).populate('items.productId');

    if (!cart) {
      return res.status(200).json({ items: [] });
    }
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).json({ error: 'Error al obtener el carrito.' });
  }
};

export const addToCart = async (req, res) => {
  const { productId, cantidad, opciones, ingredientes, cartId, mesa, nombre } = req.body;

  try {
    // Validar que `productId` esté presente
    if (!productId) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    let cart;

    if (cartId) {
      // Buscar el carrito existente
      cart = await Cart.findById(cartId);
    }

    if (!cart) {
      // Crear el carrito si no existe
      cart = new Cart({ items: [], mesa });
    }

    // Buscar si el producto ya está en el carrito
    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);

    if (itemIndex > -1) {
      // Actualizar la cantidad si el producto ya está en el carrito
      cart.items[itemIndex].cantidad += cantidad;
    } else {
      // Agregar un nuevo producto al carrito
      cart.items.push({ productId, cantidad, opciones, ingredientes, nombre });
    }

    // Guardar el carrito en la base de datos
    await cart.save();

    // Emitir un evento de actualización del carrito
    req.io.emit('carritoActualizado', {
      cartId: cart._id,
      totalItems: cart.items.reduce((total, item) => total + item.cantidad, 0), // Número total de ítems
    });

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    res.status(500).json({ error: 'Error al agregar al carrito.' });
  }
};


// Actualizar la cantidad de un producto en el carrito
export const updateCartItem = async (req, res) => {
  const { tempCartId, itemId, cantidad } = req.body;

  if (!tempCartId) {
    return res.status(400).json({ error: 'Falta el identificador del carrito.' });
  }

  try {
    const cart = await Cart.findOne({ cartId: tempCartId });
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado.' });
    }

    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Producto no encontrado en el carrito.' });
    }

    cart.items[itemIndex].cantidad = cantidad;
    await cart.save();
    res.status(200).json({ message: 'Cantidad actualizada.', cart });
  } catch (error) {
    console.error('Error al actualizar el carrito:', error);
    res.status(500).json({ error: 'Error al actualizar el carrito.' });
  }
};

export const removeFromCart = async (req, res) => {
  const { itemId } = req.params;
  const cartId = req.headers['x-cart-id']; // Obtener el identificador del carrito desde los encabezados

  if (!cartId) {
    return res.status(400).json({ error: 'Falta el identificador del carrito.' });
  }

  try {
    // Buscar el carrito correspondiente
    const cart = await Cart.findOne({ _id: cartId });

    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado.' });
    }

    // Encontrar el índice del producto en el carrito
    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito.' });
    }

    if (cart.items[itemIndex].cantidad > 1) {
      // Reducir la cantidad del producto en 1
      cart.items[itemIndex].cantidad -= 1;
    } else {
      // Eliminar el producto del carrito si la cantidad es 1
      cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    }

    if (cart.items.length === 0) {
      // Si el carrito queda vacío, eliminarlo
      await Cart.deleteOne({ _id: cart._id });
      req.io.emit('carritoActualizado', {
        cartId: cart._id,
        totalItems: 0,
      });
      return res.status(200).json({
        message: 'Producto eliminado y carrito eliminado por estar vacío.',
        carritoEliminado: true,
      });
    }

    // Guardar los cambios si aún hay productos
    await cart.save();

    // Emitir el evento de actualización del carrito
    req.io.emit('carritoActualizado', {
      cartId: cart._id,
      totalItems: cart.items.reduce((total, item) => total + item.cantidad, 0), // Actualizar el número total de ítems
    });

    res.status(200).json({ message: 'Producto eliminado del carrito.', carritoEliminado: false, cart });
  } catch (error) {
    console.error('Error al eliminar el producto del carrito:', error);
    res.status(500).json({ error: 'Error al eliminar el producto del carrito.' });
  }
};



// Vaciar el carrito
export const clearCart = async (req, res) => {
  const { tempCartId } = req.body;

  if (!tempCartId) {
    return res.status(400).json({ error: 'Falta el identificador del carrito.' });
  }

  try {
    const cart = await Cart.findOne({ cartId: tempCartId });
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado.' });
    }

    cart.items = [];
    await cart.save();
    res.status(200).json({ message: 'Carrito vaciado.', cart });
  } catch (error) {
    console.error('Error al vaciar el carrito:', error);
    res.status(500).json({ error: 'Error al vaciar el carrito.' });
  }
};
