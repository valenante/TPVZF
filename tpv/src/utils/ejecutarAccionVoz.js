import api from './api';
function determinarTipoPrecioDefault(producto, tipoPrecioDetectado) {
  if (tipoPrecioDetectado) return tipoPrecioDetectado;

  const tieneTapa = producto.precios?.tapa != null;
  const tieneRacion = producto.precios?.racion != null;
  const tieneCopa = producto.precios?.copa != null;
  const tieneBotella = producto.precios?.botella != null;

  // Si el producto tiene tapa y racion, default a 'racion'
  if (tieneTapa && tieneRacion) {
    return 'racion';
  }

  // Si tiene copa y botella, default a 'copa'
  if (tieneCopa && tieneBotella) {
    return 'copa';
  }

  // Si NO tiene ni tapa, ni racion, ni copa, ni botella, PERO sí tiene precioBase, default a 'precioBase'
  if (!tieneTapa && !tieneRacion && !tieneCopa && !tieneBotella && producto.precios?.precioBase != null) {
    return 'precioBase';
  }

  // Si no entró en casos anteriores, si tiene precioBase también lo toma como default
  if (producto.precios?.precioBase != null) {
    return 'precioBase';
  }

  if (tieneRacion) return 'racion';
  if (tieneTapa) return 'tapa';
  if (tieneCopa) return 'copa';
  if (tieneBotella) return 'botella';

  return null;
}


function obtenerPrecioUnitario(producto, tipoPrecio) {
  if (!tipoPrecio) return 0;

  if (tipoPrecio === 'precioBase' && producto.precioBase != null) {
    return producto.precioBase;
  }

  if (producto.precios && producto.precios[tipoPrecio] != null) {
    return producto.precios[tipoPrecio];
  }

  return 0;
}

export async function ejecutarAccionVoz(accion) {
  if (accion.accion === 'agregarProducto') {
    try {
      const resProducto = await api.get(`/productos/buscar/buscar?nombre=${encodeURIComponent(accion.producto)}`);
      const producto = resProducto.data;

      // Determinar el tipoPrecio definitivo:
      const tipoPrecio = determinarTipoPrecioDefault(producto, accion.tipoPrecio);

      // Obtener precio unitario:
      const precio = obtenerPrecioUnitario(producto, tipoPrecio);

      const cantidad = accion.cantidad || 1;
      const total = precio * cantidad;

      const body = {
        productos: [
          {
            producto: producto._id,
            cantidad,
            precioSeleccionado: precio,
            total,
            tipoPrecio: tipoPrecio || 'precioBase'
          }
        ]
      };

      // Elegir ruta según tipo producto
      const ruta = producto.tipo === 'bebida'
        ? `/pedidosBebidas/${accion.mesa}/agregar-producto`
        : `/pedidos/${accion.mesa}/agregar-producto`;

      const res = await api.post(ruta, body);
      return res.data;

    } catch (err) {
      console.error("❌ Error al enviar pedido:", err.response?.data || err.message);
      throw err;
    }
  }

  throw new Error('Acción no soportada');
}
