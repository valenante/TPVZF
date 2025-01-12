import React, { useContext } from 'react';
import { ProductosContext } from '../../context/ProductosContext';
import api from '../../utils/api';
import '../../styles/CarritoModal.css';

const CarritoModal = ({ cerrarModal }) => {
  const { carrito, cargarCarrito, mesaId } = useContext(ProductosContext);

  const eliminarProducto = async (itemId) => {
    try {
      const cartId = carrito._id;
      if (!cartId) {
        console.error('No se encontró el identificador del carrito.');
        return;
      }

      const response = await api.delete(`/cart/${itemId}`, {
        headers: { 'X-Cart-ID': cartId },
      });

      const { carritoEliminado } = response.data;

      if (carritoEliminado) {
        // Si el carrito fue eliminado, limpiar el localStorage
        localStorage.removeItem('carritoMongoId');
      } else {
        // Recargar el carrito después de eliminar
        cargarCarrito();
      }
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
    }
  };


  const enviarPedido = async () => {
    try {
      const carritoId = localStorage.getItem('carritoMongoId');
  
      // Datos para el pedido
      const pedido = {
        mesa: mesaId, // Reemplaza esto con el ID de la mesa
        cartId: carritoId,
        productos: carrito.items.map((item) => ({
          producto: item.productId._id, // Referencia al producto original
          nombre: item.productId.nombre, // Nombre del producto
          tipo: item.productId.tipo, // Tipo (plato, bebida)
          categoria: item.productId.categoria, // Categoría del producto
          cantidad: item.cantidad, // Cantidad pedida
          total: item.productId.precios.precioBase * item.cantidad, // Total del producto
          precios: item.productId.precios, // Detalle de precios
          ingredientesEliminados: item.ingredientesEliminados || [], // Ingredientes eliminados
          especificaciones: item.especificaciones || [], // Especificaciones adicionales
        })),
        total: carrito.items.reduce((total, item) => {
          const precioBase = item.productId.precios.precioBase;
          return total + precioBase * item.cantidad;
        }, 0),
        comensales: 2, // Ejemplo: Número de personas
        alergias: carrito.alergias || '', // Información de alergias (opcional)
      };
  
      // Enviar el pedido al servidor
      const response = await api.post('/pedidos', pedido);
  
      // Limpiar el carrito y cerrar el modal
      localStorage.removeItem('carritoMongoId');
      cargarCarrito();
      cerrarModal();
    } catch (error) {
      console.error('Error al enviar el pedido:', error);
    }
  };

  const calcularTotal = () => {
    return carrito.items?.reduce((total, item) => {
      const producto = item.productId; // Asegúrate de que `productId` esté populado con detalles
      return total + (producto.precios.precioBase * item.cantidad);
    }, 0).toFixed(2);
  };

  return (
    <div className="modal-overlay-carritoModal">
      <div className="modal-content-carritoModal">
        <button className="modal-close-carritoModal" onClick={cerrarModal}>
          ✖
        </button>
        <ul className="modal-items-carritoModal">
          {carrito.items?.map((item) => (
            <li key={item._id} className="modal-item-carritoModal">
              <h3 className="item-title-carritoModal">{item.productId.nombre}</h3>

              {/* Mostrar "Sin" solo si hay ingredientes */}
              {item.ingredientes?.length > 0 && (
                <p className="item-details-carritoModal">Sin {item.ingredientes.join(', ')}</p>
              )}

              {/* Mostrar opciones solo si hay alguna */}
              {item.opciones && Object.keys(item.opciones).length > 0 && (
                <p className="item-details-carritoModal">
                  Opciones:{' '}
                  {Object.entries(item.opciones)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(', ')}
                </p>
              )}

              <p className="item-details-carritoModal">Cantidad: {item.cantidad}</p>
              <button className="btn-delete-carritoModal" onClick={() => eliminarProducto(item._id)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
        <h3 className="total-carritoModal">Total: {calcularTotal()} €</h3>
        <button onClick={enviarPedido} className="btn-submit-carritoModal">
          Enviar Pedido
        </button>
      </div>
    </div>

  );
};

export default CarritoModal;
