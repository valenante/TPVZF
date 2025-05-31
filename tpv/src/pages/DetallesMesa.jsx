import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MetodoPago from "../components/DetallesMesa/MetodoPago";
import RightBar from "../components/RightBar/RightBar";
import { SocketContext } from "../utils/socket";
import useMesa from "../hooks/useMesa";
import usePedidos from "../hooks/usePedidos";
import useAccionesMesa from "../hooks/useAccionesMesa";
import "../styles/DetallesMesa.css";
import AlertaMensaje from "../components/AlertaMensaje/AlertaMensaje";
import ModalTransferencia from "../components/Modal/ModalTransferencia";
import ListaPedidos from "../components/DetallesMesa/ListaPedidos";
import ListaBebidas from "../components/DetallesMesa/ListaBebidas";

const DetalleMesa = () => {
  const { id } = useParams(); // Obtener el `id` de la mesa desde la URL  
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const { mesa, setMesa, productosDetalles, fetchMesa } = useMesa(id, socket);
  const {
    agregarProducto,
    eliminarProducto,
    mensajeAlerta,
    setMensajeAlerta,
  } = usePedidos(mesa, setMesa);
  const [datosFactura, setDatosFactura] = useState({ nombre: "", nif: "" });
  const {
    cerrarMesa,
    emitirFactura,
    imprimirCuenta,
  } = useAccionesMesa(mesa, setMensajeAlerta, navigate, datosFactura);
  const [showModal, setShowModal] = useState(false);
  const [mostrarFacturaModal, setMostrarFacturaModal] = useState(false);
  const [metodoPagoFactura, setMetodoPagoFactura] = useState(null);
  useState(false);
  const [mostrarModalTransferir, setMostrarModalTransferir] = useState(false);

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
              <button onClick={() => emitirFactura(metodoPagoFactura)}>Emitir Factura</button>
              <button onClick={() => setMostrarFacturaModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}
        <h1 className="titulo-mesa--mesadetalles">Mesa {mesa.numero}</h1>
        <p className="total-mesa--mesadetalles">Total: {mesa.total} €</p>
        <ListaPedidos
          pedidos={mesa.pedidos}
          productosDetalles={productosDetalles}
          eliminarProducto={eliminarProducto}
        />

        <ListaBebidas
          pedidosBebidas={mesa.pedidosBebidas || []}
          eliminarProducto={eliminarProducto}
        />


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
            <button
              onClick={imprimirCuenta}
              className="boton-imprimir--mesadetalles"
            >
              Cuenta
            </button>
            <button
              onClick={() => setShowModal("factura")}
              className="boton-factura--mesadetalles"
            >
              Factura
            </button>
            <button
              onClick={() => setMostrarModalTransferir(true)}
              className="boton-factura--mesadetalles"
            >
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
                setMostrarFacturaModal(true); // Abre el modal de datos fiscales
              } else {
                cerrarMesa(metodoPago, "simplificada"); // Cierra sin factura
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
