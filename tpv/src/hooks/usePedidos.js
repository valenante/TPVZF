import { useState } from "react";
import api from "../utils/api";

const usePedidosMesa = (mesa, setMesa) => {
  const [mensajeAlerta, setMensajeAlerta] = useState(null);

  const agregarProducto = async (productoPersonalizado) => {
    try {
      const esBebida = productoPersonalizado.tipo === "bebida";
      const ruta = esBebida
        ? `pedidosBebidas/${mesa._id}/agregar-producto`
        : `pedidos/${mesa._id}/agregar-producto`;

      const { data } = await api.post(ruta, {
        productos: {
          producto: productoPersonalizado._id,
          cantidad: productoPersonalizado.cantidad,
          total:
            productoPersonalizado.precioSeleccionado *
            productoPersonalizado.cantidad,
          precioSeleccionado: productoPersonalizado.precioSeleccionado,
          tipoPrecio: productoPersonalizado.tipoPrecio,
          tipoPlato: productoPersonalizado.tipoPlato || null,
          acompanante: productoPersonalizado.acompanante || null,
          tipo: productoPersonalizado.tipo,
          categoria: productoPersonalizado.categoria,
          ingredientes: productoPersonalizado.ingredientes || [],
          opcionesPersonalizables:
            productoPersonalizado.opciones &&
            Object.keys(productoPersonalizado.opciones).length > 0
              ? Object.entries(productoPersonalizado.opciones).map(
                  ([tipo, opcion]) => ({ tipo, opcion })
                )
              : [],
        },
      });

      setMesa((prevMesa) => ({
        ...prevMesa,
        pedidos: data.pedidos,
      }));

      setMensajeAlerta({
        tipo: "exito",
        mensaje: `Producto ${esBebida ? "bebida" : "plato"} agregado al pedido con éxito.`,
      });

      window.location.reload();
    } catch (error) {
      console.error("Error al agregar el producto al pedido:", error);
      setMensajeAlerta({
        tipo: "error",
        mensaje: error.response?.data?.error || "Hubo un problema.",
      });
    }
  };

  const eliminarProducto = (pedidoId, productoId) => {
    return async () => {
      try {
        const response = await api.post(`/productos/${pedidoId}/${productoId}`);
        setMesa((prevMesa) => ({
          ...prevMesa,
          pedidos: response.data.pedidos,
        }));

        setMensajeAlerta({
          tipo: "exito",
          mensaje: "Producto eliminado con éxito.",
        });

        window.location.reload();
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
        setMensajeAlerta({
          tipo: "error",
          mensaje: "Hubo un problema al eliminar el producto.",
        });
      }
    };
  };

  return {
    agregarProducto,
    eliminarProducto,
    mensajeAlerta,
    setMensajeAlerta,
  };
};

export default usePedidosMesa;
