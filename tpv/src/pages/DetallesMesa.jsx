import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import MetodoPago from "../components/DetallesMesa/MetodoPago";
import RightBar from "../components/RightBar/RightBar";
import { SocketContext } from "../utils/socket";
import "../styles/DetallesMesa.css";

const DetalleMesa = () => {
  const { id } = useParams(); // Obtener el `id` de la mesa desde la URL
  const [mesa, setMesa] = useState(null);
  const [productosDetalles, setProductosDetalles] = useState({});
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    const fetchMesa = async () => {
      try {
        const { data } = await api.get(`/mesas/${id}`);
        setMesa(data);

        // Obtener IDs de pedidos de bebidas
        const pedidosBebidasIds = data.pedidosBebidas || [];

        // Si hay pedidos de bebidas, obtener detalles
        let pedidosBebidasDetalles = [];
        if (pedidosBebidasIds.length > 0) {
          const { data: pedidosBebidasData } = await api.get(
            `/pedidosBebidas`,
            {
              params: { ids: pedidosBebidasIds.join(",") },
            }
          );
          pedidosBebidasDetalles = pedidosBebidasData;
        }

        // Asignar los pedidos de bebidas con detalles a la mesa
        setMesa((prevMesa) => ({
          ...prevMesa,
          pedidosBebidas: pedidosBebidasDetalles,
        }));

        // Obtener productos únicos de pedidos y pedidosBebidas
        const productIds = [
          ...new Set([
            ...data.pedidos.flatMap((pedido) =>
              pedido.productos.map((p) => p.productoId)
            ),
            ...pedidosBebidasDetalles.flatMap((pedido) =>
              pedido.productos.map((p) => p.productoId)
            ),
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

    fetchMesa();
  }, [id]);

  // 🟩 2. Escuchar evento nuevoPedido con socket
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

  const cerrarMesa = async (metodoPago) => {
    try {
      // Verifica si hay pedidos no finalizados
      const pedidosNoFinalizados = mesa.pedidos.filter(
        (pedido) => pedido.estado !== "listo"
      );

      if (pedidosNoFinalizados.length > 0) {
        alert(
          "No puedes cerrar la mesa. Todos los pedidos deben estar finalizados."
        );
        return;
      }

      // Enviar la solicitud al backend con el método de pago
      await api.put(`/mesas/${mesa._id}/cerrar`, { metodoPago });

      alert("Mesa cerrada con éxito");
      setMesa(null); // Limpia el estado de la mesa
      navigate("/"); // Navega fuera de la vista actual
    } catch (error) {
      console.error("Error al cerrar la mesa:", error);
      alert(
        error.response?.data?.error || "Hubo un problema al cerrar la mesa."
      );
    }
  };

  const agregarProducto = async (productoPersonalizado) => {
    try {
      // Determinar si el producto es una bebida o un plato
      const esBebida = productoPersonalizado.tipo === "bebida";

      // Definir la ruta dependiendo del tipo
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
          tipoPrecio: productoPersonalizado.tipoPrecio, // ✅ obligatorio
          tipoPlato: productoPersonalizado.tipoPlato || null, // opcional, depende del producto
          acompanante: productoPersonalizado.acompanante || null, // opcional
          tipo: productoPersonalizado.tipo,
          categoria: productoPersonalizado.categoria,
          ingredientes: productoPersonalizado.ingredientes || [],
          opcionesPersonalizables:
            productoPersonalizado.opciones &&
            Object.keys(productoPersonalizado.opciones).length > 0
              ? Object.entries(productoPersonalizado.opciones).map(
                  ([tipo, opcion]) => ({
                    tipo,
                    opcion,
                  })
                )
              : [],
        },
      });

      setMesa((prevMesa) => ({
        ...prevMesa,
        pedidos: data.pedidos,
      }));

      alert(
        `Producto ${
          esBebida ? "bebida" : "plato"
        } agregado al pedido con éxito.`
      );

      // Refrescar la página
      window.location.reload();
    } catch (error) {
      console.error("Error al agregar el producto al pedido:", error);
      alert("Hubo un problema al agregar el producto al pedido.");
    }
  };

  const eliminarProducto = async (pedidoId, productoId) => {
    const confirmacion = window.confirm(
      "¿Estás seguro de que quieres eliminar este producto del pedido?"
    );
    if (!confirmacion) return;

    try {
      const response = await api.post(`/productos/${pedidoId}/${productoId}`);

      setMesa((prevMesa) => ({
        ...prevMesa,
        pedidos: response.data.pedidos,
      }));

      alert("Producto eliminado con éxito.");
      window.location.reload();
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      alert("Hubo un problema al eliminar el producto.");
    }
  };

  // ⛔ AÑADE ESTO AQUÍ ANTES DEL RETURN
  if (!mesa) {
    return (
      <p className="cargando--mesadetalles">Cargando detalles de la mesa...</p>
    );
  }

  return (
    <div className="detalle-mesa--mesadetalles">
      <div className="contenido-mesa--mesadetalles">
        <h1 className="titulo-mesa--mesadetalles">Mesa {mesa.numero}</h1>
        <p className="total-mesa--mesadetalles">Total Mesa: {mesa.total} €</p>
        <p className="pedidos-titulo--mesadetalles">Pedidos:</p>
        <ul className="lista-pedidos--mesadetalles">
          {mesa?.pedidos?.length > 0 ? (
            mesa.pedidos.map((pedido) => (
              <li key={pedido._id} className="pedido--mesadetalles">
                <p className="pedido-estado--mesadetalles">{pedido.estado}</p>
                <ul className="lista-productos--mesadetalles">
                  {pedido.productos?.length > 0 ? (
                    pedido.productos.map((producto) => {
                      const detalle = productosDetalles[producto.producto];
                      return (
                        <li
                          key={producto.productoId}
                          className={`producto--mesadetalles ${
                            producto.estadoPreparacion === "listo"
                              ? "producto-listo"
                              : ""
                          }`}
                        >
                          {detalle
                            ? `${detalle.nombre} - ${producto.cantidad} unidad(es)`
                            : "Cargando producto..."}
                          <button
                            onClick={() =>
                              eliminarProducto(pedido._id, producto.producto)
                            }
                            className="boton-eliminar--mesadetalles"
                          >
                            Eliminar
                          </button>
                        </li>
                      );
                    })
                  ) : (
                    <p className="sin-productos--mesadetalles">
                      No hay productos en este pedido.
                    </p>
                  )}
                </ul>
                <p className="total-pedido--mesadetalles">
                  Total Pedido:{" "}
                  {pedido.total ? pedido.total.toFixed(2) : "0.00"} €
                </p>
              </li>
            ))
          ) : (
            <p className="sin-pedidos--mesadetalles">
              No hay pedidos disponibles.
            </p>
          )}
        </ul>

        <p className="pedidos-titulo--mesadetalles">Bebidas:</p>
        <ul className="lista-pedidos--mesadetalles">
          {mesa?.pedidosBebidas?.length > 0 ? (
            mesa.pedidosBebidas.map((pedido) => (
              <li key={pedido._id} className="pedido--mesadetalles">
                <p className="pedido-estado--mesadetalles">{pedido.estado}</p>
                <ul className="lista-productos--mesadetalles">
                  {pedido.productos?.length > 0 ? (
                    pedido.productos.map((producto) => {
                      return (
                        <li
                          key={producto.producto._id}
                          className={`producto--mesadetalles ${
                            producto.estadoPreparacion === "listo"
                              ? "producto-listo"
                              : ""
                          }`}
                        >
                          {producto.producto
                            ? `${producto.producto.nombre} - ${producto.cantidad} unidad(es)`
                            : "Cargando bebida..."}
                          <button
                            onClick={() =>
                              eliminarProducto(
                                pedido._id,
                                producto.producto._id
                              )
                            }
                            className="boton-eliminar--mesadetalles"
                          >
                            Eliminar
                          </button>
                        </li>
                      );
                    })
                  ) : (
                    <p className="sin-productos--mesadetalles">
                      No hay bebidas en este pedido.
                    </p>
                  )}
                </ul>
                <p className="total-pedido--mesadetalles">
                  Total Pedido:{" "}
                  {pedido.total ? pedido.total.toFixed(2) : "0.00"} €
                </p>
              </li>
            ))
          ) : (
            <p className="sin-pedidos--mesadetalles">
              No hay pedidos de bebidas disponibles.
            </p>
          )}
        </ul>

        <button
          onClick={() => setShowModal(true)}
          className="boton-cerrar--mesadetalles"
        >
          Cerrar Mesa
        </button>
        {showModal && (
          <MetodoPago
            total={mesa.total}
            onClose={() => setShowModal(false)}
            onConfirm={(metodoPago) => {
              cerrarMesa(metodoPago);
            }}
          />
        )}
      </div>
      <div className="rightbar--mesadetalles">
        <RightBar mesaId={mesa._id} agregarProducto={agregarProducto} />
      </div>
    </div>
  );
};

export default DetalleMesa;
