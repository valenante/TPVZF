import { useState, useEffect } from "react";

import ProductoDetalle from "./ProductoDetalle.jsx";
import { useRightBar } from "../../hooks/useRightBar";
import AlertaMensaje from "../AlertaMensaje/AlertaMensaje"; // ✅ Asegúrate de tenerlo creado
import ModalProductosCategoria from "../ModalProductosCategoria/ModalProductosCategoria";
import CarritoOrganizable from "../CarritoOrganizable/CarritoOrganizable";
import "./RightBar.css";

const RightBar = ({ mesaId }) => {
  const {
    tipo, setTipo, categoriaSeleccionada, setCategoriaSeleccionada,
    productoSeleccionado, preciosSeleccionados, setPreciosSeleccionados,
    showModal, abrirModal, cerrarModal, agregarAlCarrito,
    carritoSecciones, setCarritoSecciones, carritoBebidas, setCarritoBebidas,
    enviarPedido, mensajeAlerta, setMensajeAlerta, isLoading,
    mostrarResumen, setMostrarResumen, categories,
    handleClickCategoria, mostrarModalCategoria,
    productosCategoriaActual, productosYaPedidos, setMostrarModalCategoria
  } = useRightBar(mesaId);

  return (
    <div className="right-bar--rightbar">
      <div className="filtros-tipo--rightbar">
        <button onClick={() => setTipo("plato")} className={`boton-tipo--rightbar ${tipo === "plato" ? "activo--rightbar" : ""}`}>Platos</button>
        <button onClick={() => setTipo("bebida")} className={`boton-tipo--rightbar ${tipo === "bebida" ? "activo--rightbar" : ""}`}>Bebidas</button>
      </div>

      <div className="categorias--rightbar">
        <ul className="lista-categorias--rightbar">
          {categories.map((categoria) => (
            <li key={categoria}
              className={`categoria--rightbar ${categoria === categoriaSeleccionada ? "seleccionada--rightbar" : ""}`}
              onClick={() => handleClickCategoria(categoria)}>
              {categoria}
            </li>
          ))}
        </ul>
      </div>

      <button
        className="boton-toggle-resumen"
        onClick={() => setMostrarResumen(!mostrarResumen)}
      >
        📋
      </button>

      {showModal && productoSeleccionado && (
        <ProductoDetalle
          producto={productoSeleccionado}
          cerrarModal={cerrarModal}
          seleccionPrecio={productoSeleccionado.precioSeleccionado}
          onConfirm={agregarAlCarrito}
        />
      )}

      {mostrarModalCategoria && (
        <ModalProductosCategoria
          categoria={categoriaSeleccionada}
          productos={productosCategoriaActual}
          productosPedidoMesa={productosYaPedidos} // ✅ Aqu
          onClose={() => setMostrarModalCategoria(false)}
          onProductoClick={(producto) => {
            setMostrarModalCategoria(false);
            abrirModal(producto); // Reutiliza el modal detalle como antes
          }}
        />
      )}

      {mostrarResumen && (
        <div className="resumen-pedido-panel">
          <h4>Pedido Actual</h4>
          <CarritoOrganizable
            carritoSecciones={carritoSecciones}
            setCarritoSecciones={setCarritoSecciones}
            enviarPedido={enviarPedido}
            isLoading={isLoading}
          />
          {carritoBebidas.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              <h4>Bebidas</h4>
              <ul>
                {carritoBebidas.map((bebida, index) => (
                  <li key={index}>
                    {bebida.nombre} x{bebida.cantidad}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

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

export default RightBar;
