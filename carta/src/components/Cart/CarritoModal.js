import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductosContext } from "../../context/ProductosContext";
import { useComensal } from "../../context/ComensalesContext"; // 👈 Importar el hook
import api from "../../utils/api";
import AlertaMensaje from "../AlertaMensaje/AlertaMensaje";
import "../../styles/CarritoModal.css";

const CarritoModal = ({ cerrarModal }) => {
  const { carrito, cargarCarrito, mesaId, obtenerMesaId } =
    useContext(ProductosContext);
  const [searchParams] = useSearchParams();
  const numeroMesa = searchParams.get("mesa");
  const { comensal } = useComensal();
  const { comensales, alergias } = comensal;
  const [mensajeAlerta, setMensajeAlerta] = useState(null);

  useEffect(() => {
    // Aquí estamos llamando a la función para obtener el ID de la mesa (asumiendo que la mesa es la 1, o puedes pasar otro número de mesa)
    obtenerMesaId(numeroMesa);
  }, [obtenerMesaId, numeroMesa]);

  const esLider = async () => {
    try {
      const tokenLocal = localStorage.getItem("tokenLider");
      const response = await api.get(
        `/mesas/token-lider/token-lider/check/${mesaId}`
      );
      const tokenLider = response.data.tokenLider;
      return tokenLocal === tokenLider; // Retorna true si es líder
    } catch (error) {
      console.error("Error al verificar el tokenLider:", error);
      return false; // Asume que no es líder si ocurre un error
    }
  };

  const eliminarProducto = async (itemId) => {
    if (!(await esLider())) {
      setMensajeAlerta({ tipo: "error", mensaje: "Solo el líder puede eliminar productos del carrito." });
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

  const enviarPedidoAImpresora = async (mesaNumero, comensales, productos, total, tipo = 'platos') => {
    const rutaBackend = tipo === 'bebidas'
      ? '/imprimir/imprimir-bebidas'
      : '/imprimir/imprimir';

    try {
      await api.post(rutaBackend, {
        mesaNumero,
        comensales,
        productos,
        total,
      });
    } catch (error) {
      console.error(`Error al imprimir el pedido de ${tipo}:`, error.message);
    }
  };

  const enviarPedido = async () => {
    if (!(await esLider())) {
      setMensajeAlerta({ tipo: "error", mensaje: "Solo el líder puede enviar el pedido." });
      return;
    }

    try {
      const carritoId = localStorage.getItem(`carritoMongoId-${numeroMesa}`);

      // Separar productos en platos y bebidas
      const productosPlatos = [];
      const productosBebidas = [];

      carrito.items.forEach((item) => {
        const productoData = {
          producto: item.productId._id,
          nombre: item.productId.nombre,
          tipo: item.productId.tipo,
          categoria: item.productId.categoria,
          ingredientesEliminados: item.ingredientes,
          cantidad: item.cantidad,
          precioSeleccionado: item.precioSeleccionado,
          tipoPrecio: item.tipoPrecio,
          total: (item.precioSeleccionado || item.productId.precios.precioBase) * item.cantidad,
          precios: item.productId.precios,
          nombreComensal: item.nombre,
          alergiasComensal: item.alergias,
          acompanante: item.acompanante,
          adicionales: item.adicionales,
        };

        if (item.productId.tipo === "bebida") {
          productoData.tipoPedido = item.tipoPedido;
          productosBebidas.push(productoData);
        } else {
          productoData.tipoPlato = item.tipoPlato;
          productosPlatos.push(productoData);
        }
      });

      // Crear pedidos separados si hay productos de ambos tipos
      if (productosPlatos.length > 0) {
        const pedidoPlatos = {
          mesa: mesaId,
          cartId: carritoId,
          productos: productosPlatos,
          total: productosPlatos.reduce((total, item) => total + item.total, 0),
          comensales,
        };
        await api.post("/pedidos", pedidoPlatos);

        await enviarPedidoAImpresora(
          numeroMesa,
          comensales,
          productosPlatos.map(p => ({
            nombre: p.nombre,
            cantidad: p.cantidad,
            opcionesPersonalizables: p.opcionesPersonalizables,
            alergiasComensal: p.alergiasComensal,
            tipoPrecio: p.tipoPrecio,
            seccion: p.seccion,
          })),
          pedidoPlatos.total,
          'platos'
        );
      }

      if (productosBebidas.length > 0) {
        const pedidoBebidas = {
          mesa: mesaId,
          cartId: carritoId,
          productos: productosBebidas,
          total: productosBebidas.reduce((total, item) => total + item.total, 0),
          comensales,
        };
        await api.post("/pedidosBebidas", pedidoBebidas);

        await enviarPedidoAImpresora(
          numeroMesa,
          comensales,
          productosBebidas.map(p => ({
            nombre: p.nombre,
            cantidad: p.cantidad,
            opcionesPersonalizables: p.opcionesPersonalizables,
            alergiasComensal: p.alergiasComensal,
            tipoPrecio: p.tipoPrecio,
            seccion: p.seccion,
          })),
          pedidoBebidas.total,
          'bebidas'
        );
      }
      //Eliminar el carrito
      await api.delete(`/cart/${carritoId}`, {
        headers: { "X-Cart-ID": carritoId },
      });

      localStorage.removeItem(`carritoMongoId-${numeroMesa}`);

      cargarCarrito();
      cerrarModal();
    } catch (error) {
      console.error("Error al enviar el pedido:", error);
    }
  };

  const calcularTotal = () => {
    return carrito.items
      ?.reduce((total, item) => {
        const precioBase =
          item.precioSeleccionado || item.productId.precios.precioBase;

        // Sumar los precios de los adicionales seleccionados
        const totalAdicionales = (item.adicionales || []).reduce(
          (acc, adicional) => acc + (adicional.precio || 0),
          0
        );

        const precioFinalUnitario = precioBase + totalAdicionales;

        return total + precioFinalUnitario * item.cantidad;
      }, 0)
      .toFixed(2);
  };

  const renderizarItems = () => {
    const itemsAgrupados = [];

    carrito.items?.forEach((item) => {
      const opciones = JSON.stringify(item.opciones); // Convertimos las opciones a una cadena
      const ingredientesEliminados = JSON.stringify(item.ingredientes); // Convertimos los ingredientes eliminados a una cadena

      // Verifica si ya existe una entrada con la misma combinación de opciones e ingredientes eliminados
      const key = `${item.productId._id}-${opciones}-${ingredientesEliminados}`;
      const itemExistente = itemsAgrupados.find((i) => i.key === key);

      if (itemExistente) {
        itemExistente.cantidad += item.cantidad; // Sumar cantidades si ya existe la combinación
      } else {
        itemsAgrupados.push({
          key,
          item,
        });
      }
    });

    return itemsAgrupados.map(({ key, item }) => (
      <li key={key} className="modal-item-carritoModal">
        {item.nombre?.length > 0 && (
          <h3 className="item-name-carritoModal">{item.nombre}</h3>
        )}
        <h3 className="item-title-carritoModal">{item.productId.nombre}</h3>
        {item.ingredientes?.length > 0 && (
          <p className="item-details-carritoModal">
            Sin {item.ingredientes.join(", ")}
          </p>
        )}
        {item.opciones && Object.entries(item.opciones).length > 0 && (
          <p className="item-details-carritoModal">
            {" "}
            {Object.entries(item.opciones || {})
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ")}
          </p>
        )}
        <p className="item-details-carritoModal">
          Precio:{" "}
          {(
            item.precioSeleccionado || item.productId.precios.precioBase
          ).toFixed(2)}{" "}
          €
        </p>
        <p className="item-details-carritoModal">Cantidad: {item.cantidad}</p>
        <button
          className="btn-delete-carritoModal"
          onClick={() => eliminarProducto(item._id)}
        >
          Eliminar
        </button>
      </li>
    ));
  };

  return (
    <div
      className="modal-overlay-carritoModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-carrito"
    >
      <div className="modal-content-carritoModal">
        <button className="modal-close-carritoModal" onClick={cerrarModal}>
          ✖
        </button>
        <ul className="modal-items-carritoModal">{renderizarItems()}</ul>
        <h3 className="total-carritoModal">Total: {calcularTotal()} €</h3>
        <button onClick={enviarPedido} className="btn-submit-carritoModal">
          Enviar Pedido
        </button>
      </div>
      {mensajeAlerta && (
        <AlertaMensaje
          tipo={mensajeAlerta.tipo}
          mensaje={mensajeAlerta.mensaje}
          onClose={() => setMensajeAlerta(null)}
        />
      )}
    </div>
  );
};

export default CarritoModal;
