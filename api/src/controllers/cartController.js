import Cart from '../models/Cart.js';

export const obtenerCarrito = async (req, res) => {
  try {
    const { numeroMesa } = req.query; // Obtener número de mesa desde la URL

    if (!numeroMesa) {
      return res.status(400).json({ error: 'Falta el número de mesa en la solicitud.' });
    }

    // Buscar el carrito asociado a la mesa
    const cart = await Cart.findOne({ mesa: numeroMesa }).populate('items.productId');

    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).json({ error: 'Error al obtener el carrito.' });
  }
};

export const agregarAlCarrito = async (req, res) => {
  let { mesa, items } = req.body;

  (req.body);

  try {
    // 🔹 Verificar que `mesa` esté presente
    if (!mesa) {
      return res.status(400).json({ error: "El número de mesa es obligatorio." });
    }

    // 🔹 Verificar que `items` es un array válido con al menos un elemento
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Debe haber al menos un producto en el carrito." });
    }

    // 🔹 Extraemos el primer producto del array `items`
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
    } = items[0];

    // 🔹 Asegurar que `cantidad` es un número válido
    cantidad = parseInt(cantidad, 10);

    // 🔹 Validaciones de los datos esenciales
    if (!productId || !nombre || !precioSeleccionado || isNaN(cantidad) || cantidad <= 0) {
      console.error("❌ Error en los datos recibidos:", { productId, cantidad, nombre, precioSeleccionado });
      return res.status(400).json({ error: "Faltan datos obligatorios o cantidad inválida." });
    }

    if (tipoPlato === "surtido" && (!sabor || sabor.length !== 6)) {
      return res.status(400).json({ error: "El surtido debe tener exactamente 6 sabores." });
    }

    let cart;

    // 🔹 Buscar el carrito existente por `mesa`
    cart = await Cart.findOne({ mesa });

    // 🔹 Si no hay carrito, crear uno nuevo
    if (!cart) {
      cart = new Cart({ mesa, items: [] });
    }

    // 🔹 Convertir `opciones` e `ingredientes` a strings para comparar
    const opcionesString = JSON.stringify(opciones || {});
    const ingredientesString = JSON.stringify(ingredientes || []);

    // 🔹 Buscar si el producto ya está en el carrito con las mismas opciones
    const itemIndex = cart.items.findIndex((item) => {
      return (
        item.productId.toString() === productId &&
        JSON.stringify(item.opciones) === opcionesString &&
        JSON.stringify(item.ingredientes) === ingredientesString
      );
    });

    if (itemIndex > -1) {
      // 🔹 Si el producto ya está en el carrito, actualizar cantidad
      cart.items[itemIndex].cantidad += cantidad;
      if (tipoPlato === "surtido") {
        cart.items[itemIndex].sabor = sabor;
      }
    } else {
      // 🔹 Si el producto no existe en el carrito, agregarlo
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
      });
    }

    // 🔹 Guardar el carrito actualizado
    await cart.save();

    req.io.emit('carritoActualizado', {
      cartId: cart._id,
      totalItems: cart.items.length,
      numeroMesa: cart.mesa, // 👈 Asegúrate de que esté aquí
    });    

    res.status(200).json(cart);
  } catch (error) {
    console.error("❌ Error al agregar al carrito:", error);
    res.status(500).json({ error: "Error al agregar al carrito." });
  }
};



// Actualizar la cantidad de un producto en el carrito
export const actualizarItem = async (req, res) => {
  const { itemId, cantidad } = req.body;

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

export const eliminarDelCarrito = async (req, res) => {
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

// Vaciar el carrito basado en el número de mesa
export const vaciarCarrito = async (req, res) => {
  const { mesa } = req.body;

  if (!mesa) {
    return res.status(400).json({ error: "El número de mesa es obligatorio." });
  }

  try {
    // Buscamos el carrito asociado a la mesa
    const cart = await Cart.findOne({ mesa });

    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado para esta mesa." });
    }

    // Vaciamos el carrito
    cart.items = [];
    await cart.save();

    res.status(200).json({ message: "Carrito vaciado.", cart });
  } catch (error) {
    console.error("❌ Error al vaciar el carrito:", error);
    res.status(500).json({ error: "Error al vaciar el carrito." });
  }
};

