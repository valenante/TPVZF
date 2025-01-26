import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client"; // Importar cliente de Socket.IO
import api from "../utils/api";
import MetodoPago from "../components/DetallesMesa/MetodoPago";
import RightBar from "../components/RightBar/RightBar";
import { jwtDecode } from "jwt-decode";
import "../styles/DetallesMesa.css";

const DetalleMesa = () => {
  const { id } = useParams(); // Obtener el `id` de la mesa desde la URL
  const [mesa, setMesa] = useState(null);
  const [productosDetalles, setProductosDetalles] = useState({});
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const socketRef = useRef(null); // Usar `useRef` para la instancia de `socket`

  useEffect(() => {
    const fetchMesa = async () => {
      try {
        const { data } = await api.get(`/mesas/${id}`);
        setMesa(data);

        const productIds = data.pedidos
          .flatMap((pedido) => pedido.productos.map((producto) => producto.productoId))
          .filter((value, index, self) => self.indexOf(value) === index);

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

    // Inicializar `socket` solo una vez
    if (!socketRef.current) {
      socketRef.current = io(process.env.REACT_APP_SOCKET_URL);

      // Escuchar el evento `nuevoPedido`
      socketRef.current.on("nuevoPedido", (pedidoActualizado) => {
        if (pedidoActualizado.mesaId === id) {
          setMesa((prevMesa) => ({
            ...prevMesa,
            pedidos: [...prevMesa.pedidos, pedidoActualizado],
          }));
        }
      });
    }

    // Limpiar la conexión de `socket` al desmontar el componente
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [id]); // Eliminar `socket` del arreglo de dependencias

  const cerrarMesa = async (metodoPago) => {
    try {
      const pedidosNoFinalizados = mesa.pedidos.filter((pedido) => pedido.estado !== "listo");

      if (pedidosNoFinalizados.length > 0) {
        alert("No puedes cerrar la mesa. Todos los pedidos deben estar finalizados.");
        return;
      }

      await api.put(`/mesas/${mesa._id}/cerrar`, {
        metodoPago,
      });
      alert("Mesa cerrada con éxito");
      setMesa(null);
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar la mesa:", error);
      alert(error.response?.data?.error || "Hubo un problema al cerrar la mesa.");
    }
  };

  const agregarProducto = async (productoPersonalizado) => {
    try {
      const { data } = await api.post(`pedidos/${mesa._id}/agregar-producto`, {
        productos: {
          producto: productoPersonalizado._id,
          cantidad: productoPersonalizado.cantidad,
          total: productoPersonalizado.precioSeleccionado * productoPersonalizado.cantidad,
          precioSeleccionado: productoPersonalizado.precioSeleccionado,
          tipo: productoPersonalizado.tipo,
          categoria: productoPersonalizado.categoria,
        },
      });

      setMesa((prevMesa) => ({
        ...prevMesa,
        pedidos: data.pedidos,
      }));

      alert("Producto agregado al pedido con éxito.");

      //Refrescar la pagina
      window.location.reload();
    } catch (error) {
      console.error("Error al agregar el producto al pedido:", error);
      alert("Hubo un problema al agregar el producto al pedido.");
    }
  };

  const eliminarProducto = async (pedidoId, productoId) => {
    try {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const usuarioId = decodedToken.id;

      const response = await api.delete(`/productos/${pedidoId}/${productoId}`, {
        data: { usuarioId },
      });

      setMesa((prevMesa) => ({
        ...prevMesa,
        pedidos: response.data.pedidos,
      }));

      alert("Producto eliminado con éxito.");
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      alert("Hubo un problema al eliminar el producto.");
    }
  };

  if (!mesa) {
    return <p>Cargando detalles de la mesa...</p>;
  }

  return (
    <div className="detalle-mesa--mesadetalles">
      <div className="contenido-mesa--mesadetalles">
        <h1 className="titulo-mesa--mesadetalles">Mesa {mesa.numero}</h1>
        <p className="total-mesa--mesadetalles">Total Actual: {mesa.total} €</p>
        <p className="pedidos-titulo--mesadetalles">Pedidos:</p>
        <ul className="lista-pedidos--mesadetalles">
          {mesa?.pedidos?.length > 0 ? (
            mesa.pedidos.map((pedido) => (
              <li key={pedido._id} className="pedido--mesadetalles">
                <p className="pedido-alergias--mesadetalles">Alergias: {pedido.alergias || "Sin especificar"}</p>
                <p className="pedido-estado--mesadetalles">{pedido.estado}</p>
                <p className="productos-titulo--mesadetalles">Productos:</p>
                <ul className="lista-productos--mesadetalles">
                  {pedido.productos?.length > 0 ? (
                    pedido.productos.map((producto) => {
                      const detalle = productosDetalles[producto.producto];
                      return (
                        <li key={producto.productoId} className="producto--mesadetalles">
                          {detalle
                            ? `${detalle.nombre} - ${producto.cantidad} unidad(es)`
                            : "Cargando producto..."}
                          <button
                            onClick={() => eliminarProducto(pedido._id, producto.producto)}
                            className="boton-eliminar--mesadetalles"
                          >
                            Eliminar
                          </button>
                        </li>
                      );
                    })
                  ) : (
                    <p className="sin-productos--mesadetalles">No hay productos en este pedido.</p>
                  )}
                </ul>
                <p className="total-pedido--mesadetalles">
                  Total Pedido: {pedido.total ? pedido.total.toFixed(2) : "0.00"} €
                </p>
              </li>
            ))
          ) : (
            <p className="sin-pedidos--mesadetalles">No hay pedidos disponibles.</p>
          )}
        </ul>
        <button onClick={() => setShowModal(true)} className="boton-cerrar--mesadetalles">
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
