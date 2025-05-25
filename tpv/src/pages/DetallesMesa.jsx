import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import MetodoPago from "../components/DetallesMesa/MetodoPago";
import RightBar from "../components/RightBar/RightBar";
import { SocketContext } from "../utils/socket";
import "../styles/DetallesMesa.css";
import AlertaMensaje from "../components/AlertaMensaje/AlertaMensaje";
import ModalTransferencia from "../components/Modal/ModalTransferencia";

const DetalleMesa = () => {
  const { id } = useParams(); // Obtener el `id` de la mesa desde la URL
  const [mesa, setMesa] = useState(null);
  const [productosDetalles, setProductosDetalles] = useState({});
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const [mostrarFacturaModal, setMostrarFacturaModal] = useState(false);
  const [datosFactura, setDatosFactura] = useState({ nombre: "", nif: "" });
  const [metodoPagoFactura, setMetodoPagoFactura] = useState(null);
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);
  const [accionModal, setAccionModal] = useState(null);
  const [mensajeAlerta, setMensajeAlerta] = useState(null);
  const [mostrarModalTransferir, setMostrarModalTransferir] = useState(false);

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

  useEffect(() => {
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

  const emitirFactura = async () => {
    const pedidosNoFinalizados = mesa.pedidos.filter(p => p.estado !== "listo");
    if (pedidosNoFinalizados.length > 0) {
      setMensajeAlerta({ tipo: "error", mensaje: "No puedes emitir la factura. Todos los pedidos deben estar finalizados." });
      return;
    }

    await cerrarMesa(metodoPagoFactura, 'nominativa');
  };

  const enviarAFacturaPrinter = async (datosImpresion) => {
    try {
      await api.post(`/imprimir/${mesa._id}/imprimir-factura`, datosImpresion);
    } catch (error) {
      console.error('Error al imprimir la factura:', error);
    }
  };

  const cerrarMesa = async (metodoPago) => {
    try {
      const response = await api.put(`/mesas/${mesa._id}/cerrar`, {
        metodoPago,
        clienteNombre: datosFactura.nombre,
        clienteNIF: datosFactura.nif
      });

      const { datosImpresion } = response.data;

      if (datosImpresion) {
        await enviarAFacturaPrinter(datosImpresion);
      }

      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  const imprimirCuenta = async () => {
    try {
      await api.post(`/cuenta/${mesa._id}/imprimir-cuenta`);
      setMensajeAlerta({ tipo: "exito", mensaje: "Cuenta enviada a impresión." });
    } catch (error) {
      setMensajeAlerta({ tipo: "error", mensaje: error.response?.data?.error || "Hubo un problema." });
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

      setMensajeAlerta({ tipo: "exito", mensaje: `Producto ${esBebida ? "bebida" : "plato"} agregado al pedido con éxito.` });

      // Refrescar la página
      window.location.reload();
    } catch (error) {
      console.error("Error al agregar el producto al pedido:", error);
      setMensajeAlerta({ tipo: "error", mensaje: error.response?.data?.error || "Hubo un problema." });
    }
  };

  const eliminarProducto = (pedidoId, productoId) => {
    setAccionModal({
      titulo: "Confirmar Eliminación",
      mensaje: "¿Estás seguro de que quieres eliminar este producto del pedido?",
      onConfirm: async () => {
        try {
          const response = await api.post(`/productos/${pedidoId}/${productoId}`);
          setMesa((prevMesa) => ({
            ...prevMesa,
            pedidos: response.data.pedidos,
          }));
          setMensajeAlerta({ tipo: "exito", mensaje: "Producto eliminado con éxito." });
          window.location.reload();
        } catch (error) {
          console.error("Error al eliminar el producto:", error);
          setMensajeAlerta({ tipo: "error", mensaje: "Hubo un problema al eliminar el producto." });
        }
      },
    });

    console.log("Mostrando modal de confirmación para eliminar producto");

    setMostrarModalConfirmacion(true);
  };

  // ⛔ AÑADE ESTO AQUÍ ANTES DEL RETURN
  if (!mesa) {
    return (
      <p className="cargando--mesadetalles">Cargando detalles de la mesa...</p>
    );
  }

  return (
    <div className="detalle-mesa--mesadetalles">
      <div className="rightbar--mesadetalles">
        <RightBar mesaId={mesa._id} agregarProducto={agregarProducto} />
      </div>
      <div className="contenido-mesa--mesadetalles">
        {mostrarFacturaModal && (
          <div className="modal-factura">
            <div className="modal-contenido">
              <h2>Datos de la Factura</h2>
              <input
                type="text"
                placeholder="Nombre o Razón Social"
                value={datosFactura.nombre}
                onChange={(e) =>
                  setDatosFactura({ ...datosFactura, nombre: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="NIF o CIF"
                value={datosFactura.nif}
                onChange={(e) =>
                  setDatosFactura({ ...datosFactura, nif: e.target.value })
                }
              />
              <button onClick={() => emitirFactura()}>Emitir Factura</button>
              <button onClick={() => setMostrarFacturaModal(false)}>Cancelar</button>
            </div>
          </div>
        )}
        <h1 className="titulo-mesa--mesadetalles">Mesa {mesa.numero}</h1>
        <p className="total-mesa--mesadetalles">Total: {mesa.total} €</p>
        <ul className="lista-pedidos--mesadetalles">
          {mesa?.pedidos?.length > 0 ? (
            mesa.pedidos.map((pedido) => (
              <li key={pedido._id} className="pedido--mesadetalles">
                <ul className="lista-productos--mesadetalles">
                  {pedido.productos?.length > 0 ? (
                    pedido.productos.map((producto) => {
                      const detalle = productosDetalles[producto.producto];
                      return (
                        <li
                          key={producto.productoId}
                          className={`producto--mesadetalles ${producto.estadoPreparacion === "listo"
                            ? "producto-listo"
                            : ""
                            }`}
                        >
                          {detalle
                            ? `${producto.cantidad} ${detalle.nombre}  `
                            : "Cargando producto..."}
                          <button
                            onClick={() =>
                              eliminarProducto(pedido._id, producto.producto?._id || producto.producto)}
                            className="boton-eliminar--mesadetalles"
                          >
                            x
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
              </li>
            ))
          ) : (
            <p className="sin-pedidos--mesadetalles">
              No hay pedidos disponibles.
            </p>
          )}
        </ul>
        <ul className="lista-pedidos--mesadetalles">
          {mesa?.pedidosBebidas?.length > 0 ? (
            mesa.pedidosBebidas.map((pedido) => (
              <li key={pedido._id} className="pedido--mesadetalles">
                <ul className="lista-productos--mesadetalles">
                  {pedido.productos?.length > 0 ? (
                    pedido.productos.map((producto) => {
                      return (
                        <li
                          key={producto.producto._id}
                          className={`producto--mesadetalles ${producto.estadoPreparacion === "listo"
                            ? "producto-listo"
                            : ""
                            }`}
                        >
                          {producto.producto
                            ? `${producto.cantidad} ${producto.producto.nombre}   `
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
                            x
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
              </li>
            ))
          ) : (
            <p className="sin-pedidos--mesadetalles">
              No hay pedidos de bebidas disponibles.
            </p>
          )}
        </ul>



        {mesa.estado === "abierta" && (
          <button
            onClick={() => setShowModal("cierre")}
            className="boton-cerrar--mesadetalles"
          >
            Cerrar Mesa
          </button>
        )}
        {mesa.estado === "abierta" && (
          <div className="contenedor-botones--mesadetalles">
            <button onClick={imprimirCuenta} className="boton-imprimir--mesadetalles">
              Cuenta
            </button>
            <button onClick={() => setShowModal("factura")} className="boton-factura--mesadetalles">
              Factura
            </button>
            <button onClick={() => setMostrarModalTransferir(true)} className="boton-factura--mesadetalles">
              Transferir Artículos
            </button>
          </div>
        )}



        {(showModal === "cierre" || showModal === "factura") && (
          <MetodoPago
            total={mesa.total}
            onClose={() => setShowModal(false)}
            onConfirm={(metodoPago) => {
              if (showModal === "factura") {
                setMetodoPagoFactura(metodoPago);
                setShowModal(false);
                setMostrarFacturaModal(true);  // Abre el modal de datos fiscales
              } else {
                cerrarMesa(metodoPago, 'simplificada');        // Cierra sin factura
              }
            }}
          />
        )}
      </div>
      {mensajeAlerta && (
        <AlertaMensaje
          tipo={mensajeAlerta.tipo}
          mensaje={mensajeAlerta.mensaje}
          onClose={() => setMensajeAlerta(null)}
        />
      )}

      {mostrarModalTransferir && (
        <ModalTransferencia
          mesaOrigen={mesa}
          onClose={() => setMostrarModalTransferir(false)}
          onTransferSuccess={() => {
            setMostrarModalTransferir(false);
            fetchMesa(); // Refresca la mesa después de transferir
          }}
        />
      )}
    </div>
  );
};

export default DetalleMesa;
