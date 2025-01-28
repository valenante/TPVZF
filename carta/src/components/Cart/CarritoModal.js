import React, { useContext } from 'react';
import { ProductosContext } from '../../context/ProductosContext';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import '../../styles/CarritoModal.css';

const CarritoModal = ({ cerrarModal }) => {
  const { carrito, cargarCarrito, mesaId } = useContext(ProductosContext);
  const [searchParams] = useSearchParams();

  console.log(carrito);

  const comensales = searchParams.get("comensales"); // Obtener el nombre desde la URL
  const alergias = searchParams.get("alergias"); // Obtener el nombre desde la URL

  const esLider = async () => {
    try {
      const tokenLocal = localStorage.getItem("tokenLider");
      const response = await api.get(`/mesas/token-lider/token-lider/check/${mesaId}`);
      const tokenLider = response.data.tokenLider;
      return tokenLocal === tokenLider; // Retorna true si es líder
    } catch (error) {
      console.error("Error al verificar el tokenLider:", error);
      return false; // Asume que no es líder si ocurre un error
    }
  };

  const eliminarProducto = async (itemId) => {
    if (!(await esLider())) {
      alert("Solo el líder puede eliminar productos del carrito.");
      return;
    }

    try {
      const cartId = carrito._id;
      if (!cartId) {
        console.error("No se encontró el identificador del carrito.");
        return;
      }

      const response = await api.delete(`/cart/${itemId}`, {
        headers: { "X-Cart-ID": cartId },
      });

      const { carritoEliminado } = response.data;

      if (carritoEliminado) {
        localStorage.removeItem("carritoMongoId");
      } else {
        cargarCarrito();
      }
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
    }
  };

  const enviarPedido = async () => {
    if (!(await esLider())) {
      alert("Solo el líder puede enviar el pedido.");
      return;
    }

    try {
      const carritoId = localStorage.getItem("carritoMongoId");

      const pedido = {
        mesa: mesaId,
        cartId: carritoId,
        productos: carrito.items.map((item) => ({
          producto: item.productId._id,
          nombre: item.productId.nombre,
          tipo: item.productId.tipo,
          categoria: item.productId.categoria,
          cantidad: item.cantidad,
          precioSeleccionado: item.precioSeleccionado,
          total: (item.precioSeleccionado || item.productId.precios.precioBase) * item.cantidad, // Usar precio seleccionado o precio base
          precios: item.productId.precios,
          ingredientesEliminados: item.ingredientesEliminados || [],
          especificaciones: item.especificaciones || [],
        })),
        total: carrito.items.reduce((total, item) => {
          const precio = item.precioSeleccionado || item.productId.precios.precioBase; // Usar precio seleccionado o precio base
          return total + precio * item.cantidad;
        }, 0),
        comensales,
        alergias,
      };

      const response = await api.post("/pedidos", pedido);

      localStorage.removeItem("carritoMongoId");
      cargarCarrito();
      cerrarModal();
    } catch (error) {
      console.error("Error al enviar el pedido:", error);
    }
  };

  const calcularTotal = () => {
    return carrito.items?.reduce((total, item) => {
      const precio = item.precioSeleccionado || item.productId.precios.precioBase; // Usar precio seleccionado o precio base
      return total + precio * item.cantidad;
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
              {item.nombre?.length > 0 && <h3 className="item-name-carritoModal">{item.nombre}</h3>}
              <h3 className="item-title-carritoModal">{item.productId.nombre}</h3>
              {item.ingredientes?.length > 0 && (
                <p className="item-details-carritoModal">Sin {item.ingredientes.join(", ")}</p>
              )}
              {item.opciones && Object.keys(item.opciones).length > 0 && (
                <p className="item-details-carritoModal">
                  Opciones:{" "}
                  {Object.entries(item.opciones)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(", ")}
                </p>
              )}
              <p className="item-details-carritoModal">
                Precio:{" "}
                {(item.precioSeleccionado || item.productId.precios.precioBase).toFixed(2)} €
              </p>
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
