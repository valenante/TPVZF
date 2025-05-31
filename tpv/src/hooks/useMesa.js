import { useState, useEffect } from "react";
import api from "../utils/api";

const useMesa = (id, socket) => {
  const [mesa, setMesa] = useState(null);
  const [productosDetalles, setProductosDetalles] = useState({});

  const fetchMesa = async () => {
    try {
      const { data } = await api.get(`/mesas/${id}`);
      setMesa(data);

      const pedidosBebidasIds = data.pedidosBebidas || [];

      let pedidosBebidasDetalles = [];
      if (pedidosBebidasIds.length > 0) {
        const { data: pedidosBebidasData } = await api.get(`/pedidosBebidas`, {
          params: { ids: pedidosBebidasIds.join(",") },
        });
        pedidosBebidasDetalles = pedidosBebidasData;
      }

      setMesa((prevMesa) => ({
        ...prevMesa,
        pedidosBebidas: pedidosBebidasDetalles,
      }));

      const productIds = [
        ...new Set([
          ...data.pedidos.flatMap((pedido) => pedido.productos.map((p) => p.productoId)),
          ...pedidosBebidasDetalles.flatMap((pedido) => pedido.productos.map((p) => p.productoId)),
        ]),
      ];

      if (productIds.length > 0) {
        const { data: productosData } = await api.get(`/productos`, {
          params: { ids: productIds.join(",") },
        });

        const productosMap = productosData.reduce((acc, producto) => {
          acc[producto._id] = producto;
          return acc;
        }, {});

        setProductosDetalles(productosMap);
      }
    } catch (error) {
      console.error("Error al obtener los detalles de la mesa:", error);
    }
  };

  useEffect(() => {
    fetchMesa();
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    const manejarNuevoPedido = (pedidoActualizado) => {
      if (pedidoActualizado.mesaId === id) {
        setMesa((prevMesa) => ({
          ...prevMesa,
          pedidos: [...prevMesa.pedidos, pedidoActualizado],
        }));
      }
    };

    socket.on("nuevoPedido", manejarNuevoPedido);

    return () => {
      socket.off("nuevoPedido", manejarNuevoPedido);
    };
  }, [socket, id]);

  return { mesa, setMesa, productosDetalles, fetchMesa };
};

export default useMesa;